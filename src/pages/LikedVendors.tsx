import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ArrowLeft } from 'lucide-react';
import Header from '@/components/layout/Header';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { getLikedVendors } from '@/services/likedVendorsApiService';
import VendorShortCard from '@/components/VendorShortCard';
import { Vendor } from '@/lib/supabase';

interface LikedVendor extends Vendor {
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
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-wedding-orange transition-colors mb-6"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
          <div className="flex items-center justify-center">
            <Heart className="h-8 w-8 mr-2.5 text-red-500 fill-red-500" />
            <h1 className="text-4xl font-semibold text-gray-800">
              Liked Vendors
            </h1>
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {likedVendors.map((vendor) => (
                <VendorShortCard
                  key={vendor.vendor_id}
                  vendor={vendor as Vendor}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LikedVendors;
