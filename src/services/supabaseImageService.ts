// Supabase Storage service - No backend needed!
// Uses your existing Supabase project for image storage

import { supabase } from '../lib/supabase';

interface UploadResult {
  success: boolean;
  fileId?: string;
  publicUrl?: string;
  error?: string;
}

class SupabaseImageService {
  private bucketName = 'vendor-images'; // We'll create this bucket

  constructor() {
    console.log('Supabase Image Service initialized');
    console.log('Using bucket:', this.bucketName);
  }

  // Upload image to Supabase Storage
  async uploadImage(
    file: File, 
    vendorId: string, 
    category: string,
    title?: string
  ): Promise<UploadResult> {
    try {
      console.log(`🚀 Uploading to Supabase Storage...`);
      console.log(`Vendor: ${vendorId}, Category: ${category}, File: ${file.name}`);

      // Create organized file path based on category
      const timestamp = Date.now();
      const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      
      // For single-image categories (brand_logo, contact_person), use simpler naming
      let fileName: string;
      if (category === 'brand_logo' || category === 'contact_person') {
        fileName = `${vendorId}/${category}/${category}_${timestamp}.${extension}`;
      } else {
        fileName = `${vendorId}/${category}/${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      }

      console.log('Upload path:', fileName);
      console.log('Category:', category);
      console.log('Vendor folder structure will be:', `${vendorId}/${category}/`);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Supabase upload error:', error);
        throw new Error(error.message);
      }

      console.log('✅ Upload successful:', data);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;

      console.log('✅ Public URL generated:', publicUrl);

      // Save to vendor_media table
      const mediaRecord = {
        id: crypto.randomUUID(),
        vendor_id: vendorId,
        media_url: publicUrl,
        gdrive_file_id: data.id || fileName, // Use Supabase path as ID
        original_filename: file.name,
        file_size: file.size,
        compressed_size: file.size, // Supabase handles compression
        compression_ratio: 0, // Supabase optimizes automatically
        media_type: 'image',
        category: category,
        title: title || file.name,
        description: `Image uploaded to Supabase Storage`,
        alt_text: `${category} image for vendor ${vendorId}`,
        order_index: 0,
        featured: false,
        public: true,
        is_highlighted: false,
        upload_status: 'completed',
        uploaded_at: new Date().toISOString()
      };

      // Insert into database
      const { data: dbData, error: dbError } = await supabase
        .from('vendor_media')
        .insert(mediaRecord)
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        // Don't fail the upload if database fails
        console.warn('Upload successful but database update failed');
      } else {
        console.log('✅ Image saved to database:', dbData);
      }

      return {
        success: true,
        fileId: data.id || fileName,
        publicUrl: publicUrl
      };

    } catch (error) {
      console.error('❌ Supabase upload failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Check if bucket exists and create if needed
  async initializeBucket(): Promise<boolean> {
    try {
      // Try to list files in bucket (this will fail if bucket doesn't exist)
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .list('', { limit: 1 });

      if (error && error.message.includes('not found')) {
        console.log('📦 Creating vendor-images bucket...');
        
        // Create bucket
        const { data: bucketData, error: bucketError } = await supabase.storage
          .createBucket(this.bucketName, {
            public: true,
            allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
            fileSizeLimit: 10485760 // 10MB
          });

        if (bucketError) {
          console.error('Failed to create bucket:', bucketError);
          return false;
        }

        console.log('✅ Bucket created successfully:', bucketData);
        return true;
      }

      console.log('✅ Bucket already exists');
      return true;

    } catch (error) {
      console.error('Error initializing bucket:', error);
      return false;
    }
  }

  // Get vendor folder URL (for organization)
  getVendorFolderPath(vendorId: string, category?: string): string {
    const basePath = `${vendorId}/`;
    return category ? `${basePath}${category}/` : basePath;
  }

  // List vendor images
  async listVendorImages(vendorId: string, category?: string): Promise<string[]> {
    try {
      const folderPath = this.getVendorFolderPath(vendorId, category);
      
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .list(folderPath);

      if (error) {
        console.error('Error listing images:', error);
        return [];
      }

      return data?.map(file => {
        const { data: urlData } = supabase.storage
          .from(this.bucketName)
          .getPublicUrl(`${folderPath}${file.name}`);
        return urlData.publicUrl;
      }) || [];

    } catch (error) {
      console.error('Error listing vendor images:', error);
      return [];
    }
  }

  // Delete image
  async deleteImage(filePath: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) {
        console.error('Error deleting image:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  }

  // Check if service is ready
  isConfigured(): boolean {
    return true; // Always configured since we use existing Supabase
  }
}

export const supabaseImageService = new SupabaseImageService();
export default supabaseImageService;
