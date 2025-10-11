import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Star, MapPin, Phone, Mail, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { getLikedVendors, removeLikeVendor } from '@/services/likedVendorsApiService';
import { preventContextMenu } from '@/utils/layoutUtils';

interface LikedVendor {
  id: number;
  vendor_id: string;
  brand_name: string;
  category: string;
  subcategory?: string;
  phone_number: string;
  email?: string;
  address?: string;
  starting_price?: number;
  rating?: number;
  review_count?: number;
  verified?: boolean;
  avatar_url?: string;
  cover_image_url?: string;
  quick_intro?: string;
  liked_at: string;
}

const LikedVendors = () => {
  const navigate = useNavigate();
  const { customer } = useCustomerAuth();
  const [likedVendors, setLikedVendors] = useState<LikedVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (customer) {
      fetchLikedVendors();
    }
  }, [customer]);

  const fetchLikedVendors = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching liked vendors for customer:', customer?.id);
      const result = await getLikedVendors(customer?.id || 0);

      if (result.error) {
        console.error('Error fetching liked vendors:', result.error);
        setError(result.error);
        return;
      }

      if (!result.data || result.data.length === 0) {
        setLikedVendors([]);
        return;
      }

      console.log('Got liked vendors:', result.data);
      console.log('First vendor data structure:', result.data?.[0]);
      setLikedVendors(result.data as LikedVendor[]);
    } catch (error) {
      console.error('Error:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const removeFromLiked = async (vendorId: string) => {
    try {
      console.log('Removing vendor from liked:', vendorId);
      const result = await removeLikeVendor(customer?.id || 0, vendorId);

      if (result.error) {
        console.error('Error removing from liked:', result.error);
        return;
      }

      console.log('Vendor removed from liked successfully');
      // Refresh the list
      fetchLikedVendors();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Please log in to view your liked vendors</h1>
            <button
              onClick={() => navigate('/customer-login')}
              className="bg-wedding-orange text-white px-6 py-2 rounded-lg hover:bg-wedding-orange-hover transition-colors"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="liked-vendors-container bg-gray-50 relative overflow-x-hidden">
      <Header />
      
      <div className="container mx-auto px-4 py-8 main-content">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-wedding-orange transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                <Heart className="h-8 w-8 mr-3 text-red-500 fill-red-500" />
                Liked Vendors
              </h1>
              <p className="text-gray-600 mt-1">Your favorite vendors for your special day</p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wedding-orange mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading your liked vendors...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && likedVendors.length === 0 && (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No liked vendors yet</h3>
            <p className="text-gray-500 mb-6">Start exploring vendors and add them to your favorites!</p>
            <button
              onClick={() => navigate('/vendors')}
              className="bg-wedding-orange text-white px-6 py-3 rounded-lg hover:bg-wedding-orange-hover transition-colors"
            >
              Browse Vendors
            </button>
          </div>
        )}

        {/* Liked Vendors Grid */}
        {!loading && !error && likedVendors.length > 0 && (
          <>
            <div className="mb-8">
              <p className="text-lg text-gray-700 font-medium">
                You have <span className="font-bold text-wedding-orange text-xl">{likedVendors.length}</span> liked vendor{likedVendors.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 vendor-grid pb-8">
              {likedVendors.map((vendor) => (
                <Card 
                  key={vendor.vendor_id}
                  className={`vendor-card group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 bg-white overflow-hidden ${
                    vendor.verified 
                      ? 'border-green-200 hover:border-green-400' 
                      : 'border-amber-100 hover:border-amber-300'
                  }`}
                  onClick={() => navigate(`/vendor/${vendor.vendor_id}`)}
                  onContextMenu={preventContextMenu}
                >
                  <CardContent className="p-0">
                    {/* Portfolio Image */}
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={vendor.avatar_url || vendor.cover_image_url || "/images/vendor-placeholder.jpg"}
                        alt={`${vendor.brand_name} portfolio`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      
                      {/* Availability Status */}
                      <div className="absolute top-3 left-3">
                        {vendor.currently_available ? (
                          <Badge className="bg-green-500 text-white px-2 py-1 text-xs animate-pulse">
                            🟢 Available Now
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-500 text-white px-2 py-1 text-xs">
                            Busy
                          </Badge>
                        )}
                      </div>

                      {/* Like Button - Already Liked */}
                      <div className="absolute top-3 right-3 z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromLiked(vendor.vendor_id);
                          }}
                          className="p-2 bg-white/90 backdrop-blur-xs rounded-full shadow-sm transition-all hover:bg-white relative z-20"
                          title="Remove from liked"
                        >
                          <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                        </button>
                      </div>

                      {/* Verified Badge */}
                      {vendor.verified && (
                        <div className="absolute bottom-3 right-3">
                          <div className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded-full shadow-lg border-2 border-white/50">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            <span className="text-xs font-bold">Verified Pro</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-4">
                      {/* Vendor Info */}
                      <div className="mb-3">
                        <h3 className="vendor-name text-lg font-bold text-gray-900 mb-1 group-hover:text-amber-600 transition-colors">
                          {vendor.brand_name}
                        </h3>
                        <p className="text-xs text-amber-600 font-medium mb-1">{vendor.category}</p>
                        <p className="text-sm text-gray-600">by {vendor.spoc_name}</p>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < Math.floor(vendor.rating || 4.5) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {vendor.rating || 4.5}
                        </span>
                        {vendor.review_count && vendor.review_count > 0 ? (
                          <span className="text-xs text-gray-500">
                            ({vendor.review_count})
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">No reviews yet</span>
                        )}
                      </div>

                      {/* Experience & Availability */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="mr-2">👤</span>
                          {vendor.experience || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600">
                          Available: {vendor.currently_available ? 'Yes' : 'No'}
                        </div>
                      </div>

                      {/* Starting Price */}
                      <div className="mb-3">
                        <p className="text-sm text-gray-500 mb-1">Starting Price</p>
                        <p className="vendor-price text-lg font-bold text-amber-600">
                          ₹{vendor.starting_price?.toLocaleString() || 'Contact for pricing'}
                        </p>
                      </div>

                      {/* Liked Date */}
                      <div className="text-xs text-gray-500 mb-3">
                        Liked on {formatDate(vendor.liked_at)}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <Button 
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm py-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            // WhatsApp functionality
                            const phoneNumber = vendor.whatsapp_number || vendor.phone_number;
                            if (phoneNumber) {
                              window.open(`https://wa.me/${phoneNumber}`, '_blank');
                            }
                          }}
                        >
                          WhatsApp
                        </Button>
                        <Button 
                          variant="outline"
                          className="flex-1 text-sm py-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/vendor/${vendor.vendor_id}`);
                          }}
                        >
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LikedVendors;
