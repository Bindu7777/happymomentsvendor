import { supabase } from '@/lib/supabase';
import { VendorBulkData } from './excelParserService';

export interface VendorCredentials {
  vendorId: string;
  password: string;
  vendorName: string;
  email: string;
}

export interface BulkUploadResult {
  success: boolean;
  totalProcessed: number;
  successful: number;
  failed: number;
  credentials: VendorCredentials[];
  errors: string[];
}

// Generate unique vendor ID (V001, V002, etc.)
export const generateVendorId = async (): Promise<string> => {
  try {
    // Get the highest existing vendor ID
    const { data, error } = await supabase
      .from('vendors')
      .select('vendor_id')
      .order('vendor_id', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching max vendor ID:', error);
      return 'V001'; // Default to V001 if error
    }

    if (!data || data.length === 0) {
      return 'V001'; // First vendor
    }

    // Extract number from the highest vendor ID
    const lastVendorId = data[0].vendor_id;
    const match = lastVendorId.match(/V(\d+)/);
    
    if (match) {
      const lastNumber = parseInt(match[1], 10);
      const newNumber = lastNumber + 1;
      return `V${newNumber.toString().padStart(3, '0')}`;
    }

    return 'V001'; // Fallback
  } catch (error) {
    console.error('Error generating vendor ID:', error);
    return 'V001';
  }
};

// Generate secure password
export const generatePassword = (): string => {
  const adjectives = ['Happy', 'Bright', 'Golden', 'Royal', 'Perfect', 'Amazing', 'Wonderful', 'Fantastic'];
  const nouns = ['Event', 'Moment', 'Celebration', 'Party', 'Wedding', 'Joy', 'Bliss', 'Magic'];
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 9000) + 1000; // 4-digit number
  
  return `${adjective}@${noun}${number}`;
};

// Convert bulk data to vendor format
const convertBulkDataToVendor = (bulkData: VendorBulkData, vendorId: string, password: string) => {
  return {
    vendor_id: vendorId,
    brand_name: bulkData.vendorName,
    spoc_name: bulkData.contactPersonName,
    phone_number: bulkData.phoneNumber,
    email: bulkData.email,
    category: bulkData.category,
    sub_category: bulkData.subCategory || null,
    address: bulkData.address || bulkData.location,
    city: bulkData.location,
    service_regions: bulkData.serviceRegions ? bulkData.serviceRegions.split(',').map(region => region.trim()) : null,
    price_range_min: bulkData.priceRangeMin || null,
    price_range_max: bulkData.priceRangeMax || null,
    packages: bulkData.packagesOffered ? [{
      name: 'Standard Package',
      description: bulkData.packagesOffered,
      price: bulkData.startingPrice || bulkData.priceRangeMin || 0
    }] : null,
    gender_preference: bulkData.genderPreference || 'Both',
    experience: bulkData.yearsOfExperience ? `${bulkData.yearsOfExperience} years` : null,
    availability: bulkData.availability || 'Available',
    photos_videos_link: bulkData.photosVideosLink || null,
    payment_advance_percent: bulkData.paymentOptionsAdvance || 50,
    negotiable: bulkData.negotiable !== undefined ? bulkData.negotiable : true,
    detailed_intro: bulkData.shortBio || null,
    languages_spoken: bulkData.languagesSpoken || null,
    starting_price: bulkData.startingPrice || bulkData.priceRangeMin || null,
    password: password,
    verified: false,
    currently_available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

// Bulk upload vendors
export const bulkUploadVendors = async (vendorData: VendorBulkData[]): Promise<BulkUploadResult> => {
  const result: BulkUploadResult = {
    success: false,
    totalProcessed: vendorData.length,
    successful: 0,
    failed: 0,
    credentials: [],
    errors: []
  };

  try {
    const vendorsToInsert = [];
    const credentials: VendorCredentials[] = [];

    // Process each vendor
    for (const bulkData of vendorData) {
      try {
        // Generate unique vendor ID and password
        const vendorId = await generateVendorId();
        const password = generatePassword();

        // Convert to vendor format
        const vendor = convertBulkDataToVendor(bulkData, vendorId, password);
        vendorsToInsert.push(vendor);

        // Store credentials
        credentials.push({
          vendorId,
          password,
          vendorName: bulkData.vendorName,
          email: bulkData.email
        });

        result.successful++;
      } catch (error) {
        result.failed++;
        result.errors.push(`Error processing ${bulkData.vendorName}: ${error}`);
      }
    }

    // Insert all vendors in batch
    if (vendorsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('vendors')
        .insert(vendorsToInsert);

      if (insertError) {
        result.success = false;
        result.errors.push(`Database error: ${insertError.message}`);
        return result;
      }
    }

    result.success = true;
    result.credentials = credentials;

  } catch (error) {
    result.success = false;
    result.errors.push(`Bulk upload error: ${error}`);
  }

  return result;
};

// Download credentials as CSV
export const downloadCredentialsCSV = (credentials: VendorCredentials[]) => {
  const headers = ['Vendor Name', 'Vendor ID', 'Email', 'Password'];
  const csvContent = [
    headers.join(','),
    ...credentials.map(cred => [
      `"${cred.vendorName}"`,
      cred.vendorId,
      cred.email,
      cred.password
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `vendor_credentials_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
