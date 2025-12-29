import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Phone, Mail, Instagram, Heart, MessageCircle, Camera, Award, Users, Zap, Clock, ChevronLeft, Search, Filter, SlidersHorizontal, ChevronDown, User, Calendar, Shield, X, Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Checkbox } from '../components/ui/checkbox';
import Header from '../components/layout/Header';
import VendorShortCard from '../components/VendorShortCard';
import { Vendor } from '@/lib/supabase';
import { getVendorsByCategory } from '@/services/supabaseService';
import { CATEGORY_NAMES } from '@/constants/categories';

// Indian States list (Telangana and Andhra Pradesh first)
const indianStates = [
  { value: 'telangana', label: 'Telangana' },
  { value: 'andhra-pradesh', label: 'Andhra Pradesh' },
  { value: 'arunachal-pradesh', label: 'Arunachal Pradesh' },
  { value: 'assam', label: 'Assam' },
  { value: 'bihar', label: 'Bihar' },
  { value: 'chhattisgarh', label: 'Chhattisgarh' },
  { value: 'goa', label: 'Goa' },
  { value: 'gujarat', label: 'Gujarat' },
  { value: 'haryana', label: 'Haryana' },
  { value: 'himachal-pradesh', label: 'Himachal Pradesh' },
  { value: 'jharkhand', label: 'Jharkhand' },
  { value: 'karnataka', label: 'Karnataka' },
  { value: 'kerala', label: 'Kerala' },
  { value: 'madhya-pradesh', label: 'Madhya Pradesh' },
  { value: 'maharashtra', label: 'Maharashtra' },
  { value: 'manipur', label: 'Manipur' },
  { value: 'meghalaya', label: 'Meghalaya' },
  { value: 'mizoram', label: 'Mizoram' },
  { value: 'nagaland', label: 'Nagaland' },
  { value: 'odisha', label: 'Odisha' },
  { value: 'punjab', label: 'Punjab' },
  { value: 'rajasthan', label: 'Rajasthan' },
  { value: 'sikkim', label: 'Sikkim' },
  { value: 'tamil-nadu', label: 'Tamil Nadu' },
  { value: 'tripura', label: 'Tripura' },
  { value: 'uttar-pradesh', label: 'Uttar Pradesh' },
  { value: 'uttarakhand', label: 'Uttarakhand' },
  { value: 'west-bengal', label: 'West Bengal' },
  { value: 'andaman-nicobar', label: 'Andaman and Nicobar Islands' },
  { value: 'chandigarh', label: 'Chandigarh' },
  { value: 'dadra-nagar-haveli', label: 'Dadra and Nagar Haveli' },
  { value: 'daman-diu', label: 'Daman and Diu' },
  { value: 'delhi', label: 'Delhi' },
  { value: 'jammu-kashmir', label: 'Jammu and Kashmir' },
  { value: 'ladakh', label: 'Ladakh' },
  { value: 'lakshadweep', label: 'Lakshadweep' },
  { value: 'puducherry', label: 'Puducherry' },
];

