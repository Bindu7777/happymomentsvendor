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
        console.log('Fetching all vendors for homepage...');
        const vendorData = await getAllVendors();
        console.log('Fetched all vendors:', vendorData);
        console.log('Number of vendors found:', vendorData.length);
        
        // Log sample vendor data to debug
        if (vendorData.length > 0) {
          console.log('Sample vendor data:', vendorData[0]);
          console.log('Vendor fields:', Object.keys(vendorData[0]));
        }
        
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
              className="bg-white rounded-xl shadow-subtle overflow-hidden transition-all duration-300 hover:shadow-card group animate-fade-up border border-wedding-orange/10"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={indianEventImages[index % indianEventImages.length]}
                  alt={`Indian event showcase for ${vendor.brand_name}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/images/image1.jpeg"; // Fallback to local image
                  }}
                />
                {/* Indian event overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                <div className="absolute top-2 left-2 text-white text-xs font-semibold bg-orange-500/80 px-2 py-1 rounded-full">
                  {index === 0 ? "🎊 Wedding" : index === 1 ? "🎉 Party" : index === 2 ? "💃 Celebration" : "🌟 Event"}
                </div>
                <button
                  onClick={() => toggleFavorite(Number(vendor.vendor_id))}
                  className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-xs rounded-full shadow-sm transition-all hover:bg-white"
                >
                  <Heart
                    className={`h-5 w-5 ${
                      favorites.includes(Number(vendor.vendor_id))
                        ? "fill-wedding-orange text-wedding-orange"
                        : "text-wedding-gray"
                    }`}
                  />
                </button>
                <div className="absolute bottom-3 right-3">
                  <Badge
                    variant="outline"
                    className="bg-white/90 backdrop-blur-xs border-0 text-wedding-navy"
                  >
                    {vendor.packages && Array.isArray(vendor.packages) && vendor.packages.length > 0
                      ? `From ${vendor.packages[0].price || 'Contact for pricing'}`
                      : 'Contact for pricing'}
                  </Badge>
                </div>
              </div>

              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg text-wedding-navy group-hover:text-wedding-orange transition-custom">
                      {vendor.brand_name}
                    </h3>
                    <Badge variant="secondary" className="mt-1 bg-wedding-orange-light text-wedding-orange border-0">
                      {vendor.category}
                    </Badge>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-wedding-orange fill-wedding-orange mr-1" />
                    <span className="text-sm font-medium text-wedding-navy">
                      {vendor.rating || 4.5}
                    </span>
                    <span className="text-xs text-wedding-gray ml-1">
                      ({vendor.review_count || 0})
                    </span>
                  </div>
                </div>

                <div className="flex items-center mb-4 text-wedding-gray text-sm">
                  <MapPin className="h-4 w-4 mr-1" />
                  {vendor.address}
                </div>

                <div className="flex items-stretch">
                  {" "}
                  <Button 
                    onClick={() => navigate(`/vendor/${vendor.vendor_id}`)}
                    className="w-full bg-wedding-orange text-white hover:bg-wedding-orange-hover transition-custom"
                  >
                    More details
                  </Button>
                  <span className="px-1"></span>
                  <Button className="w-full bg-wedding-orange text-white hover:bg-wedding-orange-hover transition-custom">
                    <Link to="/" className="w-full text-white">
                      Enquire now
                    </Link>
                  </Button>
                </div>
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
