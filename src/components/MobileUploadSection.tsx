import React, { useRef, useState } from 'react';
import { Upload, Image, Plus, Camera } from 'lucide-react';
import { takePicture, isNative, hapticFeedback } from '../utils/capacitor';

interface MobileUploadSectionProps {
  onImageUpload: (file: File | string) => void;
}

const MobileUploadSection: React.FC<MobileUploadSectionProps> = ({ onImageUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file);
      hapticFeedback('light');
    } else {
      alert('Please select a valid image file (JPG, PNG, GIF, etc.)');
    }
  };

  const handleNativeImageSelect = async () => {
    const imageData = await takePicture();
    if (imageData) {
      onImageUpload(imageData);
      hapticFeedback('light');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    event.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-pink-200">
      <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 mb-4 text-center">
        📸 Upload Your Image
      </h2>
      
      {/* Native vs Web Upload */}
      {isNative() ? (
        <div className="space-y-4">
          <button
            onClick={handleNativeImageSelect}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg flex items-center justify-center gap-3"
          >
            <Camera className="w-6 h-6" />
            Choose from Gallery
          </button>
        </div>
      ) : (
        <div
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer ${
            isDragOver
              ? 'border-pink-400 bg-pink-50 scale-105'
              : 'border-gray-300 hover:border-pink-300 hover:bg-pink-50/50'
          }`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <div className="space-y-4">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
              isDragOver ? 'bg-pink-200' : 'bg-gradient-to-r from-pink-100 to-purple-100'
            }`}>
              {isDragOver ? (
                <Plus className="w-8 h-8 text-pink-600" />
              ) : (
                <Upload className="w-8 h-8 text-pink-600" />
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {isDragOver ? 'Drop your image here!' : 'Upload Custom Image'}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {isDragOver 
                  ? 'Release to upload your puzzle image' 
                  : 'Drag & drop or click to select your own puzzle image'
                }
              </p>
              
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <Image className="w-4 h-4" />
                <span>JPG, PNG, GIF supported</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Tips */}
      <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl">
        <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
          💡 Tips for Best Results
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Use high-quality images for better puzzle experience</li>
          <li>• Square images work best for puzzles</li>
          <li>• Images with clear details are more fun to solve</li>
          <li>• Try photos of landscapes, pets, or artwork!</li>
        </ul>
      </div>
    </div>
  );
};

export default MobileUploadSection;