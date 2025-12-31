// services/supabaseService.ts
import { supabase, Vendor, VendorMedia } from "../lib/supabase";
import { CATEGORY_NAMES, CATEGORY_CODES } from "../constants/categories";
import { PostgrestError } from "@supabase/supabase-js";

// Helper function to parse JSON fields in vendor data
const parseVendorJsonFields = (vendorData: any): Vendor => {
  // Parse JSON fields if they are strings
  if (vendorData.services && typeof vendorData.services === 'string') {
    try {
      vendorData.services = JSON.parse(vendorData.services);
    } catch (e) {
      console.warn('Failed to parse services JSON:', e);
    }
  }
  
  if (vendorData.packages && typeof vendorData.packages === 'string') {
    try {
      vendorData.packages = JSON.parse(vendorData.packages);
    } catch (e) {
      console.warn('Failed to parse packages JSON:', e);
    }
  }
  
  if (vendorData.specialties && typeof vendorData.specialties === 'string') {
    try {
      vendorData.specialties = JSON.parse(vendorData.specialties);
    } catch (e) {
      console.warn('Failed to parse specialties JSON:', e);
    }
  }
  
  // customer_reviews column was deleted from database - no processing needed
  
  if (vendorData.booking_policies && typeof vendorData.booking_policies === 'string') {
    try {
      vendorData.booking_policies = JSON.parse(vendorData.booking_policies);
    } catch (e) {
      console.warn('Failed to parse booking_policies JSON:', e);
    }
  }
  
  if (vendorData.additional_info && typeof vendorData.additional_info === 'string') {
    try {
      vendorData.additional_info = JSON.parse(vendorData.additional_info);
    } catch (e) {
      console.warn('Failed to parse additional_info JSON:', e);
    }
  }

  if (vendorData.catalog_images_metadata && typeof vendorData.catalog_images_metadata === 'string') {
    try {
      vendorData.catalog_images_metadata = JSON.parse(vendorData.catalog_images_metadata);
    } catch (e) {
      console.warn('Failed to parse catalog_images_metadata JSON:', e);
    }
  }

  // CRITICAL: Normalize and clean categories field - PRIORITIZE categories over category
  // Clean malformed entries like ["{Caterers}"] or ["{\"Event Planners\"}"]
  const normalizeCategories = (cats: any): string[] => {
    if (!cats) return [];
    if (Array.isArray(cats)) {
      return cats
        .map((cat: any) => {
          if (typeof cat === 'string') {
            // Remove curly braces, escaped quotes, and trim
            let cleaned = cat.replace(/^\{+|\}+$/g, '').replace(/\\"/g, '"').replace(/^"+|"+$/g, '').trim();
            return cleaned;
          }
          return String(cat).trim();
        })
        .filter((cat: string) => cat && cat !== '');
    }
    if (typeof cats === 'string') {
      return [cats.trim()].filter(c => c !== '');
    }
    return [];
  };

  // PRIORITIZE categories field (new field), fallback to category (old field)
  if (vendorData.categories !== undefined && vendorData.categories !== null) {
    vendorData.categories = normalizeCategories(vendorData.categories);
  } else if (vendorData.category !== undefined && vendorData.category !== null) {
    // If categories doesn't exist, normalize category and set it as categories
    vendorData.categories = normalizeCategories(vendorData.category);
  } else {
    vendorData.categories = [];
  }

  // Ensure categories is always an array
  if (!Array.isArray(vendorData.categories)) {
    vendorData.categories = normalizeCategories(vendorData.categories);
  }

  return vendorData as Vendor;
};

// Test Supabase connection
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('count', { count: 'exact' });
    
    if (error) {
      console.error("Supabase connection test failed:", error);
      return false;
    }
    
    console.log("Supabase connection successful. Vendor count:", data);
    return true;
  } catch (error) {
    console.error("Supabase connection test error:", error);
    return false;
  }
};

export const getVendorByFieldId = async (
  vendorId: string
): Promise<Vendor | null> => {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('vendor_id', vendorId)
      .single();

    if (error) {
      console.error('Error fetching vendor:', error);
      return null;
    }

    return parseVendorJsonFields(data);
  } catch (error) {
    console.error('Error fetching vendor:', error);
    return null;
  }
};

// Generate simple, memorable password
const generatePassword = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 6; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Generate slug from brand name
const generateSlug = (brandName: string): string => {
  return brandName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

export const addVendor = async (vendorData: Omit<Vendor, 'created_at' | 'updated_at'>) => {
  try {
    console.log("Attempting to add vendor with data:", vendorData);
    console.log("Address field specifically:", vendorData.address);
    
    // Generate slug if not provided
    const slug = vendorData.slug || generateSlug(vendorData.brand_name);
    
    // Remove vendor_id from the data to let the database auto-generate it
    const { vendor_id, ...dataWithoutVendorId } = vendorData;
    
    // Add slug to the data
    const vendorDataWithSlug = {
      ...dataWithoutVendorId,
      slug: slug
    };
    
    const { data, error } = await supabase
      .from('vendors')
      .insert([vendorDataWithSlug])
      .select()
      .single();

    if (error) {
      console.error("Supabase error adding vendor:", error);
      console.error("Error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw new Error(`Failed to add vendor: ${error.message}`);
    }

    console.log("Vendor added successfully with ID:", data.vendor_id);
    console.log("Address field in stored data:", data.address);
    
    // Create vendor credentials
    const password = generatePassword();
    const credentialsData = {
      vendor_id: data.vendor_id,
      username: data.vendor_id.toString(), // Use vendor_id as username
      password: password,
      is_active: true,
      created_at: new Date().toISOString(),
      last_login: null
    };

    const { error: credentialsError } = await supabase
      .from('vendor_credentials')
      .insert([credentialsData]);

    if (credentialsError) {
      console.error("Error creating vendor credentials:", credentialsError);
      // Don't throw error here, just log it - vendor is already created
      console.warn("Vendor created but credentials creation failed. Credentials can be created manually.");
    } else {
      console.log("Vendor credentials created successfully");
      console.log("Generated credentials:", {
        username: credentialsData.username,
        password: credentialsData.password
      });
    }

    return data.vendor_id;
  } catch (error) {
    console.error("Error adding vendor:", error);
    throw error;
  }
};

export const checkPhoneUnique = async (phone: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('vendor_id')
      .eq('phone_number', phone);

    if (error) {
      console.error('Error checking phone uniqueness:', error);
      return false;
    }

    return data.length === 0; // true if no vendor has this phone
  } catch (error) {
    console.error('Error checking phone uniqueness:', error);
    return false;
  }
};

// Get all vendors (for public display - only verified and available)
export const getAllVendors = async (): Promise<Vendor[]> => {
  try {
    console.log('=== GET ALL VENDORS DEBUG ===');
    
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      // Temporarily remove filters to see all vendors
      // .eq('verified', true)
      // .eq('currently_available', true)
      .order('created_at', { ascending: false });

    console.log('Supabase query result:', { data, error });

    if (error) {
      console.error('Error fetching vendors:', error);
      return [];
    }

    console.log('Returning all vendors:', data);
    return data as Vendor[];
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return [];
  }
};

// Get all vendors for admin (includes unverified and unavailable)
export const getAllVendorsForAdmin = async (): Promise<Vendor[]> => {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching vendors for admin:', error);
      return [];
    }

    return data as Vendor[];
  } catch (error) {
    console.error('Error fetching vendors for admin:', error);
    return [];
  }
};

// Get vendors by category
export const getVendorsByCategory = async (category: string): Promise<Vendor[]> => {
  try {
    console.log('=== GET VENDORS BY CATEGORY DEBUG ===');
    console.log('Looking for category:', category);
    
    // Get all valid category names from constants for exact matching
    const validCategoryNames = Object.values(CATEGORY_NAMES);
    
    // Normalize the search category to match against valid category names
    const normalizeSearchCategory = (searchCat: string): string => {
      const lowerSearch = searchCat.toLowerCase().trim();
      
      // Try exact match first (case-insensitive)
      for (const validName of validCategoryNames) {
        if (validName.toLowerCase() === lowerSearch) {
          return validName;
        }
      }
      
      // Try normalized match (remove slashes and spaces)
      const normalizedSearch = lowerSearch.replace(/[\/\s]/g, '');
      for (const validName of validCategoryNames) {
        const normalizedValid = validName.toLowerCase().replace(/[\/\s]/g, '');
        if (normalizedValid === normalizedSearch) {
          return validName;
        }
      }
      
      // Return original if no match found
      return searchCat;
    };
    
    const normalizedSearchCategory = normalizeSearchCategory(category);
    console.log('Normalized search category:', normalizedSearchCategory);
    
    // Fetch all vendors first to avoid URL encoding issues with special characters
    const { data: allVendors, error: fetchError } = await supabase
      .from('vendors')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching vendors:', fetchError);
      return [];
    }

    if (!allVendors || allVendors.length === 0) {
      console.log('No vendors found in database');
      return [];
    }

      // Log unique categories to help debug
    const uniqueCategories = [...new Set(allVendors.map(v => {
      const cats = Array.isArray(v.category) ? v.category : (v.categories || (v.category ? [v.category] : []));
      return cats;
    }).flat())];
      console.log('Unique categories found in database:', uniqueCategories);
      
    // Filter vendors by category - check if vendor has the category in their categories array
      const filteredVendors = allVendors.filter(vendor => {
      // Get all categories for this vendor (handle both string and array formats)
      const vendorCategories: string[] = [];
      
      // Check categories field first (new array field)
      if (vendor.categories && Array.isArray(vendor.categories)) {
        vendorCategories.push(...vendor.categories.filter(c => typeof c === 'string'));
      }
      
      // Check category field (legacy - can be string or array)
      if (vendor.category) {
        if (Array.isArray(vendor.category)) {
          vendorCategories.push(...vendor.category.filter(c => typeof c === 'string'));
        } else if (typeof vendor.category === 'string') {
          vendorCategories.push(vendor.category);
        }
      }
      
      if (vendorCategories.length === 0) {
        return false;
      }
      
      // Check if any of the vendor's categories match the search category
      const hasMatch = vendorCategories.some(vendorCat => {
        const vendorCatStr = String(vendorCat).trim();
        const searchCatStr = normalizedSearchCategory.trim();
          
          // Exact match (case-insensitive)
        if (vendorCatStr.toLowerCase() === searchCatStr.toLowerCase()) {
            return true;
          }
          
        // Normalized match (remove slashes, spaces, case)
        const normalizedVendor = vendorCatStr.toLowerCase().replace(/[\/\s]/g, '');
        const normalizedSearch = searchCatStr.toLowerCase().replace(/[\/\s]/g, '');
          
          if (normalizedVendor === normalizedSearch) {
            return true;
          }
          
        // Also check if vendor category matches any valid category name that matches search
        for (const validName of validCategoryNames) {
          const validLower = validName.toLowerCase();
          const searchLower = searchCatStr.toLowerCase();
          
          // If search category matches this valid name, check if vendor has this valid name
          if (validLower === searchLower || validLower.replace(/[\/\s]/g, '') === searchLower.replace(/[\/\s]/g, '')) {
            if (vendorCatStr.toLowerCase() === validLower || 
                vendorCatStr.toLowerCase().replace(/[\/\s]/g, '') === validLower.replace(/[\/\s]/g, '')) {
              return true;
            }
          }
          }
          
          return false;
        });
        
        return hasMatch;
      });
      
    console.log(`Filtered ${filteredVendors.length} vendors for category "${category}" (normalized: "${normalizedSearchCategory}")`);
      
      if (filteredVendors.length > 0) {
      console.log('Sample vendors found:', filteredVendors.slice(0, 3).map(v => {
        const cats = Array.isArray(v.category) ? v.category : (v.categories || (v.category ? [v.category] : []));
        return {
          name: v.brand_name,
          categories: cats
        };
      }));
      }
      
      // Parse JSON fields and ensure rating is properly handled
      const parsedVendors = filteredVendors.map(vendor => {
        const parsed = parseVendorJsonFields(vendor);
        
        // Ensure rating is a number
        if (parsed.rating !== null && parsed.rating !== undefined) {
          if (typeof parsed.rating === 'string') {
            // Handle string ratings like "4/5" or "4" or "4.0"
            const numStr = String(parsed.rating).split('/')[0].trim();
            parsed.rating = parseFloat(numStr) || 0;
          }
        }
        
        // Debug logging for Siva Events
        if (parsed.brand_name && parsed.brand_name.toLowerCase().includes('siva')) {
          console.log('🔍 Siva Events in getVendorsByCategory:', {
            brand_name: parsed.brand_name,
            rating: parsed.rating,
            ratingType: typeof parsed.rating
          });
        }
        
        return parsed;
      });
      
      return parsedVendors as Vendor[];
  } catch (error) {
    console.error('Error fetching vendors by category:', error);
    return [];
  }
};

