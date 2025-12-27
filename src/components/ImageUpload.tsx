import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Check, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import imageProcessingService from '../services/imageProcessingService';
import supabaseImageService from '../services/supabaseImageService';

interface ImageUploadProps {
  vendorId: string;
  category: 'catalog' | 'highlights' | 'profile' | 'brand_logo' | 'contact_person';
  maxImages?: number;
  onUploadComplete?: (urls: string[]) => void;
  onUploadError?: (error: string) => void;
  existingImages?: string[];
  allowHighlight?: boolean;
}

interface UploadingImage {
  id: string;
  file: File;
  preview: string;
  status: 'processing' | 'uploading' | 'completed' | 'error';
  progress: number;
  error?: string;
  publicUrl?: string;
  compressionInfo?: {
    originalSize: number;
    compressedSize: number;
    ratio: number;
  };
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  vendorId,
  category,
  maxImages = 13,
  onUploadComplete,
  onUploadError,
  existingImages = [],
  allowHighlight = false
}) => {
  const [uploadingImages, setUploadingImages] = useState<UploadingImage[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate remaining upload slots
  const remainingSlots = maxImages - existingImages.length - uploadingImages.filter(img => img.status === 'completed').length;

  // Handle file selection
  const handleFileSelect = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    // Check if adding these files would exceed limit
    if (fileArray.length > remainingSlots) {
      onUploadError?.(`Can only upload ${remainingSlots} more images. Maximum ${maxImages} images per vendor.`);
      return;
    }

    // Process each file
    for (const file of fileArray) {
      // Validate file
      const validation = imageProcessingService.validateImageFile(file);
      if (!validation.isValid) {
        onUploadError?.(validation.error || 'Invalid file');
        continue;
      }

      // Create upload entry
      const uploadId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const preview = imageProcessingService.createPreviewUrl(file);
      
      const uploadingImage: UploadingImage = {
        id: uploadId,
        file,
        preview,
        status: 'processing',
        progress: 0
      };

      setUploadingImages(prev => [...prev, uploadingImage]);

      // Process and upload
      processAndUpload(uploadId, file);
    }
  }, [vendorId, category, remainingSlots, maxImages, onUploadError]);

  // Process and upload image
  const processAndUpload = async (uploadId: string, file: File) => {
    try {
      // Update status to processing
      setUploadingImages(prev => 
        prev.map(img => 
          img.id === uploadId 
            ? { ...img, status: 'processing', progress: 25 }
            : img
        )
      );

      // Compress image
      const processingResult = await imageProcessingService.processImage(file);
      
      if (!processingResult.success || !processingResult.processedFile) {
        throw new Error(processingResult.error || 'Failed to process image');
      }

      // Update with compression info
      setUploadingImages(prev => 
        prev.map(img => 
          img.id === uploadId 
            ? { 
                ...img, 
                progress: 50,
                compressionInfo: {
                  originalSize: processingResult.originalSize!,
                  compressedSize: processingResult.compressedSize!,
                  ratio: processingResult.compressionRatio!
                }
              }
            : img
        )
      );

      // Upload to Google Drive
      setUploadingImages(prev => 
        prev.map(img => 
          img.id === uploadId 
            ? { ...img, status: 'uploading', progress: 75 }
            : img
        )
      );

      // Use Supabase Storage for centralized image storage
      console.log('🚀 Uploading to Supabase Storage...');
      
      // Initialize bucket if needed
      await supabaseImageService.initializeBucket();
      
      const uploadResult = await supabaseImageService.uploadImage(
        processingResult.processedFile,
        vendorId,
        category,
        file.name
      );

      if (!uploadResult.success || !uploadResult.publicUrl) {
        throw new Error(uploadResult.error || 'Failed to upload to Google Drive');
      }

      // Mark as completed
      setUploadingImages(prev => 
        prev.map(img => 
          img.id === uploadId 
            ? { 
                ...img, 
                status: 'completed', 
                progress: 100,
                publicUrl: uploadResult.publicUrl
              }
            : img
        )
      );

      // Notify parent component
      const completedUrls = uploadingImages
        .filter(img => img.status === 'completed')
        .map(img => img.publicUrl!)
        .concat([uploadResult.publicUrl]);
      
      onUploadComplete?.(completedUrls);

    } catch (error) {
      console.error('Error processing/uploading image:', error);
      
      setUploadingImages(prev => 
        prev.map(img => 
          img.id === uploadId 
            ? { 
                ...img, 
                status: 'error', 
                error: error.message,
                progress: 0
              }
            : img
        )
      );
      
      onUploadError?.(error.message);
    }
  };

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  // Remove uploading image
  const removeUploadingImage = (uploadId: string) => {
    setUploadingImages(prev => {
      const imageToRemove = prev.find(img => img.id === uploadId);
      if (imageToRemove) {
        // Clean up preview URL
        imageProcessingService.revokePreviewUrl(imageToRemove.preview);
      }
      return prev.filter(img => img.id !== uploadId);
    });
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : remainingSlots > 0 
            ? 'border-gray-300 hover:border-gray-400' 
            : 'border-gray-200 bg-gray-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) {
              handleFileSelect(e.target.files);
            }
          }}
        />
        
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        
        {remainingSlots > 0 ? (
          <>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Upload {category} Images
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop images here, or click to select files
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Supports: JPEG, PNG, WebP • Max 10MB per image • Auto-compressed
            </p>
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              disabled={remainingSlots === 0}
            >
              Select Images ({remainingSlots} remaining)
            </Button>
          </>
        ) : (
          <>
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              Upload Limit Reached
            </h3>
            <p className="text-gray-500">
              Maximum {maxImages} images per vendor. Remove existing images to upload new ones.
            </p>
          </>
        )}
      </div>

      {/* Upload Progress */}
      {uploadingImages.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Upload Progress</h4>
          {uploadingImages.map((image) => (
            <div key={image.id} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-start gap-3">
                {/* Image Preview */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                  <img
                    src={image.preview}
                    alt="Upload preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Upload Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {image.file.name}
                    </p>
                    <Button
                      type="button"
                      onClick={() => removeUploadingImage(image.id)}
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Status and Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {image.status === 'processing' && (
                        <>
                          <AlertCircle className="w-4 h-4 text-blue-500" />
                          <span className="text-sm text-blue-600">Processing...</span>
                        </>
                      )}
                      {image.status === 'uploading' && (
                        <>
                          <Upload className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm text-yellow-600">Uploading...</span>
                        </>
                      )}
                      {image.status === 'completed' && (
                        <>
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-green-600">Completed</span>
                        </>
                      )}
                      {image.status === 'error' && (
                        <>
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <span className="text-sm text-red-600">Error: {image.error}</span>
                        </>
                      )}
                    </div>
                    
                    <Progress value={image.progress} className="h-2" />
                    
                    {/* Compression Info */}
                    {image.compressionInfo && (
                      <div className="text-xs text-gray-500">
                        {formatFileSize(image.compressionInfo.originalSize)} → {formatFileSize(image.compressionInfo.compressedSize)} 
                        ({image.compressionInfo.ratio.toFixed(1)}% reduction)
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Existing Images Display */}
      {existingImages.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Existing Images</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {existingImages.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-200 border-2 border-gray-300">
                  <img
                    src={imageUrl}
                    alt={`Existing ${category} image ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Failed to load existing image:', imageUrl);
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                    onLoad={() => {
                      console.log('Successfully loaded existing image:', imageUrl);
                    }}
                  />
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg flex items-center justify-center">
                  <Check className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
          <div className="text-sm text-gray-600">
            <ImageIcon className="w-4 h-4 inline mr-1" />
            {existingImages.length} existing images • {remainingSlots} slots remaining
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
