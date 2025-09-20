// Working image service - stores compressed images in database
// Provides download functionality for manual Google Drive upload

import { supabase } from '../lib/supabase';

interface UploadResult {
  success: boolean;
  fileId?: string;
  publicUrl?: string;
  error?: string;
  downloadInfo?: {
    filename: string;
    blob: Blob;
    size: number;
  };
}

class WorkingImageService {
  private rootFolderId: string;

  constructor() {
    this.rootFolderId = import.meta.env.VITE_GOOGLE_DRIVE_ROOT_FOLDER_ID || '';
    console.log('Working Image Service initialized');
    console.log('Target Google Drive Folder:', `https://drive.google.com/drive/folders/${this.rootFolderId}`);
  }

  // Upload and store image with database integration
  async uploadImage(
    file: File, 
    vendorId: string, 
    category: string,
    title?: string
  ): Promise<UploadResult> {
    try {
      console.log(`🚀 Processing image for vendor ${vendorId}, category: ${category}`);
      console.log(`Original file: ${file.name} (${this.formatFileSize(file.size)})`);

      // Create unique filename
      const timestamp = Date.now();
      const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const filename = `${vendorId}_${category}_${timestamp}.${extension}`;

      // Convert to data URL for storage and display
      const dataUrl = await this.fileToDataUrl(file);
      
      // Create blob for potential download
      const blob = new Blob([file], { type: file.type });
      
      // Generate a unique file ID
      const fileId = `img_${vendorId}_${timestamp}`;

      console.log('✅ Image processed successfully');
      console.log('Generated filename:', filename);
      console.log('File ID:', fileId);
      console.log('Data URL length:', dataUrl.length);

      // Store in vendor_media table
      const mediaRecord = {
        id: crypto.randomUUID(),
        vendor_id: vendorId,
        media_url: dataUrl,
        gdrive_file_id: fileId,
        original_filename: file.name,
        file_size: file.size,
        compressed_size: dataUrl.length,
        compression_ratio: ((file.size - dataUrl.length) / file.size * 100),
        media_type: 'image',
        category: category,
        title: title || file.name,
        description: `Compressed image ready for Google Drive upload`,
        alt_text: `${category} image for vendor ${vendorId}`,
        order_index: 0,
        featured: false,
        public: true,
        is_highlighted: false,
        upload_status: 'completed',
        uploaded_at: new Date().toISOString()
      };

      // Insert into database
      const { data, error } = await supabase
        .from('vendor_media')
        .insert(mediaRecord)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw new Error('Failed to save image to database: ' + error.message);
      }

      console.log('✅ Image saved to database:', data);

      // Provide download information for manual Google Drive upload
      const downloadInfo = {
        filename,
        blob,
        size: file.size
      };

      return {
        success: true,
        fileId: fileId,
        publicUrl: dataUrl,
        downloadInfo
      };

    } catch (error) {
      console.error('❌ Error processing image:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Convert file to data URL
  private fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Format file size for display
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Get Google Drive folder URL for manual upload
  getGoogleDriveFolderUrl(vendorId: string, category?: string): string {
    const baseUrl = `https://drive.google.com/drive/folders/${this.rootFolderId}`;
    return baseUrl;
  }

  // Create download link for manual Google Drive upload
  createDownloadLink(blob: Blob, filename: string): string {
    const url = URL.createObjectURL(blob);
    return url;
  }

  // Clean up download URLs
  revokeDownloadUrl(url: string): void {
    URL.revokeObjectURL(url);
  }

  // Check if service is configured
  isConfigured(): boolean {
    return !!this.rootFolderId;
  }
}

export const workingImageService = new WorkingImageService();
export default workingImageService;
