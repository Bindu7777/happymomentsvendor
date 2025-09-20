-- SQL script to fix duplicate entries in vendors table JSONB arrays
-- This will remove duplicate entries from deliverables, services, packages, specialties, and highlight_features

-- First, let's see which vendors have duplicate data
SELECT 
    vendor_id,
    brand_name, 
    category,
    CASE WHEN deliverables IS NOT NULL AND deliverables != '[]'::jsonb THEN jsonb_array_length(deliverables) ELSE 0 END as deliverable_count,
    CASE WHEN services IS NOT NULL AND services != '[]'::jsonb THEN jsonb_array_length(services) ELSE 0 END as services_count,
    CASE WHEN packages IS NOT NULL AND packages != '[]'::jsonb THEN jsonb_array_length(packages) ELSE 0 END as packages_count,
    CASE WHEN specialties IS NOT NULL AND specialties != '[]'::jsonb THEN jsonb_array_length(specialties) ELSE 0 END as specialties_count,
    CASE WHEN highlight_features IS NOT NULL AND highlight_features != '[]'::jsonb THEN jsonb_array_length(highlight_features) ELSE 0 END as highlight_features_count
FROM vendors 
WHERE (deliverables IS NOT NULL AND deliverables != '[]'::jsonb AND jsonb_array_length(deliverables) > 0)
   OR (services IS NOT NULL AND services != '[]'::jsonb AND jsonb_array_length(services) > 0)
   OR (packages IS NOT NULL AND packages != '[]'::jsonb AND jsonb_array_length(packages) > 0)
   OR (specialties IS NOT NULL AND specialties != '[]'::jsonb AND jsonb_array_length(specialties) > 0)
   OR (highlight_features IS NOT NULL AND highlight_features != '[]'::jsonb AND jsonb_array_length(highlight_features) > 0)
ORDER BY brand_name;

-- Function to remove duplicates from JSONB arrays
CREATE OR REPLACE FUNCTION remove_duplicate_arrays()
RETURNS void AS $$
DECLARE
    vendor_record RECORD;
    unique_deliverables JSONB;
    unique_specialties JSONB;
    unique_highlight_features JSONB;
    unique_services JSONB;
    unique_packages JSONB;
    item_text TEXT;
    service_record RECORD;
    package_record RECORD;
    seen_items TEXT[];
    seen_services TEXT[];
    seen_packages TEXT[];
