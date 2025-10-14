import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ShoppingCart, Users, Calendar, MessageCircle, Star, Zap, Save, Filter } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import SmartRequestInput from '../components/SmartRequestInput';
import SmartVendorRecommendations from '../components/SmartVendorRecommendations';
import SaveFilterModal from '../components/SaveFilterModal';
import LoadFilterModal from '../components/LoadFilterModal';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';
import { useSearchTracking } from '../hooks/use-search-tracking';
import { ParsedRequest } from '../services/requestParser';
import { MatchingResult, findBestMatches } from '../services/autoMatchingEngine';
import { ExtractedEntities } from '../services/enhancedAudioEngine';
import { createVendorFilterCriteria, searchVendorsWithFilters, VendorSearchResult } from '../services/enhancedVendorFiltering';
import Header from '../components/layout/Header';

const SmartRequest: React.FC = () => {
  const navigate = useNavigate();
  const { customer } = useCustomerAuth();
  const { trackSmartRequest, trackVoiceSearch, trackManualSearch } = useSearchTracking();
  const [parsedRequest, setParsedRequest] = useState<ParsedRequest | null>(null);
  const [matchingResult, setMatchingResult] = useState<MatchingResult | null>(null);
  const [enhancedSearchResult, setEnhancedSearchResult] = useState<VendorSearchResult | null>(null);
  const [extractedEntities, setExtractedEntities] = useState<ExtractedEntities | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cart, setCart] = useState<any[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [useEnhancedSearch, setUseEnhancedSearch] = useState(true);
  const [showSaveFilterModal, setShowSaveFilterModal] = useState(false);
  const [showLoadFilterModal, setShowLoadFilterModal] = useState(false);

  const handleRequestParsed = (request: ParsedRequest) => {
    setParsedRequest(request);
  };

  const handleEntitiesExtracted = (entities: ExtractedEntities) => {
    setExtractedEntities(entities);
  };

  const handleRequestSubmit = async (request: ParsedRequest) => {
    setIsLoading(true);
    try {
      console.log('Submitting request:', request);
      
      let resultsCount = 0;
      
      if (useEnhancedSearch && extractedEntities) {
        // Use enhanced search with extracted entities
        const filterCriteria = createVendorFilterCriteria(extractedEntities);
        console.log('Enhanced search criteria:', filterCriteria);
        
        const enhancedResult = await searchVendorsWithFilters(filterCriteria);
        console.log('Enhanced search result:', enhancedResult);
        setEnhancedSearchResult(enhancedResult);
        resultsCount = enhancedResult.vendors.length;
        
        // Track smart request search
        await trackSmartRequest(
          request.originalText || 'Smart request',
          filterCriteria,
          resultsCount
        );
        
        // Also run legacy search for comparison
        const legacyResult = await findBestMatches(request);
        setMatchingResult(legacyResult);
      } else {
        // Use legacy search
        const result = await findBestMatches(request);
        console.log('Legacy matching result:', result);
        setMatchingResult(result);
        resultsCount = result.matches.length;
        
        // Track manual search
        await trackManualSearch(
          request.originalText || 'Manual search',
          request,
          resultsCount
        );
      }
    } catch (error) {
      console.error('Error finding matches:', error);
      // Set a fallback result to prevent blank screen
      const fallbackResult = {
        perfectMatches: [],
        nearMatches: [],
        allMatches: [],
        totalFound: 0,
        searchCriteria: request
      };
      setMatchingResult(fallbackResult);
      setEnhancedSearchResult({
        perfectMatches: [],
        nearMatches: [],
        allMatches: [],
        totalFound: 0,
        searchCriteria: createVendorFilterCriteria(extractedEntities || {
          serviceTypes: [],
          preferences: {},
          additionalInfo: []
        }),
        filtersApplied: {
          categories: request.serviceTypes,
          location: request.location,
          budgetRange: request.budgetRange ? {
            min: request.budgetRange.min,
            max: request.budgetRange.max
          } : undefined,
          preferences: {}
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVendorSelect = (vendor: any) => {
    navigate(`/vendor/${vendor.vendor_id}`);
  };

  const handleAddToCart = (vendor: any) => {
    setCart(prev => {
      const exists = prev.find(item => item.vendor_id === vendor.vendor_id);
      if (exists) return prev;
      return [...prev, { ...vendor, addedAt: new Date() }];
    });
  };

  const handleContactVendor = (vendor: any) => {
    // Open WhatsApp or contact modal
    const phoneNumber = vendor.whatsapp_number || vendor.phone_number;
    if (phoneNumber) {
      const message = `Hi ${vendor.spoc_name}! I found your ${vendor.category} services and I'm interested in learning more about your packages. Could you please share your availability and pricing details?`;
      const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^\d]/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const handleViewProfile = (vendor: any) => {
    navigate(`/vendor/${vendor.vendor_id}`);
  };

  const removeFromCart = (vendorId: string) => {
    setCart(prev => prev.filter(item => item.vendor_id !== vendorId));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.starting_price || 0), 0);
  };

  const getCurrentFilterData = () => {
    if (useEnhancedSearch && enhancedSearchResult) {
      return {
        categories: enhancedSearchResult.filtersApplied.categories,
        location: enhancedSearchResult.filtersApplied.location,
        budgetRange: enhancedSearchResult.filtersApplied.budgetRange,
        preferences: enhancedSearchResult.filtersApplied.preferences
      };
    } else if (matchingResult) {
      return {
        serviceTypes: matchingResult.searchCriteria.serviceTypes,
        location: matchingResult.searchCriteria.location,
        budgetRange: matchingResult.searchCriteria.budgetRange,
        eventType: matchingResult.searchCriteria.eventType,
        guestCount: matchingResult.searchCriteria.guestCount,
        date: matchingResult.searchCriteria.date
      };
    }
    return {};
  };

  const handleApplyFilter = (filterData: any) => {
    // Apply the loaded filter data to the search
    if (filterData.categories || filterData.serviceTypes) {
      const request: ParsedRequest = {
        serviceTypes: filterData.categories || filterData.serviceTypes || [],
        location: filterData.location || '',
        budgetRange: filterData.budgetRange || undefined,
        eventType: filterData.eventType || '',
        guestCount: filterData.guestCount || undefined,
        date: filterData.date || '',
        additionalRequirements: filterData.additionalRequirements || []
      };
      
      setParsedRequest(request);
      handleRequestSubmit(request);
    }
  };

  const handleSaveFilterSuccess = () => {
    // Optionally show a success message or refresh the page
    console.log('Filter saved successfully');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <Header />
      
      <div className="container mx-auto px-4 pt-20 pb-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            🎯 Smart Vendor Discovery
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Just tell us what you need in your own words, and we'll find the perfect vendors for your event. 
            Our AI understands natural language and matches you with the best options instantly.
          </p>
        </div>

        {/* Cart Button */}
        {cart.length > 0 && (
          <div className="fixed top-20 right-4 z-50">
            <Button
              onClick={() => setShowCart(!showCart)}
              className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Cart ({cart.length})
              <Badge variant="secondary" className="ml-2 bg-white text-orange-600">
                ₹{getCartTotal().toLocaleString()}
              </Badge>
            </Button>
          </div>
        )}

        {/* Smart Request Input */}
        <div className="mb-12">
          <SmartRequestInput
            onRequestParsed={handleRequestParsed}
            onRequestSubmit={handleRequestSubmit}
            onEntitiesExtracted={handleEntitiesExtracted}
            isLoading={isLoading}
          />
        </div>

        {/* Filter Management Buttons */}
        {customer && (
          <div className="flex justify-center gap-4 mb-8">
            <Button
              variant="outline"
              onClick={() => setShowLoadFilterModal(true)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Load Saved Filter
            </Button>
            {(matchingResult || enhancedSearchResult) && (
              <Button
                variant="outline"
                onClick={() => setShowSaveFilterModal(true)}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Current Filter
              </Button>
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Finding Perfect Matches...</h3>
            <p className="text-gray-600">Our AI is analyzing your request and matching you with the best vendors</p>
          </div>
        )}

        {/* Results */}
        {(matchingResult || enhancedSearchResult) && !isLoading && (
          <div className="mb-12">
            {/* Search Mode Toggle */}
            <div className="flex justify-center mb-6">
              <div className="bg-gray-100 p-1 rounded-lg">
                <Button
                  variant={useEnhancedSearch ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setUseEnhancedSearch(true)}
                  className={useEnhancedSearch ? "bg-orange-500 text-white" : ""}
                >
                  🎯 Enhanced Search
                </Button>
                <Button
                  variant={!useEnhancedSearch ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setUseEnhancedSearch(false)}
                  className={!useEnhancedSearch ? "bg-orange-500 text-white" : ""}
                >
                  🔍 Legacy Search
                </Button>
              </div>
            </div>

            {/* Enhanced Search Results */}
            {useEnhancedSearch && enhancedSearchResult ? (
              enhancedSearchResult.totalFound === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No vendors found</h3>
                    <p className="text-gray-500 mb-6">
                      We couldn't find any vendors matching your enhanced search criteria. Try adjusting your search or browse all vendors.
                    </p>
                    <div className="flex gap-4 justify-center">
                      <Button 
                        onClick={() => {
                          setEnhancedSearchResult(null);
                          setMatchingResult(null);
                        }}
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        Try Different Search
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => navigate('/')}
                      >
                        Browse All Vendors
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div>
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2">🎯 Enhanced Search Results</h3>
                    <div className="text-sm text-green-700">
                      <p>Found {enhancedSearchResult.totalFound} vendors using advanced AI filtering</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {enhancedSearchResult.filtersApplied.categories.map((category, index) => (
                          <Badge key={index} variant="outline" className="bg-green-100 text-green-800">
                            {category}
                          </Badge>
                        ))}
                        {enhancedSearchResult.filtersApplied.budgetRange && (
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            ₹{enhancedSearchResult.filtersApplied.budgetRange.min.toLocaleString()} - ₹{enhancedSearchResult.filtersApplied.budgetRange.max.toLocaleString()}
                          </Badge>
                        )}
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          {enhancedSearchResult.filtersApplied.location}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <SmartVendorRecommendations
                    matchingResult={enhancedSearchResult}
                    onVendorSelect={handleVendorSelect}
                    onAddToCart={handleAddToCart}
                    onContactVendor={handleContactVendor}
                    onViewProfile={handleViewProfile}
                  />
                </div>
              )
            ) : null}

            {/* Legacy Search Results */}
            {!useEnhancedSearch && matchingResult ? (
              matchingResult.totalFound === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No vendors found</h3>
                    <p className="text-gray-500 mb-6">
                      We couldn't find any vendors matching your criteria. Try adjusting your search or browse all vendors.
                    </p>
                    <div className="flex gap-4 justify-center">
                      <Button 
                        onClick={() => {
                          setMatchingResult(null);
                          setEnhancedSearchResult(null);
                        }}
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        Try Different Search
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => navigate('/')}
                      >
                        Browse All Vendors
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div>
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">🔍 Legacy Search Results</h3>
                    <p className="text-sm text-blue-700">Found {matchingResult.totalFound} vendors using traditional matching</p>
                  </div>
                  <SmartVendorRecommendations
                    matchingResult={matchingResult}
                    onVendorSelect={handleVendorSelect}
                    onAddToCart={handleAddToCart}
                    onContactVendor={handleContactVendor}
                    onViewProfile={handleViewProfile}
                  />
                </div>
              )
            ) : null}
          </div>
        )}


        {/* Cart Sidebar */}
        {showCart && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md max-h-[80vh] overflow-hidden">
              <CardHeader className="bg-orange-500 text-white">
                <CardTitle className="flex items-center justify-between">
                  <span>Your Cart ({cart.length})</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCart(false)}
                    className="text-white hover:bg-orange-600"
                  >
                    ×
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 max-h-96 overflow-y-auto">
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Your cart is empty</p>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.vendor_id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <img
                          src={item.avatar_url || "/images/vendor-placeholder.jpg"}
                          alt={item.brand_name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{item.brand_name}</h4>
                          <p className="text-xs text-gray-600">{item.category}</p>
                          <p className="text-sm font-medium text-orange-600">
                            ₹{item.starting_price?.toLocaleString() || 'Contact for pricing'}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.vendor_id)}
                          className="text-red-500 hover:bg-red-50"
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-semibold">Total:</span>
                        <span className="text-lg font-bold text-orange-600">
                          ₹{getCartTotal().toLocaleString()}
                        </span>
                      </div>
                      <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                        Proceed to Booking
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Save Filter Modal */}
        <SaveFilterModal
          isOpen={showSaveFilterModal}
          onClose={() => setShowSaveFilterModal(false)}
          filterData={getCurrentFilterData()}
          onSuccess={handleSaveFilterSuccess}
        />

        {/* Load Filter Modal */}
        <LoadFilterModal
          isOpen={showLoadFilterModal}
          onClose={() => setShowLoadFilterModal(false)}
          onApplyFilter={handleApplyFilter}
        />
      </div>
    </div>
  );
};

export default SmartRequest;
