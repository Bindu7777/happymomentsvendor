# Google Drive Centralized Image Storage Implementation

## 🎯 Overview
Replace manual URL entry with automated Google Drive upload system for vendor images.

## 📋 Requirements
- **Image Limit**: 13 images per vendor maximum
- **Compression**: Automatic image compression and resizing
- **Central Storage**: Google Drive with vendor-specific folders
- **Public URLs**: Viewable links for app access
- **Database**: Store only Google Drive URLs

## 🏗️ Architecture

### 1. Google Drive Setup
```
Root Folder: "VendorImages"
├── Vendor_14_BrandName/
│   ├── catalog/
│   ├── highlights/
│   └── profile/
├── Vendor_15_BrandName/
└── ...
```

### 2. Image Processing Pipeline
```
File Upload → Compression → Google Drive → Public URL → Database
```

### 3. Database Schema
```sql
-- Add Google Drive metadata
ALTER TABLE vendor_media ADD COLUMN gdrive_file_id TEXT;
ALTER TABLE vendor_media ADD COLUMN original_filename TEXT;
ALTER TABLE vendor_media ADD COLUMN file_size INTEGER;
ALTER TABLE vendor_media ADD COLUMN compressed_size INTEGER;
ALTER TABLE vendor_media ADD COLUMN upload_status TEXT DEFAULT 'pending';
```

## 🔧 Implementation Components

### 1. Google Drive Service (`/src/services/googleDriveService.ts`)
- Authentication with Google Drive API
- Folder creation and management
- File upload with progress tracking
- Public URL generation
- File deletion and cleanup

### 2. Image Processing Service (`/src/services/imageProcessingService.ts`)
- Image compression (JPEG quality: 80%)
- Resizing (max width: 1200px, maintain aspect ratio)
- Format standardization (convert to JPEG)
- File size optimization

### 3. Upload Components
- File input with drag-and-drop
- Image preview with compression preview
- Upload progress indicators
- Error handling and retry logic

### 4. Updated Database Schema
```sql
-- Enhanced vendor_media table
CREATE TABLE vendor_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id TEXT NOT NULL,
  media_url TEXT NOT NULL,
  gdrive_file_id TEXT, -- Google Drive file ID
  original_filename TEXT, -- Original file name
  file_size INTEGER, -- Original file size in bytes
  compressed_size INTEGER, -- Compressed file size in bytes
  media_type TEXT CHECK (media_type IN ('image', 'video')),
  category TEXT CHECK (category IN ('catalog', 'highlights', 'profile', 'brand_logo', 'contact_person')),
  title TEXT,
  description TEXT,
  alt_text TEXT,
  order_index INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  public BOOLEAN DEFAULT TRUE,
  is_highlighted BOOLEAN DEFAULT FALSE,
  upload_status TEXT DEFAULT 'completed' CHECK (upload_status IN ('pending', 'uploading', 'completed', 'failed')),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT fk_vendor_media_vendor FOREIGN KEY (vendor_id) REFERENCES vendors(vendor_id)
);

-- Limit 13 images per vendor
CREATE OR REPLACE FUNCTION enforce_vendor_image_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM vendor_media WHERE vendor_id = NEW.vendor_id) >= 13 THEN
        RAISE EXCEPTION 'Vendor cannot have more than 13 images total';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_vendor_image_limit
    BEFORE INSERT ON vendor_media
    FOR EACH ROW
    EXECUTE FUNCTION enforce_vendor_image_limit();
```

## 🔑 Google Drive API Requirements

### Authentication Setup
1. **Google Cloud Console Project**
2. **Drive API enabled**
3. **Service Account** with Drive access
4. **API Keys** and credentials

### Required Permissions
- `https://www.googleapis.com/auth/drive.file`
- `https://www.googleapis.com/auth/drive.folders`

## 📱 UI/UX Changes

### 1. Replace URL Inputs with File Uploads
```jsx
// Before: URL input
<Input type="url" placeholder="https://..." />

// After: File upload
<FileUpload 
  accept="image/*"
  maxFiles={13}
  onUpload={handleImageUpload}
  compression={true}
/>
```

### 2. Upload Progress
- Progress bars for each upload
- Compression preview
- Success/error states
- Retry functionality

### 3. Image Management
- Drag-and-drop reordering
- Highlight selection (up to 3)
- Delete functionality
- Bulk operations

## 🚀 Implementation Priority

### Phase 1: Foundation
1. Google Drive service setup
2. Image compression service
3. Database schema updates
4. Basic file upload component

### Phase 2: Integration
1. Replace URL inputs with file uploads
2. Update vendor edit form
3. Update admin interfaces
4. Testing and validation

### Phase 3: Enhancement
1. Bulk upload functionality
2. Image optimization
3. Performance improvements
4. User experience polish

## 💰 Cost Considerations
- **Google Drive Storage**: Free tier (15GB) or paid plans
- **API Calls**: Minimal cost for file operations
- **Bandwidth**: Reduced by compression
- **Performance**: Faster loading with optimized images

## 🔒 Security
- Service account authentication
- Folder-level permissions
- Public URL generation only for approved images
- File type validation and sanitization

Would you like me to proceed with implementing any specific part of this plan?
