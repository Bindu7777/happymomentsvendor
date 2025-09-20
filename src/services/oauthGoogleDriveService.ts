// OAuth-based Google Drive service for real uploads
// This will actually upload to your Google Drive and create folders

interface UploadResult {
  success: boolean;
  fileId?: string;
  publicUrl?: string;
  error?: string;
}

class OAuthGoogleDriveService {
  private clientId: string;
  private apiKey: string;
  private rootFolderId: string;
  private accessToken: string | null = null;
  private isInitialized = false;

  constructor() {
    this.clientId = import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_ID || '';
    this.apiKey = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY || '';
    this.rootFolderId = import.meta.env.VITE_GOOGLE_DRIVE_ROOT_FOLDER_ID || '';
    
    console.log('OAuth Google Drive Service initialized');
    console.log('Client ID:', this.clientId ? '✅ Set' : '❌ Missing');
    console.log('API Key:', this.apiKey ? '✅ Set' : '❌ Missing');
    console.log('Root Folder:', this.rootFolderId ? '✅ Set' : '❌ Missing');
  }

  // Initialize Google Identity Services (new OAuth method)
  async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) return true;

      // Load Google Identity Services
      await this.loadGoogleIdentityServices();

      // Initialize the token client
      window.google.accounts.id.initialize({
        client_id: this.clientId,
        callback: this.handleCredentialResponse.bind(this)
      });

      this.isInitialized = true;
      console.log('✅ Google Identity Services initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Google Identity Services:', error);
      return false;
    }
  }

  // Load Google Identity Services script
  private loadGoogleIdentityServices(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.google?.accounts) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = () => {
        // Wait a bit for the script to fully load
        setTimeout(resolve, 100);
      };
      script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
      document.head.appendChild(script);
    });
  }

  // Handle credential response
  private handleCredentialResponse(response: any) {
    console.log('Google credential response:', response);
    // This would handle the JWT token from Google
  }

  // Authenticate user with Google
  async authenticate(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      return new Promise((resolve, reject) => {
        // Use the newer Google Identity Services OAuth flow
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: this.clientId,
          scope: 'https://www.googleapis.com/auth/drive.file',
          callback: (response: any) => {
            if (response.error) {
              console.error('OAuth error:', response.error);
              reject(new Error(response.error));
              return;
            }
            
            this.accessToken = response.access_token;
            console.log('✅ OAuth authentication successful');
            resolve(true);
          },
        });

        tokenClient.requestAccessToken();
      });
    } catch (error) {
      console.error('❌ Authentication failed:', error);
      return false;
    }
  }

  // Upload image to Google Drive (REAL UPLOAD)
  async uploadImage(
    file: File, 
    vendorId: string, 
    category: string,
    title?: string
  ): Promise<UploadResult> {
    try {
      console.log(`🚀 Starting REAL Google Drive upload for vendor ${vendorId}`);

      // Ensure we're authenticated
      if (!this.accessToken) {
        console.log('🔐 Authentication required...');
        const authSuccess = await this.authenticate();
        if (!authSuccess) {
          throw new Error('Authentication failed');
        }
      }

      // Get or create vendor folder
      const vendorFolderId = await this.getOrCreateVendorFolder(vendorId);
      if (!vendorFolderId) {
        throw new Error('Failed to create vendor folder');
      }

      // Get or create category folder
      const categoryFolderId = await this.getOrCreateCategoryFolder(vendorFolderId, category);

      // Upload the actual file
      const uploadResult = await this.uploadFileWithAuth(file, categoryFolderId, vendorId, category);
      
      if (uploadResult.success) {
        console.log('🎉 REAL Google Drive upload successful!');
        console.log('Check your Google Drive folder for new files');
      }

      return uploadResult;

    } catch (error) {
      console.error('❌ Real upload failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Real file upload with authentication
  private async uploadFileWithAuth(
    file: File, 
    folderId: string, 
    vendorId: string, 
    category: string
  ): Promise<UploadResult> {
    try {
      const timestamp = Date.now();
      const extension = file.name.split('.').pop() || 'jpg';
      const filename = `${vendorId}_${category}_${timestamp}.${extension}`;

      console.log(`📤 Uploading ${filename} to folder ${folderId}`);

      // Create form data for multipart upload
      const metadata = {
        name: filename,
        parents: [folderId]
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
      form.append('file', file);

      // Upload to Google Drive
      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: form
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      const fileId = result.id;

      // Make file publicly viewable
      await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          role: 'reader',
          type: 'anyone'
        })
      });

      const publicUrl = `https://drive.google.com/uc?id=${fileId}`;

      console.log('✅ File uploaded successfully!');
      console.log('File ID:', fileId);
      console.log('Public URL:', publicUrl);

      return {
        success: true,
        fileId: fileId,
        publicUrl: publicUrl
      };

    } catch (error) {
      console.error('Error in authenticated upload:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get or create vendor folder
  private async getOrCreateVendorFolder(vendorId: string): Promise<string | null> {
    try {
      const folderName = vendorId; // Just the number (14, 15, etc.)
      
      // Search for existing folder
      const searchResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='${folderName}' and parents in '${this.rootFolderId}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      const searchData = await searchResponse.json();
      
      if (searchData.files && searchData.files.length > 0) {
        console.log(`✅ Found existing vendor folder: ${searchData.files[0].id}`);
        return searchData.files[0].id;
      }

      // Create new vendor folder
      const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [this.rootFolderId]
        })
      });

      const createData = await createResponse.json();
      const vendorFolderId = createData.id;

      // Create subfolders
      const subfolders = ['catalog', 'highlights', 'profile'];
      for (const subfolder of subfolders) {
        await this.createSubfolder(subfolder, vendorFolderId);
      }

      console.log(`✅ Created vendor folder: ${vendorFolderId}`);
      return vendorFolderId;

    } catch (error) {
      console.error('Error with vendor folder:', error);
      return null;
    }
  }

  // Get or create category folder
  private async getOrCreateCategoryFolder(vendorFolderId: string, category: string): Promise<string> {
    try {
      // Search for category folder
      const searchResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='${category}' and parents in '${vendorFolderId}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      const searchData = await searchResponse.json();
      
      if (searchData.files && searchData.files.length > 0) {
        return searchData.files[0].id;
      }

      // Create category folder
      return await this.createSubfolder(category, vendorFolderId);

    } catch (error) {
      console.error('Error with category folder:', error);
      return vendorFolderId;
    }
  }

  // Create subfolder
  private async createSubfolder(name: string, parentId: string): Promise<string> {
    try {
      const response = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [parentId]
        })
      });

      const data = await response.json();
      console.log(`✅ Created subfolder '${name}': ${data.id}`);
      return data.id;
    } catch (error) {
      console.error(`Error creating subfolder '${name}':`, error);
      return parentId;
    }
  }

  // Check if authenticated
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // Check configuration
  isConfigured(): boolean {
    return !!(this.clientId && this.apiKey && this.rootFolderId);
  }
}

export const oauthGoogleDriveService = new OAuthGoogleDriveService();
export default oauthGoogleDriveService;
