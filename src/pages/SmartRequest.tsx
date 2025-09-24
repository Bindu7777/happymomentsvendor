import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ShoppingCart, Users, Calendar, MessageCircle, Star, Zap } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import SmartRequestInput from '../components/SmartRequestInput';
import SmartVendorRecommendations from '../components/SmartVendorRecommendations';
import { ParsedRequest } from '../services/requestParser';
import { MatchingResult, findBestMatches } from '../services/autoMatchingEngine';
import Header from '../components/layout/Header';

const SmartRequest: React.FC = () => {
  const navigate = useNavigate();
  const [parsedRequest, setParsedRequest] = useState<ParsedRequest | null>(null);
  const [matchingResult, setMatchingResult] = useState<MatchingResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cart, setCart] = useState<any[]>([]);
  const [showCart, setShowCart] = useState(false);

  const handleRequestParsed = (request: ParsedRequest) => {
    setParsedRequest(request);
  };

  const handleRequestSubmit = async (request: ParsedRequest) => {
    setIsLoading(true);
    try {
      console.log('Submitting request:', request);
      const result = await findBestMatches(request);
      console.log('Matching result:', result);
      setMatchingResult(result);
    } catch (error) {
      console.error('Error finding matches:', error);
      // Set a fallback result to prevent blank screen
      setMatchingResult({
        perfectMatches: [],
        nearMatches: [],
        allMatches: [],
        totalFound: 0,
        searchCriteria: request
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
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
            isLoading={isLoading}
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Finding Perfect Matches...</h3>
            <p className="text-gray-600">Our AI is analyzing your request and matching you with the best vendors</p>
          </div>
        )}

        {/* Results */}
        {matchingResult && !isLoading && (
          <div className="mb-12">
            {matchingResult.totalFound === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No vendors found</h3>
                  <p className="text-gray-500 mb-6">
                    We couldn't find any vendors matching your criteria. Try adjusting your search or browse all vendors.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button 
                      onClick={() => setMatchingResult(null)}
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
              <SmartVendorRecommendations
                matchingResult={matchingResult}
                onVendorSelect={handleVendorSelect}
                onAddToCart={handleAddToCart}
                onContactVendor={handleContactVendor}
                onViewProfile={handleViewProfile}
              />
            )}
          </div>
        )}

        {/* Features Section */}
        {!matchingResult && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Why Choose Smart Request?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent>
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Natural Language</h3>
                  <p className="text-gray-600">
                    Describe your needs in plain English. No complex forms or filters to fill out.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">AI-Powered Matching</h3>
                  <p className="text-gray-600">
                    Our AI understands context and finds vendors that truly match your requirements.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Smart Recommendations</h3>
                  <p className="text-gray-600">
                    Get personalized suggestions based on budget, location, and preferences.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent>
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Availability Check</h3>
                  <p className="text-gray-600">
                    See vendor availability instantly for your event date.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent>
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-yellow-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Multi-Service Bundling</h3>
                  <p className="text-gray-600">
                    Book multiple services in one go - photographer, makeup artist, decorator, and more.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent>
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingCart className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Smart Cart</h3>
                  <p className="text-gray-600">
                    Compare vendors side-by-side and manage your selections easily.
                  </p>
                </CardContent>
              </Card>
            </div>
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
      </div>
    </div>
  );
};

export default SmartRequest;
