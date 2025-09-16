import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
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
  whatsapp_number?: string
  email?: string
  instagram?: string
  address?: string
  
  // Business Details
  description?: string
  experience?: string
  total_events?: number
  rating?: number
  review_count?: number
  verified?: boolean
  currently_available?: boolean
  
  // Media URLs
  avatar_url?: string
  cover_image_url?: string
  
  // JSON Data Fields
  specialties?: any
  services?: any
  packages?: any
  customer_reviews?: any
  booking_policies?: any
  additional_info?: any
  
  // Timestamps
  created_at?: string
  updated_at?: string
}

export interface VendorMedia {
  id: string
  vendor_id: string
  media_url: string
  media_type: 'image' | 'video'
  category: 'catalog' | 'highlights' | 'portfolio' | 'gallery' | 'avatar' | 'cover'
  title?: string
  description?: string
  alt_text?: string
  order_index?: number
  featured?: boolean
  public?: boolean
  uploaded_at?: string
}