BEGIN
    -- Loop through all vendors
    FOR vendor_record IN 
        SELECT vendor_id, deliverables, specialties, highlight_features, services, packages
        FROM vendors 
    LOOP
        RAISE NOTICE 'Processing vendor_id %', vendor_record.vendor_id;
        
        -- Process deliverables
        IF vendor_record.deliverables IS NOT NULL AND vendor_record.deliverables != '[]'::jsonb AND jsonb_array_length(vendor_record.deliverables) > 0 THEN
            unique_deliverables := '[]'::jsonb;
            seen_items := ARRAY[]::TEXT[];
            
            FOR item_text IN SELECT jsonb_array_elements_text(vendor_record.deliverables) LOOP
                IF NOT (LOWER(TRIM(item_text)) = ANY(seen_items)) AND TRIM(item_text) != '' THEN
                    unique_deliverables := unique_deliverables || to_jsonb(TRIM(item_text));
                    seen_items := seen_items || LOWER(TRIM(item_text));
                END IF;
            END LOOP;
            
            UPDATE vendors SET deliverables = unique_deliverables WHERE vendor_id = vendor_record.vendor_id;
        END IF;
        
        -- Process specialties
        IF vendor_record.specialties IS NOT NULL AND vendor_record.specialties != '[]'::jsonb AND jsonb_array_length(vendor_record.specialties) > 0 THEN
            unique_specialties := '[]'::jsonb;
            seen_items := ARRAY[]::TEXT[];
            
            FOR item_text IN SELECT jsonb_array_elements_text(vendor_record.specialties) LOOP
                IF NOT (LOWER(TRIM(item_text)) = ANY(seen_items)) AND TRIM(item_text) != '' THEN
                    unique_specialties := unique_specialties || to_jsonb(TRIM(item_text));
                    seen_items := seen_items || LOWER(TRIM(item_text));
                END IF;
            END LOOP;
            
            UPDATE vendors SET specialties = unique_specialties WHERE vendor_id = vendor_record.vendor_id;
        END IF;
        
        -- Process highlight_features
        IF vendor_record.highlight_features IS NOT NULL AND vendor_record.highlight_features != '[]'::jsonb AND jsonb_array_length(vendor_record.highlight_features) > 0 THEN
            unique_highlight_features := '[]'::jsonb;
            seen_items := ARRAY[]::TEXT[];
            
            FOR item_text IN SELECT jsonb_array_elements_text(vendor_record.highlight_features) LOOP
                IF NOT (LOWER(TRIM(item_text)) = ANY(seen_items)) AND TRIM(item_text) != '' THEN
                    unique_highlight_features := unique_highlight_features || to_jsonb(TRIM(item_text));
                    seen_items := seen_items || LOWER(TRIM(item_text));
                END IF;
            END LOOP;
            
            UPDATE vendors SET highlight_features = unique_highlight_features WHERE vendor_id = vendor_record.vendor_id;
        END IF;
        
        -- Process services (based on service name)
        IF vendor_record.services IS NOT NULL AND vendor_record.services != '[]'::jsonb AND jsonb_array_length(vendor_record.services) > 0 THEN
            unique_services := '[]'::jsonb;
            seen_services := ARRAY[]::TEXT[];
            
            FOR service_record IN 
                SELECT * FROM jsonb_to_recordset(vendor_record.services) AS x(name TEXT, description TEXT, price TEXT)
            LOOP
                IF service_record.name IS NOT NULL AND TRIM(service_record.name) != '' AND NOT (LOWER(TRIM(service_record.name)) = ANY(seen_services)) THEN
                    unique_services := unique_services || jsonb_build_object(
                        'name', TRIM(service_record.name),
                        'description', COALESCE(service_record.description, ''),
                        'price', COALESCE(service_record.price, '')
                    );
                    seen_services := seen_services || LOWER(TRIM(service_record.name));
                END IF;
            END LOOP;
            
            UPDATE vendors SET services = unique_services WHERE vendor_id = vendor_record.vendor_id;
        END IF;
        
        -- Process packages (based on package name)
        IF vendor_record.packages IS NOT NULL AND vendor_record.packages != '[]'::jsonb AND jsonb_array_length(vendor_record.packages) > 0 THEN
            unique_packages := '[]'::jsonb;
            seen_packages := ARRAY[]::TEXT[];
            
            FOR package_record IN 
                SELECT * FROM jsonb_to_recordset(vendor_record.packages) AS x(name TEXT, price TEXT, description TEXT, features JSONB)
            LOOP
                IF package_record.name IS NOT NULL AND TRIM(package_record.name) != '' AND NOT (LOWER(TRIM(package_record.name)) = ANY(seen_packages)) THEN
                    unique_packages := unique_packages || jsonb_build_object(
                        'name', TRIM(package_record.name),
                        'price', COALESCE(package_record.price, ''),
                        'description', COALESCE(package_record.description, ''),
                        'features', COALESCE(package_record.features, '[]'::jsonb)
                    );
                    seen_packages := seen_packages || LOWER(TRIM(package_record.name));
                END IF;
            END LOOP;
            
            UPDATE vendors SET packages = unique_packages WHERE vendor_id = vendor_record.vendor_id;
        END IF;
        
    END LOOP;
    
    RAISE NOTICE 'Completed deduplication for all vendors';
END;
$$ LANGUAGE plpgsql;

-- Execute the function to remove duplicates
SELECT remove_duplicate_arrays();

-- Verify the results
SELECT 
    vendor_id,
    brand_name, 
    category,
    CASE WHEN deliverables IS NOT NULL AND deliverables != '[]'::jsonb THEN jsonb_array_length(deliverables) ELSE 0 END as deliverable_count,
    CASE WHEN services IS NOT NULL AND services != '[]'::jsonb THEN jsonb_array_length(services) ELSE 0 END as services_count,
    CASE WHEN packages IS NOT NULL AND packages != '[]'::jsonb THEN jsonb_array_length(packages) ELSE 0 END as packages_count,
    CASE WHEN specialties IS NOT NULL AND specialties != '[]'::jsonb THEN jsonb_array_length(specialties) ELSE 0 END as specialties_count,
    CASE WHEN highlight_features IS NOT NULL AND highlight_features != '[]'::jsonb THEN jsonb_array_length(highlight_features) ELSE 0 END as highlight_features_count
FROM vendors 
WHERE (deliverables IS NOT NULL AND deliverables != '[]'::jsonb AND jsonb_array_length(deliverables) > 0)
   OR (services IS NOT NULL AND services != '[]'::jsonb AND jsonb_array_length(services) > 0)
   OR (packages IS NOT NULL AND packages != '[]'::jsonb AND jsonb_array_length(packages) > 0)
   OR (specialties IS NOT NULL AND specialties != '[]'::jsonb AND jsonb_array_length(specialties) > 0)
   OR (highlight_features IS NOT NULL AND highlight_features != '[]'::jsonb AND jsonb_array_length(highlight_features) > 0)
ORDER BY brand_name;

-- Drop the temporary function
DROP FUNCTION remove_duplicate_arrays();
