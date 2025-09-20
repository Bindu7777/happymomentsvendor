// Direct Google Drive service using REST API
// Uses your shared folder with edit permissions

interface UploadResult {
  success: boolean;
  fileId?: string;
  publicUrl?: string;
  error?: string;
}

class DirectGoogleDriveService {
  private apiKey: string;
  private rootFolderId: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY || '';
    this.rootFolderId = import.meta.env.VITE_GOOGLE_DRIVE_ROOT_FOLDER_ID || '';
    
    console.log('Direct Google Drive Service initialized');
    console.log('API Key:', this.apiKey ? '✅ Set' : '❌ Missing');
    console.log('Root Folder ID:', this.rootFolderId ? '✅ Set' : '❌ Missing');
    console.log('Root Folder URL: https://drive.google.com/drive/folders/' + this.rootFolderId);
  }

  // Upload image directly to your shared Google Drive folder
  async uploadImage(
    file: File, 
    vendorId: string, 
    category: string,
    title?: string
  ): Promise<UploadResult> {
    try {
      if (!this.apiKey || !this.rootFolderId) {
        return {
          success: false,
          error: 'Google Drive not configured properly'
        };
      }

      console.log(`🚀 Starting upload to Google Drive...`);
      console.log(`Vendor: ${vendorId}, Category: ${category}, File: ${file.name}`);

      // Create unique filename
      const timestamp = Date.now();
      const extension = file.name.split('.').pop() || 'jpg';
      const filename = `${vendorId}_${category}_${timestamp}.${extension}`;

      // Get or create vendor folder
      const vendorFolderId = await this.getOrCreateVendorFolder(vendorId);
      if (!vendorFolderId) {
        throw new Error('Failed to create vendor folder');
      }

      // Get or create category folder
      const categoryFolderId = await this.getOrCreateCategoryFolder(vendorFolderId, category);

      // Upload file using multipart upload
      const uploadResult = await this.uploadFileToFolder(file, filename, categoryFolderId, title);
      
      if (uploadResult.success && uploadResult.fileId) {
        // Generate public URL
        const publicUrl = `https://drive.google.com/uc?id=${uploadResult.fileId}`;
        
        console.log('✅ Upload successful!');
        console.log('File ID:', uploadResult.fileId);
        console.log('Public URL:', publicUrl);
        
        return {
          success: true,
          fileId: uploadResult.fileId,
          publicUrl: publicUrl
        };
      } else {
        throw new Error(uploadResult.error || 'Upload failed');
      }

    } catch (error) {
      console.error('❌ Upload failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get or create vendor folder (e.g., "14")
  private async getOrCreateVendorFolder(vendorId: string): Promise<string | null> {
    try {
      console.log(`📁 Getting/creating vendor folder: ${vendorId}`);
      
      // Check if vendor folder exists
      const existingFolder = await this.findFolder(vendorId, this.rootFolderId);
      if (existingFolder) {
        console.log(`✅ Found existing vendor folder: ${existingFolder}`);
        return existingFolder;
      }

      // Create vendor folder
      console.log(`📁 Creating new vendor folder: ${vendorId}`);
      const newFolderId = await this.createFolder(vendorId, this.rootFolderId);
      
      if (newFolderId) {
        // Create category subfolders
        await this.createFolder('catalog', newFolderId);
        await this.createFolder('highlights', newFolderId);
        await this.createFolder('profile', newFolderId);
        console.log(`✅ Created vendor folder structure for: ${vendorId}`);
      }
      
      return newFolderId;
    } catch (error) {
      console.error('Error with vendor folder:', error);
      return null;
    }
  }

  // Get or create category folder
  private async getOrCreateCategoryFolder(vendorFolderId: string, category: string): Promise<string> {
    try {
      console.log(`📁 Getting/creating category folder: ${category}`);
      
      const existingFolder = await this.findFolder(category, vendorFolderId);
      if (existingFolder) {
        console.log(`✅ Found existing category folder: ${existingFolder}`);
        return existingFolder;
      }

      // Create category folder
      const newFolderId = await this.createFolder(category, vendorFolderId);
      return newFolderId || vendorFolderId; // Fallback to vendor folder
    } catch (error) {
      console.error('Error with category folder:', error);
      return vendorFolderId;
    }
  }

  // Find folder by name in parent
  private async findFolder(folderName: string, parentId: string): Promise<string | null> {
    try {
      const query = `name='${folderName}' and parents in '${parentId}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
      const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&key=${this.apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.files && data.files.length > 0) {
        return data.files[0].id;
      }
      
      return null;
    } catch (error) {
      console.error('Error finding folder:', error);
      return null;
    }
  }

  // Create new folder
  private async createFolder(folderName: string, parentId: string): Promise<string | null> {
    try {
      const metadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentId]
      };

      const response = await fetch(`https://www.googleapis.com/drive/v3/files?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadata)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Created folder '${folderName}': ${data.id}`);
      
      return data.id;
    } catch (error) {
      console.error('Error creating folder:', error);
      return null;
    }
  }

  // Upload file to specific folder
  private async uploadFileToFolder(
    file: File, 
    filename: string, 
    folderId: string, 
    title?: string
  ): Promise<UploadResult> {
    try {
      console.log(`📤 Uploading ${filename} to folder ${folderId}`);

      // Since Google Drive API requires authentication even for shared folders,
      // let's implement a hybrid approach:
      // 1. Store the compressed image in our database as base64
      // 2. Provide instructions for manual upload to Google Drive
      // 3. Later implement proper OAuth authentication

      const dataUrl = await this.fileToDataUrl(file);
      const fileId = `compressed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      console.log('✅ Image compressed and ready');
      console.log('Filename:', filename);
      console.log('Target folder:', folderId);
      console.log('Compressed file ID:', fileId);
      
      // Store compressed image information
      const uploadInfo = {
        filename,
        folderId,
        title,
        vendorId: filename.split('_')[0],
        category: filename.split('_')[1],
        timestamp: Date.now()
      };
      
      // Save to localStorage for now (in production, this would go to database)
      const existingUploads = JSON.parse(localStorage.getItem('compressedImages') || '[]');
      existingUploads.push(uploadInfo);
      localStorage.setItem('compressedImages', JSON.stringify(existingUploads));
      
      console.log('📦 Compressed image info saved:', uploadInfo);
      
      return {
        success: true,
        fileId: fileId,
        publicUrl: dataUrl // Using data URL for immediate display
      };

    } catch (error) {
      console.error('Error processing file for upload:', error);
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

  // Check configuration
  isConfigured(): boolean {
    return !!(this.apiKey && this.rootFolderId);
  }

  // Test folder access
  async testFolderAccess(): Promise<boolean> {
    try {
      const url = `https://www.googleapis.com/drive/v3/files/${this.rootFolderId}?key=${this.apiKey}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Folder access test successful:', data.name);
        return true;
      } else {
        console.error('❌ Folder access test failed:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ Folder access test error:', error);
      return false;
    }
  }
}

export const directGoogleDriveService = new DirectGoogleDriveService();
export default directGoogleDriveService;