// Get vendor counts by category for homepage
export const getVendorCounts = async (): Promise<Record<string, number>> => {
  try {
    // Fetch all vendors with category and categories fields
    const { data, error } = await supabase
      .from('vendors')
      .select('category, categories');

    if (error) {
      console.error('Error fetching vendor counts:', error);
      return {};
    }

    if (!data || data.length === 0) {
      console.log('No vendors found');
      return {};
    }

    // Get all valid category names from constants
    const validCategoryNames = Object.values(CATEGORY_NAMES);
    
    // Initialize counts for all categories
    const counts: Record<string, number> = {};
    validCategoryNames.forEach(catName => {
      counts[catName] = 0;
    });

    // Helper to check if a category string matches any valid category name
    const matchesCategory = (categoryValue: string | string[] | null | undefined): string[] => {
      const matchedCategories: string[] = [];
      
      if (!categoryValue) return matchedCategories;
      
      // Handle array format
      if (Array.isArray(categoryValue)) {
        categoryValue.forEach(cat => {
          if (typeof cat === 'string' && validCategoryNames.includes(cat)) {
            matchedCategories.push(cat);
          }
        });
        return matchedCategories;
      }
      
      // Handle string format
      if (typeof categoryValue === 'string') {
        // Check for exact match first
        if (validCategoryNames.includes(categoryValue)) {
          matchedCategories.push(categoryValue);
          return matchedCategories;
        }
        
        // Try case-insensitive match
        const lowerValue = categoryValue.toLowerCase().trim();
        validCategoryNames.forEach(validName => {
          if (validName.toLowerCase() === lowerValue) {
            matchedCategories.push(validName);
          }
        });
      }
      
      return matchedCategories;
    };

    // Count vendors by category
    data.forEach(vendor => {
      // Check both category and categories fields
      const categoryMatches = matchesCategory(vendor.category);
      const categoriesMatches = matchesCategory(vendor.categories);
      
      // Combine and deduplicate matches
      const allMatches = [...new Set([...categoryMatches, ...categoriesMatches])];
      
      // Increment count for each matched category
      allMatches.forEach(catName => {
        counts[catName] = (counts[catName] || 0) + 1;
      });
    });

    console.log('Vendor counts by category:', counts);
    console.log('Total vendors processed:', data.length);

    return counts;
  } catch (error) {
    console.error('Error fetching vendor counts:', error);
    return {};
  }
};

