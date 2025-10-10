// This file is deprecated - vendor types are now defined in /lib/supabase.ts
// Keeping for backward compatibility during migration

export interface Vendor {
    id: number;  // Changed from string to number for auto-increment integer
    name: string;
    category: string;
    location: string;
    phone: string;
    email?: string;
    description: string;
    pricing_min?: number;
    pricing_max?: number;
    rating?: number;
    image_url?: string;
    gallery_images?: string[];
    services?: string[];
    availability?: boolean;
    created_at?: string;
    updated_at?: string;
}

export enum PricingCategory {
    basic = "Basic",
    standard = "Standard", 
    premium = "Premium"
}

export default Vendor;