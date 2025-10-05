import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Users, TrendingUp, Award, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Vendor } from '@/lib/supabase';
import { getVendorsByCategory } from '@/services/supabaseService';

const TrendingSection = () => {
  const [trendingVendors, setTrendingVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingVendors = async () => {
      try {
        // Get vendors from popular categories
        const categories = ['Photographers', 'Decorators', 'Makeup Artists', 'Caterers'];
        const allVendors: Vendor[] = [];
        
        for (const category of categories) {
          const vendors = await getVendorsByCategory(category);
          if (vendors) {
            allVendors.push(...vendors.slice(0, 2)); // Take top 2 from each category
          }
        }
        
        // Sort by rating and availability
        const sorted = allVendors
          .filter(vendor => vendor.currently_available && vendor.verified)
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 6);
        
        setTrendingVendors(sorted);
      } catch (error) {
        console.error('Error fetching trending vendors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingVendors();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <div className="container-custom">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-96 mx-auto mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 bg-gray-200 rounded-2xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <TrendingUp className="h-4 w-4" />
            Trending This Season
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            🌟 Popular Vendors Right Now
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            These vendors are getting the most bookings and highest ratings this season
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingVendors.map((vendor, index) => (
            <Card key={vendor.vendor_id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
                        {vendor.brand_name}
                      </h3>
                      {index < 3 && (
                        <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs">
                          #{index + 1} Trending
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{vendor.category}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{vendor.location || 'Location not specified'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(vendor.rating || 0)
                              ? 'text-amber-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {vendor.rating?.toFixed(1) || 'New'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {vendor.review_count && vendor.review_count > 0 
                        ? `(${vendor.review_count} reviews)`
                        : '(No reviews yet)'
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs font-medium">Available</span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Starting Price:</span>
                    <span className="font-semibold text-gray-800">
                      {vendor.starting_price ? `₹${vendor.starting_price.toLocaleString()}` : 'Contact for pricing'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Experience:</span>
                    <span className="font-medium text-gray-800">
                      {vendor.experience || 'Not specified'}
                    </span>
                  </div>
                  {vendor.languages_spoken && Array.isArray(vendor.languages_spoken) && vendor.languages_spoken.length > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Languages:</span>
                      <span className="font-medium text-gray-800">
                        {vendor.languages_spoken.join(', ')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/vendor/${vendor.vendor_id}`}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-2 px-4 rounded-lg text-sm font-semibold text-center transition-all duration-200 hover:scale-105"
                  >
                    View Profile
                  </Link>
                  <button
                    onClick={() => {
                      const message = `Hi ${vendor.spoc_name}! I found your ${vendor.category} services and I'm interested in learning more about your packages. Could you please share your availability and pricing details?`;
                      const phoneNumber = vendor.whatsapp_number || vendor.phone_number;
                      const whatsappUrl = `https://wa.me/${phoneNumber?.replace(/[^\d]/g, '')}?text=${encodeURIComponent(message)}`;
                      window.open(whatsappUrl, '_blank');
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105"
                  >
                    WhatsApp
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            to="/vendors"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <Users className="h-5 w-5" />
            View All Vendors
            <TrendingUp className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TrendingSection;