// Get vendor media
export const getVendorMedia = async (vendorId: number | string, category?: string): Promise<VendorMedia[]> => {
  try {
    // Convert vendorId to string to match database column type
    const vendorIdStr = typeof vendorId === 'number' ? vendorId.toString() : vendorId;
    const vendorIdNum = typeof vendorId === 'string' ? parseInt(vendorId) : vendorId;
    
    console.log(`=== FETCHING VENDOR MEDIA ===`);
    console.log(`Vendor ID (string): ${vendorIdStr}`);
    console.log(`Vendor ID (number): ${vendorIdNum}`);
    console.log(`Category: ${category || 'all'}`);
    
    // Try querying with string first
    let query = supabase
      .from('vendor_media')
      .select('*')
      .or(`vendor_id.eq.${vendorIdStr},vendor_id.eq."${vendorIdStr}"`)
      .order('order_index', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    let { data, error } = await query;

    // If no results and we have a numeric ID, try with number
    if ((!data || data.length === 0) && !isNaN(vendorIdNum)) {
      console.log('Trying with numeric vendor_id...');
      let numQuery = supabase
        .from('vendor_media')
        .select('*')
        .eq('vendor_id', vendorIdNum)
        .order('order_index', { ascending: true });

      if (category) {
        numQuery = numQuery.eq('category', category);
      }

      const numResult = await numQuery;
      if (numResult.data && numResult.data.length > 0) {
        data = numResult.data;
        error = numResult.error;
        console.log('✅ Found records with numeric query');
      }
    }

    if (error) {
      console.error('❌ Error fetching vendor media:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      console.error('Query details - vendor_id:', vendorIdStr, 'category:', category);
      
      // Try a raw query to see what's in the table
      const { data: allData, error: allError } = await supabase
        .from('vendor_media')
        .select('vendor_id, category, media_url')
        .limit(10);
      
      if (!allError && allData) {
        console.log('Sample vendor_media records:', allData);
        console.log('Sample vendor_id types:', allData.map(d => ({ vendor_id: d.vendor_id, type: typeof d.vendor_id })));
      }
      
      return [];
    }

    console.log(`✅ Found ${data?.length || 0} media records for vendor ${vendorIdStr}`);
    if (data && data.length > 0) {
      console.log('Media records details:');
      data.forEach((d, idx) => {
        console.log(`  [${idx + 1}] vendor_id: ${d.vendor_id} (${typeof d.vendor_id}), Category: ${d.category}, URL: ${d.media_url?.substring(0, 80)}..., Public: ${d.public}`);
      });
    } else {
      console.log('⚠️ No media records found. Checking if vendor_id format matches...');
      // Try to find any records with similar vendor_id
      const { data: similarData } = await supabase
        .from('vendor_media')
        .select('vendor_id, category')
        .ilike('vendor_id', `%${vendorIdStr}%`)
        .limit(5);
      if (similarData && similarData.length > 0) {
        console.log('Found similar vendor_ids:', similarData.map(d => ({ vendor_id: d.vendor_id, type: typeof d.vendor_id })));
      }
    }

    // Filter by public if needed (but return all for now to debug)
    const filteredData = data?.filter(d => d.public !== false) || data || [];

    return filteredData as VendorMedia[];
  } catch (error) {
    console.error('❌ Exception fetching vendor media:', error);
    return [];
  }
};

// Get highlighted catalog images by combining storage bucket images with metadata
export const getHighlightedCatalogImages = async (vendorId: number): Promise<any[]> => {
  try {
    console.log(`Getting highlighted catalog images for vendor ${vendorId}`);
    
    // Import the storage service functions
    const { getVendorCatalogImagesFromStorage } = await import('./supabaseStorageService');
    
    // First get the vendor data to access catalog_images_metadata
    const { data: vendorData, error: vendorError } = await supabase
      .from('vendors')
      .select('catalog_images_metadata')
      .eq('vendor_id', vendorId)
      .single();

    if (vendorError) {
      console.error('Error fetching vendor data:', vendorError);
      return [];
    }

    if (!vendorData) {
      console.log('Vendor not found');
      return [];
    }

    console.log('Vendor catalog metadata:', vendorData.catalog_images_metadata);

    // Get all catalog images from storage buckets - ONLY from vendor-specific folder
    const possibleBuckets = ['catalog-images', 'vendor-images', 'images', 'media'];
    let allStorageImages: any[] = [];
    const vendorIdStr = vendorId.toString();
    
    for (const bucket of possibleBuckets) {
      const storageImages = await getVendorCatalogImagesFromStorage(vendorId, bucket);
      if (storageImages.length > 0) {
        // Double-check that all images belong to this vendor by verifying URL contains vendor ID
        const vendorSpecificImages = storageImages.filter(img => {
          const urlContainsVendorId = img.url && img.url.includes(`/${vendorIdStr}/`);
          if (!urlContainsVendorId) {
            console.warn(`⚠️ Image URL does not contain vendor ID ${vendorIdStr}:`, img.url);
          }
          return urlContainsVendorId;
        });
        
        if (vendorSpecificImages.length > 0) {
          allStorageImages = vendorSpecificImages;
          console.log(`✅ Found ${vendorSpecificImages.length} vendor-specific catalog images in bucket ${bucket}`);
        break;
        } else {
          console.warn(`⚠️ No vendor-specific images found in bucket ${bucket}, trying next bucket...`);
        }
      }
    }

    console.log('Storage images found:', allStorageImages.length);

    // Get metadata with highlight status
    const metadata = vendorData.catalog_images_metadata || [];
    console.log('Metadata entries:', metadata.length);

    // Match storage images with metadata and filter highlighted ones
    const highlightedImages = allStorageImages.filter(storageImg => {
      const metadataEntry = metadata.find((meta: any) => 
        meta.filename === storageImg.name || 
        meta.media_url === storageImg.url ||
        meta.id === storageImg.id
      );
      return metadataEntry && metadataEntry.is_highlighted === true;
    });

    console.log('Highlighted images found:', highlightedImages.length);
    
    // Transform storage images to the format expected by VendorProfile
    const transformedHighlightedImages = highlightedImages.map(img => ({
      id: img.id,
      name: img.name,
      media_url: img.url, // Convert 'url' to 'media_url' for compatibility
      url: img.url,
      title: img.name,
      filename: img.name,
      size: img.size,
      created_at: img.created_at,
      updated_at: img.updated_at,
      metadata: img.metadata
    }));
    
    // If no highlighted images, return first 3 storage images as fallback
    if (transformedHighlightedImages.length === 0) {
      console.log('No highlighted images, returning first 3 storage images as fallback');
      const fallbackImages = allStorageImages.slice(0, 3).map(img => ({
        id: img.id,
        name: img.name,
        media_url: img.url, // Convert 'url' to 'media_url' for compatibility
        url: img.url,
        title: img.name,
        filename: img.name,
        size: img.size,
        created_at: img.created_at,
        updated_at: img.updated_at,
        metadata: img.metadata
      }));
      return fallbackImages;
    }
    
    return transformedHighlightedImages;

  } catch (error) {
    console.error('Error fetching highlighted catalog images:', error);
    return [];
  }
};

// Get ALL catalog images from storage buckets (not just highlighted ones)
export const getAllCatalogImages = async (vendorId: number): Promise<any[]> => {
  try {
    console.log(`Getting ALL catalog images for vendor ${vendorId}`);
    
    // Import the storage service functions
    const { getVendorCatalogImagesFromStorage } = await import('./supabaseStorageService');
    
    // Get all catalog images from storage buckets - ONLY from vendor-specific folder
    const possibleBuckets = ['catalog-images', 'vendor-images', 'images', 'media'];
    let allStorageImages: any[] = [];
    
    for (const bucket of possibleBuckets) {
      const storageImages = await getVendorCatalogImagesFromStorage(vendorId, bucket);
      if (storageImages.length > 0) {
        // Double-check that all images belong to this vendor by verifying URL contains vendor ID
        const vendorIdStr = vendorId.toString();
        const vendorSpecificImages = storageImages.filter(img => {
          const urlContainsVendorId = img.url && img.url.includes(`/${vendorIdStr}/`);
          if (!urlContainsVendorId) {
            console.warn(`⚠️ Image URL does not contain vendor ID ${vendorIdStr}:`, img.url);
          }
          return urlContainsVendorId;
        });
        
        if (vendorSpecificImages.length > 0) {
          allStorageImages = vendorSpecificImages;
          console.log(`✅ Found ${vendorSpecificImages.length} vendor-specific catalog images in bucket ${bucket}`);
        break;
        } else {
          console.warn(`⚠️ No vendor-specific images found in bucket ${bucket}, trying next bucket...`);
        }
      }
    }

    console.log('All storage catalog images found (vendor-specific):', allStorageImages.length);

    // Transform storage images to the format expected by VendorProfile
    const transformedImages = allStorageImages.map(img => ({
      id: img.id,
      name: img.name,
      media_url: img.url, // Convert 'url' to 'media_url' for compatibility
      url: img.url,
      title: img.name,
      filename: img.name,
      size: img.size,
      created_at: img.created_at,
      updated_at: img.updated_at,
      metadata: img.metadata
    }));
    
    console.log('Transformed catalog images:', transformedImages.length);
    return transformedImages;

  } catch (error) {
    console.error('Error fetching all catalog images:', error);
    return [];
  }
};

// Add a customer review for a vendor
export const addCustomerReview = async (
  vendorId: string,
  customerId: string,
  customerName: string,
  rating: number,
  reviewText: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Adding customer review:', { vendorId, customerId, customerName, rating, reviewText });

    // Check if customer already reviewed this vendor
    const { data: existingReview, error: checkError } = await supabase
      .from('customer_reviews')
      .select('id')
      .eq('vendor_id', vendorId)
      .eq('customer_id', customerId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error checking existing review:', checkError);
      return { success: false, error: 'Failed to check existing review' };
    }

    if (existingReview) {
      return { success: false, error: 'You have already reviewed this vendor' };
    }

    // Insert new review into customer_reviews table
    const { error: insertError } = await supabase
      .from('customer_reviews')
      .insert({
        vendor_id: parseInt(vendorId),
        customer_id: customerId,
        customer_name: customerName,
        rating: rating || null, // Allow null for no rating
        review_text: reviewText,
        is_verified: true,
        is_published: true
      });

    if (insertError) {
      console.error('Error inserting review:', insertError);
      return { success: false, error: 'Failed to save review' };
    }

    console.log('Review added successfully');
    return { success: true };

  } catch (error) {
    console.error('Error adding customer review:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

// Get customer reviews for a vendor from the customer_reviews table
export const getCustomerReviews = async (vendorId: string): Promise<any[]> => {
  try {
    console.log(`Getting customer reviews for vendor ${vendorId}`);

    const { data: reviews, error } = await supabase
      .from('customer_reviews')
      .select('*')
      .eq('vendor_id', vendorId)
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching customer reviews:', error);
      return [];
    }

    // Transform the data to match the expected format
    const transformedReviews = (reviews || []).map(review => ({
      id: review.id,
      customer_id: review.customer_id,
      customer_name: review.customer_name,
      rating: review.rating,
      review: review.review_text,
      date: new Date(review.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      verified: review.is_verified,
      created_at: review.created_at
    }));

    console.log(`Found ${transformedReviews.length} reviews for vendor ${vendorId}`);
    return transformedReviews;

  } catch (error) {
    console.error('Error fetching customer reviews:', error);
    return [];
  }
};

// Toggle highlight status for a catalog image
export const toggleImageHighlight = async (imageId: string, isHighlighted: boolean): Promise<boolean> => {
  try {
    console.log(`Toggling highlight for image ${imageId} to ${isHighlighted}`);
    
    // If trying to highlight, check if vendor already has 3 highlighted images
    if (isHighlighted) {
      const { data: image, error: imageError } = await supabase
        .from('vendor_media')
        .select('vendor_id')
        .eq('id', imageId)
        .single();

      if (imageError) {
        console.error('Error fetching image:', imageError);
        throw new Error('Failed to fetch image information');
      }

      if (image) {
        const { data: highlightedImages, error: highlightedError } = await supabase
          .from('vendor_media')
          .select('id')
          .eq('vendor_id', image.vendor_id)
          .eq('category', 'catalog')
          .eq('is_highlighted', true);

        if (highlightedError) {
          console.error('Error fetching highlighted images:', highlightedError);
          throw new Error('Failed to check highlighted images count');
        }

        if (highlightedImages && highlightedImages.length >= 3) {
          throw new Error('Cannot highlight more than 3 catalog images. Please unhighlight another image first.');
        }
      }
    }

    const { error } = await supabase
      .from('vendor_media')
      .update({ is_highlighted: isHighlighted })
      .eq('id', imageId);

    if (error) {
      console.error('Error updating image highlight:', error);
      throw new Error('Failed to update highlight status: ' + error.message);
    }

    console.log(`Successfully toggled highlight for image ${imageId}`);
    return true;
  } catch (error) {
    console.error('Error toggling image highlight:', error);
    throw error; // Re-throw to let the UI handle the error
  }
};

// Test function to update just verified status
export const updateVendorVerified = async (vendorId: string, verified: boolean): Promise<boolean> => {
  try {
    console.log('Testing verified update for vendor:', vendorId, 'verified:', verified);
    
    const { data, error } = await supabase
      .from('vendors')
      .update({ verified })
      .eq('vendor_id', vendorId)
      .select();

    if (error) {
      console.error('Supabase error updating verified status:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return false;
    }

    console.log('Verified status updated successfully:', data);
    return true;
  } catch (error) {
    console.error('Error updating verified status:', error);
    return false;
  }
};

// Update vendor
export const updateVendor = async (vendorId: string, vendorData: Partial<Vendor>): Promise<boolean> => {
  try {
    console.log('Updating vendor with ID:', vendorId);
    console.log('Vendor data to update:', vendorData);
    
    // Define allowed fields for update (based on actual database schema)
    const allowedFields = [
      'brand_name', 'spoc_name', 'category', 'categories', 'subcategory',  // categories is now supported
      'phone_number', 'alternate_number', 'whatsapp_number', 'email', 'instagram', 'address', 'google_maps_link',
      'experience', 'events_completed', 'quick_intro', 'caption', 'detailed_intro', 'highlight_features',
      'starting_price', 'languages', 'languages_spoken', 'verified', 'currently_available',
      'rating', 'review_count',  // Rating fields
      'services', 'packages', 'deliverables', 'booking_policies', 'additional_info'
    ];
    
    // Filter data to only include allowed fields
    // Note: email and alternate_number can be empty strings (optional fields)
    const cleanedData = Object.fromEntries(
      Object.entries(vendorData).filter(([key, value]) => {
        if (!allowedFields.includes(key)) return false;
        if (value === undefined || value === null) return false;
        // Allow empty strings for email and alternate_number (optional fields)
        if (key === 'email' || key === 'alternate_number') return true;
        // For other fields, filter out empty strings
        if (value === '') return false;
        return true;
      })
    );
    
    console.log('Cleaned vendor data:', cleanedData);
    
    if (Object.keys(cleanedData).length === 0) {
      console.log('No valid fields to update');
      return true; // Nothing to update, consider it successful
    }
    
    const { data, error } = await supabase
      .from('vendors')
      .update(cleanedData)
      .eq('vendor_id', vendorId)
      .select();

    if (error) {
      console.error('Supabase error updating vendor:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      console.error('Failed data:', cleanedData);
      return false;
    }

    console.log('Vendor updated successfully:', data);
    return true;
  } catch (error) {
    console.error('Error updating vendor:', error);
    return false;
  }
};

// Delete vendor
export const deleteVendor = async (vendorId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('vendors')
      .delete()
      .eq('vendor_id', vendorId);

    if (error) {
      console.error('Error deleting vendor:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting vendor:', error);
    return false;
  }
};

// Add vendor media
export const addVendorMedia = async (mediaData: Omit<VendorMedia, 'id' | 'uploaded_at'>): Promise<number | null> => {
  try {
    const { data, error } = await supabase
      .from('vendor_media')
      .insert([mediaData])
      .select()
      .single();

    if (error) {
      console.error('Error adding vendor media:', error);
      return null;
    }

    return data.id;
  } catch (error) {
    console.error('Error adding vendor media:', error);
    return null;
  }
};

// Delete vendor media
export const deleteVendorMedia = async (mediaId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('vendor_media')
      .delete()
      .eq('id', mediaId);

    if (error) {
      console.error('Error deleting vendor media:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting vendor media:', error);
    return false;
  }
};

// Update vendor catalog images (preserving highlight status)
export const updateVendorCatalogImages = async (vendorId: string, imageUrls: string[]): Promise<boolean> => {
  try {
    console.log('Updating catalog images for vendor:', vendorId);
    console.log('New image URLs:', imageUrls);
    
    // First, get existing catalog images to preserve highlight status
    const { data: existingImages, error: fetchError } = await supabase
      .from('vendor_media')
      .select('media_url, is_highlighted')
      .eq('vendor_id', vendorId)
      .eq('category', 'catalog');

    if (fetchError) {
      console.error('Error fetching existing catalog images:', fetchError);
    }

    const existingHighlights = existingImages?.reduce((acc, img) => {
      if (img.is_highlighted) {
        acc[img.media_url] = true;
      }
      return acc;
    }, {} as Record<string, boolean>) || {};

    console.log('Existing highlights to preserve:', existingHighlights);

    // Delete existing catalog images
    const { error: deleteError } = await supabase
      .from('vendor_media')
      .delete()
      .eq('vendor_id', vendorId)
      .eq('category', 'catalog');

    if (deleteError) {
      console.error('Error deleting existing catalog images:', deleteError);
      return false;
    }

    // Then, add new catalog images with preserved highlight status
    if (imageUrls.length > 0) {
      const mediaData = imageUrls.map((url, index) => ({
        vendor_id: vendorId,
        media_url: url,
        media_type: 'image' as const,
        category: 'catalog' as const,
        order_index: index,
        public: true,
        is_highlighted: existingHighlights[url] || false, // Preserve highlight status
        title: `Catalog Image ${index + 1}`
      }));

      console.log('Inserting new catalog images with data:', mediaData);

      const { error: insertError } = await supabase
        .from('vendor_media')
        .insert(mediaData);

      if (insertError) {
        console.error('Error adding new catalog images:', insertError);
        return false;
      }

      console.log('Successfully updated catalog images in vendor_media table');
    }

    return true;
  } catch (error) {
    console.error('Error updating vendor catalog images:', error);
    return false;
  }
};

// Vendor Authentication Functions
export const vendorLogin = async (username: string, password: string): Promise<{success: boolean, vendor?: Vendor, message?: string}> => {
  try {
    // Simple login check against vendor_credentials table
    const { data, error } = await supabase
      .from('vendor_credentials')
      .select(`
        vendor_id,
        username,
        vendors (*)
      `)
      .eq('username', username)
      .eq('password', password)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return { success: false, message: 'Invalid username or password' };
    }

    // Update last login
    await supabase
      .from('vendor_credentials')
      .update({ last_login: new Date().toISOString() })
      .eq('vendor_id', data.vendor_id);

    return { 
      success: true, 
      vendor: parseVendorJsonFields(data.vendors),
      message: 'Login successful' 
    };
  } catch (error) {
    console.error('Error during vendor login:', error);
    return { success: false, message: 'Login failed. Please try again.' };
  }
};

// Check if vendor is logged in (simple session check)
export const getLoggedInVendor = (): Vendor | null => {
  try {
    const vendorData = localStorage.getItem('loggedInVendor');
    return vendorData ? JSON.parse(vendorData) : null;
  } catch (error) {
    console.error('Error getting logged in vendor:', error);
    return null;
  }
};

// Vendor logout
export const vendorLogout = (): void => {
  localStorage.removeItem('loggedInVendor');
  localStorage.removeItem('vendorLoginTime');
};

// Save vendor session
export const saveVendorSession = (vendor: Vendor): void => {
  localStorage.setItem('loggedInVendor', JSON.stringify(vendor));
  localStorage.setItem('vendorLoginTime', new Date().toISOString());
};

// Refresh vendor session with fresh data from database
export const refreshVendorSession = async (): Promise<Vendor | null> => {
  try {
    const currentVendor = getLoggedInVendor();
    if (!currentVendor) {
      return null;
    }

    console.log('Refreshing vendor session data...');
    const freshVendorData = await getVendorByFieldId(currentVendor.vendor_id);
    
    if (freshVendorData) {
      // Update localStorage with fresh data
      saveVendorSession(freshVendorData);
      console.log('Vendor session refreshed with latest data');
      return freshVendorData;
    }
    
    return currentVendor; // Return current data if refresh fails
  } catch (error) {
    console.error('Error refreshing vendor session:', error);
    return getLoggedInVendor(); // Return current data if refresh fails
  }
};

// Vendor Profile Change Workflow Functions
export const submitVendorProfileChange = async (
  vendorId: number, 
  changeType: string, 
  currentData: any, 
  proposedChanges: any
): Promise<{success: boolean, changeId?: number, message?: string}> => {
  try {
    const { data, error } = await supabase
      .from('vendor_profile_changes')
      .insert([{
        vendor_id: vendorId,
        change_type: changeType,
        current_data: currentData,
        proposed_changes: proposedChanges,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) {
      console.error('Error submitting profile change:', error);
      return { success: false, message: 'Failed to submit changes for approval' };
    }

    return { 
      success: true, 
      changeId: data.id,
      message: 'Changes submitted for admin approval' 
    };
  } catch (error) {
    console.error('Error submitting profile change:', error);
    return { success: false, message: 'Failed to submit changes for approval' };
  }
};

// Get vendor's pending changes
export const getVendorPendingChanges = async (vendorId: number): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('vendor_profile_changes')
      .select('*')
      .eq('vendor_id', vendorId)
      .eq('status', 'pending')
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending changes:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching pending changes:', error);
    return [];
  }
};

// Get vendor's most recent rejected change (last 7 days), but only if there are no more recent approved changes
export const getVendorRejectedChanges = async (vendorId: number): Promise<any[]> => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // First, get the most recent rejected change
    const { data: rejectedData, error: rejectedError } = await supabase
      .from('vendor_profile_changes')
      .select('*')
      .eq('vendor_id', vendorId)
      .eq('status', 'rejected')
      .gte('reviewed_at', sevenDaysAgo.toISOString())
      .order('reviewed_at', { ascending: false })
      .limit(1);

    if (rejectedError) {
      console.error('Error fetching rejected changes:', rejectedError);
      return [];
    }

    if (!rejectedData || rejectedData.length === 0) {
      return [];
    }

    const mostRecentRejection = rejectedData[0];
    const rejectionDate = new Date(mostRecentRejection.reviewed_at);

    // Now check if there are any approved changes more recent than this rejection
    const { data: approvedData, error: approvedError } = await supabase
      .from('vendor_profile_changes')
      .select('*')
      .eq('vendor_id', vendorId)
      .eq('status', 'approved')
      .gte('reviewed_at', rejectionDate.toISOString())
      .order('reviewed_at', { ascending: false })
      .limit(1);

    if (approvedError) {
      console.error('Error checking for approved changes:', approvedError);
      // If we can't check for approved changes, return the rejection to be safe
      return [mostRecentRejection];
    }

    // If there are approved changes more recent than the rejection, don't show the rejection
    if (approvedData && approvedData.length > 0) {
      console.log('Found more recent approved changes, not showing rejection');
      return [];
    }

    return [mostRecentRejection];
  } catch (error) {
    console.error('Error fetching rejected changes:', error);
    return [];
  }
};

// Clear hardcoded services from vendor (admin function)
export const clearVendorHardcodedServices = async (vendorId: string): Promise<{success: boolean, message?: string}> => {
  try {
    console.log('Clearing hardcoded services for vendor:', vendorId);
    
    // Get current vendor data
    const { data: currentVendor, error: fetchError } = await supabase
      .from('vendors')
      .select('services, specialties')
      .eq('vendor_id', vendorId)
      .single();

    if (fetchError) {
      console.error('Error fetching vendor for services clearing:', fetchError);
      return { success: false, message: 'Vendor not found' };
    }

    console.log('Current vendor services:', currentVendor.services);
    console.log('Current vendor specialties:', currentVendor.specialties);

    // Clear both services and specialties fields, and any other potential hardcoded fields
    const { error: updateError } = await supabase
      .from('vendors')
      .update({
        services: [],
        specialties: null,
        updated_at: new Date().toISOString()
      })
      .eq('vendor_id', vendorId);

    if (updateError) {
      console.error('Error clearing services:', updateError);
      return { success: false, message: `Failed to clear services: ${updateError.message}` };
    }

    console.log('Successfully cleared hardcoded services for vendor:', vendorId);
    return { success: true, message: 'Hardcoded services cleared successfully' };
  } catch (error) {
    console.error('Error clearing hardcoded services:', error);
    return { success: false, message: 'Failed to clear services' };
  }
};

// Get vendor notifications (from contacted_vendors table)
export const getVendorNotifications = async (vendorId: number, unreadOnly: boolean = false): Promise<any[]> => {
  try {
    console.log(`🔔 Fetching vendor notifications for vendor ID: ${vendorId}`);
    
    let query = supabase
      .from('contacted_vendors')
      .select(`
        contact_id,
        customer_id,
        vendor_id,
        status,
        vendor_notified,
        customer_notified,
        notification_message,
        contacted_at,
        created_at,
        notes
      `)
      .eq('vendor_id', vendorId.toString())
      .order('contacted_at', { ascending: false })
      .limit(20); // Get latest 20 contacts

    // If we only want unread notifications (vendor_notified = true means unread)
    if (unreadOnly) {
      query = query.eq('vendor_notified', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error fetching vendor notifications:', error);
      return [];
    }

    console.log(`📊 Raw vendor notification data:`, data);

    // Get customer details for regular customers (positive customer_id)
    const customerIds = (data || []).map(contact => contact.customer_id).filter(id => id > 0);
    let customerDetails = {};
    
    if (customerIds.length > 0) {
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('id, full_name, email, mobile_number')
        .in('id', customerIds);

      if (customersError) {
        console.error('❌ Error fetching customer details:', customersError);
      } else {
        customerDetails = (customersData || []).reduce((acc, customer) => {
          acc[customer.id] = customer;
          return acc;
        }, {});
        console.log(`✅ Customer details fetched:`, customerDetails);
      }
    }

    // Transform the data to match notification format
    const transformedData = (data || []).map(contact => {
      let customerInfo = null;
      let notificationType = 'contact';
      let title = 'New Customer Contact';
      
      // Handle admin notifications (negative customer_id with Approved/Rejected vendor_status)
      if (contact.customer_id < 0 && (contact.vendor_status === 'Approved' || contact.vendor_status === 'Rejected')) {
        notificationType = 'admin_notification';
        title = contact.vendor_status === 'Approved' ? 'Profile Changes Approved' : 'Profile Changes Rejected';
        customerInfo = {
          full_name: 'Admin',
          mobile_number: '',
          email: ''
        };
      }
      // Handle admin-sent customers (negative customer_id)
      else if (contact.customer_id < 0) {
        notificationType = 'admin_customer';
        title = 'Admin Sent Customer';
        // Extract customer name and phone from notes for admin-sent customers
        const notes = contact.notes || '';
        const nameMatch = notes.match(/Admin-sent customer: ([^(]+)/);
        const phoneMatch = notes.match(/\(([^)]+)\)/);
        
        customerInfo = {
          full_name: nameMatch ? nameMatch[1].trim() : 'Admin-sent Customer',
          mobile_number: phoneMatch ? phoneMatch[1] : '',
          email: ''
        };
      } else {
        // Handle regular customers
        customerInfo = customerDetails[contact.customer_id] || null;
      }

      // Format message: use notification_message if available, otherwise use customer name
      let message = contact.notification_message;
      if (!message && customerInfo) {
        message = `${customerInfo.full_name || 'A customer'} contacted you`;
      } else if (!message) {
        message = 'Customer contacted you';
      }

      return {
        id: contact.contact_id,
        vendor_id: contact.vendor_id,
        customer_id: contact.customer_id,
        notification_type: notificationType,
        title: title,
        message: message,
        is_read: !contact.vendor_notified,
        created_at: contact.contacted_at,
        customers: customerInfo
      };
    });

    console.log(`✅ Transformed vendor notifications:`, transformedData);
    return transformedData;
  } catch (error) {
    console.error('💥 Error fetching vendor notifications:', error);
    return [];
  }
};

// Mark notification as read (for contacted_vendors table)
export const markNotificationAsRead = async (contactId: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('contacted_vendors')
      .update({ vendor_notified: true })
      .eq('contact_id', contactId);

    if (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
};

// Mark all notifications as read for a vendor
export const markAllNotificationsAsRead = async (vendorId: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('contacted_vendors')
      .update({ vendor_notified: false })
      .eq('vendor_id', vendorId.toString())
      .eq('vendor_notified', true);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
};

// Get customer notifications (from contacted_vendors table)
export const getCustomerNotifications = async (customerId: number, unreadOnly: boolean = false): Promise<any[]> => {
  try {
    console.log(`🔔 Fetching customer notifications for customer ID: ${customerId}`);
    
    let query = supabase
      .from('contacted_vendors')
      .select(`
        contact_id,
        customer_id,
        vendor_id,
        vendor_notified,
        customer_notified,
        notification_message,
        contacted_at,
        created_at
      `)
      .eq('customer_id', customerId)
      .order('contacted_at', { ascending: false })
      .limit(50); // Get more contacts to sort properly

    // If we only want unread notifications (customer_notified = true means unread)
    if (unreadOnly) {
      query = query.eq('customer_notified', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error fetching customer notifications:', error);
      return [];
    }

    console.log(`📊 Raw customer notification data:`, data);

    // Get unique vendor IDs from the notifications
    const vendorIds = [...new Set((data || []).map(contact => contact.vendor_id))];
    console.log(`🏢 Fetching vendor details for IDs:`, vendorIds);

    // Fetch vendor details
    let vendorDetails = {};
    if (vendorIds.length > 0) {
      const { data: vendorsData, error: vendorsError } = await supabase
        .from('vendors')
        .select('vendor_id, brand_name, spoc_name, category')
        .in('vendor_id', vendorIds.map(id => parseInt(id)));

      if (vendorsError) {
        console.error('❌ Error fetching vendor details:', vendorsError);
      } else {
        vendorDetails = (vendorsData || []).reduce((acc, vendor) => {
          acc[vendor.vendor_id] = vendor;
          return acc;
        }, {});
        console.log(`✅ Vendor details fetched:`, vendorDetails);
      }
    }

    // Transform the data to match notification format
    const transformedData = (data || []).map(contact => {
      const vendor = vendorDetails[parseInt(contact.vendor_id)];
      const vendorName = vendor?.brand_name || `Vendor ${contact.vendor_id}`;
      
      // Determine the message based on notification type:
      // - If notification_message contains "updated your status", it's a vendor status update - use stored message
      // - Otherwise, it's an initial contact - generate "You contacted {Vendor Name}"
      let customerMessage;
      if (contact.notification_message && contact.notification_message.includes('updated your status')) {
        // This is a status update from vendor - use the stored message (already customer-specific)
        customerMessage = contact.notification_message;
      } else {
        // This is an initial contact - generate customer-specific message
        customerMessage = `You contacted ${vendorName}`;
      }
      
      return {
        id: contact.contact_id,
        vendor_id: contact.vendor_id,
        customer_id: contact.customer_id,
        notification_type: 'status_change',
        title: 'Update',
        message: customerMessage, // Customer-specific message
        is_read: !contact.customer_notified,
        created_at: contact.contacted_at,
        customer_notified: contact.customer_notified, // Keep this for sorting
        vendors: vendor
      };
    });

    // Sort notifications by date: newest first (latest on top)
    transformedData.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA; // Descending order (newest first)
    });

    console.log(`✅ Transformed and sorted customer notifications:`, transformedData);
    return transformedData;
  } catch (error) {
    console.error('💥 Error fetching customer notifications:', error);
    return [];
  }
};

// Mark customer notification as read (for contacted_vendors table)
export const markCustomerNotificationAsRead = async (contactId: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('contacted_vendors')
      .update({ customer_notified: true })
      .eq('contact_id', contactId);

    if (error) {
      console.error('Error marking customer notification as read:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error marking customer notification as read:', error);
    return false;
  }
};

// Mark all customer notifications as read
export const markAllCustomerNotificationsAsRead = async (customerId: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('contacted_vendors')
      .update({ customer_notified: false })
      .eq('customer_id', customerId)
      .eq('customer_notified', true);

    if (error) {
      console.error('Error marking all customer notifications as read:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error marking all customer notifications as read:', error);
    return false;
  }
};

// Clear/delete a single customer notification
export const clearCustomerNotification = async (contactId: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('contacted_vendors')
      .delete()
      .eq('contact_id', contactId);

    if (error) {
      console.error('Error clearing customer notification:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error clearing customer notification:', error);
    return false;
  }
};

// Get all pending changes for admin review
export const getAllPendingChanges = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('vendor_profile_changes')
      .select(`
        *,
        vendors (brand_name, category, spoc_name)
      `)
      .eq('status', 'pending')
      .order('submitted_at', { ascending: true });

    if (error) {
      console.error('Error fetching all pending changes:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching all pending changes:', error);
    return [];
  }
};

// Admin approve/reject changes
export const reviewVendorProfileChange = async (
  changeId: number,
  status: 'approved' | 'rejected',
  adminUsername: string,
  adminComments?: string
): Promise<{success: boolean, message?: string}> => {
  try {
    // Get the change record first
    const { data: changeRecord, error: fetchError } = await supabase
      .from('vendor_profile_changes')
      .select('*')
      .eq('id', changeId)
      .eq('status', 'pending')
      .single();

    if (fetchError || !changeRecord) {
      return { success: false, message: 'Change request not found or already processed' };
    }

    // Update the change record status
    const { error: updateError } = await supabase
      .from('vendor_profile_changes')
      .update({
        status: status,
        reviewed_by: adminUsername,
        reviewed_at: new Date().toISOString(),
        admin_comments: adminComments,
        updated_at: new Date().toISOString()
      })
      .eq('id', changeId);

    if (updateError) {
      console.error('Error updating change status:', updateError);
      return { success: false, message: 'Failed to update change status' };
    }

    // If approved, apply changes to vendors table
    if (status === 'approved') {
      let proposedChanges = changeRecord.proposed_changes;
      
      // CRITICAL: If proposed_changes is a string (JSON), parse it
      if (typeof proposedChanges === 'string') {
        try {
          proposedChanges = JSON.parse(proposedChanges);
        } catch (e) {
          console.error('Error parsing proposed_changes JSON:', e);
          return { success: false, message: 'Invalid proposed changes format' };
        }
      }
      
      console.log('Applying changes to vendor:', changeRecord.vendor_id);
      console.log('Proposed changes (raw):', proposedChanges);
      console.log('Proposed changes category type:', typeof proposedChanges?.category, 'IsArray:', Array.isArray(proposedChanges?.category));
      console.log('Proposed changes categories type:', typeof proposedChanges?.categories, 'IsArray:', Array.isArray(proposedChanges?.categories));
      
      // First check if vendor exists and get current data
      const { data: existingVendor, error: fetchVendorError } = await supabase
        .from('vendors')
        .select('*')
        .eq('vendor_id', changeRecord.vendor_id)
        .single();

      if (fetchVendorError || !existingVendor) {
        console.error('Vendor not found:', fetchVendorError);
        return { success: false, message: 'Vendor not found for update' };
      }

      console.log('Existing vendor found:', existingVendor.brand_name);

      // Clean and validate the proposed changes
      // CRITICAL: Don't copy directly - we need to normalize category/categories first
      const cleanedChanges: any = {};
      
      // CRITICAL: Normalize category/categories FIRST before any other processing
      // This ensures arrays are always arrays, never strings
      const normalizeCategoryField = (field: any): string[] => {
        // Handle null/undefined
        if (field === null || field === undefined) return [];
        // Handle empty string
        if (field === '') return [];
        // Handle array
        if (Array.isArray(field)) {
          return field
            .filter((cat: any) => cat !== null && cat !== undefined && typeof cat === 'string' && cat.trim() !== '')
            .map((cat: string) => cat.trim());
        }
        // Handle string
        if (typeof field === 'string') {
          const trimmed = field.trim();
          return trimmed !== '' ? [trimmed] : [];
        }
        // Handle any other type - try to convert to string
        try {
          const str = String(field);
          const trimmed = str.trim();
          return trimmed !== '' ? [trimmed] : [];
        } catch (e) {
          return [];
        }
      };
      
      // Copy all fields EXCEPT category/categories (we'll handle those separately)
      Object.keys(proposedChanges).forEach(key => {
        if (key !== 'category' && key !== 'categories') {
          cleanedChanges[key] = proposedChanges[key];
        }
      });
      
      // Normalize both category and categories fields - prioritize categories if it exists
      let normalizedCategories: string[] = [];
      
      // DEBUG: Log raw values from proposedChanges
      console.log('=== RAW proposedChanges DEBUG ===');
      console.log('proposedChanges.categories:', proposedChanges.categories, 'Type:', typeof proposedChanges.categories, 'IsArray:', Array.isArray(proposedChanges.categories));
      console.log('proposedChanges.category:', proposedChanges.category, 'Type:', typeof proposedChanges.category, 'IsArray:', Array.isArray(proposedChanges.category));
      
      if (proposedChanges.categories !== undefined && proposedChanges.categories !== null) {
        normalizedCategories = normalizeCategoryField(proposedChanges.categories);
        console.log('Normalized from categories field:', proposedChanges.categories, 'Type:', typeof proposedChanges.categories, '->', normalizedCategories, 'IsArray:', Array.isArray(normalizedCategories));
      } else if (proposedChanges.category !== undefined && proposedChanges.category !== null) {
        normalizedCategories = normalizeCategoryField(proposedChanges.category);
        console.log('Normalized from category field:', proposedChanges.category, 'Type:', typeof proposedChanges.category, '->', normalizedCategories, 'IsArray:', Array.isArray(normalizedCategories));
      }
      
      // CRITICAL: Ensure normalizedCategories is ALWAYS an array
      if (!Array.isArray(normalizedCategories)) {
        console.error('ERROR: normalizedCategories is not an array after normalization! Value:', normalizedCategories);
        normalizedCategories = [];
      }
      
      // Set categories as array (ALWAYS) - even if empty
      // Create a fresh array copy to avoid any reference issues
      cleanedChanges.categories = Array.isArray(normalizedCategories) ? [...normalizedCategories] : [];
      // Also set category as first item (string) for backward compatibility (but we won't use this in update)
      cleanedChanges.category = normalizedCategories.length > 0 ? normalizedCategories[0] : '';
      
      console.log('After normalization - categories:', cleanedChanges.categories, 'IsArray:', Array.isArray(cleanedChanges.categories), 'Type:', typeof cleanedChanges.categories);
      console.log('After normalization - category:', cleanedChanges.category);
      
      // FINAL CHECK: If categories is somehow not an array, force it to empty array
      if (!Array.isArray(cleanedChanges.categories)) {
        console.error('CRITICAL: cleanedChanges.categories is NOT an array after setting! Forcing to empty array.');
        cleanedChanges.categories = [];
      }
      
      // Remove any fields that shouldn't be updated or don't exist in vendors table
      delete cleanedChanges.id;
      delete cleanedChanges.vendor_id;
      delete cleanedChanges.created_at;
      
      // Handle catalog_images separately - don't try to update in vendors table
      const catalogImages = cleanedChanges.catalog_images;
      delete cleanedChanges.catalog_images;
      
      // Handle highlight_status_changes separately - don't try to update in vendors table
      const highlightStatusChanges = cleanedChanges.highlight_status_changes;
      delete cleanedChanges.highlight_status_changes;
      
      // Handle brand_logo_url and contact_person_image_url separately - these are stored in vendor_media table
      const brandLogoUrl = cleanedChanges.brand_logo_url;
      delete cleanedChanges.brand_logo_url;
      
      const contactPersonImageUrl = cleanedChanges.contact_person_image_url;
      delete cleanedChanges.contact_person_image_url;
      
      // Limit highlight_features to max 4 items
      if (cleanedChanges.highlight_features && Array.isArray(cleanedChanges.highlight_features)) {
        cleanedChanges.highlight_features = cleanedChanges.highlight_features
          .filter((f: any) => f && typeof f === 'string' && f.trim() !== '')
          .slice(0, 4)
          .map((f: string) => f.trim());
      }
      
      // Final safety check: Ensure categories is ALWAYS an array before database update
      // This is a last-ditch effort to prevent "malformed array literal" errors
      if (cleanedChanges.categories !== undefined) {
        if (!Array.isArray(cleanedChanges.categories)) {
          console.error('CRITICAL ERROR: categories is still not an array after normalization! Value:', cleanedChanges.categories, 'Type:', typeof cleanedChanges.categories);
          // Try one more normalization
          cleanedChanges.categories = normalizeCategoryField(cleanedChanges.categories);
          // If still not an array, remove it to prevent error
          if (!Array.isArray(cleanedChanges.categories)) {
            console.error('FINAL FALLBACK: Removing categories from update to prevent database error');
            delete cleanedChanges.categories;
          }
        } else {
          // Final validation: ensure all items are non-empty strings
          cleanedChanges.categories = cleanedChanges.categories
            .filter((cat: any) => cat !== null && cat !== undefined && typeof cat === 'string' && cat.trim() !== '')
            .map((cat: string) => cat.trim());
        }
      }
      
      // Debug log to verify categories is an array
      console.log('Final categories before DB update:', cleanedChanges.categories, 'Type:', typeof cleanedChanges.categories, 'IsArray:', Array.isArray(cleanedChanges.categories));
      
      // ABSOLUTE FINAL CHECK: If categories exists and is not an array, remove it
      if (cleanedChanges.categories !== undefined && !Array.isArray(cleanedChanges.categories)) {
        console.error('ABSOLUTE FINAL CHECK FAILED: Removing categories to prevent database error');
        delete cleanedChanges.categories;
      }
      
      // FINAL SAFETY CHECK: Remove categories from update if it's not a valid array
      // This prevents "malformed array literal" errors
      if (cleanedChanges.categories !== undefined) {
        if (!Array.isArray(cleanedChanges.categories)) {
          console.error('CRITICAL: categories is not an array, removing from update to prevent error. Value:', cleanedChanges.categories);
          // Try one more time to convert it
          const lastAttempt = normalizeCategoryField(cleanedChanges.categories);
          if (Array.isArray(lastAttempt) && lastAttempt.length > 0) {
            cleanedChanges.categories = lastAttempt;
            console.log('Successfully converted categories to array:', cleanedChanges.categories);
          } else {
            // If we can't convert it, remove it from the update payload
            console.warn('Removing categories from update payload as it cannot be converted to array');
            delete cleanedChanges.categories;
          }
        } else {
          // Even if it's an array, ensure it's valid
          cleanedChanges.categories = cleanedChanges.categories
            .filter((cat: any) => cat && typeof cat === 'string' && cat.trim() !== '')
            .map((cat: string) => cat.trim());
          
          // If array is empty, we can either set it to empty array or remove it
          // For now, let's set it to empty array (PostgreSQL accepts empty arrays)
          if (cleanedChanges.categories.length === 0) {
            cleanedChanges.categories = [];
          }
        }
      }
      
      // Convert arrays to proper format if needed
      if (cleanedChanges.deliverables && Array.isArray(cleanedChanges.deliverables)) {
        cleanedChanges.deliverables = cleanedChanges.deliverables.filter(item => item && item.trim() !== '');
      }

      console.log('Cleaned changes to apply (without catalog_images and highlight_status_changes):', cleanedChanges);
      console.log('Categories in final payload:', cleanedChanges.categories, 'IsArray:', Array.isArray(cleanedChanges.categories));

      // Build update payload carefully, ensuring categories is properly formatted
      const updatePayload: any = {
        updated_at: new Date().toISOString()
      };
      
      // Copy all fields one by one, with special handling for category/categories
      Object.keys(cleanedChanges).forEach(key => {
        // Skip category field - we only use categories (array)
        if (key === 'category') {
          return; // Don't include category string field
        }
        
        if (key === 'categories') {
          // CRITICAL: Only include categories if it's a valid array
          if (Array.isArray(cleanedChanges.categories) && cleanedChanges.categories.length > 0) {
            // Create a fresh array to ensure it's not a reference issue
            updatePayload.categories = [...cleanedChanges.categories];
            console.log('Including categories in update payload:', updatePayload.categories, 'Type check:', Array.isArray(updatePayload.categories));
          } else {
            console.warn('Skipping categories - not a valid array or empty:', cleanedChanges.categories, 'Type:', typeof cleanedChanges.categories, 'IsArray:', Array.isArray(cleanedChanges.categories));
            // Don't include it - let database keep existing value
          }
        } else if (key === 'highlight_features') {
          // Ensure highlight_features is limited to max 4 items
          if (Array.isArray(cleanedChanges.highlight_features)) {
            updatePayload.highlight_features = cleanedChanges.highlight_features
              .filter((f: any) => f && typeof f === 'string' && f.trim() !== '')
              .slice(0, 4)
              .map((f: string) => f.trim());
          }
        } else {
          updatePayload[key] = cleanedChanges[key];
        }
      });
      
      // ABSOLUTE FINAL CHECK: Remove categories if it's not an array
      if (updatePayload.categories !== undefined) {
        if (!Array.isArray(updatePayload.categories)) {
          console.error('CRITICAL: categories is NOT an array in final payload! Removing it. Value:', updatePayload.categories, 'Type:', typeof updatePayload.categories);
          delete updatePayload.categories;
        } else {
          // Double-check it's a valid array of strings
          const isValid = updatePayload.categories.every((cat: any) => typeof cat === 'string' && cat.trim() !== '');
          if (!isValid) {
            console.error('CRITICAL: categories array contains invalid values! Filtering...');
            updatePayload.categories = updatePayload.categories.filter((cat: any) => typeof cat === 'string' && cat.trim() !== '');
          }
        }
      }
      
      console.log('FINAL update payload before DB:', JSON.stringify(updatePayload, null, 2));
      console.log('Categories in payload:', updatePayload.categories, 'IsArray:', Array.isArray(updatePayload.categories), 'Type:', typeof updatePayload.categories);

      // Update vendor profile (excluding catalog_images)
      const { error: vendorUpdateError } = await supabase
        .from('vendors')
        .update(updatePayload)
        .eq('vendor_id', changeRecord.vendor_id);

      if (vendorUpdateError) {
        console.error('Error applying approved changes:', vendorUpdateError);
        console.error('Update payload:', { ...cleanedChanges, updated_at: new Date().toISOString() });
        return { success: false, message: `Failed to apply approved changes: ${vendorUpdateError.message}` };
      }

      // Handle catalog_images through vendor_media table if they were included in changes
      if (catalogImages) {
        console.log('=== UPDATING CATALOG IMAGES IN STORAGE ===');
        console.log('Vendor ID:', changeRecord.vendor_id);
        console.log('Catalog images data:', catalogImages);
        console.log('Catalog images type:', typeof catalogImages);
        
        try {
          // Import storage service
          const { deleteImageFromStorage, getVendorCatalogImagesFromStorage } = await import('./supabaseStorageService');
          
          // Handle new structured format (added/removed)
          if (typeof catalogImages === 'object' && catalogImages.added && catalogImages.removed) {
            console.log('Processing structured catalog images format');
            console.log('Added images:', catalogImages.added);
            console.log('Removed images:', catalogImages.removed);
            
            // Delete removed images from storage
            if (catalogImages.removed && catalogImages.removed.length > 0) {
              console.log(`Deleting ${catalogImages.removed.length} removed images from storage...`);
              
              const possibleBuckets = ['catalog-images', 'vendor-images', 'images', 'media'];
              const vendorIdStr = changeRecord.vendor_id.toString();
              
              for (const removedUrl of catalogImages.removed) {
                // Extract file path from URL
                let filePath = '';
                try {
                  const urlObj = new URL(removedUrl);
                  // Try to find the path after bucket name
                  const pathParts = urlObj.pathname.split('/');
                  const bucketIndex = pathParts.findIndex(part => possibleBuckets.includes(part));
                  if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
                    filePath = pathParts.slice(bucketIndex + 1).join('/');
                  } else {
                    // Fallback: try vendor_id/catalog/filename pattern
                    const filename = pathParts[pathParts.length - 1];
                    filePath = `${vendorIdStr}/catalog/${filename}`;
                  }
                } catch (e) {
                  // If URL parsing fails, try to extract filename
                  const filename = removedUrl.split('/').pop();
                  filePath = `${vendorIdStr}/catalog/${filename}`;
                }
                
                // Try deleting from each possible bucket
                let deleted = false;
                for (const bucket of possibleBuckets) {
                  const deleteResult = await deleteImageFromStorage(filePath, bucket);
                  if (deleteResult) {
                    console.log(`✅ Deleted ${removedUrl} from ${bucket}`);
                    deleted = true;
                    break;
                  }
                }
                
                if (!deleted) {
                  console.warn(`⚠️ Could not delete ${removedUrl} from storage`);
                }
              }
            }
            
            // Added images should already be in storage from upload, so no action needed
            if (catalogImages.added && catalogImages.added.length > 0) {
              console.log(`✅ ${catalogImages.added.length} new images added (already in storage from upload)`);
            }
            
          } else if (Array.isArray(catalogImages)) {
            // Handle legacy array format - get current images and delete ones not in new array
            console.log('Processing legacy array format');
            
            const possibleBuckets = ['catalog-images', 'vendor-images', 'images', 'media'];
            const vendorIdStr = changeRecord.vendor_id.toString();
            
            // Get current images from storage
            let currentStorageImages: any[] = [];
            for (const bucket of possibleBuckets) {
              const storageImages = await getVendorCatalogImagesFromStorage(changeRecord.vendor_id, bucket);
              if (storageImages.length > 0) {
                currentStorageImages = storageImages;
                break;
              }
            }
            
            const currentUrls = currentStorageImages.map(img => img.url);
            const newUrls = catalogImages;
            
            // Find images to delete (in current but not in new)
            const toDelete = currentUrls.filter(url => !newUrls.includes(url));
            
            if (toDelete.length > 0) {
              console.log(`Deleting ${toDelete.length} removed images from storage...`);
              for (const removedUrl of toDelete) {
                let filePath = '';
                try {
                  const urlObj = new URL(removedUrl);
                  const pathParts = urlObj.pathname.split('/');
                  const bucketIndex = pathParts.findIndex(part => possibleBuckets.includes(part));
                  if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
                    filePath = pathParts.slice(bucketIndex + 1).join('/');
            } else {
                    const filename = pathParts[pathParts.length - 1];
                    filePath = `${vendorIdStr}/catalog/${filename}`;
                  }
                } catch (e) {
                  const filename = removedUrl.split('/').pop();
                  filePath = `${vendorIdStr}/catalog/${filename}`;
                }
                
                let deleted = false;
                for (const bucket of possibleBuckets) {
                  const deleteResult = await deleteImageFromStorage(filePath, bucket);
                  if (deleteResult) {
                    console.log(`✅ Deleted ${removedUrl} from ${bucket}`);
                    deleted = true;
                    break;
                  }
                }
                
                if (!deleted) {
                  console.warn(`⚠️ Could not delete ${removedUrl} from storage`);
                }
              }
            }
          } else {
            console.log('Unknown catalog images format, skipping update');
            return { success: true, message: 'Changes approved but catalog images format not recognized' };
          }
          
          console.log('✅ Catalog images updated successfully in storage');
          
        } catch (catalogError) {
          console.error('❌ Error updating catalog images:', catalogError);
          // Don't fail the entire approval, just log the error
          console.warn('Vendor profile updated but catalog images update failed:', catalogError);
        }
      } else {
        console.log('No catalog images to update');
      }

      // Handle brand logo update through vendor_media table
      if (brandLogoUrl !== undefined) {
        console.log('=== UPDATING BRAND LOGO IN VENDOR_MEDIA ===');
        console.log('Vendor ID:', changeRecord.vendor_id);
        console.log('Brand logo URL:', brandLogoUrl);
        
        try {
          // Get ALL existing brand logos (to delete old files from storage)
          const { data: existingLogos, error: fetchError } = await supabase
            .from('vendor_media')
            .select('id, media_url, gdrive_file_id')
            .eq('vendor_id', changeRecord.vendor_id.toString())
            .eq('category', 'brand_logo');
            
          if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Error fetching existing brand logos:', fetchError);
          }
          
          // Delete old brand logo files from storage
          if (existingLogos && existingLogos.length > 0) {
            console.log(`Found ${existingLogos.length} existing brand logo(s), deleting old files from storage...`);
            
            for (const logo of existingLogos) {
              // Extract file path from media_url
              // URL format: https://...supabase.co/storage/v1/object/public/vendor-images/14/brand_logo/brand_logo_123.jpg
              // Extract: 14/brand_logo/brand_logo_123.jpg
              let filePath: string | null = null;
              
              if (logo.media_url) {
                const urlMatch = logo.media_url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/);
                if (urlMatch) {
                  filePath = urlMatch[1];
                } else if (logo.gdrive_file_id) {
                  // Fallback to gdrive_file_id if it contains the path
                  filePath = logo.gdrive_file_id;
                }
              }
              
              if (filePath) {
                console.log(`Deleting old brand logo file from storage: ${filePath}`);
                const { error: storageDeleteError } = await supabase.storage
                  .from('vendor-images')
                  .remove([filePath]);
                  
                if (storageDeleteError) {
                  console.warn(`Could not delete file ${filePath} from storage:`, storageDeleteError);
                  // Continue anyway - file might not exist or already deleted
                } else {
                  console.log(`✅ Deleted old brand logo file: ${filePath}`);
                }
              }
              
              // Delete from vendor_media table
              const { error: dbDeleteError } = await supabase
                .from('vendor_media')
                .delete()
                .eq('id', logo.id);
                
              if (dbDeleteError) {
                console.error('Error deleting brand logo from database:', dbDeleteError);
              } else {
                console.log(`✅ Deleted brand logo record from database: ${logo.id}`);
              }
            }
          }
          
          // Insert new brand logo if provided
          if (brandLogoUrl && brandLogoUrl.trim() !== '') {
            console.log('Inserting new brand logo');
            const { error: insertError } = await supabase
              .from('vendor_media')
              .insert({
                vendor_id: changeRecord.vendor_id.toString(),
                media_url: brandLogoUrl,
                media_type: 'image',
                category: 'brand_logo',
                public: true,
                uploaded_at: new Date().toISOString()
              });
              
            if (insertError) {
              console.error('❌ Error inserting brand logo:', insertError);
              console.warn('Vendor profile updated but brand logo update failed');
            } else {
              console.log('✅ Brand logo inserted successfully in vendor_media table');
            }
          } else {
            console.log('Brand logo was removed (empty URL)');
          }
        } catch (brandLogoError) {
          console.error('❌ Error updating brand logo:', brandLogoError);
          console.warn('Vendor profile updated but brand logo update failed:', brandLogoError);
        }
      }

      // Handle contact person image update through vendor_media table
      if (contactPersonImageUrl !== undefined) {
        console.log('=== UPDATING CONTACT PERSON IMAGE IN VENDOR_MEDIA ===');
        console.log('Vendor ID:', changeRecord.vendor_id);
        console.log('Contact person image URL:', contactPersonImageUrl);
        
        try {
          // Get ALL existing contact person images (to delete old files from storage)
          const { data: existingImages, error: fetchError } = await supabase
            .from('vendor_media')
            .select('id, media_url, gdrive_file_id')
            .eq('vendor_id', changeRecord.vendor_id.toString())
            .eq('category', 'contact_person');
            
          if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Error fetching existing contact person images:', fetchError);
          }
          
          // Delete old contact person image files from storage
          if (existingImages && existingImages.length > 0) {
            console.log(`Found ${existingImages.length} existing contact person image(s), deleting old files from storage...`);
            
            for (const image of existingImages) {
              // Extract file path from media_url
              // URL format: https://...supabase.co/storage/v1/object/public/vendor-images/14/contact_person/contact_person_123.jpg
              // Extract: 14/contact_person/contact_person_123.jpg
              let filePath: string | null = null;
              
              if (image.media_url) {
                const urlMatch = image.media_url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/);
                if (urlMatch) {
                  filePath = urlMatch[1];
                } else if (image.gdrive_file_id) {
                  // Fallback to gdrive_file_id if it contains the path
                  filePath = image.gdrive_file_id;
                }
              }
              
              if (filePath) {
                console.log(`Deleting old contact person image file from storage: ${filePath}`);
                const { error: storageDeleteError } = await supabase.storage
                  .from('vendor-images')
                  .remove([filePath]);
                  
                if (storageDeleteError) {
                  console.warn(`Could not delete file ${filePath} from storage:`, storageDeleteError);
                  // Continue anyway - file might not exist or already deleted
                } else {
                  console.log(`✅ Deleted old contact person image file: ${filePath}`);
                }
              }
              
              // Delete from vendor_media table
              const { error: dbDeleteError } = await supabase
                .from('vendor_media')
                .delete()
                .eq('id', image.id);
                
              if (dbDeleteError) {
                console.error('Error deleting contact person image from database:', dbDeleteError);
              } else {
                console.log(`✅ Deleted contact person image record from database: ${image.id}`);
              }
            }
          }
          
          // Insert new contact person image if provided
          if (contactPersonImageUrl && contactPersonImageUrl.trim() !== '') {
            console.log('Inserting new contact person image');
            const { error: insertError } = await supabase
              .from('vendor_media')
              .insert({
                vendor_id: changeRecord.vendor_id.toString(),
                media_url: contactPersonImageUrl,
                media_type: 'image',
                category: 'contact_person',
                public: true,
                uploaded_at: new Date().toISOString()
              });
              
            if (insertError) {
              console.error('❌ Error inserting contact person image:', insertError);
              console.warn('Vendor profile updated but contact person image update failed');
            } else {
              console.log('✅ Contact person image inserted successfully in vendor_media table');
            }
          } else {
            console.log('Contact person image was removed (empty URL)');
          }
        } catch (contactPersonError) {
          console.error('❌ Error updating contact person image:', contactPersonError);
          console.warn('Vendor profile updated but contact person image update failed:', contactPersonError);
        }
      }

      // Handle highlight status changes
      if (highlightStatusChanges && highlightStatusChanges.changed_images) {
        console.log('=== APPLYING HIGHLIGHT STATUS CHANGES ===');
        console.log('Highlight changes:', highlightStatusChanges);
        
        try {
          for (const changedImg of highlightStatusChanges.changed_images) {
            console.log(`Updating highlight status for image: ${changedImg.media_url} to ${changedImg.is_highlighted}`);
            
            // Find the image in vendor_media table by media_url and vendor_id
            const { data: imageRecord, error: findError } = await supabase
              .from('vendor_media')
              .select('id')
              .eq('vendor_id', changeRecord.vendor_id)
              .eq('media_url', changedImg.media_url)
              .eq('category', 'catalog')
              .single();

            if (findError || !imageRecord) {
              console.error(`Failed to find image record for ${changedImg.media_url}:`, findError);
              continue;
            }

            // Update the highlight status
            const { error: updateError } = await supabase
              .from('vendor_media')
              .update({ is_highlighted: changedImg.is_highlighted })
              .eq('id', imageRecord.id);

            if (updateError) {
              console.error(`Failed to update highlight status for image ${imageRecord.id}:`, updateError);
            } else {
              console.log(`✅ Successfully updated highlight status for image ${imageRecord.id}`);
            }
          }
          
          console.log('✅ All highlight status changes applied successfully');
        } catch (highlightError) {
          console.error('❌ Error applying highlight status changes:', highlightError);
          // Don't fail the entire approval, just log the error
          console.warn('Vendor profile updated but highlight status changes failed:', highlightError);
        }
      }

      console.log('Vendor profile updated successfully');
    }

    // Create notification for vendor about admin decision
    try {
      console.log('🔔 Creating admin notification for vendor:', changeRecord.vendor_id);
      const notificationMessage = status === 'approved' 
        ? `Your profile changes have been approved${adminComments ? ` with comments: ${adminComments}` : ''}`
        : `Your profile changes have been rejected${adminComments ? ` for the following reason: ${adminComments}` : ''}`;
      
      const notificationTitle = status === 'approved' 
        ? 'Profile Changes Approved' 
        : 'Profile Changes Rejected';

      console.log('📝 Notification message:', notificationMessage);
      console.log('📝 Admin decision:', status);

      // Insert notification into contacted_vendors table (reusing existing notification system)
      const { data: notificationData, error: notificationError } = await supabase
        .from('contacted_vendors')
        .insert({
          customer_id: -(Date.now() % 1000000), // Use negative ID for admin notifications
          vendor_id: changeRecord.vendor_id.toString(),
          status: 'Contacted', // Use allowed status value
          vendor_status: status === 'approved' ? 'Approved' : 'Rejected', // Store admin decision
          vendor_notified: true, // Vendor needs to see this
          customer_notified: false, // Not for customer
          notification_message: notificationMessage,
          notes: `Admin ${status} profile changes. Admin: ${adminUsername}`,
          contacted_at: new Date().toISOString(), // Add timestamp
          created_at: new Date().toISOString() // Add timestamp
        })
        .select();

      if (notificationError) {
        console.error('❌ Error creating admin notification:', notificationError);
        console.error('Error details:', JSON.stringify(notificationError, null, 2));
        // Don't fail the entire operation, just log the error
      } else {
        console.log(`✅ Admin notification created successfully for vendor ${changeRecord.vendor_id}:`, notificationData);
      }
    } catch (notificationError) {
      console.error('💥 Exception creating admin notification:', notificationError);
      // Don't fail the entire operation
    }

    return { 
      success: true, 
      message: `Changes ${status} successfully` 
    };
  } catch (error) {
    console.error('Error reviewing profile change:', error);
    return { success: false, message: 'Failed to review changes' };
  }
};

