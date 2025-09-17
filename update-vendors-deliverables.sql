-- SQL script to add deliverables column to vendors table
-- Run this script in your Supabase SQL editor

-- Add deliverables column to vendors table
ALTER TABLE vendors 
ADD COLUMN IF NOT EXISTS deliverables JSONB DEFAULT '[]'::jsonb;

-- Update existing vendors with sample deliverables (optional)
-- Event Planners
UPDATE vendors SET deliverables = '[
  "Complete event planning from concept to execution",
  "Vendor coordination and management",
  "Timeline creation and management",
  "Budget planning and tracking",
  "Day-of coordination services",
  "Post-event cleanup coordination"
]'::jsonb WHERE category = 'Event Planners' AND deliverables = '[]'::jsonb;

-- Photographers
UPDATE vendors SET deliverables = '[
  "High-resolution edited photos",
  "Online gallery for easy sharing",
  "Professional photo album",
  "USB/DVD with all photos",
  "Pre-wedding consultation",
  "Same-day highlights reel"
]'::jsonb WHERE category = 'Photographers' AND deliverables = '[]'::jsonb;

-- Venues
UPDATE vendors SET deliverables = '[
  "Fully decorated venue space",
  "Tables, chairs, and basic furniture",
  "Sound system and microphones",
  "Lighting setup",
  "Parking facilities",
  "Security services",
  "Cleanup after event"
]'::jsonb WHERE category = 'Venues' AND deliverables = '[]'::jsonb;

-- Decorators
UPDATE vendors SET deliverables = '[
  "Custom theme design",
  "Fresh flower arrangements",
  "Stage/backdrop decoration",
  "Table centerpieces",
  "Entrance decoration",
  "Lighting setup",
  "Post-event cleanup"
]'::jsonb WHERE category = 'Decorators' AND deliverables = '[]'::jsonb;

-- Caterers
UPDATE vendors SET deliverables = '[
  "Multi-course meal service",
  "Professional serving staff",
  "Table setup and linens",
  "Appetizers and beverages",
  "Dessert service",
  "Kitchen equipment if needed",
  "Cleanup after service"
]'::jsonb WHERE category = 'Caterers' AND deliverables = '[]'::jsonb;

-- Makeup Artists
UPDATE vendors SET deliverables = '[
  "Bridal makeup application",
  "Hair styling service",
  "Pre-wedding trial session",
  "Touch-up kit for the day",
  "False eyelashes application",
  "Makeup removal service",
  "Photography-ready finish"
]'::jsonb WHERE category = 'Makeup Artists' AND deliverables = '[]'::jsonb;

-- DJs, Lighting, and Entertainment
UPDATE vendors SET deliverables = '[
  "Professional DJ services",
  "Sound system and microphones",
  "Lighting effects setup",
  "Music playlist customization",
  "MC/Announcer services",
  "Dance floor setup",
  "Equipment setup and breakdown"
]'::jsonb WHERE category = 'DJs, Lighting, and Entertainment' AND deliverables = '[]'::jsonb;

-- Anchors
UPDATE vendors SET deliverables = '[
  "Professional event hosting",
  "Script writing and preparation",
  "Audience engagement activities",
  "Ceremony coordination",
  "Microphone and sound check",
  "Timeline management",
  "Backup content preparation"
]'::jsonb WHERE category = 'Anchors' AND deliverables = '[]'::jsonb;

-- Transportation Services
UPDATE vendors SET deliverables = '[
  "Luxury vehicle rental",
  "Professional chauffeur service",
  "Vehicle decoration for events",
  "Fuel and maintenance included",
  "Insurance coverage",
  "Flexible pickup/drop locations",
  "24/7 customer support"
]'::jsonb WHERE category = 'Transportation Services' AND deliverables = '[]'::jsonb;

-- Fashion/Costume Designers
UPDATE vendors SET deliverables = '[
  "Custom outfit design",
  "Multiple fitting sessions",
  "Premium fabric selection",
  "Matching accessories",
  "Alteration services",
  "Style consultation",
  "Delivery and pickup service"
]'::jsonb WHERE category = 'Fashion/Costume Designers' AND deliverables = '[]'::jsonb;

-- Tent & Equipment Rentals
UPDATE vendors SET deliverables = '[
  "Weather-resistant tent setup",
  "Tables, chairs, and furniture",
  "Lighting and electrical setup",
  "Flooring installation",
  "Decoration mounting points",
  "Setup and breakdown service",
  "Emergency backup equipment"
]'::jsonb WHERE category = 'Tent & Equipment Rentals' AND deliverables = '[]'::jsonb;

-- Verify the update
SELECT brand_name, category, deliverables FROM vendors WHERE deliverables != '[]'::jsonb LIMIT 5;