const CategoryVendors = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedBudgetRanges, setSelectedBudgetRanges] = useState<string[]>([]);
  const [showCustomBudget, setShowCustomBudget] = useState(false);
  const [customMinBudget, setCustomMinBudget] = useState('');
  const [customMaxBudget, setCustomMaxBudget] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [comparisonVendors, setComparisonVendors] = useState<Vendor[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  // Reset scroll position on page load and route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [category]);

  // Fetch vendors from Supabase
  useEffect(() => {
    const fetchVendors = async () => {
      if (!category) return;
      
      try {
        // Convert URL parameter back to proper category name
        let categoryName = category
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        // Handle special cases for better matching
        const categoryMappings: Record<string, string> = {
          'photographers': 'Photographers',
          'event-planners': 'Event Planners',
          'venues': 'Venues',
          'decorators': 'Decorators',
          'caterers': 'Caterers',
          'makeup-artists': 'Makeup Artists',
          'djs-lighting-and-entertainment': 'DJs, Lighting, and Entertainment',
          'anchors': 'Anchors',
          'transportation-services': 'Transportation Services',
          'fashion-costume-designers': 'Fashion/Costume Designers',
          'tent-equipment-rentals': 'Tent & Equipment Rentals'
        };
        
        // Use mapping if available, otherwise use the converted name
        categoryName = categoryMappings[category] || categoryName;
        
        console.log('Fetching vendors for category:', categoryName);
        const vendorData = await getVendorsByCategory(categoryName);
        console.log('Fetched vendors for category:', vendorData);
        console.log('Number of vendors found:', vendorData.length);
        
        // Log sample vendor data to debug
        if (vendorData.length > 0) {
          console.log('Sample vendor data:', vendorData[0]);
          console.log('Vendor fields:', Object.keys(vendorData[0]));
          
          // Specifically check rating field for Siva Events
          const sivaVendor = vendorData.find(v => v.brand_name && v.brand_name.toLowerCase().includes('siva'));
          if (sivaVendor) {
            console.log('🔍 SIVA EVENTS RATING DEBUG:', {
              brand_name: sivaVendor.brand_name,
              rating: sivaVendor.rating,
              ratingType: typeof sivaVendor.rating,
              allKeys: Object.keys(sivaVendor),
              rawData: JSON.stringify(sivaVendor, null, 2)
            });
          }
        }
        
        setVendors(vendorData);
      } catch (error) {
        console.error('Error fetching vendors by category:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, [category]);

  // Enhanced filtering and sorting for real vendor data
  const filteredAndSortedVendors = vendors
    .filter(vendor => {
      const matchesSearch = vendor.brand_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           vendor.spoc_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (vendor.specialties && Array.isArray(vendor.specialties) && 
                            vendor.specialties.some((specialty: string) => 
                             specialty.toLowerCase().includes(searchQuery.toLowerCase())
                            ));
      
      // Check if vendor's service areas match any selected states
      const matchesLocation = selectedStates.length === 0 || (() => {
        const vendorServiceAreas = vendor.additional_info?.service_areas || [];
        if (!Array.isArray(vendorServiceAreas) || vendorServiceAreas.length === 0) {
          return false;
        }
        // Check if any selected state matches any vendor service area
        return selectedStates.some(selectedState => 
          vendorServiceAreas.some((area: string) => 
            area.toLowerCase() === selectedState.toLowerCase() ||
            area.toLowerCase().includes(selectedState.toLowerCase()) ||
            selectedState.toLowerCase().includes(area.toLowerCase())
          )
        );
      })();
      
      const matchesPrice = (() => {
        // If no budget ranges selected, show all
        if (selectedBudgetRanges.length === 0) return true;
        
        // Get vendor starting price, handle different data types
        const vendorPrice = typeof vendor.starting_price === 'number' 
          ? vendor.starting_price 
          : (typeof vendor.starting_price === 'string' 
            ? parseFloat(vendor.starting_price.replace(/[^\d.]/g, '')) 
            : 0);
        
        if (!vendorPrice || vendorPrice <= 0) return false;
        
        // Check if vendor price matches any of the selected ranges
        return selectedBudgetRanges.some(range => {
          if (range === '10k-25k') {
            return vendorPrice >= 10000 && vendorPrice <= 25000;
          }
          if (range === '25k-50k') {
            return vendorPrice >= 25000 && vendorPrice <= 50000;
          }
          if (range === '50k-100k') {
            return vendorPrice >= 50000 && vendorPrice <= 100000;
          }
          if (range === 'above-100k') {
            return vendorPrice > 100000;
          }
          if (range === 'custom' && customMinBudget && customMaxBudget) {
            const min = parseInt(customMinBudget.replace(/[^\d]/g, ''));
            const max = parseInt(customMaxBudget.replace(/[^\d]/g, ''));
            if (!isNaN(min) && !isNaN(max) && min > 0 && max > 0) {
              return vendorPrice >= min && vendorPrice <= max;
            }
          }
          return false;
        });
      })();
      
      const matchesRating = ratingFilter === 'all' || (() => {
        // Get rating from the actual database column
        // Check multiple possible field names in case of case sensitivity or naming differences
        const ratingValue = (vendor as any).rating || (vendor as any).Rating || (vendor as any).RATING;
        
        // Debug: Log the actual vendor object for Siva Events to see all fields
        if (vendor.brand_name && vendor.brand_name.toLowerCase().includes('siva')) {
          console.log('🔍 DATABASE RATING CHECK - Siva Events:', {
            brand_name: vendor.brand_name,
            vendor_rating: vendor.rating,
            vendor_Rating: (vendor as any).Rating,
            vendor_RATING: (vendor as any).RATING,
            allVendorKeys: Object.keys(vendor),
            fullVendorObject: JSON.stringify(vendor, null, 2),
            ratingFilter: ratingFilter
          });
        }
        
        // Convert rating to number
        let rating: number = 4; // Default to 4, matching VendorShortCard behavior
        
        if (ratingValue !== null && ratingValue !== undefined) {
          if (typeof ratingValue === 'number') {
            rating = ratingValue;
          } else if (typeof ratingValue === 'string') {
            // Handle string ratings like "4/5" or "4" or "4.0"
            const numStr = String(ratingValue).split('/')[0].trim();
            const parsed = parseFloat(numStr);
            if (!isNaN(parsed) && parsed > 0) {
              rating = parsed;
            }
          }
        }
        
        // Debug: Log converted rating
        if (vendor.brand_name && vendor.brand_name.toLowerCase().includes('siva')) {
          console.log('🔍 RATING CONVERSION - Siva Events:', {
            originalValue: ratingValue,
            convertedRating: rating,
            filter: ratingFilter,
            willMatch4Plus: rating >= 4
          });
        }
        
        // Apply filter based on selected rating
        let result: boolean;
        switch (ratingFilter) {
          case '5': 
            result = rating >= 5;
            break;
          case '4+': 
            result = rating >= 4;
            if (vendor.brand_name && vendor.brand_name.toLowerCase().includes('siva')) {
              console.log('🔍 FILTER RESULT - Siva Events:', {
                rating: rating,
                filter: '4+',
                ratingGreaterEqual4: rating >= 4,
                result: result
              });
            }
            break;
          case '3+': 
            result = rating >= 3;
            break;
          case '2+': 
            result = rating >= 2;
            break;
          default: 
            result = true;
        }
        
        return result;
      })();
      
      return matchesSearch && matchesLocation && matchesPrice && matchesRating;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'price-low':
          return (a.starting_price || 0) - (b.starting_price || 0);
        case 'price-high':
          return (b.starting_price || 0) - (a.starting_price || 0);
        case 'experience':
          const aExp = parseInt((a.experience || '0').replace(/[^\d]/g, ''));
          const bExp = parseInt((b.experience || '0').replace(/[^\d]/g, ''));
          return bExp - aExp;
        case 'reviews':
          return (b.review_count || 0) - (a.review_count || 0);
        default:
          return (b.rating || 0) - (a.rating || 0);
      }
    });

  // Toggle favorite
  const toggleFavorite = (vendorId: string) => {
    setFavorites(prev => 
      prev.includes(vendorId) 
        ? prev.filter(id => id !== vendorId)
        : [...prev, vendorId]
    );
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedStates([]);
    setSelectedBudgetRanges([]);
    setShowCustomBudget(false);
    setCustomMinBudget('');
    setCustomMaxBudget('');
    setRatingFilter('all');
    setSortBy('rating');
  };

  // Format number with Indian numbering system
  const formatIndianNumber = (value: string): string => {
    const numStr = value.replace(/[^\d]/g, '');
    if (!numStr) return '';
    const num = parseInt(numStr);
    if (isNaN(num)) return '';
    return num.toLocaleString('en-IN');
  };

  // Handle custom budget input
  const handleCustomBudgetChange = (type: 'min' | 'max', value: string) => {
    const numStr = value.replace(/[^\d]/g, '');
    if (type === 'min') {
      setCustomMinBudget(numStr);
    } else {
      setCustomMaxBudget(numStr);
    }
  };

  // Apply custom budget filter
  const applyCustomBudget = () => {
    const min = parseInt(customMinBudget.replace(/[^\d]/g, ''));
    const max = parseInt(customMaxBudget.replace(/[^\d]/g, ''));
    
    if (isNaN(min) || isNaN(max)) {
      alert('Please enter valid budget values');
      return;
    }
    
    if (min > max) {
      alert('Minimum budget cannot be greater than maximum budget');
      return;
    }
    
    if (min < 0 || max < 0) {
      alert('Budget values must be positive');
      return;
    }
    
    // Add custom range to selected ranges if not already there
    if (!selectedBudgetRanges.includes('custom')) {
      setSelectedBudgetRanges(prev => [...prev, 'custom']);
    }
    setShowCustomBudget(false);
  };

  // Toggle state selection
  const toggleState = (stateValue: string) => {
    setSelectedStates(prev => 
      prev.includes(stateValue)
        ? prev.filter(s => s !== stateValue)
        : [...prev, stateValue]
    );
  };

  // Toggle budget range selection
  const toggleBudgetRange = (rangeValue: string) => {
    setSelectedBudgetRanges(prev => 
      prev.includes(rangeValue)
        ? prev.filter(r => r !== rangeValue)
        : [...prev, rangeValue]
    );
  };

  // Comparison functions
  const addToComparison = (vendor: Vendor) => {
    if (comparisonVendors.length >= 3) {
      alert('You can compare maximum 3 vendors at a time');
      return;
    }
    if (!comparisonVendors.find(v => v.vendor_id === vendor.vendor_id)) {
      setComparisonVendors([...comparisonVendors, vendor]);
    }
  };

  const removeFromComparison = (vendorId: number) => {
    setComparisonVendors(comparisonVendors.filter(v => v.vendor_id !== vendorId));
  };

  const clearComparison = () => {
    setComparisonVendors([]);
    setShowComparison(false);
  };

  // Navigate to individual vendor profile
  const handleCardClick = (vendorId: number) => {
    navigate(`/vendor/${vendorId}`);
  };

  // WhatsApp integration
  const openWhatsApp = (vendor: Vendor) => {
    const message = `Hi ${vendor.spoc_name}! I found your ${vendor.category} services and I'm interested in learning more about your packages. Could you please share your availability and pricing details?`;
    const phoneNumber = vendor.whatsapp_number || vendor.phone_number;
    const whatsappUrl = `https://wa.me/${phoneNumber?.replace(/[^\d]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const formatCategoryName = (cat: string) => {
    return cat
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-white to-orange-50/30">
      <Header />
      
      {/* Premium Enhanced Header */}
      <div className="relative py-8 sm:py-10 mt-16 overflow-hidden">
        {/* Enhanced Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600 via-orange-500 to-orange-400"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/80 via-transparent to-orange-300/60"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Enhanced Header with Typography */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              onClick={() => {
                navigate('/');
                // Scroll to categories section after navigation
                setTimeout(() => {
                  const categoriesSection = document.getElementById('categories');
                  if (categoriesSection) {
                    categoriesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }, 100);
              }}
              className="text-white hover:bg-white/20 p-2 rounded-xl transition-all duration-200 backdrop-blur-sm"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <div className="flex-1 text-center">
              <h1 className="text-lg md:text-3xl font-bold text-white drop-shadow-lg">
                {formatCategoryName(category || '')} Vendors
              </h1>
              {/* Elegant Accent Line */}
              <div className="mt-3 h-1 w-24 bg-gradient-to-r from-white via-amber-200 to-transparent rounded-full shadow-sm mx-auto"></div>
            </div>
          </div>
          
          {/* Compact Horizontal Filter Bar */}
          <div className="max-w-7xl mx-auto">
            {/* Premium Glassmorphism Filter Bar */}
            <div className="hidden md:block bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 p-5 hover:shadow-3xl transition-all duration-300" style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.2)'
            }}>
              <div className="flex items-center gap-3">
                {/* Search Input - Compact */}
                <div className="flex-1 max-w-xs">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder={`Search ${formatCategoryName(category || '')}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-10 border border-gray-300 focus:border-amber-400 focus:ring-1 focus:ring-amber-200 rounded-lg text-sm"
                    />
                  </div>
                </div>

                {/* Compact Filters */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="pl-7 h-10 w-40 border border-gray-300 focus:border-amber-400 text-sm justify-start"
                        >
                    <MapPin className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                          <span className="ml-2">
                            {selectedStates.length === 0 
                              ? 'All States' 
                              : selectedStates.length === 1
                              ? indianStates.find(s => s.value === selectedStates[0])?.label || '1 State'
                              : `${selectedStates.length} States`
                            }
                          </span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-0" align="start">
                        <div className="p-3 border-b">
                          <p className="text-sm font-semibold text-gray-700">Select States</p>
                  </div>
                        <div className="max-h-64 overflow-y-auto p-2">
                          {indianStates.map((state) => {
                            const isChecked = selectedStates.includes(state.value);
                            return (
                              <div
                                key={state.value}
                                className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded"
                              >
                                <Checkbox
                                  id={`state-${state.value}`}
                                  checked={isChecked}
                                  onCheckedChange={(checked) => {
                                    toggleState(state.value);
                                  }}
                                />
                                <label 
                                  htmlFor={`state-${state.value}`}
                                  className="text-sm text-gray-700 cursor-pointer flex-1"
                                >
                                  {state.label}
                                </label>
                              </div>
                            );
                          })}
                        </div>
                        {selectedStates.length > 0 && (
                          <div className="p-2 border-t">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full text-xs"
                              onClick={() => setSelectedStates([])}
                            >
                              Clear All
                            </Button>
                          </div>
                        )}
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="relative">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-10 w-40 border border-gray-300 focus:border-amber-400 text-sm justify-start px-3"
                        >
                          <span>
                            {selectedBudgetRanges.length === 0 
                              ? '₹ Budget' 
                              : selectedBudgetRanges.length === 1
                              ? (selectedBudgetRanges[0] === 'custom' 
                                ? `₹${formatIndianNumber(customMinBudget)}-₹${formatIndianNumber(customMaxBudget)}`
                                : selectedBudgetRanges[0] === '10k-25k' ? '₹10k-25k'
                                : selectedBudgetRanges[0] === '25k-50k' ? '₹25k-50k'
                                : selectedBudgetRanges[0] === '50k-100k' ? '₹50k-100k'
                                : 'Above ₹1L')
                              : `${selectedBudgetRanges.length} Ranges`
                            }
                          </span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72 p-0" align="start">
                        <div className="p-3 border-b">
                          <p className="text-sm font-semibold text-gray-700">Select Budget</p>
                        </div>
                        <div className="max-h-64 overflow-y-auto p-2">
                          {[
                            { value: '10k-25k', label: '₹10,000 – ₹25,000' },
                            { value: '25k-50k', label: '₹25,000 – ₹50,000' },
                            { value: '50k-100k', label: '₹50,000 – ₹1,00,000' },
                            { value: 'above-100k', label: 'Above ₹1,00,000' },
                          ].map((range) => {
                            const isChecked = selectedBudgetRanges.includes(range.value);
                            return (
                              <div
                                key={range.value}
                                className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded"
                              >
                                <Checkbox
                                  id={`budget-${range.value}`}
                                  checked={isChecked}
                                  onCheckedChange={() => {
                                    toggleBudgetRange(range.value);
                                  }}
                                />
                                <label 
                                  htmlFor={`budget-${range.value}`}
                                  className="text-sm text-gray-700 cursor-pointer flex-1"
                                >
                                  {range.label}
                                </label>
                              </div>
                            );
                          })}
                  </div>

                        <div className="border-t p-2">
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="budget-custom"
                                checked={selectedBudgetRanges.includes('custom')}
                                onCheckedChange={() => {
                                  if (!selectedBudgetRanges.includes('custom')) {
                                    setShowCustomBudget(true);
                                  } else {
                                    toggleBudgetRange('custom');
                                    setCustomMinBudget('');
                                    setCustomMaxBudget('');
                                  }
                                }}
                              />
                              <label 
                                htmlFor="budget-custom"
                                className="text-sm font-semibold text-gray-700 cursor-pointer flex-1"
                              >
                                Custom Budget
                              </label>
                </div>
                            {selectedBudgetRanges.includes('custom') && (
                              <div className="space-y-2 pl-6">
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Min (₹)</label>
                                    <Input
                                      type="text"
                                      placeholder="Min"
                                      value={customMinBudget ? `₹${formatIndianNumber(customMinBudget)}` : ''}
                                      onChange={(e) => handleCustomBudgetChange('min', e.target.value)}
                                      className="text-sm"
                                    />
              </div>
                                  <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Max (₹)</label>
                                    <Input
                                      type="text"
                                      placeholder="Max"
                                      value={customMaxBudget ? `₹${formatIndianNumber(customMaxBudget)}` : ''}
                                      onChange={(e) => handleCustomBudgetChange('max', e.target.value)}
                                      className="text-sm"
                                    />
            </div>
          </div>
                                <Button
                                  onClick={applyCustomBudget}
                                  className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm"
                                  disabled={!customMinBudget || !customMaxBudget}
                                >
                                  Apply
                                </Button>
        </div>
                            )}
                          </div>
      </div>

                        {selectedBudgetRanges.length > 0 && (
                          <div className="p-2 border-t">
            <Button
                              variant="ghost"
              size="sm"
                              className="w-full text-xs"
                              onClick={() => {
                                setSelectedBudgetRanges([]);
                                setCustomMinBudget('');
                                setCustomMaxBudget('');
                              }}
                            >
                              Clear All
            </Button>
          </div>
                        )}
                      </PopoverContent>
                    </Popover>
              </div>

              {/* Rating Filter */}
              <div className="relative">
                    <Star className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                <Select value={ratingFilter} onValueChange={setRatingFilter}>
                      <SelectTrigger className="pl-7 h-10 w-32 border border-gray-300 focus:border-amber-400 text-sm">
                    <SelectValue placeholder="Rating" />
                  </SelectTrigger>
                  <SelectContent>
                        <SelectItem value="all">All Ratings</SelectItem>
                        <SelectItem value="5">5 Stars</SelectItem>
                    <SelectItem value="4+">4+ Stars</SelectItem>
                    <SelectItem value="3+">3+ Stars</SelectItem>
                    <SelectItem value="2+">2+ Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>

                  <Button 
                    className="h-10 px-6 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:via-orange-600 hover:to-amber-700 text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 rounded-xl relative overflow-hidden group"
                    onClick={() => {/* Trigger search */}}
                    style={{
                      boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Search className="w-4 h-4 mr-2 relative z-10" />
                    <span className="relative z-10">Search</span>
                  </Button>
              </div>
            </div>
            </div>
        </div>
      </div>
        
        {/* Enhanced Curved Separator with Shadow */}
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-white rounded-t-3xl shadow-inner" style={{
          boxShadow: 'inset 0 4px 8px -2px rgba(0, 0, 0, 0.1)'
        }}></div>
      </div>


      {/* Compact Results Summary */}
      <div className="container mx-auto px-4 py-4 -mt-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900">
              {filteredAndSortedVendors.length} Results Found
            </h2>
            <div className="hidden sm:flex items-center gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{filteredAndSortedVendors.filter(v => v.currently_available).length} available</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-500" />
                <span>All verified</span>
              </div>
            </div>
          </div>

          {/* Comparison Controls */}
          <div className="flex items-center gap-3">
            {comparisonVendors.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {comparisonVendors.length} selected for comparison
                </span>
                <Button
                  onClick={() => setShowComparison(true)}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                >
                  Compare Now
                </Button>
                <Button
                  onClick={clearComparison}
                  variant="outline"
                  size="sm"
                  className="text-gray-500 hover:text-red-600"
                >
                  Clear
                </Button>
              </div>
            )}
          </div>
          
          {/* Active Filters Display */}
          <div className="flex items-center gap-2">
            {(searchQuery || selectedStates.length > 0 || selectedBudgetRanges.length > 0 || ratingFilter !== 'all') && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Filters:</span>
                {searchQuery && (
                  <Badge variant="secondary" className="text-xs">
                    "{searchQuery}"
                  </Badge>
                )}
                {selectedStates.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    📍 {selectedStates.length} {selectedStates.length === 1 ? 'State' : 'States'}
                  </Badge>
                )}
                {selectedBudgetRanges.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    ₹ {selectedBudgetRanges.length} {selectedBudgetRanges.length === 1 ? 'Range' : 'Ranges'}
                  </Badge>
                )}
                {ratingFilter !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    ⭐ {ratingFilter === '5' ? '5 Stars' : ratingFilter === '4+' ? '4+ Stars' : ratingFilter === '3+' ? '3+ Stars' : '2+ Stars'}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-xs text-gray-500 hover:text-gray-700 p-1"
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading vendors...</p>
          </div>
        ) : (
          <>
            {/* Vendor Cards Grid - Using Unified Short Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6 md:mb-0">
              {filteredAndSortedVendors.map((vendor) => (
                <VendorShortCard
                  key={vendor.vendor_id}
                  vendor={vendor}
                />
              ))}
            </div>

            {/* No Results */}
            {filteredAndSortedVendors.length === 0 && (
              <div className="text-center py-16">
                <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No vendors found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your search criteria or browse all vendors</p>
                <Button 
                  onClick={() => { setSearchQuery(''); setSelectedStates([]); setSelectedBudgetRanges([]); }}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Comparison Modal */}
      {showComparison && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Compare Vendors</h2>
              <Button
                onClick={() => setShowComparison(false)}
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {comparisonVendors.map((vendor) => (
                  <div key={vendor.vendor_id} className="border border-gray-200 rounded-xl p-4">
                    <div className="text-center mb-4">
                      <img
                        src={vendor.avatar_url || vendor.cover_image_url || "/images/vendor-placeholder.jpg"}
                        alt={vendor.brand_name}
                        className="w-16 h-16 rounded-full mx-auto mb-3 object-cover"
                      />
                      <h3 className="text-lg font-bold text-gray-800">{vendor.brand_name}</h3>
                      <p className="text-sm text-gray-600">{vendor.category}</p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Rating:</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-amber-400 fill-current" />
                          <span className="font-semibold">{vendor.rating?.toFixed(1) || 'New'}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Price:</span>
                        <span className="font-semibold text-orange-600">
                          {vendor.starting_price ? `₹${vendor.starting_price.toLocaleString()}` : 'Contact for pricing'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Experience:</span>
                        <span className="font-medium">{vendor.experience || 'Not specified'}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Location:</span>
                        <span className="font-medium">{vendor.location || 'Not specified'}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Availability:</span>
                        <span className={`font-medium ${vendor.currently_available ? 'text-green-600' : 'text-red-600'}`}>
                          {vendor.currently_available ? 'Available' : 'Busy'}
                        </span>
                      </div>
                      
                      {vendor.languages_spoken && vendor.languages_spoken.length > 0 && (
                        <div>
                          <span className="text-sm text-gray-600">Languages:</span>
                          <p className="text-sm font-medium mt-1">{vendor.languages_spoken.join(', ')}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <Button
                        onClick={() => handleCardClick(vendor.vendor_id)}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 text-sm font-semibold rounded-lg"
                      >
                        View Full Profile
                      </Button>
                      <Button
                        onClick={() => openWhatsApp(vendor)}
                        variant="outline"
                        className="w-full border-green-500 text-green-600 hover:bg-green-50 py-2 text-sm font-semibold rounded-lg"
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        WhatsApp
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between p-6 border-t border-gray-200">
              <Button
                onClick={clearComparison}
                variant="outline"
                className="text-gray-600 hover:text-gray-800"
              >
                Clear All
              </Button>
              <Button
                onClick={() => setShowComparison(false)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom CTA Section */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white py-12 mt-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">Can't Find the Perfect Vendor?</h2>
          <p className="text-white mb-6 max-w-2xl mx-auto">
            Let us help you find the ideal professional for your special event. 
            Our team will connect you with verified vendors in your area.
          </p>
          <Button 
            className="bg-white text-amber-600 hover:bg-amber-50 px-8 py-3 text-lg font-semibold rounded-xl shadow-lg"
            onClick={() => openWhatsApp({ spoc_name: 'HappyMoments Team' } as Vendor)}
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Get Personalized Recommendations
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CategoryVendors;
