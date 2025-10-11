import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Search, MapPin, DollarSign, Camera, Sparkles, Volume2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useVoiceProcessing } from '../hooks/useVoiceProcessing';
import { VoiceExtractedData } from '../services/voiceProcessingService';

interface SmartVoiceRequestProps {
  onSearch?: (filters: {
    serviceType: string;
    location: string;
    budget: string;
  }) => void;
  className?: string;
}

const SmartVoiceRequest: React.FC<SmartVoiceRequestProps> = ({
  onSearch,
  className = ''
}) => {
  const {
    isListening,
    transcript,
    extractedData,
    startListening,
    stopListening,
    clearData,
    error
  } = useVoiceProcessing();

  const [searchFilters, setSearchFilters] = useState({
    serviceType: 'all',
    location: 'all',
    budget: 'all'
  });

  const [showExtractedData, setShowExtractedData] = useState(false);

  // Process extracted data and update filters
  useEffect(() => {
    if (extractedData && extractedData.confidence > 0.3) {
      const newFilters = { ...searchFilters };

      // Update service type
      if (extractedData.serviceType) {
        newFilters.serviceType = extractedData.serviceType;
      }

      // Update location (prefer state over city)
      if (extractedData.state) {
        newFilters.location = extractedData.state;
      } else if (extractedData.city) {
        newFilters.location = extractedData.city;
      }

      // Update budget
      if (extractedData.budgetRange) {
        newFilters.budget = extractedData.budgetRange;
      }

      setSearchFilters(newFilters);
      setShowExtractedData(true);

      // Auto-search after 2 seconds if confidence is high
      if (extractedData.confidence > 0.7) {
        setTimeout(() => {
          handleSearch(newFilters);
        }, 2000);
      }
    }
  }, [extractedData]);

  // Handle search with current filters
  const handleSearch = (filters = searchFilters) => {
    onSearch?.(filters);
    setShowExtractedData(false);
    clearData();
  };

  // Handle voice button click
  const handleVoiceClick = () => {
    if (isListening) {
      stopListening();
    } else {
      clearData();
      setShowExtractedData(false);
      startListening();
    }
  };

  // Get confidence color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800 border-green-200';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  // Format location display
  const formatLocation = (data: VoiceExtractedData) => {
    if (data.state) {
      return data.city ? `${data.city}, ${data.state}` : data.state;
    }
    return data.city || '';
  };

  // Format service type display
  const formatServiceType = (serviceType: string) => {
    return serviceType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Format budget display
  const formatBudget = (data: VoiceExtractedData) => {
    if (data.budgetValue && data.budgetRange) {
      return `₹${data.budgetValue.toLocaleString()} (${data.budgetRange})`;
    }
    return data.budgetRange || '';
  };

  return (
    <div className={`smart-voice-request ${className}`}>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-xl">
            <Sparkles className="w-6 h-6 text-orange-500" />
            Smart Voice Search
            <Sparkles className="w-6 h-6 text-orange-500" />
          </CardTitle>
          <p className="text-gray-600">
            Speak naturally about your event needs and we'll find the perfect vendors
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Voice Input Section */}
          <div className="text-center space-y-4">
            <Button
              onClick={handleVoiceClick}
              className={`
                w-24 h-24 rounded-full transition-all duration-300
                ${isListening 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse shadow-lg' 
                  : 'bg-orange-500 hover:bg-orange-600 shadow-md'
                }
                ${error ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              disabled={!!error}
            >
              {isListening ? (
                <MicOff className="w-10 h-10 text-white" />
              ) : (
                <Mic className="w-10 h-10 text-white" />
              )}
            </Button>

            <div>
              <p className="text-lg font-medium text-gray-800">
                {isListening ? 'Listening... Speak now' : 'Tap to speak'}
              </p>
              <p className="text-sm text-gray-500">
                Example: "I need a photographer in Hyderabad with a budget of fifty thousand"
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800 font-medium">Voice Recognition Error</p>
                <p className="text-sm text-red-600 mt-1">{error}</p>
                <p className="text-xs text-red-500 mt-2">
                  Please ensure your microphone is enabled and try again.
                </p>
              </div>
            )}
          </div>

          {/* Live Transcript */}
          {transcript && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Volume2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-800 mb-2">Live Transcript:</p>
                    <p className="text-sm text-blue-700 italic">
                      "{transcript}"
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Extracted Data Display */}
          {showExtractedData && extractedData && (
            <Card className={`border-2 ${getConfidenceColor(extractedData.confidence)}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Extracted Information</span>
                  <Badge className={getConfidenceColor(extractedData.confidence)}>
                    {Math.round(extractedData.confidence * 100)}% confidence
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Service Type */}
                {extractedData.serviceType && (
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                    <Camera className="w-5 h-5 text-purple-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">Service Type</p>
                      <p className="text-lg font-semibold text-purple-800">
                        {formatServiceType(extractedData.serviceType)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Location */}
                {(extractedData.city || extractedData.state) && (
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">Location</p>
                      <p className="text-lg font-semibold text-blue-800">
                        {formatLocation(extractedData)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Budget */}
                {extractedData.budgetRange && (
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">Budget</p>
                      <p className="text-lg font-semibold text-green-800">
                        {formatBudget(extractedData)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => handleSearch()}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Search Vendors
                  </Button>
                  <Button
                    onClick={() => {
                      setShowExtractedData(false);
                      clearData();
                    }}
                    variant="outline"
                  >
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current Filters Display */}
          {(searchFilters.serviceType !== 'all' || searchFilters.location !== 'all' || searchFilters.budget !== 'all') && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-green-800">Active Filters</h3>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {searchFilters.serviceType !== 'all' && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      📸 {formatServiceType(searchFilters.serviceType)}
                    </Badge>
                  )}
                  {searchFilters.location !== 'all' && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      📍 {searchFilters.location.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  )}
                  {searchFilters.budget !== 'all' && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      💰 {searchFilters.budget.replace('-', ' - ₹').replace('k', 'K').replace('l', 'L').replace('cr', 'CR')}
                    </Badge>
                  )}
                </div>
                
                <Button
                  onClick={() => {
                    setSearchFilters({ serviceType: 'all', location: 'all', budget: 'all' });
                    setShowExtractedData(false);
                    clearData();
                  }}
                  variant="outline"
                  size="sm"
                >
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartVoiceRequest;
