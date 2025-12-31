import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Star, MapPin, Phone, Mail, Trash2, Filter, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { getContactedVendors, removeContactVendor, getStatusOptions } from '@/services/contactedVendorsApiService';
import VendorStatusDropdown from '@/components/VendorStatusDropdown';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const [filteredVendors, setFilteredVendors] = useState<ContactedVendor[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [statusOptions, setStatusOptions] = useState<Array<{value: string, label: string}>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContactedVendors = React.useCallback(async () => {
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
  }, [customer]);

  useEffect(() => {
    if (customer) {
      fetchContactedVendors();
      loadStatusOptions();
    }
  }, [customer, fetchContactedVendors]);

  // Listen for vendorContacted events to refresh the list
  useEffect(() => {
    const handleVendorContacted = () => {
      console.log('📢 MyVendors: Vendor contacted event received, refreshing list...');
      if (customer) {
        fetchContactedVendors();
      }
    };

    window.addEventListener('vendorContacted', handleVendorContacted);
    
    return () => {
      window.removeEventListener('vendorContacted', handleVendorContacted);
    };
  }, [customer, fetchContactedVendors]);

  useEffect(() => {
    // Apply status filter
    if (statusFilter === 'all') {
      setFilteredVendors(contactedVendors);
    } else {
      setFilteredVendors(contactedVendors.filter(vendor => vendor.status === statusFilter));
    }
  }, [contactedVendors, statusFilter]);

  const loadStatusOptions = async () => {
    try {
      // Use 'customer' userType to get customer status options (same as VendorStatusDropdown)
      console.log('MyVendors: Loading status options for filter dropdown with userType: customer');
      const result = await getStatusOptions('customer');
      console.log('MyVendors: Status options result:', result);
      if (result.success && result.data) {
        console.log('MyVendors: Raw status options:', result.data);
        console.log('MyVendors: Number of options:', result.data.length);
        const options = [
          { value: 'all', label: 'All Statuses' },
          ...result.data.map((option: any) => ({
            value: option.value,
            label: option.label
          }))
        ];
        console.log('MyVendors: Final filter options:', options);
        setStatusOptions(options);
      } else {
        console.error('MyVendors: Failed to load status options:', result.error);
      }
    } catch (err: any) {
      console.error('MyVendors: Failed to load status options:', err);
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

  const handleStatusUpdate = (vendorId: string, newStatus: string) => {
    // Update the vendor status in local state
    setContactedVendors(prev => 
      prev.map(vendor => 
        vendor.vendor_id === vendorId 
          ? { ...vendor, status: newStatus }
          : vendor
      )
    );
    // Refresh the list to get the latest data from server
    if (customer) {
      fetchContactedVendors();
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
            <p className="text-gray-600">Please log in to view your contacted vendors.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 pt-20 md:pt-24">
        {/* Header */}
        <div className="mb-4 sm:mb-8">
          <div className="flex items-center justify-between mb-3 sm:mb-0">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-gray-600 hover:text-wedding-orange transition-colors text-sm sm:text-base"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <div className="flex items-center justify-center flex-1 sm:flex-1">
              <MessageCircle className="h-5 w-5 sm:h-8 sm:w-8 text-[#001B5E] mr-1.5 sm:mr-2.5" strokeWidth={2} />
              <h1 className="text-xl sm:text-2xl md:text-4xl font-semibold text-gray-800">
                Contacted Vendors
              </h1>
            </div>
            <div className="w-12 sm:w-20"></div> {/* Spacer to balance the back button */}
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
            <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-0">
              <p className="text-sm sm:text-base text-gray-600">
                You have <span className="font-semibold text-wedding-orange">{contactedVendors.length}</span> contacted vendor{contactedVendors.length !== 1 ? 's' : ''}
                {statusFilter !== 'all' && (
                  <span className="block sm:inline sm:ml-2 mt-1 sm:mt-0">
                    • Showing <span className="font-semibold text-blue-600">{filteredVendors.length}</span> with status "{statusOptions.find(opt => opt.value === statusFilter)?.label}"
                  </span>
                )}
              </p>
              
              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px] text-sm">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {filteredVendors.length === 0 && statusFilter !== 'all' ? (
              <div className="text-center py-12">
                <Filter className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Vendors Found</h3>
                <p className="text-gray-600 mb-6">
                  No vendors match the selected status filter. Try selecting a different status or "All Statuses".
                </p>
                <Button 
                  onClick={() => setStatusFilter('all')}
                  variant="outline"
                  className="border-wedding-orange text-wedding-orange hover:bg-wedding-orange hover:text-white"
                >
                  Show All Vendors
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredVendors.map((vendor) => (
                <Card 
                  key={vendor.vendor_id}
                  className={`group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 bg-white overflow-visible sm:overflow-hidden ${
                    vendor.verified 
                      ? 'border-green-200 hover:border-green-400' 
                      : 'border-amber-100 hover:border-amber-300'
                  }`}
                  onClick={() => navigate(`/vendor/${vendor.vendor_id}`)}
                >
                  <CardContent className="p-0">
                    {/* Portfolio Image */}
                    <div className="relative h-40 sm:h-48 overflow-hidden">
                      <img
                        src={vendor.avatar_url || vendor.cover_image_url || "/images/vendor-placeholder.jpg"}
                        alt={`${vendor.brand_name} portfolio`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      
                      {/* Contact Status Badge */}
                      <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
                        <Badge className="bg-green-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs">
                          <span className="hidden sm:inline">📱 </span>{vendor.status || 'Contacted'}
                        </Badge>
                      </div>

                      {/* Remove from Contacted Button */}
                      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromContacted(vendor.vendor_id);
                          }}
                          className="p-1.5 sm:p-2 bg-white/90 backdrop-blur-xs rounded-full shadow-sm transition-all hover:bg-white relative z-20"
                          title="Remove from contacted"
                        >
                          <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                        </button>
                      </div>

                      {/* Verified Badge */}
                      {vendor.verified && (
                        <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3">
                          <div className="flex items-center gap-1 bg-green-600 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-lg border-2 border-white/50">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse"></div>
                            <span className="text-[10px] sm:text-xs font-bold">Verified Pro</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-3 sm:p-4">
                      {/* Vendor Info */}
                      <div className="mb-2 sm:mb-3 min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 group-hover:text-amber-600 transition-colors break-words overflow-hidden text-ellipsis" style={{ 
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}>
                          {vendor.brand_name || 'Unknown Vendor'}
                        </h3>
                        <p className="text-[11px] sm:text-xs text-amber-600 font-medium mb-0.5 sm:mb-1 break-words overflow-hidden text-ellipsis">{vendor.category || 'Unknown Category'}</p>
                        <p className="text-xs sm:text-sm text-gray-600 break-words overflow-hidden text-ellipsis">by {vendor.spoc_name || 'Unknown'}</p>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                        <div className="flex items-center gap-0.5 sm:gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3 h-3 sm:w-4 sm:h-4 ${i < Math.floor(vendor.rating || 4.5) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-gray-700">
                          {vendor.rating || 4.5}
                        </span>
                        {vendor.review_count && vendor.review_count > 0 ? (
                          <span className="text-[10px] sm:text-xs text-gray-500">
                            ({vendor.review_count})
                          </span>
                        ) : (
                          <span className="text-[10px] sm:text-xs text-gray-400">No reviews</span>
                        )}
                      </div>

                      {/* Starting Price */}
                      <div className="mb-2 sm:mb-3">
                        <p className="text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-1">Starting Price</p>
                        <p className="text-base sm:text-lg font-bold text-amber-600 break-words">
                          ₹{vendor.starting_price?.toLocaleString() || 'Contact for pricing'}
                        </p>
                      </div>

                      {/* Contacted Date */}
                      <div className="text-[10px] sm:text-xs text-gray-500 mb-2 sm:mb-3 break-words">
                        Contacted on {formatDate(vendor.contacted_at)}
                      </div>

                      {/* Status Management */}
                      <div className="mb-2 sm:mb-3">
                        <div className="text-[11px] sm:text-xs font-medium text-gray-700 mb-1.5 sm:mb-2">Status</div>
                        <VendorStatusDropdown
                          customerId={customer.id}
                          vendorId={vendor.vendor_id}
                          currentStatus={vendor.status || 'Contacted'}
                          onStatusUpdate={(newStatus) => handleStatusUpdate(vendor.vendor_id, newStatus)}
                          className="w-full"
                          userType="customer"
                          dropdownDirection="up"
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-1.5 sm:space-x-2">
                        <Button 
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-4"
                          onClick={(e) => {
                            e.stopPropagation();
                            // WhatsApp functionality
                            const phoneNumber = vendor.whatsapp_number || vendor.phone_number;
                            if (phoneNumber) {
                              window.open(`https://wa.me/${phoneNumber}`, '_blank');
                            }
                          }}
                        >
                          <span className="hidden sm:inline">WhatsApp </span>Again
                        </Button>
                        <Button 
                          variant="outline"
                          className="flex-1 text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-4"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/vendor/${vendor.vendor_id}`);
                          }}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyVendors;
