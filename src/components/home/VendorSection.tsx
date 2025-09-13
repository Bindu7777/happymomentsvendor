import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Heart } from "lucide-react";
import Vendor from "@/models/vendor";

// Mock vendor data with Indian names and locations
const vendors: Array<Vendor> = [
  {
    id: "1",
    name: "Maxo Events",
    category: ["Events"],
    location: "Hyderabad, Telangana",
    rating: 4.9,
    reviews: 128,
    image: "images/vendor.jpeg ",
    featured: true,
    subcategory: "",
    vendorId: "sri-sai-lighting",
  },
  {
    id: "2",
    name: "JJ Events",
    category: ["Events"],
    location: "Hyderabad, Telangana",
    rating: 4.8,
    reviews: 94,
    image: "images/celebrations.jpeg ",
    featured: false,
  },
  {
    id: "4",
    name: "Myra",
    category: ["Entertainment"],
    location: "Sarronagar, Telangana",
    rating: 4.9,
    reviews: 112,
    image:
      "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    featured: false,
  },
  {
    id: "4",
    name: "Myra",
    category: ["Entertainment"],
    location: "Sarronagar, Telangana",
    rating: 4.9,
    reviews: 112,
    image:
      "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    featured: false,
  },
];

const VendorSection = () => {

  const navigate = useNavigate();

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
            Highlights
          </h2>
          <p className="text-wedding-gray max-w-2xl mx-auto">
            We celebrate your event.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {vendors.map((vendor, index) => (
            <div
              key={vendor.id}
              className="bg-white rounded-xl shadow-subtle overflow-hidden transition-all duration-300 hover:shadow-card group animate-fade-up border border-wedding-orange/10"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={vendor.image}
                  alt={vendor.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <button
                  onClick={() => toggleFavorite(Number(vendor.id))}
                  className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-xs rounded-full shadow-sm transition-all hover:bg-white"
                >
                  <Heart
                    className={`h-5 w-5 ${
                      favorites.includes(Number(vendor.id))
                        ? "fill-wedding-orange text-wedding-orange"
                        : "text-wedding-gray"
                    }`}
                  />
                </button>
                {vendor.featured && (
                  <Badge className="absolute top-3 left-3 bg-wedding-orange text-white border-0">
                    Featured
                  </Badge>
                )}
                <div className="absolute bottom-3 right-3">
                  <Badge
                    variant="outline"
                    className="bg-white/90 backdrop-blur-xs border-0 text-wedding-navy"
                  >
                    {vendor.price}
                  </Badge>
                </div>
              </div>

              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg text-wedding-navy group-hover:text-wedding-orange transition-custom">
                      {vendor.category}
                    </h3>
                    {/* <Badge variant="secondary" className="mt-1 bg-wedding-orange-light text-wedding-orange border-0">
                      {vendor.category}
                    </Badge> */}
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-wedding-orange fill-wedding-orange mr-1" />
                    <span className="text-sm font-medium text-wedding-navy">
                      {vendor.rating}
                    </span>
                    <span className="text-xs text-wedding-gray ml-1">
                      ({vendor.reviews})
                    </span>
                  </div>
                </div>

                <div className="flex items-center mb-4 text-wedding-gray text-sm">
                  <MapPin className="h-4 w-4 mr-1" />
                  {vendor.location}
                </div>

                <div className="flex items-stretch">
                  {" "}
                  <Button onClick={()=>navigate(`/vendor/${vendor.vendorId??""}`)} className="w-full bg-wedding-orange text-white hover:bg-wedding-orange-hover transition-custom">
                    {/* <Link
                    to={`/vendor/${vendor.vendorId??""}`}
                      className="w-full text-white"
                    > */}
                      More details
                    {/* </Link> */}
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
          ))}
        </div>

        <div className="text-center mt-12">
          <Button className="bg-wedding-orange hover:bg-wedding-orange-hover text-white px-10 py-6 font-medium shadow-md">
            <Link to="/" className="text-white">
              View All Vendors
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default VendorSection;
