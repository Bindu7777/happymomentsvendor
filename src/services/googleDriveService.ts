// Google Drive service for centralized image storage
// This service handles all Google Drive operations for vendor images

// Extend Window interface to include Google APIs
declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

interface GoogleDriveConfig {
  apiKey: string;
  clientId: string;
  discoveryDoc: string;
  scope: string;
}

interface UploadResult {
  success: boolean;
  fileId?: string;
  publicUrl?: string;
  error?: string;
}

interface FolderResult {
  success: boolean;
  folderId?: string;
  error?: string;
}

class GoogleDriveService {
  private config: GoogleDriveConfig;
  private isInitialized = false;
  private gapi: any;

  constructor() {
    this.config = {
      apiKey: import.meta.env.VITE_GOOGLE_DRIVE_API_KEY || '',
      clientId: import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_ID || '',
      discoveryDoc: 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
      scope: 'https://www.googleapis.com/auth/drive.file'
    };
    
    // Log configuration status for debugging
    console.log('Google Drive Service Configuration:');
    console.log('API Key:', this.config.apiKey ? '✅ Set' : '❌ Missing');
    console.log('Client ID:', this.config.clientId ? '✅ Set' : '❌ Missing');
    console.log('Root Folder ID:', import.meta.env.VITE_GOOGLE_DRIVE_ROOT_FOLDER_ID ? '✅ Set' : '❌ Missing');
    console.log('All env vars:', {
      API_KEY: import.meta.env.VITE_GOOGLE_DRIVE_API_KEY,
      CLIENT_ID: import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_ID,
      ROOT_FOLDER_ID: import.meta.env.VITE_GOOGLE_DRIVE_ROOT_FOLDER_ID
    });
  }

