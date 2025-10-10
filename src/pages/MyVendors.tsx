import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Star, MapPin, Phone, Mail, ArrowLeft, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { getContactedVendors, removeContactVendor } from '@/services/contactedVendorsApiService';

interface ContactedVendor {
  contact_id: number;
  customer_id: number;
  vendor_id: string;
  status: string;
  contacted_at: string;
  created_at: string;
  // Additional vendor details when fetched
  brand_name?: string;
  category?: string;
  subcategory?: string;
  phone_number?: string;
  whatsapp_number?: string;
  email?: string;
  address?: string;
  starting_price?: number;
  rating?: number;
  review_count?: number;
  verified?: boolean;
  avatar_url?: string;
  cover_image_url?: string;
  quick_intro?: string;
  spoc_name?: string;
}

const MyVendors: React.FC = () => {
  const { customer } = useCustomerAuth();
  const navigate = useNavigate();
  const [contactedVendors, setContactedVendors] = useState<ContactedVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (customer) {
      fetchContactedVendors();
    }
  }, [customer]);

  const fetchContactedVendors = async () => {
    if (!customer) return;

    setLoading(true);
    setError(null);

    try {
      console.log('Fetching contacted vendors for customer:', customer.id);
      const result = await getContactedVendors(customer.id);

      if (result.error) {
        console.error('Error fetching contacted vendors:', result.error);
        setError(result.error);
        return;
      }

      console.log('Got contacted vendors:', result.data);
      setContactedVendors(result.data || []);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to fetch contacted vendors');
    } finally {
      setLoading(false);
    }
  };

  const removeFromContacted = async (vendorId: string) => {
    if (!customer) return;

    try {
      const result = await removeContactVendor(customer.id, vendorId);
      
      if (result.error) {
        console.error('Error removing contact:', result.error);
        return;
      }

      // Remove from local state
      setContactedVendors(prev => prev.filter(vendor => vendor.vendor_id !== vendorId));
    } catch (error) {
      console.error('Error removing contact:', error);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">My Vendors</h1>
            <p className="text-gray-600">Please log in to view your contacted vendors.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Home
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Vendors</h1>
              <p className="text-gray-600 mt-1">
                Vendors you have successfully contacted via WhatsApp
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wedding-orange mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your contacted vendors...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
              <p className="text-red-600">{error}</p>
              <Button 
                onClick={fetchContactedVendors}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && contactedVendors.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Contacted Vendors</h3>
            <p className="text-gray-600 mb-6">
              You haven't contacted any vendors yet. Start by browsing vendors and using WhatsApp to contact them.
            </p>
            <Button 
              onClick={() => navigate('/vendors')}
              className="bg-wedding-orange hover:bg-wedding-orange-hover text-white"
            >
              Browse Vendors
            </Button>
          </div>
        )}

        {/* Contacted Vendors Grid */}
        {!loading && !error && contactedVendors.length > 0 && (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                You have <span className="font-semibold text-wedding-orange">{contactedVendors.length}</span> contacted vendor{contactedVendors.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {contactedVendors.map((vendor) => (
                <Card 
                  key={vendor.vendor_id}
                  className={`group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 bg-white overflow-hidden ${
                    vendor.verified 
                      ? 'border-green-200 hover:border-green-400' 
                      : 'border-amber-100 hover:border-amber-300'
                  }`}
                  onClick={() => navigate(`/vendor/${vendor.vendor_id}`)}
                >
                  <CardContent className="p-0">
                    {/* Portfolio Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={vendor.avatar_url || vendor.cover_image_url || "/images/vendor-placeholder.jpg"}
                        alt={`${vendor.brand_name} portfolio`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      
                      {/* Contact Status Badge */}
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-green-500 text-white px-2 py-1 text-xs">
                          📱 Contacted
                        </Badge>
                      </div>

                      {/* Remove from Contacted Button */}
                      <div className="absolute top-3 right-3 z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromContacted(vendor.vendor_id);
                          }}
                          className="p-2 bg-white/90 backdrop-blur-xs rounded-full shadow-sm transition-all hover:bg-white relative z-20"
                          title="Remove from contacted"
                        >
                          <Trash2 className="h-5 w-5 text-red-500" />
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
                        <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-amber-600 transition-colors">
                          {vendor.brand_name || 'Unknown Vendor'}
                        </h3>
                        <p className="text-xs text-amber-600 font-medium mb-1">{vendor.category || 'Unknown Category'}</p>
                        <p className="text-sm text-gray-600">by {vendor.spoc_name || 'Unknown'}</p>
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

                      {/* Starting Price */}
                      <div className="mb-3">
                        <p className="text-sm text-gray-500 mb-1">Starting Price</p>
                        <p className="text-lg font-bold text-amber-600">
                          ₹{vendor.starting_price?.toLocaleString() || 'Contact for pricing'}
                        </p>
                      </div>

                      {/* Contacted Date */}
                      <div className="text-xs text-gray-500 mb-3">
                        Contacted on {formatDate(vendor.contacted_at)}
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
                          WhatsApp Again
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

export default MyVendors;
