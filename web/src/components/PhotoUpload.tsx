'use client';

import { useCallback, useState, DragEvent } from 'react';

interface PhotoUploadProps {
  onUpload: (file: File) => void;
  isAnalyzing: boolean;
}

export default function PhotoUpload({ onUpload, isAnalyzing }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    onUpload(file);
  }, [onUpload]);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragging(false);
    }
  }, []);

  const handleClick = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleFile(file);
    };
    input.click();
  }, [handleFile]);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
      className={`
        relative h-full flex flex-col items-center justify-center
        border-2 border-dashed rounded-2xl p-8
        cursor-pointer transition-all duration-300 ease-out
        ${isDragging
          ? 'border-primary-500 bg-primary-100 scale-[1.02] shadow-lg shadow-primary-500/20'
          : 'border-primary-300 bg-white/80 backdrop-blur-sm hover:border-primary-400 hover:bg-white hover:shadow-xl hover:shadow-primary-500/10 hover:scale-[1.01]'}
        ${isAnalyzing ? 'opacity-60 pointer-events-none' : ''}
      `}
    >
      {/* Drag pulse ring */}
      {isDragging && (
        <div className="absolute inset-0 rounded-2xl border-2 border-primary-400 animate-ping opacity-30" />
      )}

      {preview ? (
        <div className="relative">
          <img src={preview} alt="上传的照片" className="max-h-64 rounded-xl object-contain shadow-lg" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl" />
        </div>
      ) : (
        <>
          <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 hover:scale-110">
            <span className="text-4xl">📷</span>
          </div>
          <p className="text-primary-800 font-semibold text-lg">点击或拖拽上传照片</p>
          <p className="text-primary-500 text-sm mt-2">支持 JPG、PNG 格式，建议正面全身照</p>
        </>
      )}

      {isAnalyzing && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center">
          <div className="relative">
            <div className="w-14 h-14 border-4 border-primary-200 rounded-full" />
            <div className="absolute inset-0 w-14 h-14 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-primary-700 font-medium mt-4">分析中...</p>
        </div>
      )}
    </div>
  );
}
