import React, { useEffect, useState } from 'react';

export const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-yellow-400';
  if (score >= 40) return 'text-orange-400';
  return 'text-red-400';
};

export const getScoreRingColor = (score: number): string => {
  if (score >= 80) return 'stroke-green-400';
  if (score >= 60) return 'stroke-yellow-400';
  if (score >= 40) return 'stroke-orange-400';
  return 'stroke-red-400';
};

export const ScoreRing: React.FC<{ score: number }> = ({ score }) => {
    const [displayScore, setDisplayScore] = useState(0);
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const [offset, setOffset] = useState(circumference);
    
    useEffect(() => {
        // Trigger ring animation
        const newOffset = circumference - (score / 100) * circumference;
        setOffset(newOffset);
        
        // Trigger number animation
        let start = 0;
        const end = score;
        if (start === end) {
            setDisplayScore(end);
            return;
        };

        const duration = 1000;
        const range = end - start;
        let startTime: number | null = null;

        const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const current = start + range * progress;
            setDisplayScore(Math.round(current));
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };
        
        const animationFrameId = requestAnimationFrame(step);

        return () => cancelAnimationFrame(animationFrameId);
    }, [score, circumference]);


    return (
        <div className="relative w-40 h-40">
            <svg className="w-full h-full" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                    className="stroke-current text-gray-700"
                    strokeWidth="10"
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                />
                {/* Progress circle */}
                <circle
                    className={`transform -rotate-90 origin-center ${getScoreRingColor(score)}`}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-5xl font-bold ${getScoreColor(score)}`}>{displayScore}</span>
            </div>
        </div>
    );
};
