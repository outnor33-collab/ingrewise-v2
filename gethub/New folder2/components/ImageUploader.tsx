import React, { useRef } from 'react';
import { CameraIcon, UploadIcon, PhotoIcon } from './Icons';
import { useTranslation } from '../hooks/useTranslation';

interface ImageUploaderProps {
  onImageSelect: (base64: string, mimeType: string) => void;
  onAnalyze: () => void;
  selectedImage: { data: string; mimeType: string } | null;
  isComparing?: boolean;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = (reader.result as string).split(',')[1];
      resolve(result);
    };
    reader.onerror = (error) => reject(error);
  });
};

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, onAnalyze, selectedImage, isComparing = false }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      onImageSelect(base64, file.type);
    }
  };

  return (
    <div className="w-full max-w-md p-6 bg-gray-800/50 ring-1 ring-white/10 rounded-2xl flex flex-col items-center transition-all duration-300">
      {!selectedImage ? (
        <div className="w-full flex flex-col items-center relative">
          <div className="absolute inset-0 flex items-center justify-center z-0">
            <PhotoIcon />
          </div>
          <div className="relative z-10 flex flex-col items-center w-full">
            <h2 className="text-xl font-semibold text-center mb-4">{isComparing ? t('analyzeProductToCompare') : t('analyzeNewProduct')}</h2>
            <p className="text-gray-400 text-center mb-6">
              {t('uploadInstruction')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-3 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 hover:scale-105"
              >
                <UploadIcon />
                <span>{t('uploadImage')}</span>
              </button>
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-3 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 hover:scale-105"
              >
                <CameraIcon />
                <span>{t('useCamera')}</span>
              </button>
            </div>
          </div>
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleFileChange} className="hidden" />
        </div>
      ) : (
        <div className="w-full flex flex-col items-center">
            <h2 className="text-xl font-semibold text-center mb-4">{t('selectedImage')}</h2>
          <div className="mb-6 w-full h-64 bg-gray-900 rounded-lg overflow-hidden flex justify-center items-center ring-1 ring-white/10">
            <img src={`data:${selectedImage.mimeType};base64,${selectedImage.data}`} alt="Preview" className="max-h-full max-w-full object-contain" />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full">
             <button
                onClick={() => onImageSelect('', '')}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105"
            >
                {t('changeImage')}
            </button>
            <button
                onClick={onAnalyze}
                className="flex-1 bg-[rgb(var(--color-accent-dark))] hover:bg-[rgb(var(--color-accent-darker))] text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg shadow-[rgba(var(--color-accent-shadow),0.5)] hover:scale-105"
            >
                {t('analyzeNow')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
