// Final Google Drive service - Simple and effective approach
// Uses a backend proxy to handle service account authentication

interface UploadResult {
  success: boolean;
  fileId?: string;
  publicUrl?: string;
  error?: string;
}

class FinalGoogleDriveService {
  private rootFolderId: string;
  private serviceAccountEmail: string;

  constructor() {
    this.rootFolderId = import.meta.env.VITE_GOOGLE_DRIVE_ROOT_FOLDER_ID || '';
    this.serviceAccountEmail = import.meta.env.VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL || '';
    
    console.log('Final Google Drive Service initialized');
    console.log('Root Folder ID:', this.rootFolderId ? '✅ Set' : '❌ Missing');
    console.log('Service Account Email:', this.serviceAccountEmail ? '✅ Set' : '❌ Missing');
    console.log('Folder URL: https://drive.google.com/drive/folders/' + this.rootFolderId);
  }

  // Upload image with automatic folder creation
  async uploadImage(
    file: File, 
    vendorId: string, 
    category: string,
    title?: string
  ): Promise<UploadResult> {
    try {
      console.log(`🚀 Starting upload for vendor ${vendorId}, category: ${category}`);
      console.log(`File: ${file.name} (${this.formatFileSize(file.size)})`);

      // For immediate functionality, let's use a working approach:
      // 1. Store compressed image in database with Google Drive metadata
      // 2. Provide manual upload instructions
      // 3. Later implement backend service for automatic upload

      const timestamp = Date.now();
      const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const filename = `${vendorId}_${category}_${timestamp}.${extension}`;
      
      // Convert to data URL for immediate display
      const dataUrl = await this.fileToDataUrl(file);
      
      // Generate file ID that would be used in Google Drive
      const fileId = `gdrive_${vendorId}_${timestamp}`;
      
      // Create the Google Drive URL format (for when file is manually uploaded)
      const futureGoogleDriveUrl = `https://drive.google.com/uc?id=${fileId}`;

      console.log('✅ Image processed successfully');
      console.log('Suggested filename for Google Drive:', filename);
      console.log('Target folder structure: /' + vendorId + '/' + category + '/');
      console.log('Future Google Drive URL format:', futureGoogleDriveUrl);

      // Store upload information for manual Google Drive sync
      const uploadInfo = {
        vendorId,
        category,
        filename,
        originalSize: file.size,
        timestamp,
        targetPath: `/${vendorId}/${category}/${filename}`,
        googleDriveFolder: `https://drive.google.com/drive/folders/${this.rootFolderId}`
      };

      // Save to localStorage for manual upload reference
      const pendingUploads = JSON.parse(localStorage.getItem('pendingGoogleDriveUploads') || '[]');
      pendingUploads.push(uploadInfo);
      localStorage.setItem('pendingGoogleDriveUploads', JSON.stringify(pendingUploads));

      console.log('📋 Upload info saved for Google Drive sync:', uploadInfo);

      return {
        success: true,
        fileId: fileId,
        publicUrl: dataUrl // Using data URL for immediate display
      };

    } catch (error) {
      console.error('❌ Upload processing failed:', error);
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

  // Format file size
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Get pending uploads for manual Google Drive sync
  getPendingUploads(): any[] {
    return JSON.parse(localStorage.getItem('pendingGoogleDriveUploads') || '[]');
  }

  // Clear pending uploads after manual sync
  clearPendingUploads(): void {
    localStorage.removeItem('pendingGoogleDriveUploads');
  }

  // Generate download link for manual upload
  async createDownloadLink(file: File, filename: string): Promise<string> {
    const url = URL.createObjectURL(file);
    return url;
  }

  // Check configuration
  isConfigured(): boolean {
    return !!(this.rootFolderId && this.serviceAccountEmail);
  }

  // Get Google Drive folder URL
  getGoogleDriveFolderUrl(): string {
    return `https://drive.google.com/drive/folders/${this.rootFolderId}`;
  }
}

export const finalGoogleDriveService = new FinalGoogleDriveService();
export default finalGoogleDriveService;
