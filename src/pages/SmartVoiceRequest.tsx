import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Search, MapPin, DollarSign, Camera, Sparkles, Volume2, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useVoiceProcessing } from '../hooks/useVoiceProcessing';
import { VoiceExtractedData } from '../services/voiceProcessingService';
import { 
  convertVoiceDataToSearchParams, 
  navigateToVendorsWithVoiceFilters, 
  generateVoiceSearchSummary,
  validateVoiceDataQuality,
  enhanceVoiceData,
  getVoiceProcessingErrorMessages,
  VoiceFilterData 
} from '../services/voiceIntegrationService';
import Header from '../components/layout/Header';

const SmartVoiceRequest: React.FC = () => {
  const navigate = useNavigate();
  const {
    isListening,
    transcript,
    extractedData,
    startListening,
    stopListening,
    clearData,
    error
  } = useVoiceProcessing();

  const [voiceFilters, setVoiceFilters] = useState<VoiceFilterData | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [searchHistory, setSearchHistory] = useState<VoiceFilterData[]>([]);
  const [activeTab, setActiveTab] = useState('voice');

  // Process extracted data
  useEffect(() => {
    if (extractedData && extractedData.confidence > 0.3) {
      const enhancedData = enhanceVoiceData(extractedData);
      const filters = convertVoiceDataToSearchParams(enhancedData);
      setVoiceFilters(filters);
      setShowResults(true);
    }
  }, [extractedData]);

  // Handle voice button click
  const handleVoiceClick = () => {
    if (isListening) {
      stopListening();
    } else {
      clearData();
      setShowResults(false);
      setVoiceFilters(null);
      startListening();
    }
  };

  // Handle search with voice filters
  const handleVoiceSearch = () => {
    if (voiceFilters) {
      // Add to search history
      setSearchHistory(prev => [voiceFilters, ...prev.slice(0, 4)]);
      
      // Navigate to vendors page
      navigateToVendorsWithVoiceFilters(voiceFilters, navigate);
    }
  };

  // Handle retry
  const handleRetry = () => {
    setShowResults(false);
    setVoiceFilters(null);
    clearData();
  };

  // Get confidence color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800 border-green-200';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  // Get error details
  const getErrorDetails = () => {
    if (!error) return null;
    return getVoiceProcessingErrorMessages(error);
  };

  const errorDetails = getErrorDetails();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Smart Voice Search
            </h1>
            <p className="text-lg text-gray-600 mb-2">
              Speak naturally about your event needs
            </p>
            <p className="text-sm text-gray-500">
              Our AI will understand and find the perfect vendors for you
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="voice" className="flex items-center gap-2">
                <Mic className="w-4 h-4" />
                Voice Search
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Search History
              </TabsTrigger>
            </TabsList>

            {/* Voice Search Tab */}
            <TabsContent value="voice" className="space-y-6">
              {/* Voice Input Card */}
              <Card className="w-full">
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2 text-xl">
                    <Sparkles className="w-6 h-6 text-orange-500" />
                    Voice Input
                    <Sparkles className="w-6 h-6 text-orange-500" />
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Voice Button */}
                  <div className="text-center space-y-4">
                    <Button
                      onClick={handleVoiceClick}
                      className={`
                        w-32 h-32 rounded-full transition-all duration-300
                        ${isListening 
                          ? 'bg-red-500 hover:bg-red-600 animate-pulse shadow-lg scale-105' 
                          : 'bg-orange-500 hover:bg-orange-600 shadow-md hover:scale-105'
                        }
                        ${error ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                      disabled={!!error}
                    >
                      {isListening ? (
                        <MicOff className="w-16 h-16 text-white" />
                      ) : (
                        <Mic className="w-16 h-16 text-white" />
                      )}
                    </Button>

                    <div>
                      <p className="text-xl font-medium text-gray-800">
                        {isListening ? 'Listening... Speak now' : 'Tap to speak'}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Example: "I need a photographer in Hyderabad with a budget of fifty thousand"
                      </p>
                    </div>

                    {/* Error Display */}
                    {errorDetails && (
                      <Card className="border-red-200 bg-red-50">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <h3 className="font-semibold text-red-800">{errorDetails.title}</h3>
                              <p className="text-sm text-red-700 mt-1">{errorDetails.message}</p>
                              <p className="text-xs text-red-600 mt-2">{errorDetails.suggestion}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
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

                  {/* Voice Results */}
                  {showResults && extractedData && voiceFilters && (
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
                        {voiceFilters.serviceType !== 'all' && (
                          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                            <Camera className="w-5 h-5 text-purple-600" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-700">Service Type</p>
                              <p className="text-lg font-semibold text-purple-800">
                                {voiceFilters.serviceType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Location */}
                        {voiceFilters.location !== 'all' && (
                          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                            <MapPin className="w-5 h-5 text-blue-600" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-700">Location</p>
                              <p className="text-lg font-semibold text-blue-800">
                                {voiceFilters.location.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Budget */}
                        {voiceFilters.budget !== 'all' && (
                          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                            <DollarSign className="w-5 h-5 text-green-600" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-700">Budget</p>
                              <p className="text-lg font-semibold text-green-800">
                                {extractedData.budgetValue 
                                  ? `₹${extractedData.budgetValue.toLocaleString()} (${voiceFilters.budget})`
                                  : voiceFilters.budget.replace('-', ' - ₹').replace('k', 'K').replace('l', 'L').replace('cr', 'CR')
                                }
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-2">
                          <Button
                            onClick={handleVoiceSearch}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            disabled={extractedData.confidence < 0.3}
                          >
                            <Search className="w-4 h-4 mr-2" />
                            Search Vendors
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                          <Button
                            onClick={handleRetry}
                            variant="outline"
                          >
                            Try Again
                          </Button>
                        </div>

                        {/* Quality Warning */}
                        {extractedData.confidence < 0.5 && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-yellow-800">Low Confidence</p>
                                <p className="text-xs text-yellow-700 mt-1">
                                  The voice recognition confidence is low. You may want to try speaking again or check the results carefully.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Search History Tab */}
            <TabsContent value="history" className="space-y-4">
              {searchHistory.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No Search History</h3>
                    <p className="text-sm text-gray-500">
                      Your voice search history will appear here
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {searchHistory.map((search, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex flex-wrap gap-2 mb-2">
                              {search.serviceType !== 'all' && (
                                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                                  📸 {search.serviceType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </Badge>
                              )}
                              {search.location !== 'all' && (
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                  📍 {search.location.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </Badge>
                              )}
                              {search.budget !== 'all' && (
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                  💰 {search.budget.replace('-', ' - ₹').replace('k', 'K').replace('l', 'L').replace('cr', 'CR')}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {generateVoiceSearchSummary(search.rawData)}
                            </p>
                          </div>
                          <Button
                            onClick={() => navigateToVendorsWithVoiceFilters(search, navigate)}
                            size="sm"
                            className="ml-4"
                          >
                            <Search className="w-4 h-4 mr-1" />
                            Search Again
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Help Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-500" />
                How to Use Voice Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">What to Say:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• "I need a photographer in Hyderabad"</li>
                    <li>• "Looking for catering services in Bangalore"</li>
                    <li>• "Wedding decorator in Mumbai with budget fifty thousand"</li>
                    <li>• "DJ services in Delhi for my birthday party"</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Tips for Better Results:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Speak clearly and at normal pace</li>
                    <li>• Mention the service type first</li>
                    <li>• Include city or state name</li>
                    <li>• Specify your budget if known</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SmartVoiceRequest;
