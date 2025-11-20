import React, { useState, useRef, useCallback } from 'react';
import { ZoomInIcon, ZoomOutIcon, ResetZoomIcon } from './Icons';
import { useTranslation } from '../hooks/useTranslation';

interface ZoomableImageProps {
  src: string;
  alt: string;
  ariaLabel: string;
}

// FIX: Use React.Touch to match the type from React's synthetic touch events.
const getDistance = (touch1: React.Touch, touch2: React.Touch) => {
    return Math.sqrt(
        Math.pow(touch1.clientX - touch2.clientX, 2) + 
        Math.pow(touch1.clientY - touch2.clientY, 2)
    );
};

const ZoomableImage: React.FC<ZoomableImageProps> = ({ src, alt, ariaLabel }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  
  // Refs for panning logic
  const isPanning = useRef(false);
  const startCursorPos = useRef({ x: 0, y: 0 });
  const initialImagePos = useRef({ x: 0, y: 0 });

  // Refs for pinching logic
  const initialDistance = useRef<number | null>(null);
  const initialScale = useRef<number>(1);

  const clampPosition = useCallback((pos: {x: number, y: number}, currentScale: number) => {
    if (!containerRef.current) return pos;

    const { width: containerWidth, height: containerHeight } = containerRef.current.getBoundingClientRect();
    
    // Simplified clamping. Prevents panning into empty space on the sides.
    const max_x = Math.max(0, (containerWidth * currentScale - containerWidth) / 2);
    const max_y = Math.max(0, (containerHeight * currentScale - containerHeight) / 2);

    return {
        x: Math.max(-max_x, Math.min(max_x, pos.x)),
        y: Math.max(-max_y, Math.min(max_y, pos.y)),
    };
  }, []);

  const setZoom = useCallback((newScale: number) => {
    const clampedScale = Math.max(1, Math.min(newScale, 5));
    setScale(clampedScale);
    if(clampedScale === 1) {
        setPosition({ x: 0, y: 0 });
    } else {
        // After zoom, re-clamp the position to ensure it's valid
        setPosition(prevPos => clampPosition(prevPos, clampedScale));
    }
  }, [clampPosition]);

  const handleReset = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // --- GENERIC PAN HANDLERS ---
  const handlePanStart = (clientX: number, clientY: number) => {
    if (scale <= 1) return;
    isPanning.current = true;
    startCursorPos.current = { x: clientX, y: clientY };
    initialImagePos.current = { ...position };
    if (containerRef.current) containerRef.current.style.cursor = 'grabbing';
  };

  const handlePanMove = (clientX: number, clientY: number) => {
    if (!isPanning.current) return;
    const deltaX = clientX - startCursorPos.current.x;
    const deltaY = clientY - startCursorPos.current.y;
    const newPos = {
        x: initialImagePos.current.x + deltaX,
        y: initialImagePos.current.y + deltaY,
    };
    setPosition(clampPosition(newPos, scale));
  };
  
  const handlePanEnd = () => {
    isPanning.current = false;
    if (containerRef.current) containerRef.current.style.cursor = 'grab';
  };

  const handleWheel = (e: React.WheelEvent) => {
      e.preventDefault();
      const zoomFactor = -e.deltaY * 0.01;
      setZoom(scale + zoomFactor);
  };

  // --- TOUCH-SPECIFIC HANDLERS ---
  const handleTouchStart = (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
          handlePanStart(e.touches[0].clientX, e.touches[0].clientY);
      } else if (e.touches.length === 2) {
          isPanning.current = false; // Stop panning when pinching starts
          initialDistance.current = getDistance(e.touches[0], e.touches[1]);
          initialScale.current = scale;
      }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
      e.preventDefault();
      if (e.touches.length === 1 && isPanning.current) {
          handlePanMove(e.touches[0].clientX, e.touches[0].clientY);
      } else if (e.touches.length === 2 && initialDistance.current !== null) {
          const currentDistance = getDistance(e.touches[0], e.touches[1]);
          const newScale = initialScale.current * (currentDistance / initialDistance.current);
          setZoom(newScale);
      }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
      if (e.touches.length < 2) {
          initialDistance.current = null;
      }
      if (e.touches.length < 1) {
          handlePanEnd();
      }
  };
  
  return (
    <div 
        ref={containerRef}
        className="relative w-full h-80 bg-gray-900 rounded-lg overflow-hidden touch-none select-none"
        role="img"
        aria-label={ariaLabel}
        onMouseDown={(e) => { if(e.button === 0) handlePanStart(e.clientX, e.clientY)}}
        onMouseMove={(e) => handlePanMove(e.clientX, e.clientY)}
        onMouseUp={handlePanEnd}
        onMouseLeave={handlePanEnd}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        style={{
            cursor: scale > 1 ? 'grab' : 'default',
        }}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-contain"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transition: isPanning.current ? 'none' : 'transform 0.1s ease-out',
        }}
        draggable={false}
        aria-hidden="true" 
      />
       <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-gray-900/50 backdrop-blur-sm rounded-lg p-1 z-10">
            <button onClick={() => setZoom(scale + 0.5)} className="p-2 text-white hover:bg-gray-700/50 rounded-md transition-colors" aria-label={t('zoomIn')}>
                <ZoomInIcon />
            </button>
            <button onClick={() => setZoom(scale - 0.5)} className="p-2 text-white hover:bg-gray-700/50 rounded-md transition-colors" aria-label={t('zoomOut')} disabled={scale <= 1}>
                <ZoomOutIcon />
            </button>
             <button onClick={handleReset} className="p-2 text-white hover:bg-gray-700/50 rounded-md transition-colors" aria-label={t('resetZoom')} disabled={scale <= 1}>
                <ResetZoomIcon />
            </button>
        </div>
    </div>
  );
};

export default ZoomableImage;
