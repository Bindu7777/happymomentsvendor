import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Heart, Award, MessageCircle } from "lucide-react";
import { Vendor } from "@/lib/supabase";
import { getAllVendors } from "@/services/supabaseService";

const VendorSection = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Indian event images for highlights
  const indianEventImages = [
    "/videos/abhilash/GardenParty.jpg",
    "/videos/abhilash/GetToGether.jpg", 
    "/images/image1.jpeg",
    "/images/image2.jpeg",
    // Additional Indian event images (using placeholder URLs for now)
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1519167758481-83f1426e4a3e?w=400&h=300&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400&h=300&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=300&fit=crop&crop=center"
  ];

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const vendorData = await getAllVendors();
        setVendors(vendorData.slice(0, 4)); // Show only first 4 vendors
      } catch (error) {
        console.error('Error fetching vendors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  const [favorites, setFavorites] = useState<number[]>([]);

  const toggleFavorite = (id: number) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter((favId) => favId !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  return (
    <section className="py-10 bg-white">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-wedding-navy mb-4">
            🎊 Event Highlights
          </h2>
          <p className="text-wedding-gray max-w-2xl mx-auto">
            Discover amazing Indian celebrations and find your perfect vendors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-subtle overflow-hidden animate-pulse">
                <div className="h-56 bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                  <div className="text-orange-400 text-4xl">🎉</div>
                </div>
                <div className="p-5">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))
          ) : vendors.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-wedding-gray">No vendors available at the moment.</p>
            </div>
          ) : (
            vendors.map((vendor, index) => (
            <div
              key={vendor.vendor_id}
              className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl group border border-gray-200"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Profile/Logo Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={vendor.brand_logo_url || vendor.avatar_url || indianEventImages[index % indianEventImages.length]}
                  alt={`${vendor.brand_name} profile`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/images/image1.jpeg";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                
                {/* Availability Status */}
                {vendor.currently_available && (
                  <div className="absolute top-3 left-3">
                    <div className="flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span>Available Now</span>
                    </div>
                  </div>
                )}

                {/* Verified Badge */}
                {vendor.verified && (
                  <div className="absolute top-3 right-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                  </div>
                )}

                {/* Price Tag */}
                <div className="absolute bottom-3 right-3">
                  <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-semibold text-gray-800">
                    {vendor.starting_price 
                      ? `₹${vendor.starting_price.toLocaleString()}+`
                      : 'Contact for Pricing'
                    }
                  </div>
                </div>
              </div>

              <div className="p-4">
                {/* Business Name & Category */}
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {vendor.brand_name}
                  </h3>
                  <div className="text-sm text-orange-600 font-medium">
                    {vendor.category}
                  </div>
                </div>

                {/* Star Rating (only if > 0 reviews) */}
                {vendor.review_count && vendor.review_count > 0 && (
                  <div className="flex items-center gap-1 mb-3">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-semibold text-gray-700">
                      {vendor.rating || 4.5}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({vendor.review_count} reviews)
                    </span>
                  </div>
                )}

                {/* Years of Experience */}
                {vendor.experience && (
                  <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                    <Award className="h-4 w-4 text-amber-500" />
                    <span>{vendor.experience}</span>
                  </div>
                )}

                {/* Location */}
                {vendor.address && (
                  <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="truncate">{vendor.address}</span>
                  </div>
                )}

                {/* WhatsApp Button (Primary Action) */}
                <Button 
                  onClick={() => {
                    const phoneNumber = vendor.whatsapp_number || vendor.phone_number;
                    if (phoneNumber) {
                      const message = `Hi ${vendor.spoc_name}! I found your ${vendor.category} services and I'm interested in learning more.`;
                      const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^\d]/g, '')}?text=${encodeURIComponent(message)}`;
                      window.open(whatsappUrl, '_blank');
                    }
                  }}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-3 font-semibold rounded-lg transition-all duration-200 hover:scale-105"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
              </div>
            </div>
            ))
          )}
        </div>

        <div className="text-center mt-12 space-x-4">
          <Button className="bg-wedding-orange hover:bg-wedding-orange-hover text-white px-10 py-6 font-medium shadow-md">
            <Link to="/" className="text-white">
              View All Vendors
            </Link>
          </Button>
          <Button 
            onClick={() => navigate("/login")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-6 font-medium shadow-md"
          >
            Login
          </Button>
        </div>
      </div>
    </section>
  );
};

export default VendorSection;
