import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Check, X, MapPin, DollarSign, Camera, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { useVoiceProcessing } from '../hooks/useVoiceProcessing';
import { VoiceExtractedData } from '../services/voiceProcessingService';

interface VoiceSearchComponentProps {
  onDataExtracted?: (data: VoiceExtractedData) => void;
  onApplyFilters?: (data: VoiceExtractedData) => void;
  className?: string;
}

const VoiceSearchComponent: React.FC<VoiceSearchComponentProps> = ({
  onDataExtracted,
  onApplyFilters,
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

  const [showResults, setShowResults] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<Partial<VoiceExtractedData>>({});

  // Notify parent component when data is extracted
  useEffect(() => {
    if (extractedData && extractedData.confidence > 0.3) {
      setShowResults(true);
      onDataExtracted?.(extractedData);
    }
  }, [extractedData, onDataExtracted]);

  // Handle voice button click
  const handleVoiceClick = () => {
    if (isListening) {
      stopListening();
    } else {
      clearData();
      startListening();
    }
  };

  // Apply extracted filters
  const handleApplyFilters = () => {
    if (extractedData) {
      setAppliedFilters(extractedData);
      onApplyFilters?.(extractedData);
      setShowResults(false);
    }
  };

  // Clear applied filters
  const handleClearFilters = () => {
    setAppliedFilters({});
    clearData();
    setShowResults(false);
  };

  // Get confidence color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  // Format confidence percentage
  const formatConfidence = (confidence: number) => {
    return `${Math.round(confidence * 100)}%`;
  };

  return (
    <div className={`voice-search-component ${className}`}>
      {/* Voice Input Button */}
      <div className="flex flex-col items-center space-y-4">
        <Button
          onClick={handleVoiceClick}
          className={`
            relative w-20 h-20 rounded-full transition-all duration-300
            ${isListening 
              ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
              : 'bg-orange-500 hover:bg-orange-600'
            }
            shadow-lg hover:shadow-xl
          `}
          disabled={!!error}
        >
          {isListening ? (
            <MicOff className="w-8 h-8 text-white" />
          ) : (
            <Mic className="w-8 h-8 text-white" />
          )}
        </Button>

        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">
            {isListening ? 'Listening... Speak now' : 'Tap to speak'}
          </p>
          <p className="text-xs text-gray-500">
            Tell us about your event needs
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-w-md">
            <p className="text-sm text-red-800">{error}</p>
            <p className="text-xs text-red-600 mt-1">
              Please ensure your microphone is enabled and try again.
            </p>
          </div>
        )}

        {/* Live Transcript */}
        {transcript && (
          <Card className="w-full max-w-md">
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <Volume2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 mb-1">Live Transcript:</p>
                  <p className="text-sm text-gray-600 italic">
                    "{transcript}"
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Extracted Data Results */}
      {showResults && extractedData && (
        <Card className="w-full max-w-md mt-4 border-2 border-blue-200">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">Extracted Information</h3>
                <Badge className={getConfidenceColor(extractedData.confidence)}>
                  {formatConfidence(extractedData.confidence)} confidence
                </Badge>
              </div>

              {/* Location */}
              {extractedData.state && (
                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-800">
                      {extractedData.city ? `${extractedData.city}, ` : ''}
                      {extractedData.state.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                  </div>
                </div>
              )}

              {/* Budget */}
              {extractedData.budgetRange && (
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800">
                      Budget: ₹{extractedData.budgetValue?.toLocaleString()} 
                      {extractedData.budgetRange !== '10k-50k' && (
                        <span className="text-xs text-green-600 ml-1">
                          (Range: {extractedData.budgetRange.replace('-', ' - ₹').replace('k', 'K').replace('l', 'L').replace('cr', 'CR')})
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* Service Type */}
              {extractedData.serviceType && (
                <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
                  <Camera className="w-4 h-4 text-purple-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-purple-800">
                      Service: {extractedData.serviceType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleApplyFilters}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Apply Filters
                </Button>
                <Button
                  onClick={handleClearFilters}
                  variant="outline"
                  size="sm"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Applied Filters Display */}
      {Object.keys(appliedFilters).length > 0 && (
        <Card className="w-full max-w-md mt-4 border-2 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-green-600" />
              <h3 className="font-semibold text-green-800">Applied Voice Filters</h3>
            </div>
            
            <div className="space-y-2">
              {appliedFilters.state && (
                <Badge variant="secondary" className="mr-2">
                  📍 {appliedFilters.city || appliedFilters.state}
                </Badge>
              )}
              {appliedFilters.budgetRange && (
                <Badge variant="secondary" className="mr-2">
                  💰 {appliedFilters.budgetRange}
                </Badge>
              )}
              {appliedFilters.serviceType && (
                <Badge variant="secondary" className="mr-2">
                  📸 {appliedFilters.serviceType}
                </Badge>
              )}
            </div>
            
            <Button
              onClick={handleClearFilters}
              variant="outline"
              size="sm"
              className="mt-3"
            >
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VoiceSearchComponent;
