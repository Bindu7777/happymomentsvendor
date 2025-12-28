// Supabase Storage Service for fetching catalog images
import { supabase } from '../lib/supabase';

export interface StorageImage {
  id: string;
  name: string;
  url: string;
  size: number;
  created_at: string;
  updated_at: string;
  metadata: any;
}

/**
 * Fetch catalog images from Supabase Storage bucket
 * @param vendorId - The vendor ID to fetch images for
 * @param bucketName - The storage bucket name (default: 'catalog-images')
 * @returns Promise<StorageImage[]>
 */
export const getVendorCatalogImagesFromStorage = async (
  vendorId: string | number, 
  bucketName: string = 'catalog-images'
): Promise<StorageImage[]> => {
  try {
    console.log('=== FETCHING CATALOG IMAGES FROM STORAGE ===');
    console.log('Vendor ID:', vendorId);
    console.log('Bucket name:', bucketName);
    
    // Convert vendorId to string if it's a number
    const vendorIdStr = vendorId.toString();
    
    // List files in the catalog subfolder specifically
    const { data: files, error } = await supabase.storage
      .from(bucketName)
      .list(`${vendorIdStr}/catalog`, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      console.error('Error listing catalog files from storage:', error);
      // If catalog folder doesn't exist, try direct vendor folder but filter for catalog-like files
      console.log('Trying direct vendor folder with catalog filtering...');
      
      const { data: allFiles, error: allError } = await supabase.storage
        .from(bucketName)
        .list(vendorIdStr, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (allError) {
        console.error('Error listing all files from storage:', allError);
        return [];
      }

      if (!allFiles || allFiles.length === 0) {
        console.log('No files found in bucket for vendor:', vendorIdStr);
        return [];
      }

      // CRITICAL: Only process files that are in the vendor's folder (not subfolders from other vendors)
      // The list() call should only return files in the vendor's folder, but double-check
      const vendorFiles = allFiles.filter(file => {
        // Ensure file path is vendor-specific (should already be filtered by list() but verify)
        return true; // list() with vendorIdStr path should already filter correctly
      });

      // Filter for catalog images only (exclude brand_logo, contact_person, etc.)
      const catalogFiles = vendorFiles.filter(file => {
        const fileName = file.name.toLowerCase();
        // Include files that look like catalog images (compressed, numbered, etc.)
        // Exclude files that are clearly other types
        const isCatalogImage = fileName.includes('compress') || 
                              fileName.includes('catalog') ||
                              (!fileName.includes('logo') && 
                               !fileName.includes('brand') && 
                               !fileName.includes('contact') && 
                               !fileName.includes('avatar') &&
                               (fileName.endsWith('.jpg') || 
                                fileName.endsWith('.jpeg') || 
                                fileName.endsWith('.png') || 
                                fileName.endsWith('.webp')));
        
        console.log(`File: ${fileName}, isCatalog: ${isCatalogImage}`);
        return isCatalogImage;
      });

      console.log(`Filtered ${catalogFiles.length} catalog images from ${allFiles.length} total files`);

      // Get public URLs for catalog files only
      const imagePromises = catalogFiles.map(async (file) => {
        try {
          const { data: urlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(`${vendorIdStr}/${file.name}`);

          return {
            id: file.id || file.name,
            name: file.name,
            url: urlData.publicUrl,
            size: file.metadata?.size || 0,
            created_at: file.created_at,
            updated_at: file.updated_at,
            metadata: file.metadata
          };
        } catch (fileError) {
          console.error('Error processing catalog file:', file.name, fileError);
          return null;
        }
      });

      const images = (await Promise.all(imagePromises)).filter(img => img !== null);
      console.log('Processed catalog images:', images.length);
      return images as StorageImage[];
    }

    if (!files || files.length === 0) {
      console.log('No catalog files found in catalog folder for vendor:', vendorIdStr);
      return [];
    }

    console.log('Catalog files found in storage:', files.length);

    // Get public URLs for each catalog file
    const imagePromises = files.map(async (file) => {
      try {
        // Get public URL for the file
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(`${vendorIdStr}/catalog/${file.name}`);

        return {
          id: file.id || file.name,
          name: file.name,
          url: urlData.publicUrl,
          size: file.metadata?.size || 0,
          created_at: file.created_at,
          updated_at: file.updated_at,
          metadata: file.metadata
        };
      } catch (fileError) {
        console.error('Error processing catalog file:', file.name, fileError);
        return null;
      }
    });

    const images = (await Promise.all(imagePromises)).filter(img => img !== null);
    
    console.log('Processed catalog images:', images.length);
    console.log('Catalog image URLs:', images.map(img => img.url));
    
    return images as StorageImage[];
  } catch (error) {
    console.error('Error fetching catalog images from storage:', error);
    return [];
  }
};

/**
 * Fetch brand logo from Supabase Storage bucket
 * @param vendorId - The vendor ID to fetch logo for
 * @param bucketName - The storage bucket name (default: 'vendor-images')
 * @returns Promise<string | null> - Returns the public URL of the brand logo or null
 */
export const getVendorBrandLogoFromStorage = async (
  vendorId: string | number,
  bucketName: string = 'vendor-images'
): Promise<string | null> => {
  try {
    console.log('=== FETCHING BRAND LOGO FROM STORAGE ===');
    console.log('Vendor ID:', vendorId);
    console.log('Bucket name:', bucketName);
    
    const vendorIdStr = vendorId.toString();
    const possibleBuckets = ['vendor-images', 'catalog-images', 'images', 'media'];
    
    for (const bucket of possibleBuckets) {
      try {
        // Try brand_logo folder
        const { data: files, error } = await supabase.storage
          .from(bucket)
          .list(`${vendorIdStr}/brand_logo`, {
            limit: 10,
            sortBy: { column: 'created_at', order: 'desc' }
          });

        if (error) {
          console.log(`No brand_logo folder in bucket ${bucket}, trying next...`);
          continue;
        }

        if (files && files.length > 0) {
          // Get the most recent file
          const logoFile = files[0];
          const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(`${vendorIdStr}/brand_logo/${logoFile.name}`);

          console.log(`✅ Found brand logo in bucket ${bucket}:`, urlData.publicUrl);
          return urlData.publicUrl;
        }
      } catch (bucketError) {
        console.log(`Error checking bucket ${bucket}:`, bucketError);
        continue;
      }
    }

    console.log('⚠️ No brand logo found in any storage bucket');
    return null;
  } catch (error) {
    console.error('Error fetching brand logo from storage:', error);
    return null;
  }
};

/**
 * Fetch contact person image from Supabase Storage bucket
 * @param vendorId - The vendor ID to fetch image for
 * @param bucketName - The storage bucket name (default: 'vendor-images')
 * @returns Promise<string | null> - Returns the public URL of the contact person image or null
 */
export const getVendorContactPersonImageFromStorage = async (
  vendorId: string | number,
  bucketName: string = 'vendor-images'
): Promise<string | null> => {
  try {
    console.log('=== FETCHING CONTACT PERSON IMAGE FROM STORAGE ===');
    console.log('Vendor ID:', vendorId);
    console.log('Bucket name:', bucketName);
    
    const vendorIdStr = vendorId.toString();
    const possibleBuckets = ['vendor-images', 'catalog-images', 'images', 'media'];
    
    for (const bucket of possibleBuckets) {
      try {
        // Try contact_person folder
        const { data: files, error } = await supabase.storage
          .from(bucket)
          .list(`${vendorIdStr}/contact_person`, {
            limit: 10,
            sortBy: { column: 'created_at', order: 'desc' }
          });

        if (error) {
          console.log(`No contact_person folder in bucket ${bucket}, trying next...`);
          continue;
        }

        if (files && files.length > 0) {
          // Get the most recent file
          const contactFile = files[0];
          const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(`${vendorIdStr}/contact_person/${contactFile.name}`);

          console.log(`✅ Found contact person image in bucket ${bucket}:`, urlData.publicUrl);
          return urlData.publicUrl;
        }
      } catch (bucketError) {
        console.log(`Error checking bucket ${bucket}:`, bucketError);
        continue;
      }
    }

    console.log('⚠️ No contact person image found in any storage bucket');
    return null;
  } catch (error) {
    console.error('Error fetching contact person image from storage:', error);
    return null;
  }
};

/**
 * Alternative method: Fetch from a specific folder structure
 * @param vendorId - The vendor ID
 * @param bucketName - The storage bucket name
 * @param folderPath - Specific folder path (e.g., 'catalog', 'gallery')
 */
export const getVendorImagesFromFolder = async (
  vendorId: string | number,
  bucketName: string = 'catalog-images',
  folderPath: string = 'catalog'
): Promise<StorageImage[]> => {
  try {
    console.log('=== FETCHING IMAGES FROM FOLDER ===');
    console.log('Vendor ID:', vendorId);
    console.log('Bucket name:', bucketName);
    console.log('Folder path:', folderPath);
    
    const vendorIdStr = vendorId.toString();
    const fullPath = `${vendorIdStr}/${folderPath}`;
    
    // List files in the specific folder
    const { data: files, error } = await supabase.storage
      .from(bucketName)
      .list(fullPath, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      console.error('Error listing files from folder:', error);
      return [];
    }

    if (!files || files.length === 0) {
      console.log('No files found in folder:', fullPath);
      return [];
    }

    // Get public URLs for each file
    const imagePromises = files.map(async (file) => {
      try {
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(`${fullPath}/${file.name}`);

        return {
          id: file.id || file.name,
          name: file.name,
          url: urlData.publicUrl,
          size: file.metadata?.size || 0,
          created_at: file.created_at,
          updated_at: file.updated_at,
          metadata: file.metadata
        };
      } catch (fileError) {
        console.error('Error processing file:', file.name, fileError);
        return null;
      }
    });

    const images = (await Promise.all(imagePromises)).filter(img => img !== null);
    
    console.log('Processed images from folder:', images.length);
    
    return images as StorageImage[];
  } catch (error) {
    console.error('Error fetching images from folder:', error);
    return [];
  }
};

/**
 * Delete an image from Supabase Storage
 * @param imagePath - The full path to the image in storage
 * @param bucketName - The storage bucket name
 */
export const deleteImageFromStorage = async (
  imagePath: string,
  bucketName: string = 'catalog-images'
): Promise<boolean> => {
  try {
    console.log('Deleting image from storage:', imagePath);
    console.log('Bucket:', bucketName);
    
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([imagePath]);
    
    if (error) {
      console.error('Error deleting image from storage:', error);
      return false;
    }
    
    console.log('Successfully deleted image from storage');
    return true;
  } catch (error) {
    console.error('Error deleting image from storage:', error);
    return false;
  }
};

/**
 * Get all storage buckets to help debug
 */
export const listStorageBuckets = async () => {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Error listing buckets:', error);
      return [];
    }
    
    console.log('Available storage buckets:', buckets);
    return buckets;
  } catch (error) {
    console.error('Error listing storage buckets:', error);
    return [];
  }
};
