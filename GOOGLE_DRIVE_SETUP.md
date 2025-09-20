# Google Drive Integration Setup Guide

## 🎯 Overview
This guide will help you set up Google Drive API integration for centralized image storage.

## 📋 Prerequisites
- Google Cloud Console account
- Google Drive account
- Admin access to the project

## 🔧 Step-by-Step Setup

### 1. Google Cloud Console Setup

#### A. Create/Select Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Note down the **Project ID**

#### B. Enable Google Drive API
1. Navigate to **APIs & Services** → **Library**
2. Search for "Google Drive API"
3. Click **Enable**

#### C. Create Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **API Key**
3. Copy the **API Key** (for `VITE_GOOGLE_DRIVE_API_KEY`)
4. Click **+ CREATE CREDENTIALS** → **OAuth 2.0 Client IDs**
5. Configure OAuth consent screen if prompted
6. Select **Web application**
7. Add your domain to **Authorized JavaScript origins**:
   - `http://localhost:8080` (for development)
   - `https://yourdomain.com` (for production)
8. Copy the **Client ID** (for `VITE_GOOGLE_DRIVE_CLIENT_ID`)

### 2. Google Drive Folder Setup

#### A. Create Root Folder
1. Go to [Google Drive](https://drive.google.com/)
2. Create a new folder named **"VendorImages"**
3. Right-click the folder → **Share**
4. Set to **"Anyone with the link can view"**
5. Copy the **Folder ID** from the URL:
   ```
   https://drive.google.com/drive/folders/[FOLDER_ID_HERE]
   ```
6. Use this as `VITE_GOOGLE_DRIVE_ROOT_FOLDER_ID`

#### B. Test Folder Access
1. Open the folder in incognito mode
2. Verify you can view it without logging in
3. This confirms public access is working

### 3. Environment Variables

Update your `.env.local` file:

```env
# Existing Supabase config...
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key

# Google Drive Configuration
VITE_GOOGLE_DRIVE_API_KEY=your_api_key_from_step_1C
VITE_GOOGLE_DRIVE_CLIENT_ID=your_client_id_from_step_1C
VITE_GOOGLE_DRIVE_ROOT_FOLDER_ID=your_folder_id_from_step_2A
```

### 4. Database Setup

Run the SQL script in your Supabase SQL Editor:
```sql
-- Execute: implement-centralized-image-storage.sql
```

This will:
- ✅ Add required columns to `vendor_media` table
- ✅ Create constraints for 13-image limit
- ✅ Add triggers for data integrity
- ✅ Create helper functions
- ✅ Add sample data for testing

### 5. Testing the Setup

#### A. Test API Access
1. Open browser console on your app
2. Run: `gapi.load('client', () => console.log('Google API loaded'))`
3. Should see "Google API loaded" message

#### B. Test Authentication
1. Try uploading an image in vendor edit form
2. Should prompt for Google account login
3. Should create vendor folder structure

#### C. Test Upload Flow
1. Select image file
2. Should compress automatically
3. Should upload to Google Drive
4. Should save URL in database
5. Should display in vendor profile

### 6. Folder Structure

After setup, your Google Drive will have:
```
VendorImages/
├── Vendor_14_BrandName/
│   ├── catalog/
│   ├── highlights/
│   └── profile/
├── Vendor_15_AnotherBrand/
│   ├── catalog/
│   ├── highlights/
│   └── profile/
└── ...
```

### 7. Security Considerations

#### A. API Key Security
- ✅ API keys are safe for frontend use (read-only)
- ✅ Restrict API key to your domain in Google Console
- ✅ Monitor usage in Google Cloud Console

#### B. Folder Permissions
- ✅ Root folder set to "Anyone with link can view"
- ✅ Individual images inherit permissions
- ✅ No edit access for public users

#### C. File Validation
- ✅ File type validation (images only)
- ✅ File size limits (10MB max before compression)
- ✅ Image limit per vendor (13 images max)

### 8. Cost Estimation

#### Google Drive Storage:
- **Free Tier**: 15GB (sufficient for ~15,000 compressed images)
- **Paid Plans**: $1.99/month for 100GB if needed

#### API Costs:
- **Drive API**: Free for reasonable usage
- **Bandwidth**: Minimal cost for image operations

### 9. Troubleshooting

#### Common Issues:
1. **"API not enabled"** → Enable Google Drive API in Cloud Console
2. **"Invalid credentials"** → Check API key and Client ID
3. **"Folder not found"** → Verify folder ID and permissions
4. **"Upload failed"** → Check authentication and folder access

#### Debug Steps:
1. Check browser console for error messages
2. Verify environment variables are loaded
3. Test Google API initialization
4. Check network tab for failed requests

### 10. Production Deployment

#### Before Going Live:
1. ✅ Update OAuth origins for production domain
2. ✅ Set production environment variables
3. ✅ Test upload flow on staging
4. ✅ Monitor API usage and quotas
5. ✅ Set up backup/monitoring systems

---

## 🚀 Ready to Implement!

Once you provide your Google Drive account details and complete the setup above, the centralized image storage system will be ready to use.

**Need Help?** Let me know if you need assistance with any step or if you'd like me to modify any part of the implementation.
