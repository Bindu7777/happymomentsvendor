import React, { useState, useEffect } from 'react';
import { Star, MapPin, Phone, Mail, Instagram, Facebook, Heart, Share2, Calendar, Clock, CheckCircle, Camera, Video, Users, Award } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { Dialog, DialogContent, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';

const VendorProfile = () => {
  const [isSaved, setIsSaved] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Sample photographer data
  const photographer = {
    name: "Rajesh Kumar Photography",
    tagline: "Capturing Life's Precious Moments with Artistic Excellence",
    avatar: "/images/vendor.jpeg",
    coverImage: "/images/wedding.webp",
    rating: 4.8,
    reviewCount: 128,
    location: "Mumbai, Maharashtra",
    verified: true,
    responseTime: "2 hours",
    yearsActive: 8,
    startingPrice: "₹25,000",
    about: "With over 8 years of experience in wedding and event photography, I specialize in capturing candid moments and creating timeless memories. My style blends traditional and contemporary approaches to tell your unique story.",
    services: [
      { name: "Wedding Photography", price: "₹25,000", description: "Full day coverage with 500+ edited photos" },
      { name: "Pre-Wedding Shoot", price: "₹15,000", description: "2-3 hour romantic couple session" },
      { name: "Corporate Events", price: "₹20,000", description: "Professional event documentation" },
      { name: "Birthday Parties", price: "₹8,000", description: "Fun and candid party photography" }
    ],
    packages: [
      {
        name: "Basic Package",
        price: "₹25,000",
        features: ["6 hours coverage", "300+ edited photos", "Online gallery", "USB drive"]
      },
      {
        name: "Premium Package", 
        price: "₹45,000",
        features: ["10 hours coverage", "600+ edited photos", "Online gallery", "USB drive", "Photo book", "Engagement shoot"]
      },
      {
        name: "Luxury Package",
        price: "₹75,000", 
        features: ["Full day coverage", "1000+ edited photos", "Online gallery", "USB drive", "Photo book", "Engagement shoot", "Video highlights", "Drone shots"]
      }
    ],
    portfolio: [
      "/images/wedding.webp",
      "/images/celebrations.jpeg", 
      "/images/corporate.jpg",
      "/images/birthday-celebration.jpg",
      "/images/decor.jpg",
      "/images/mandapas.png"
    ],
    reviews: [
      {
        name: "Priya & Arjun",
        rating: 5,
        text: "Rajesh captured our wedding beautifully! Every moment was perfect. Highly recommended!",
        date: "2 weeks ago",
        images: ["/images/wedding.webp"]
      },
      {
        name: "Corporate Client",
        rating: 5,
        text: "Professional, punctual, and amazing quality. Our event photos were outstanding.",
        date: "1 month ago"
      }
    ],
    contact: {
      phone: "+91 98765 43210",
      email: "rajesh@photography.com",
      instagram: "@rajeshphotography",
      website: "www.rajeshphotography.com"
    }
  };

  const portfolioImages = photographer.portfolio;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % portfolioImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + portfolioImages.length) % portfolioImages.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative h-[70vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${photographer.coverImage})` }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 h-full flex items-end pb-16">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6 w-full">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col md:flex-row items-start gap-4">
              <div className="relative">
                <img 
                  src={photographer.avatar} 
                  alt={photographer.name}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-2xl object-cover"
                />
                {photographer.verified && (
                  <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
              
              <div className="text-white">
                <h1 className="text-4xl font-bold mb-2">{photographer.name}</h1>
                <p className="text-xl mb-4 opacity-90">{photographer.tagline}</p>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < Math.floor(photographer.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    ))}
                    <span className="ml-2 text-lg font-semibold">{photographer.rating}</span>
                    <span className="text-gray-300">({photographer.reviewCount} reviews)</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{photographer.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Responds in {photographer.responseTime}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col gap-3 ml-auto">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                  onClick={() => setIsSaved(!isSaved)}
                >
                  <Heart className={`w-5 h-5 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
              
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold shadow-xl">
                Book Now - {photographer.startingPrice}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Strip */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-blue-600">{photographer.startingPrice}</div>
              <div className="text-sm text-gray-600">Starting Price</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-green-600">{photographer.reviewCount}</div>
              <div className="text-sm text-gray-600">Reviews</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-purple-600">{photographer.responseTime}</div>
              <div className="text-sm text-gray-600">Response Time</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-orange-600">{photographer.yearsActive}+</div>
              <div className="text-sm text-gray-600">Years Active</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-red-600">500+</div>
              <div className="text-sm text-gray-600">Events Done</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Camera className="w-6 h-6 text-blue-600" />
                  About
                </h2>
                <p className="text-gray-700 leading-relaxed">{photographer.about}</p>
              </CardContent>
            </Card>

            {/* Services & Packages */}
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Award className="w-6 h-6 text-blue-600" />
                  Services & Packages
                </h2>
                
                <Tabs defaultValue="services" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="services">Services</TabsTrigger>
                    <TabsTrigger value="packages">Packages</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="services" className="space-y-4 mt-6">
                    {photographer.services.map((service, index) => (
                      <Card key={index} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-lg">{service.name}</h3>
                              <p className="text-gray-600">{service.description}</p>
                            </div>
                            <Badge variant="secondary" className="text-lg font-bold">
                              {service.price}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="packages" className="space-y-4 mt-6">
                    {photographer.packages.map((pkg, index) => (
                      <Card key={index} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="font-semibold text-lg">{pkg.name}</h3>
                            <Badge variant="default" className="text-lg font-bold bg-blue-600">
                              {pkg.price}
                            </Badge>
                          </div>
                          <ul className="space-y-1">
                            {pkg.features.map((feature, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-gray-600">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                          <Button className="w-full mt-4">Select Package</Button>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Portfolio Gallery */}
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Video className="w-6 h-6 text-blue-600" />
                  Portfolio
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {photographer.portfolio.map((image, index) => (
                    <Dialog key={index}>
                      <DialogTrigger asChild>
                        <div 
                          className="relative group cursor-pointer overflow-hidden rounded-lg"
                          onClick={() => setSelectedImage(image)}
                        >
                          <img 
                            src={image} 
                            alt={`Portfolio ${index + 1}`}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                            <Camera className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <div className="relative">
                          <img 
                            src={image} 
                            alt={`Portfolio ${index + 1}`}
                            className="w-full h-auto rounded-lg"
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Users className="w-6 h-6 text-blue-600" />
                  Reviews ({photographer.reviewCount})
                </h2>
                
                <div className="space-y-6">
                  {photographer.reviews.map((review, index) => (
                    <div key={index} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{review.name}</h4>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                            ))}
                            <span className="text-sm text-gray-500 ml-2">{review.date}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700">{review.text}</p>
                      {review.images && (
                        <div className="flex gap-2 mt-3">
                          {review.images.map((img, idx) => (
                            <img key={idx} src={img} alt="Review" className="w-16 h-16 object-cover rounded" />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Booking Widget */}
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Request Booking</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Event Date</label>
                    <Input type="date" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Event Type</label>
                    <select className="w-full p-2 border rounded-md">
                      <option>Wedding</option>
                      <option>Pre-Wedding</option>
                      <option>Corporate Event</option>
                      <option>Birthday Party</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Message</label>
                    <Textarea placeholder="Tell us about your event..." />
                  </div>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                    Send Booking Request
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Contact Info</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <span>{photographer.contact.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <span>{photographer.contact.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Instagram className="w-5 h-5 text-pink-600" />
                    <span>{photographer.contact.instagram}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorProfile;
