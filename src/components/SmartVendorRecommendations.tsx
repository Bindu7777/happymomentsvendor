import React, { useState, useEffect } from 'react';
import { Star, MapPin, Phone, Mail, Instagram, Heart, MessageCircle, Camera, Award, Users, Zap, Clock, ChevronRight, CheckCircle, AlertCircle, TrendingUp, DollarSign, Calendar, User, Edit3 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { VendorMatch, MatchingResult, getMatchQuality, formatMatchReasons } from '../services/autoMatchingEngine';
import { ParsedRequest } from '../services/requestParser';

interface SmartVendorRecommendationsProps {
  matchingResult: MatchingResult;
  onVendorSelect: (vendor: any) => void;
  onAddToCart: (vendor: any) => void;
  onContactVendor: (vendor: any) => void;
  onViewProfile: (vendor: any) => void;
}

const SmartVendorRecommendations: React.FC<SmartVendorRecommendationsProps> = ({
  matchingResult,
  onVendorSelect,
  onAddToCart,
  onContactVendor,
  onViewProfile
}) => {
  const [selectedTab, setSelectedTab] = useState<'perfect' | 'near' | 'all'>('perfect');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const toggleFavorite = (vendorId: string) => {
    setFavorites(prev => 
      prev.includes(vendorId) 
        ? prev.filter(id => id !== vendorId)
        : [...prev, vendorId]
    );
  };

  const getMatchQualityColor = (score: number) => {
    const quality = getMatchQuality(score);
    switch (quality) {
      case 'excellent': return 'bg-green-100 text-green-800 border-green-200';
      case 'good': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'fair': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'poor': return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getMatchQualityIcon = (score: number) => {
    const quality = getMatchQuality(score);
    switch (quality) {
      case 'excellent': return <CheckCircle className="h-4 w-4" />;
      case 'good': return <TrendingUp className="h-4 w-4" />;
      case 'fair': return <AlertCircle className="h-4 w-4" />;
      case 'poor': return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getPriceMatchColor = (priceMatch: string) => {
    switch (priceMatch) {
      case 'exact': return 'text-green-600';
      case 'within_range': return 'text-blue-600';
      case 'below_range': return 'text-green-500';
      case 'above_range': return 'text-orange-500';
      default: return 'text-gray-600';
    }
  };

  const getCurrentMatches = () => {
    switch (selectedTab) {
      case 'perfect': return matchingResult.perfectMatches;
      case 'near': return matchingResult.nearMatches;
      case 'all': return matchingResult.allMatches;
      default: return [];
    }
  };

  const currentMatches = getCurrentMatches();

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-900">
          🎯 Smart Recommendations for You
        </h2>
        <p className="text-lg text-gray-600">
          We found <span className="font-semibold text-orange-600">{matchingResult.totalFound}</span> vendors that match your requirements
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center space-x-1 bg-gray-100 p-1 rounded-lg">
        <Button
          variant={selectedTab === 'perfect' ? 'default' : 'ghost'}
          onClick={() => setSelectedTab('perfect')}
          className={`px-6 ${selectedTab === 'perfect' ? 'bg-orange-500 text-white' : 'text-gray-600'}`}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Perfect Matches ({matchingResult.perfectMatches.length})
        </Button>
        <Button
          variant={selectedTab === 'near' ? 'default' : 'ghost'}
          onClick={() => setSelectedTab('near')}
          className={`px-6 ${selectedTab === 'near' ? 'bg-orange-500 text-white' : 'text-gray-600'}`}
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Near Matches ({matchingResult.nearMatches.length})
        </Button>
        <Button
          variant={selectedTab === 'all' ? 'default' : 'ghost'}
          onClick={() => setSelectedTab('all')}
          className={`px-6 ${selectedTab === 'all' ? 'bg-orange-500 text-white' : 'text-gray-600'}`}
        >
          <Users className="h-4 w-4 mr-2" />
          All Results ({matchingResult.allMatches.length})
        </Button>
      </div>

      {/* Search Criteria Summary */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="font-semibold text-orange-800">Your Requirements:</h3>
              <div className="flex flex-wrap gap-2">
                {matchingResult.searchCriteria.serviceTypes.map((service, index) => (
                  <Badge key={index} variant="secondary" className="bg-orange-100 text-orange-800">
                    {service}
                  </Badge>
                ))}
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  {matchingResult.searchCriteria.eventType}
                </Badge>
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  {matchingResult.searchCriteria.location}
                </Badge>
                {matchingResult.searchCriteria.budgetRange && (
                  <Badge variant="outline" className="bg-purple-100 text-purple-800">
                    ₹{matchingResult.searchCriteria.budgetRange.min.toLocaleString()} - ₹{matchingResult.searchCriteria.budgetRange.max.toLocaleString()}
                  </Badge>
                )}
              </div>
            </div>
            <Button variant="outline" size="sm" className="text-orange-700 border-orange-300">
              <Edit3 className="h-4 w-4 mr-1" />
              Modify Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Vendor Cards */}
      {currentMatches.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No vendors found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search criteria or browse all vendors</p>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              Browse All Vendors
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentMatches.map((match) => (
            <Card
              key={match.vendor.vendor_id}
              className={`group relative overflow-hidden transition-all duration-300 hover:shadow-xl border-2 ${
                hoveredCard === match.vendor.vendor_id ? 'border-orange-300 shadow-lg' : 'border-gray-200'
              }`}
              onMouseEnter={() => setHoveredCard(match.vendor.vendor_id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Match Quality Badge */}
              <div className="absolute top-3 left-3 z-10">
                <Badge className={`${getMatchQualityColor(match.matchScore)} border`}>
                  {getMatchQualityIcon(match.matchScore)}
                  <span className="ml-1">{match.matchScore}% Match</span>
                </Badge>
              </div>

              {/* Favorite Button */}
              <div className="absolute top-3 right-3 z-10">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFavorite(match.vendor.vendor_id)}
                  className={`p-2 ${favorites.includes(match.vendor.vendor_id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                >
                  <Heart className={`h-4 w-4 ${favorites.includes(match.vendor.vendor_id) ? 'fill-current' : ''}`} />
                </Button>
              </div>

              {/* Vendor Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={match.vendor.avatar_url || match.vendor.cover_image_url || "/images/vendor-placeholder.jpg"}
                  alt={`${match.vendor.brand_name} portfolio`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                
                {/* Availability Status */}
                <div className="absolute top-3 right-3">
                  <Badge className={`${match.availabilityMatch ? 'bg-green-500' : 'bg-gray-500'} text-white`}>
                    {match.availabilityMatch ? 'Available' : 'Check Availability'}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4">
                {/* Vendor Info */}
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">
                    {match.vendor.brand_name}
                  </h3>
                  <p className="text-xs text-orange-600 font-medium mb-1">{match.vendor.category}</p>
                  <p className="text-sm text-gray-600">by {match.vendor.spoc_name}</p>
                </div>

                {/* Rating & Reviews */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(match.vendor.rating || 0)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 ml-1">
                      {match.vendor.rating?.toFixed(1) || 'N/A'} {match.vendor.review_count && match.vendor.review_count > 0 
                        ? `(${match.vendor.review_count})`
                        : '(No reviews)'
                      }
                    </span>
                  </div>
                  {match.ratingMatch && (
                    <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800">
                      <Award className="h-3 w-3 mr-1" />
                      Top Rated
                    </Badge>
                  )}
                </div>

                {/* Price */}
                <div className="mb-3">
                  <div className={`text-lg font-bold ${getPriceMatchColor(match.priceMatch)}`}>
                    {match.vendor.starting_price 
                      ? `Starting ₹${match.vendor.starting_price.toLocaleString()}`
                      : 'Contact for pricing'
                    }
                  </div>
                  {match.priceMatch !== 'unknown' && (
                    <div className="text-xs text-gray-500">
                      {match.priceMatch === 'exact' && 'Perfect budget match'}
                      {match.priceMatch === 'within_range' && 'Within your budget range'}
                      {match.priceMatch === 'below_range' && 'Under your budget'}
                      {match.priceMatch === 'above_range' && 'Above your budget'}
                    </div>
                  )}
                </div>

                {/* Match Reasons */}
                <div className="mb-3">
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {formatMatchReasons(match.matchReasons)}
                  </p>
                </div>

                {/* Location & Languages */}
                <div className="mb-3 space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{match.vendor.address || 'Location not specified'}</span>
                  </div>
                  {match.vendor.languages_spoken && Array.isArray(match.vendor.languages_spoken) && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span className="text-xs">
                        Languages: {match.vendor.languages_spoken.join(', ')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Experience & Availability */}
                <div className="flex items-center justify-between mb-4 text-sm">
                  <div className="flex items-center gap-1 text-gray-600">
                    <Award className="w-4 h-4" />
                    <span>{match.vendor.experience || 'Experience not specified'}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Available: {match.vendor.currently_available ? 'Yes' : 'No'}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => onContactVendor(match.vendor)}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Contact
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => onViewProfile(match.vendor)}
                    className="flex-1 border-orange-300 text-orange-600 hover:bg-orange-50"
                  >
                    <User className="h-4 w-4 mr-1" />
                    View Profile
                  </Button>
                </div>

                {/* Add to Cart Button */}
                <Button
                  variant="outline"
                  onClick={() => onAddToCart(match.vendor)}
                  className="w-full mt-2 border-blue-300 text-blue-600 hover:bg-blue-50"
                >
                  <Zap className="h-4 w-4 mr-1" />
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {currentMatches.length > 0 && (
        <div className="text-center">
          <Button variant="outline" className="px-8">
            Load More Results
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default SmartVendorRecommendations;
