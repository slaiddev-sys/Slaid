"use client";

import React, { useState, useCallback } from 'react';

interface FileUploadProps {
  onDataExtracted: (data: any, fileName: string, fileType: string) => void;
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataExtracted, className = "" }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('FileUpload: Uploading file to API...', file.name);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      console.log('FileUpload: Upload response:', result);

      if (result.success && result.type === 'document') {
        // Extract the processed data from the API response
        const { processedData, fileType, filename } = result;
        onDataExtracted(processedData.structuredData, filename, fileType);
      } else if (result.success && result.type === 'image') {
        // Handle image uploads - pass the image URL and metadata
        const { url, filename, originalName } = result;
        onDataExtracted({ imageUrl: url, originalName }, filename, 'image');
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('FileUpload: Error uploading file:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 bg-gray-50
          ${isDragOver 
            ? 'bg-gray-100' 
            : 'hover:opacity-90'
          }
          ${isProcessing ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
        `}
        style={{ borderColor: '#002903' }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileInput}
          className="hidden"
          disabled={isProcessing}
        />
        
        <div className="flex items-center justify-center gap-4">
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="text-gray-600 dark:text-gray-400">Processing file...</p>
            </>
          ) : (
            <>
              <img 
                src="/xls-icon.png" 
                alt="Upload folder" 
                className="h-12 w-12 object-contain flex-shrink-0"
              />
              <div className="text-left">
                <p className="text-sm font-semibold mb-1" style={{ color: '#002903' }}>
                  Upload files
                </p>
                <p className="text-xs" style={{ color: '#002903' }}>
                  Drag and drop or click to select files
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