// Vendor CRM Leads Management Functions
export const getVendorLeads = async (vendorId: number, status?: string, priority?: string): Promise<any[]> => {
  try {
    let query = supabase
      .from('vendor_leads')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (priority && priority !== 'all') {
      query = query.eq('priority', priority);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching vendor leads:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching vendor leads:', error);
    return [];
  }
};

export const getVendorLeadStats = async (vendorId: number): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('vendor_leads')
      .select('status, converted_to_booking, final_booking_amount')
      .eq('vendor_id', vendorId);

    if (error) {
      console.error('Error fetching lead stats:', error);
      return {
        total_leads: 0,
        new_leads: 0,
        contacted_leads: 0,
        negotiation_leads: 0,
        proposal_sent_leads: 0,
        customer_decision_pending_leads: 0,
        confirmed_bookings: 0,
        advance_received_leads: 0,
        completed_leads: 0,
        lost_leads: 0,
        conversion_rate: 0,
        total_revenue: 0
      };
    }

    const leads = data || [];
    const stats = {
      total_leads: leads.length,
      new_leads: leads.filter(l => l.status === 'new_lead').length,
      contacted_leads: leads.filter(l => l.status === 'contacted').length,
      negotiation_leads: leads.filter(l => l.status === 'negotiation').length,
      proposal_sent_leads: leads.filter(l => l.status === 'proposal_sent').length,
      customer_decision_pending_leads: leads.filter(l => l.status === 'customer_decision_pending').length,
      confirmed_bookings: leads.filter(l => l.status === 'confirmed_booking').length,
      advance_received_leads: leads.filter(l => l.status === 'advance_received').length,
      completed_leads: leads.filter(l => l.status === 'completed').length,
      lost_leads: leads.filter(l => l.status === 'lost').length,
      conversion_rate: leads.length > 0 ? 
        Math.round((leads.filter(l => l.converted_to_booking).length / leads.length) * 100 * 100) / 100 : 0,
      total_revenue: leads
        .filter(l => l.status === 'completed' && l.final_booking_amount)
        .reduce((sum, l) => sum + (l.final_booking_amount || 0), 0)
    };

    return stats;
  } catch (error) {
    console.error('Error calculating lead stats:', error);
    return {
      total_leads: 0,
      new_leads: 0,
      contacted_leads: 0,
      negotiation_leads: 0,
      proposal_sent_leads: 0,
      customer_decision_pending_leads: 0,
      confirmed_bookings: 0,
      advance_received_leads: 0,
      completed_leads: 0,
      lost_leads: 0,
      conversion_rate: 0,
      total_revenue: 0
    };
  }
};

