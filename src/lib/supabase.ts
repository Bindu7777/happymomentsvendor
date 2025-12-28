import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Missing');
console.log('Supabase Key:', supabaseAnonKey ? 'Set' : 'Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.error('URL:', supabaseUrl);
  console.error('Key:', supabaseAnonKey);
  console.error('Please create a .env.local file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types based on your Supabase tables
export interface Vendor {
  // Primary identification
  vendor_id: string
  slug: string
  
  // Basic Brand Information
  brand_name: string
  spoc_name: string
  category: string | string[]  // Support both string (legacy) and array (new)
  categories?: string[]  // New array field for multiple categories
  subcategory?: string
  
  // Contact Information
  phone_number: string
  alternate_number?: string  // Admin-only field, not visible in profile
  whatsapp_number?: string
  email?: string
  instagram?: string
  address?: string
  google_maps_link?: string
  
  // Business Details
  experience?: string
  quick_intro?: string
  caption?: string
  detailed_intro?: string
  // highlight_features column was deleted from database
  events_completed?: number
  rating?: number
  review_count?: number
  verified?: boolean
  currently_available?: boolean
  starting_price?: number
  languages_spoken?: string[]  // Legacy field, kept for backward compatibility
  languages?: string[]  // New dedicated languages field
  
  // Media URLs - Removed deleted columns
  // avatar_url, cover_image_url, brand_logo_url, contact_person_image_url columns were deleted from database
  
  // JSON Data Fields
  services?: any
  packages?: any
  deliverables?: string[]  // New deliverables field
  catalog_images?: string[]  // Catalog images field for edit form compatibility
  catalog_images_metadata?: any[]  // Catalog images metadata including highlight status
  // customer_reviews column was deleted from database
  booking_policies?: any
  additional_info?: {
    working_hours?: string;
    languages?: string[];
    awards?: string[];
    certifications?: string[];
    custom_fields?: Array<{
      field_name: string;
      field_value: string;
    }>;
    [key: string]: any;  // Allow any additional flexible fields
  }
  
  // Timestamps
  created_at?: string
  updated_at?: string
}

export interface UserProfile {
  id: number  // Changed from UUID string to auto-increment integer
  user_id: string  // This remains UUID as it references auth.users
  email: string
  first_name: string
  last_name: string
  full_name: string
  phone_number?: string
  date_of_birth?: string
  profile_image_url?: string
  bio?: string
  location?: string
  website?: string
  agreed_to_terms: boolean
  email_verified: boolean
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface VendorMedia {
  id: number  // Changed from string to number for auto-increment integer
  vendor_id: string
  media_url: string
  media_type: 'image' | 'video'
  category: 'catalog' | 'highlights' | 'portfolio' | 'gallery' | 'avatar' | 'cover' | 'brand_logo' | 'contact_person'
  title?: string
  description?: string
  alt_text?: string
  order_index?: number
  featured?: boolean
  public?: boolean
  is_highlighted?: boolean  // New field for highlighting catalog images
  uploaded_at?: string
}
