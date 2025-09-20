// Image processing service for compression and resizing
// Handles image optimization before Google Drive upload

interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

interface ProcessingResult {
  success: boolean;
  processedFile?: File;
  originalSize?: number;
  compressedSize?: number;
  compressionRatio?: number;
  error?: string;
}

class ImageProcessingService {
  // Default compression settings
  private defaultOptions: CompressionOptions = {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.8, // 80% quality
    format: 'jpeg'
  };

  // Process image with compression and resizing
  async processImage(file: File, options?: CompressionOptions): Promise<ProcessingResult> {
    try {
      const settings = { ...this.defaultOptions, ...options };
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        return {
          success: false,
          error: 'File must be an image'
        };
      }

      // Check file size (max 10MB before processing)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return {
          success: false,
          error: 'Image file too large. Maximum size is 10MB.'
        };
      }

      const originalSize = file.size;

      // Create canvas for processing
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      // Load image
      const img = await this.loadImage(file);
      
      // Calculate new dimensions
      const { width, height } = this.calculateDimensions(
        img.width, 
        img.height, 
        settings.maxWidth!, 
        settings.maxHeight!
      );

      // Set canvas size
      canvas.width = width;
      canvas.height = height;

      // Draw and compress image
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to blob with compression
      const processedBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          `image/${settings.format}`,
          settings.quality
        );
      });

      // Create new file from processed blob
      const processedFile = new File(
        [processedBlob], 
        `compressed_${Date.now()}.${settings.format}`, 
        { type: `image/${settings.format}` }
      );

      const compressedSize = processedFile.size;
      const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;

      console.log(`Image processed: ${originalSize} → ${compressedSize} bytes (${compressionRatio.toFixed(1)}% reduction)`);

      return {
        success: true,
        processedFile,
        originalSize,
        compressedSize,
        compressionRatio
      };
    } catch (error) {
      console.error('Error processing image:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Load image from file
  private loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  // Calculate optimal dimensions maintaining aspect ratio
  private calculateDimensions(
    originalWidth: number, 
    originalHeight: number, 
    maxWidth: number, 
    maxHeight: number
  ): { width: number; height: number } {
    let { width, height } = { width: originalWidth, height: originalHeight };

    // If image is smaller than max dimensions, don't upscale
    if (width <= maxWidth && height <= maxHeight) {
      return { width, height };
    }

    // Calculate scaling factor
    const widthRatio = maxWidth / width;
    const heightRatio = maxHeight / height;
    const ratio = Math.min(widthRatio, heightRatio);

    return {
      width: Math.round(width * ratio),
      height: Math.round(height * ratio)
    };
  }

  // Validate image file
  validateImageFile(file: File): { isValid: boolean; error?: string } {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Only JPEG, PNG, and WebP images are allowed'
      };
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'Image file too large. Maximum size is 10MB.'
      };
    }

    return { isValid: true };
  }

  // Get image dimensions without loading full image
  async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    const img = await this.loadImage(file);
    return { width: img.width, height: img.height };
  }

  // Create image preview URL
  createPreviewUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  // Clean up preview URL
  revokePreviewUrl(url: string): void {
    URL.revokeObjectURL(url);
  }

  // Batch process multiple images
  async processMultipleImages(
    files: File[], 
    options?: CompressionOptions,
    onProgress?: (processed: number, total: number) => void
  ): Promise<ProcessingResult[]> {
    const results: ProcessingResult[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const result = await this.processImage(files[i], options);
      results.push(result);
      
      if (onProgress) {
        onProgress(i + 1, files.length);
      }
    }
    
    return results;
  }
}

export const imageProcessingService = new ImageProcessingService();
export default imageProcessingService;