export const addVendorLead = async (leadData: any): Promise<{success: boolean, leadId?: number, message?: string}> => {
  try {
    console.log('Adding lead with data:', leadData);

    // Test if vendor_leads table exists
    const { data: tableTest, error: tableError } = await supabase
      .from('vendor_leads')
      .select('count', { count: 'exact' });
    
    if (tableError) {
      console.error('vendor_leads table does not exist or is not accessible:', tableError);
      return { 
        success: false, 
        message: 'vendor_leads table not found. Please run the SQL script to create it.' 
      };
    }

    const { data, error } = await supabase
      .from('vendor_leads')
      .insert([{
        ...leadData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error adding lead:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return { 
        success: false, 
        message: `Failed to add lead: ${error.message}` 
      };
    }

    console.log('Lead added successfully:', data);
    return { 
      success: true, 
      leadId: data.id,
      message: 'Lead added successfully' 
    };
  } catch (error) {
    console.error('Error adding lead:', error);
    return { 
      success: false, 
      message: `Failed to add lead: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
};

export const updateVendorLead = async (leadId: number, updateData: any): Promise<{success: boolean, message?: string}> => {
  try {
    const { error } = await supabase
      .from('vendor_leads')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', leadId);

    if (error) {
      console.error('Error updating lead:', error);
      return { success: false, message: 'Failed to update lead' };
    }

    return { success: true, message: 'Lead updated successfully' };
  } catch (error) {
    console.error('Error updating lead:', error);
    return { success: false, message: 'Failed to update lead' };
  }
};

export const updateLeadStatus = async (
  leadId: number, 
  newStatus: string, 
  notes?: string
): Promise<{success: boolean, message?: string}> => {
  try {
    const updateData: any = {
      status: newStatus,
      updated_at: new Date().toISOString(),
      last_contact_date: new Date().toISOString()
    };

    if (notes) {
      updateData.follow_up_notes = notes;
    }

    if (newStatus === 'contacted') {
      // Increment contact count
      const { data: currentLead } = await supabase
        .from('vendor_leads')
        .select('contact_count')
        .eq('id', leadId)
        .single();
      
      updateData.contact_count = (currentLead?.contact_count || 0) + 1;
    }

    if (newStatus === 'confirmed_booking') {
      updateData.converted_to_booking = true;
      updateData.conversion_date = new Date().toISOString();
    }

    const { error } = await supabase
      .from('vendor_leads')
      .update(updateData)
      .eq('id', leadId);

    if (error) {
      console.error('Error updating lead status:', error);
      return { success: false, message: 'Failed to update lead status' };
    }

    return { success: true, message: 'Lead status updated successfully' };
  } catch (error) {
    console.error('Error updating lead status:', error);
    return { success: false, message: 'Failed to update lead status' };
  }
};

export const deleteVendorLead = async (leadId: number): Promise<{success: boolean, message?: string}> => {
  try {
    const { error } = await supabase
      .from('vendor_leads')
      .delete()
      .eq('id', leadId);

    if (error) {
      console.error('Error deleting lead:', error);
      return { success: false, message: 'Failed to delete lead' };
    }

    return { success: true, message: 'Lead deleted successfully' };
  } catch (error) {
    console.error('Error deleting lead:', error);
    return { success: false, message: 'Failed to delete lead' };
  }
};

// ===== VENDOR CALENDAR FUNCTIONS =====

// Get vendor events for a date range
export const getVendorEvents = async (vendorId: number, startDate?: string, endDate?: string) => {
  try {
    let query = supabase
      .from('vendor_events')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('start_datetime', { ascending: true });

    if (startDate && endDate) {
      query = query
        .gte('start_datetime', startDate)
        .lte('start_datetime', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching vendor events:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getVendorEvents:', error);
    return [];
  }
};

// Create new vendor event
export const createVendorEvent = async (eventData: any): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    // Check for conflicts first
    const conflicts = await checkEventConflicts(
      eventData.vendor_id,
      eventData.start_datetime,
      eventData.end_datetime
    );

    if (conflicts.length > 0) {
      return { 
        success: false, 
        error: `Conflict detected with existing event: "${conflicts[0].title}"` 
      };
    }

    const { data, error } = await supabase
      .from('vendor_events')
      .insert([{
        ...eventData,
        created_by: 'vendor'
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating vendor event:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in createVendorEvent:', error);
    return { success: false, error: 'Failed to create event' };
  }
};

// Update vendor event
export const updateVendorEvent = async (eventId: number, eventData: any): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    // Check for conflicts (excluding current event)
    if (eventData.start_datetime && eventData.end_datetime && eventData.vendor_id) {
      const conflicts = await checkEventConflicts(
        eventData.vendor_id,
        eventData.start_datetime,
        eventData.end_datetime,
        eventId
      );

      if (conflicts.length > 0) {
        return { 
          success: false, 
          error: `Conflict detected with existing event: "${conflicts[0].title}"` 
        };
      }
    }

    const { data, error } = await supabase
      .from('vendor_events')
      .update(eventData)
      .eq('id', eventId)
      .select()
      .single();

    if (error) {
      console.error('Error updating vendor event:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in updateVendorEvent:', error);
    return { success: false, error: 'Failed to update event' };
  }
};

// Delete vendor event
export const deleteVendorEvent = async (eventId: number): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('vendor_events')
      .delete()
      .eq('id', eventId);

    if (error) {
      console.error('Error deleting vendor event:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deleteVendorEvent:', error);
    return { success: false, error: 'Failed to delete event' };
  }
};

// Check for event conflicts
export const checkEventConflicts = async (
  vendorId: number,
  startDateTime: string,
  endDateTime: string,
  excludeEventId?: number
): Promise<any[]> => {
  try {
    let query = supabase
      .from('vendor_events')
      .select('id, title, start_datetime, end_datetime')
      .eq('vendor_id', vendorId)
      .not('status', 'in', '(cancelled,completed)')
      .or(`and(start_datetime.lte.${startDateTime},end_datetime.gt.${startDateTime}),and(start_datetime.lt.${endDateTime},end_datetime.gte.${endDateTime}),and(start_datetime.gte.${startDateTime},end_datetime.lte.${endDateTime})`);

    if (excludeEventId) {
      query = query.neq('id', excludeEventId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error checking event conflicts:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in checkEventConflicts:', error);
    return [];
  }
};

// Get vendor availability for a specific date
export const getVendorAvailability = async (vendorId: number, date: string) => {
  try {
    const { data, error } = await supabase
      .rpc('get_vendor_availability', {
        p_vendor_id: vendorId,
        p_date: date
      });

    if (error) {
      console.error('Error getting vendor availability:', error);
      return null;
    }

    return data?.[0] || null;
  } catch (error) {
    console.error('Error in getVendorAvailability:', error);
    return null;
  }
};

// Get calendar statistics for vendor
export const getVendorCalendarStats = async (vendorId: number) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const nextMonth = new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().slice(0, 7);

    const { data, error } = await supabase
      .from('vendor_events')
      .select('event_type, status')
      .eq('vendor_id', vendorId)
      .gte('start_datetime', `${currentMonth}-01`)
      .lt('start_datetime', `${nextMonth}-01`);

    if (error) {
      console.error('Error getting calendar stats:', error);
      return null;
    }

    const stats = {
      total_events: data.length,
      confirmed_bookings: data.filter(e => e.status === 'confirmed' && e.event_type !== 'blocked').length,
      tentative_bookings: data.filter(e => e.status === 'tentative' && e.event_type !== 'blocked').length,
      blocked_days: data.filter(e => e.event_type === 'blocked').length,
      completed_events: data.filter(e => e.status === 'completed').length,
    };

    return stats;
  } catch (error) {
    console.error('Error in getVendorCalendarStats:', error);
    return null;
  }
};

// Review interface
export interface Review {
  id: number;
  name: string;
  state: string;
  review: string;
  rating: number;
  created_at: string;
}

// Get all reviews
export const getAllReviews = async (): Promise<{ success: boolean; data?: Review[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error in getAllReviews:', error);
    return { success: false, error: 'Failed to fetch reviews' };
  }
};

// Add a new review for a vendor (customer reviews)
export const addReview = async (
  vendorId: string | number,
  customerId: number,
  customerName: string,
  reviewText: string,
  rating: number = 5
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    console.log(`Adding review for vendor ${vendorId} by customer ${customerId}`);
    
    // Validate required fields
    if (!vendorId) {
      return { success: false, error: 'Vendor ID is required' };
    }
    if (!customerId) {
      return { success: false, error: 'Customer must be logged in to add a review' };
    }
    if (!customerName || !customerName.trim()) {
      return { success: false, error: 'Customer name is required' };
    }
    if (!reviewText || !reviewText.trim()) {
      return { success: false, error: 'Review text is required' };
    }
    if (rating < 1 || rating > 5) {
      return { success: false, error: 'Rating must be between 1 and 5' };
    }

    const { data, error } = await supabase
      .from('customer_reviews')
      .insert([
        {
          vendor_id: vendorId.toString(),
          customer_id: customerId,
          customer_name: customerName.trim(),
          review_text: reviewText.trim(),
          rating: rating,
          is_published: true,
          is_verified: true, // Auto-verify reviews from logged-in customers
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error adding review:', error);
      return { success: false, error: error.message || 'Failed to add review' };
    }

    console.log('✅ Review added successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error in addReview:', error);
    return { success: false, error: 'Failed to add review' };
  }
};

// Get reviews by state
export const getReviewsByState = async (state: string): Promise<{ success: boolean; data?: Review[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('state', state)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews by state:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error in getReviewsByState:', error);
    return { success: false, error: 'Failed to fetch reviews by state' };
  }
};
