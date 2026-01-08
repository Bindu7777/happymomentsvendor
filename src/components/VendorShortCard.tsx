import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Star, MapPin, MessageCircle, Eye, Languages } from 'lucide-react';
import { Vendor } from '@/lib/supabase';
import WhatsAppButton from './WhatsAppButton';
import LikeButton from './LikeButton';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { getAllCatalogImages } from '@/services/supabaseService';

interface VendorShortCardProps {
  vendor: Vendor;
}

const VendorShortCard: React.FC<VendorShortCardProps> = ({ 
  vendor
}) => {
  const navigate = useNavigate();
  const { customer } = useCustomerAuth();
  const [coverImage, setCoverImage] = useState<string | null>(null);

  // Load cover image from catalog images
  useEffect(() => {
    const loadCoverImage = async () => {
      try {
        // First try to use cover_image_url or avatar_url
        if (vendor.cover_image_url) {
          setCoverImage(vendor.cover_image_url);
          return;
        }
        if (vendor.avatar_url) {
          setCoverImage(vendor.avatar_url);
          return;
        }

        // If no cover/avatar, try to get from catalog images
        if (vendor.vendor_id) {
          const catalogImages = await getAllCatalogImages(Number(vendor.vendor_id));
          if (catalogImages && catalogImages.length > 0) {
            // Use the first image as cover
            setCoverImage(catalogImages[0].url || catalogImages[0].image_url || null);
          }
        }
      } catch (error) {
        console.error('Error loading cover image:', error);
      }
    };

    loadCoverImage();
  }, [vendor.vendor_id, vendor.cover_image_url, vendor.avatar_url]);

  // Get all categories (handle both string and array)
  const getAllCategories = (): string[] => {
    const categories: string[] = [];
    
    // Check categories field first (new array field)
    if (vendor.categories && Array.isArray(vendor.categories)) {
      categories.push(...vendor.categories.filter(c => typeof c === 'string'));
    }
    
    // Check category field (legacy - can be string or array)
    if (vendor.category) {
      if (Array.isArray(vendor.category)) {
        categories.push(...vendor.category.filter(c => typeof c === 'string'));
      } else if (typeof vendor.category === 'string') {
        categories.push(vendor.category);
      }
    }
    
    // Remove duplicates and return
    return [...new Set(categories)];
  };

  // Get service area (coverage-based, not full address)
  const getServiceArea = (): string => {
    if (vendor.additional_info?.service_areas && Array.isArray(vendor.additional_info.service_areas) && vendor.additional_info.service_areas.length > 0) {
      // Convert state values to readable labels
      const stateMap: { [key: string]: string } = {
        'andhra-pradesh': 'Andhra Pradesh',
        'telangana': 'Telangana',
        'karnataka': 'Karnataka',
        'tamil-nadu': 'Tamil Nadu',
        'kerala': 'Kerala',
        'maharashtra': 'Maharashtra',
        'goa': 'Goa',
        'delhi': 'Delhi',
        'punjab': 'Punjab',
        'rajasthan': 'Rajasthan',
        'gujarat': 'Gujarat',
        'madhya-pradesh': 'Madhya Pradesh',
        'uttar-pradesh': 'Uttar Pradesh',
        'west-bengal': 'West Bengal',
        'bihar': 'Bihar',
        'jharkhand': 'Jharkhand',
        'odisha': 'Odisha',
        'chhattisgarh': 'Chhattisgarh',
        'haryana': 'Haryana',
        'himachal-pradesh': 'Himachal Pradesh',
        'jammu-kashmir': 'Jammu & Kashmir',
        'ladakh': 'Ladakh',
        'uttarakhand': 'Uttarakhand',
        'assam': 'Assam',
        'arunachal-pradesh': 'Arunachal Pradesh',
        'manipur': 'Manipur',
        'meghalaya': 'Meghalaya',
        'mizoram': 'Mizoram',
        'nagaland': 'Nagaland',
        'tripura': 'Tripura',
        'sikkim': 'Sikkim',
        'andaman-nicobar': 'Andaman & Nicobar',
        'chandigarh': 'Chandigarh',
        'dadra-nagar-haveli': 'Dadra & Nagar Haveli',
        'daman-diu': 'Daman & Diu',
        'lakshadweep': 'Lakshadweep',
        'puducherry': 'Puducherry'
      };
      
      const stateLabels = vendor.additional_info.service_areas
        .map(stateValue => stateMap[stateValue] || stateValue)
        .slice(0, 2);
      
      if (stateLabels.length === 1) {
        return stateLabels[0];
      } else if (stateLabels.length === 2) {
        return `${stateLabels[0]} | ${stateLabels[1]}`;
      } else {
        return `${stateLabels[0]} & nearby areas`;
      }
    }
    
    // Fallback: extract city/state from address if available
    if (vendor.address) {
      const parts = vendor.address.split(',');
      if (parts.length >= 2) {
        const city = parts[parts.length - 2]?.trim();
        const state = parts[parts.length - 1]?.trim();
        return city ? `${city} | ${state}` : state;
      }
      return parts[0]?.trim() || '';
    }
    
    return '';
  };

  // Format experience - ensure it shows "X+ years experience" format
  const getExperienceDisplay = (): string => {
    if (vendor.experience) {
      // If already in good format, return as is
      if (vendor.experience.toLowerCase().includes('year') || vendor.experience.toLowerCase().includes('experience')) {
        return vendor.experience;
      }
      // Try to extract number and format
      const match = vendor.experience.match(/(\d+)/);
      if (match) {
        return `${match[1]}+ years experience`;
      }
      return vendor.experience;
    }
    return 'Experience not specified';
  };

  // Get rating display
  const getRatingDisplay = (): { text: string; showStars: boolean; ratingValue: number } => {
    // Always show rating, default to 4/5 if no rating exists
    const ratingValue = vendor.rating && vendor.rating > 0 ? vendor.rating : 4;
    return {
      text: `${ratingValue}/5`,
      showStars: true,
      ratingValue: ratingValue
    };
  };

  // Get all languages (check multiple possible locations)
  const getAllLanguages = (): string[] => {
    // Check in order: languages (new field) -> languages_spoken (legacy) -> additional_info.languages
    if (vendor.languages && Array.isArray(vendor.languages) && vendor.languages.length > 0) {
      return vendor.languages;
    }
    if (vendor.languages_spoken && Array.isArray(vendor.languages_spoken) && vendor.languages_spoken.length > 0) {
      return vendor.languages_spoken;
    }
    if (vendor.additional_info?.languages && Array.isArray(vendor.additional_info.languages) && vendor.additional_info.languages.length > 0) {
      return vendor.additional_info.languages;
    }
    return [];
  };

  const ratingDisplay = getRatingDisplay();
  const allCategories = getAllCategories();
  const serviceArea = getServiceArea();
  const experience = getExperienceDisplay();
  const allLanguages = getAllLanguages();

  // Handle card click to navigate to vendor profile
  const handleCardClick = () => {
    // Check if customer is logged in before viewing profile
    if (!customer) {
      // Redirect to customer login
      navigate('/customer-login?redirect=' + encodeURIComponent(`/vendor/${vendor.vendor_id}`));
      return;
    }
    navigate(`/vendor/${vendor.vendor_id}`);
  };

  return (
    <Card 
      className="group hover:shadow-xl transition-all duration-300 border-2 border-gray-300 md:border-gray-200 bg-white overflow-hidden h-full flex flex-col rounded-xl md:rounded-lg shadow-md md:shadow-sm cursor-pointer"
      onClick={handleCardClick}
    >
      <CardContent className="p-0 flex flex-col h-full">
        {/* Subtle top accent for visual start */}
        <div className="h-1 bg-gradient-to-r from-[#F7941D] via-[#FFA326] to-[#F7941D]"></div>
        
        {/* Cover Image or Placeholder */}
        <div className={`relative ${coverImage ? 'h-40 sm:h-48 md:h-48' : 'h-28 sm:h-32 md:h-48'} overflow-hidden bg-gradient-to-br from-[#001B5E] via-[#001B5E]/90 to-[#F7941D]/20 flex items-center justify-center`}>
          {coverImage ? (
            <>
              <img
                src={coverImage}
                alt={`${vendor.brand_name} cover`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => {
                  // Hide image and show placeholder text if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    const placeholder = parent.querySelector('.cover-placeholder') as HTMLElement;
                    if (placeholder) placeholder.style.display = 'flex';
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
            </>
          ) : null}
          <div 
            className={`cover-placeholder ${coverImage ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}
          >
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-2 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
                <Star className="w-6 h-6 md:w-8 md:h-8 text-white/80 fill-white/40" />
              </div>
              <p className="text-white/70 text-xs font-medium">Happy Moments</p>
            </div>
          </div>
          
          {/* Like Button - Top Right Corner - High z-index to ensure visibility */}
          <div 
            className="absolute top-3 right-3 z-30 flex items-center justify-center" 
            onClick={(e) => e.stopPropagation()}
            style={{ zIndex: 30 }}
          >
            <div className="bg-white/95 hover:bg-white backdrop-blur-sm shadow-xl rounded-full p-1.5 border border-white/80">
              <LikeButton
                vendorId={String(vendor.vendor_id)}
                size="md"
                className=""
              />
            </div>
          </div>
        </div>

        {/* 1. Vendor Brand Name (Primary Heading) */}
        <div className="px-3 sm:px-4 pt-3 sm:pt-4 pb-2 sm:pb-3">
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2 break-words">
            {vendor.brand_name}
          </h3>
        </div>

        {/* 2. Trust & Availability (same horizontal row) */}
        <div className="px-3 sm:px-4 pb-2 sm:pb-3 flex items-center justify-between gap-1 sm:gap-2">
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
            {vendor.verified && (
              <Badge className="bg-green-600 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 font-semibold">
                Verified Pro
              </Badge>
            )}
            {vendor.currently_available ? (
              <Badge className="bg-blue-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 font-semibold">
                <span className="hidden sm:inline">Available for bookings</span>
                <span className="sm:hidden">Available</span>
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 text-gray-600 border-gray-300">
                Currently busy
              </Badge>
            )}
          </div>
        </div>

        {/* 4. Experience Highlight with Events Completed */}
        <div className="px-3 sm:px-4 pb-1.5 sm:pb-2">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <p className="text-xs sm:text-sm font-semibold text-orange-600">
              {experience.match(/\d+/) ? (
                `Since ${experience.match(/\d+/)?.[0]}+ years`
              ) : (
                experience
              )}
            </p>
            {vendor.events_completed && vendor.events_completed > 0 && (
              <>
                <span className="text-gray-400 font-bold">•</span>
                <p className="text-xs sm:text-sm font-semibold text-gray-800">
                  <span className="text-blue-600 font-bold">{vendor.events_completed}+</span>
                  <span className="text-gray-700"> <span className="hidden sm:inline">events completed</span><span className="sm:hidden">events</span></span>
                </p>
              </>
            )}
          </div>
        </div>

        {/* 5. Rating / Trust Indicator */}
        <div className="px-3 sm:px-4 pb-2 sm:pb-3">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {ratingDisplay.showStars && (
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 sm:w-4 sm:h-4 ${
                      i < Math.floor(ratingDisplay.ratingValue || 0)
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            )}
            <p className="text-xs sm:text-sm text-gray-700 font-medium">{ratingDisplay.text}</p>
          </div>
        </div>

        {/* 6. Service Area (Coverage-based) */}
        {serviceArea && (
          <div className="px-3 sm:px-4 pb-2 sm:pb-3">
            <div className="flex items-start gap-1.5 sm:gap-2 text-gray-700">
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 text-red-500 fill-red-500 mt-0.5" />
              <p className="text-xs sm:text-sm break-words">
                {serviceArea.includes('|') ? serviceArea : `Serving ${serviceArea} & nearby areas`}
              </p>
            </div>
          </div>
        )}

        {/* 7. Pricing (Contextual) */}
        <div className="px-3 sm:px-4 pb-2 sm:pb-3">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-lg sm:text-xl font-bold text-green-600 flex-shrink-0">₹</span>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-gray-900 break-words">
                Starting from {vendor.starting_price ? `₹${vendor.starting_price.toLocaleString()}` : 'Contact for pricing'}
              </p>
            </div>
          </div>
        </div>

        {/* Languages - Below Pricing */}
        <div className="px-3 sm:px-4 pb-3 sm:pb-4">
          {allLanguages.length > 0 ? (
            <div className="flex items-start gap-1.5 sm:gap-2 text-gray-700">
              <Languages className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 text-blue-500 fill-blue-500 mt-0.5" />
              <p className="text-xs sm:text-sm break-words">
                Communicates in {allLanguages.join(', ')}
              </p>
            </div>
          ) : (
            <div className="flex items-start gap-1.5 sm:gap-2 text-gray-400">
              <Languages className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 text-gray-400 mt-0.5" />
              <p className="text-xs sm:text-sm break-words">
                Communicates in Not specified
              </p>
            </div>
          )}
        </div>

        {/* Spacer to push buttons to bottom */}
        <div className="flex-1"></div>

        {/* 8. Primary CTA - WhatsApp */}
        <div className="px-3 sm:px-4 pb-2" onClick={(e) => e.stopPropagation()}>
          <WhatsAppButton
            vendor={vendor}
            className="w-full bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base font-semibold py-2 sm:py-2.5 rounded-lg transition-all duration-200"
          >
            WhatsApp
          </WhatsAppButton>
        </div>

        {/* 9. Secondary CTA - View Profile */}
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 md:pb-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            className="w-full border-2 border-orange-500 text-orange-600 hover:bg-orange-50 text-sm sm:text-base font-semibold py-2 sm:py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2"
            onClick={(e) => {
              e.stopPropagation();
              // Check if customer is logged in before viewing profile
              if (!customer) {
                // Redirect to customer login
                navigate('/customer-login?redirect=' + encodeURIComponent(`/vendor/${vendor.vendor_id}`));
                return;
              }
              navigate(`/vendor/${vendor.vendor_id}`);
            }}
          >
            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>View Profile</span>
          </Button>
        </div>

      </CardContent>
    </Card>
  );
};

export default VendorShortCard;

