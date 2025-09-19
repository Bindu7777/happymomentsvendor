import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Missing');
console.log('Supabase Key:', supabaseAnonKey ? 'Set' : 'Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.error('URL:', supabaseUrl);
  console.error('Key:', supabaseAnonKey);
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
  category: string
  subcategory?: string
  
  // Contact Information
  phone_number: string
  alternate_number?: string  // Admin-only field, not visible in profile
  whatsapp_number?: string
  email?: string
  instagram?: string
  address?: string
  
  // Business Details
  experience?: string
  quick_intro?: string
  caption?: string
  detailed_intro?: string
  highlight_features?: string[]
  total_events?: number
  rating?: number
  review_count?: number
  verified?: boolean
  currently_available?: boolean
  
  // Media URLs
  avatar_url?: string
  cover_image_url?: string
  brand_logo_url?: string
  contact_person_image_url?: string
  
  // JSON Data Fields
  services?: any
  packages?: any
  deliverables?: string[]  // New deliverables field
  customer_reviews?: any
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

export interface VendorMedia {
  id: string
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
  uploaded_at?: string
}