  // Initialize Google Drive API
  async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) return true;

      // Load Google API script if not already loaded
      if (!window.gapi) {
        await this.loadGoogleAPI();
      }

      this.gapi = window.gapi;

      // Initialize the API
      await new Promise((resolve, reject) => {
        this.gapi.load('client:auth2', async () => {
          try {
            await this.gapi.client.init({
              apiKey: this.config.apiKey,
              clientId: this.config.clientId,
              discoveryDocs: [this.config.discoveryDoc],
              scope: this.config.scope
            });
            resolve(true);
          } catch (error) {
            reject(error);
          }
        });
      });

      this.isInitialized = true;
      console.log('Google Drive API initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Google Drive API:', error);
      return false;
    }
  }

  // Load Google API script dynamically
  private loadGoogleAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google API'));
      document.head.appendChild(script);
    });
  }

  // Authenticate user
  async authenticate(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const authInstance = this.gapi.auth2.getAuthInstance();
      
      if (authInstance.isSignedIn.get()) {
        return true;
      }

      const authResult = await authInstance.signIn();
      return authResult.isSignedIn();
    } catch (error) {
      console.error('Authentication failed:', error);
      return false;
    }
  }

  // Create vendor folder structure
  async createVendorFolder(vendorId: string, brandName: string): Promise<FolderResult> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const folderName = `Vendor_${vendorId}_${brandName.replace(/[^a-zA-Z0-9]/g, '_')}`;
      
      // Create main vendor folder
      const vendorFolder = await this.gapi.client.drive.files.create({
        resource: {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [import.meta.env.VITE_GOOGLE_DRIVE_ROOT_FOLDER_ID || 'root']
        }
      });

      const vendorFolderId = vendorFolder.result.id;

      // Create subfolders
      const subfolders = ['catalog', 'highlights', 'profile'];
      for (const subfolder of subfolders) {
        await this.gapi.client.drive.files.create({
          resource: {
            name: subfolder,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [vendorFolderId]
          }
        });
      }

      // Make folder publicly viewable
      await this.gapi.client.drive.permissions.create({
        fileId: vendorFolderId,
        resource: {
          role: 'reader',
          type: 'anyone'
        }
      });

      return {
        success: true,
        folderId: vendorFolderId
      };
    } catch (error) {
      console.error('Error creating vendor folder:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Upload image to Google Drive
  async uploadImage(
    file: File, 
    vendorId: string, 
    category: 'catalog' | 'highlights' | 'profile' | 'brand_logo' | 'contact_person',
    title?: string
  ): Promise<UploadResult> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Get or create vendor folder
      console.log(`Getting vendor folder for vendor ID: ${vendorId}`);
      const vendorFolderId = await this.getVendorFolderId(vendorId);
      console.log(`Vendor folder ID result: ${vendorFolderId}`);
      
      if (!vendorFolderId) {
        console.error('Failed to get vendor folder ID');
        return {
          success: false,
          error: 'Failed to get vendor folder. Please check your Google Drive configuration and folder permissions.'
        };
      }

      // Get category subfolder
      const categoryFolderId = await this.getCategoryFolderId(vendorFolderId, category);

      // Create unique filename
      const timestamp = Date.now();
      const extension = file.name.split('.').pop() || 'jpg';
      const filename = `${category}_${timestamp}.${extension}`;

      // Convert file to base64 for upload
      const base64Data = await this.fileToBase64(file);
      const metadata = {
        name: filename,
        parents: [categoryFolderId],
        description: title || `${category} image for vendor ${vendorId}`
      };

      // Upload file
      const uploadResult = await this.gapi.client.request({
        path: 'https://www.googleapis.com/upload/drive/v3/files',
        method: 'POST',
        params: {
          uploadType: 'multipart'
        },
        headers: {
          'Content-Type': 'multipart/related; boundary="foo_bar_baz"'
        },
        body: this.createMultipartBody(metadata, base64Data, file.type)
      });

      const fileId = uploadResult.result.id;

      // Make file publicly viewable
      await this.gapi.client.drive.permissions.create({
        fileId: fileId,
        resource: {
          role: 'reader',
          type: 'anyone'
        }
      });

      // Generate public URL
      const publicUrl = `https://drive.google.com/uc?id=${fileId}`;

      return {
        success: true,
        fileId: fileId,
        publicUrl: publicUrl
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Helper functions
  private async getVendorFolderId(vendorId: string): Promise<string | null> {
    try {
      const rootFolderId = import.meta.env.VITE_GOOGLE_DRIVE_ROOT_FOLDER_ID;
      
      if (!rootFolderId) {
        console.error('Root folder ID not configured');
        return null;
      }
      
      // Create vendor-specific folder name (just the number)
      const folderName = vendorId;
      console.log(`Looking for vendor folder: ${folderName}`);
      
      // Check if vendor folder already exists
      const existingFolder = await this.findFolderByName(folderName, rootFolderId);
      if (existingFolder) {
        console.log(`Found existing vendor folder: ${existingFolder}`);
        return existingFolder;
      }
      
      // Create new vendor folder
      console.log(`Creating new vendor folder: ${folderName}`);
      const newFolderId = await this.createFolder(folderName, rootFolderId);
      
      if (newFolderId) {
        // Create category subfolders
        await this.createFolder('catalog', newFolderId);
        await this.createFolder('highlights', newFolderId);
        await this.createFolder('profile', newFolderId);
        console.log(`Created vendor folder structure for: ${folderName}`);
      }
      
      return newFolderId;
      
    } catch (error) {
      console.error('Error getting vendor folder ID:', error);
      return null;
    }
  }

  private async getCategoryFolderId(vendorFolderId: string, category: string): Promise<string> {
    try {
      console.log(`Getting category folder: ${category} in vendor folder: ${vendorFolderId}`);
      
      // Find the category subfolder
      const categoryFolderId = await this.findFolderByName(category, vendorFolderId);
      
      if (categoryFolderId) {
        console.log(`Found category folder: ${categoryFolderId}`);
        return categoryFolderId;
      }
      
      // Create category subfolder if it doesn't exist
      console.log(`Creating category subfolder: ${category}`);
      const newCategoryFolderId = await this.createFolder(category, vendorFolderId);
      
      return newCategoryFolderId || vendorFolderId; // Fallback to vendor folder
      
    } catch (error) {
      console.error('Error getting category folder ID:', error);
      return vendorFolderId; // Fallback to vendor folder
    }
  }

  // Find folder by name in parent folder
  private async findFolderByName(folderName: string, parentFolderId: string): Promise<string | null> {
    try {
      const response = await this.gapi.client.drive.files.list({
        q: `name='${folderName}' and parents in '${parentFolderId}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name)'
      });
      
      if (response.result.files && response.result.files.length > 0) {
        return response.result.files[0].id;
      }
      
      return null;
    } catch (error) {
      console.error('Error finding folder:', error);
      return null;
    }
  }

  // Create new folder
  private async createFolder(folderName: string, parentFolderId: string): Promise<string | null> {
    try {
      const response = await this.gapi.client.drive.files.create({
        resource: {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [parentFolderId]
        }
      });
      
      const folderId = response.result.id;
      
      // Make folder publicly viewable
      await this.gapi.client.drive.permissions.create({
        fileId: folderId,
        resource: {
          role: 'reader',
          type: 'anyone'
        }
      });
      
      console.log(`Created folder '${folderName}' with ID: ${folderId}`);
      return folderId;
    } catch (error) {
      console.error('Error creating folder:', error);
      return null;
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }

  private createMultipartBody(metadata: any, data: string, mimeType: string): string {
    const delimiter = 'foo_bar_baz';
    const close_delim = `\r\n--${delimiter}--`;
    
    let body = `--${delimiter}\r\n`;
    body += 'Content-Type: application/json\r\n\r\n';
    body += JSON.stringify(metadata) + '\r\n';
    body += `--${delimiter}\r\n`;
    body += `Content-Type: ${mimeType}\r\n`;
    body += 'Content-Transfer-Encoding: base64\r\n\r\n';
    body += data;
    body += close_delim;
    
    return body;
  }

  // Delete image from Google Drive
  async deleteImage(fileId: string): Promise<boolean> {
    try {
      await this.gapi.client.drive.files.delete({
        fileId: fileId
      });
      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  }
}

export const googleDriveService = new GoogleDriveService();
export default googleDriveService;
