import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Loader2, Edit3, Check, X, Volume2, Languages, Clock, Users, DollarSign } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { parseRequest, validateParsedRequest, ParsedRequest } from '../services/requestParser';

interface SmartRequestInputProps {
  onRequestParsed: (request: ParsedRequest) => void;
  onRequestSubmit: (request: ParsedRequest) => void;
  isLoading?: boolean;
}

const SmartRequestInput: React.FC<SmartRequestInputProps> = ({
  onRequestParsed,
  onRequestSubmit,
  isLoading = false
}) => {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [parsedRequest, setParsedRequest] = useState<ParsedRequest | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTimeout, setRecordingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'en-IN' | 'te-IN' | 'auto'>('auto');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [extractedDetails, setExtractedDetails] = useState<any>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Process transcript to improve accuracy and handle mixed languages
  const processTranscript = (transcript: string): string => {
    let processed = transcript.toLowerCase().trim();
    
    // Common Telugu to English mappings for better understanding
    const teluguMappings: { [key: string]: string } = {
      'kavali': 'need',
      'kavali': 'want',
      'pelli': 'wedding',
      'pelli ki': 'for wedding',
      'budget lo': 'within budget',
      'discount ivvara': 'can you give discount',
      'discount kavali': 'need discount',
      'family kosam': 'for family',
      'sister ki': 'for sister',
      'brother ki': 'for brother',
      'birthday ki': 'for birthday',
      'reception ki': 'for reception',
      'makeup artist': 'makeup artist',
      'photographer': 'photographer',
      'decorator': 'decorator',
      'catering': 'catering',
      'dj': 'dj',
      'music': 'music',
      'venue': 'venue',
      'hall': 'hall',
      'hours': 'hours',
      'hours ki': 'for hours',
      'guests': 'guests',
      'people': 'people'
    };

    // Replace Telugu phrases with English equivalents
    Object.entries(teluguMappings).forEach(([telugu, english]) => {
      const regex = new RegExp(telugu, 'gi');
      processed = processed.replace(regex, english);
    });

    // Clean up common speech recognition errors
    processed = processed
      .replace(/\b(um|uh|ah|er)\b/g, '') // Remove filler words
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    return processed;
  };

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = selectedLanguage === 'auto' ? 'en-IN' : selectedLanguage;
      recognitionInstance.maxAlternatives = 3; // Get multiple alternatives for better accuracy

      recognitionInstance.onstart = () => {
        setIsListening(true);
        setTranscript('');
      };

      recognitionInstance.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            // Use the best alternative or combine multiple alternatives
            const bestTranscript = result[0].transcript;
            finalTranscript += bestTranscript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        setTranscript(finalTranscript + interimTranscript);
        
        if (finalTranscript) {
          // Process the transcript for better accuracy
          const processedText = processTranscript(finalTranscript);
          setText(processedText);
          handleTextChange(processedText);
        }
      };

      recognitionInstance.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
        // Don't automatically set isRecording to false for continuous mode
        // Let the user manually stop recording
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setIsRecording(false);
        
        // Handle specific errors
        if (event.error === 'no-speech') {
          console.log('No speech detected, continuing to listen...');
          // Restart recognition for continuous mode
          if (isRecording) {
            setTimeout(() => {
              try {
                recognitionInstance.start();
              } catch (e) {
                console.error('Error restarting recognition:', e);
              }
            }, 100);
          }
        } else if (event.error === 'audio-capture') {
          alert('Microphone not accessible. Please check your microphone permissions.');
        } else if (event.error === 'not-allowed') {
          alert('Microphone access denied. Please allow microphone access and try again.');
        }
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (recordingTimeout) {
        clearTimeout(recordingTimeout);
      }
    };
  }, [recordingTimeout]);

  const handleTextChange = (newText: string) => {
    setText(newText);
    
    if (newText.trim().length > 10) {
      setIsProcessing(true);
      
      // Debounce the parsing
      const timeoutId = setTimeout(() => {
        try {
          const parsed = parseRequest(newText);
          const validation = validateParsedRequest(parsed);
          
          if (validation.isValid) {
            setParsedRequest(parsed);
            onRequestParsed(parsed);
            
            // Show confirmation UI for voice input
            if (isRecording || transcript) {
              setExtractedDetails({
                eventType: parsed.eventType,
                services: parsed.serviceTypes,
                budget: parsed.budgetRange,
                location: parsed.location,
                duration: parsed.duration,
                guestCount: parsed.guestCount,
                additionalRequirements: parsed.additionalRequirements,
                originalText: newText
              });
              setShowConfirmation(true);
            }
          } else {
            setParsedRequest(null);
            // Show partial results for voice input even if incomplete
            if (isRecording || transcript) {
              setExtractedDetails({
                eventType: parsed.eventType || 'Not specified',
                services: parsed.serviceTypes || [],
                budget: parsed.budgetRange || null,
                location: parsed.location || 'Not specified',
                duration: parsed.duration || 'Not specified',
                guestCount: parsed.guestCount || 'Not specified',
                additionalRequirements: parsed.additionalRequirements || [],
                originalText: newText,
                isIncomplete: true,
                errors: validation.errors
              });
              setShowConfirmation(true);
            }
          }
        } catch (error) {
          console.error('Error parsing request:', error);
          setParsedRequest(null);
        } finally {
          setIsProcessing(false);
        }
      }, 1000);

      return () => clearTimeout(timeoutId);
    } else {
      setParsedRequest(null);
      setIsProcessing(false);
    }
  };

  const startRecording = () => {
    if (!recognition) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    try {
      setIsRecording(true);
      setIsListening(true);
      setTranscript('');
      setShowConfirmation(false);
      setExtractedDetails(null);
      recognition.start();
      
      // Set a timeout to stop recording after 30 seconds
      const timeout = setTimeout(() => {
        console.log('Recording timeout reached, stopping...');
        stopRecording();
      }, 30000); // 30 seconds
      
      setRecordingTimeout(timeout);
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setIsRecording(false);
      setIsListening(false);
    }
  };

  const stopRecording = () => {
    if (recognition && isListening) {
      try {
        recognition.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
    
    // Clear the timeout
    if (recordingTimeout) {
      clearTimeout(recordingTimeout);
      setRecordingTimeout(null);
    }
    
    setIsRecording(false);
    setIsListening(false);
  };

  const handleSubmit = () => {
    if (parsedRequest) {
      onRequestSubmit(parsedRequest);
    }
  };

  const handleConfirmDetails = () => {
    if (extractedDetails && parsedRequest) {
      setShowConfirmation(false);
      onRequestSubmit(parsedRequest);
    }
  };

  const handleEditDetails = () => {
    setShowConfirmation(false);
    setIsEditing(true);
  };

  const handleReRecord = () => {
    setShowConfirmation(false);
    setText('');
    setTranscript('');
    setExtractedDetails(null);
    setParsedRequest(null);
    if (recognition) {
      startRecording();
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    setIsEditing(false);
    if (text.trim()) {
      handleTextChange(text);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (parsedRequest) {
      setText(parsedRequest.serviceTypes.join(', ') + ' for ' + parsedRequest.eventType);
    }
  };

  const formatBudget = (budget: { min: number; max: number; currency: string }) => {
    const formatAmount = (amount: number) => {
      if (amount >= 100000) {
        return `₹${(amount / 100000).toFixed(1)}L`;
      } else if (amount >= 1000) {
        return `₹${(amount / 1000).toFixed(0)}K`;
      }
      return `₹${amount}`;
    };

    if (budget.min === budget.max) {
      return formatAmount(budget.min);
    }
    return `${formatAmount(budget.min)} - ${formatAmount(budget.max)}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Main Input Card */}
      <Card className="border-2 border-orange-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
          <CardTitle className="text-2xl font-bold text-orange-800 flex items-center gap-2">
            <Volume2 className="h-6 w-6" />
            Tell us what you need - in your own words!
          </CardTitle>
          <p className="text-orange-600">
            Describe your event requirements naturally. We'll understand and find the perfect vendors for you.
          </p>
          
          {/* Language Selection */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Languages className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-700">Voice Language:</span>
            </div>
            <div className="flex gap-2">
              {[
                { value: 'auto', label: 'Auto Detect', flag: '🌐' },
                { value: 'en-IN', label: 'English', flag: '🇮🇳' },
                { value: 'te-IN', label: 'Telugu', flag: '🇮🇳' }
              ].map((lang) => (
                <Button
                  key={lang.value}
                  variant={selectedLanguage === lang.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedLanguage(lang.value as any)}
                  className={`text-xs ${selectedLanguage === lang.value ? 'bg-orange-500 text-white' : 'border-orange-300 text-orange-700 hover:bg-orange-50'}`}
                >
                  {lang.flag} {lang.label}
                </Button>
              ))}
            </div>
          </div>

          {isRecording && (
            <div className="flex items-center gap-2 text-red-600 font-medium mt-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span>Listening... Click the microphone to stop</span>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Text Input */}
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="E.g., 'I need a wedding photographer and makeup artist for my wedding on 15th March in Hyderabad, budget around 1 lakh'"
                className="min-h-[120px] text-lg pr-20"
                disabled={isLoading}
              />
              
              {/* Voice Recording Button */}
              <div className="absolute bottom-3 right-3 flex gap-2">
                {!isRecording ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={startRecording}
                    disabled={isLoading}
                    className="bg-white hover:bg-gray-50 border-orange-300 hover:border-orange-400"
                    title="Start voice recording"
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={stopRecording}
                    className="animate-pulse bg-red-500 hover:bg-red-600"
                    title="Stop voice recording"
                  >
                    <MicOff className="h-4 w-4" />
                  </Button>
                )}
                
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!parsedRequest || isLoading}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Voice Transcript */}
            {transcript && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-700">
                  <strong>Listening:</strong> {transcript}
                </p>
              </div>
            )}

            {/* Processing Indicator */}
            {isProcessing && (
              <div className="flex items-center gap-2 text-orange-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Understanding your request...</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Parsed Request Display */}
      {parsedRequest && (
        <Card className="border-2 border-green-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-green-800 flex items-center gap-2">
                <Check className="h-5 w-5" />
                We understood your request!
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  className="text-green-700 border-green-300 hover:bg-green-50"
                >
                  <Edit3 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {isEditing ? (
              <div className="space-y-4">
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveEdit}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Service Types */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Services Needed:</h4>
                  <div className="flex flex-wrap gap-2">
                    {parsedRequest.serviceTypes.map((service, index) => (
                      <Badge key={index} variant="secondary" className="bg-orange-100 text-orange-800">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Event Type */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Event Type:</h4>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">
                    {parsedRequest.eventType}
                  </Badge>
                </div>

                {/* Location */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Location:</h4>
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    {parsedRequest.location}
                  </Badge>
                </div>

                {/* Budget */}
                {parsedRequest.budgetRange && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Budget:</h4>
                    <Badge variant="outline" className="bg-purple-100 text-purple-800">
                      {formatBudget(parsedRequest.budgetRange)}
                    </Badge>
                  </div>
                )}

                {/* Date */}
                {parsedRequest.eventDate && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Event Date:</h4>
                    <Badge variant="outline" className="bg-indigo-100 text-indigo-800">
                      {new Date(parsedRequest.eventDate).toLocaleDateString()}
                    </Badge>
                  </div>
                )}

                {/* Gender Preference */}
                {parsedRequest.genderPreference && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Gender Preference:</h4>
                    <Badge variant="outline" className="bg-pink-100 text-pink-800">
                      {parsedRequest.genderPreference}
                    </Badge>
                  </div>
                )}

                {/* Additional Requirements */}
                {parsedRequest.additionalRequirements && parsedRequest.additionalRequirements.length > 0 && (
                  <div className="md:col-span-2">
                    <h4 className="font-semibold text-gray-700 mb-2">Additional Requirements:</h4>
                    <div className="flex flex-wrap gap-2">
                      {parsedRequest.additionalRequirements.map((req, index) => (
                        <Badge key={index} variant="outline" className="bg-gray-100 text-gray-800">
                          {req}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Voice Confirmation Modal */}
      {showConfirmation && extractedDetails && (
        <Card className="border-2 border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="text-xl font-bold text-blue-800 flex items-center gap-2">
              <Check className="h-5 w-5" />
              Please confirm your request details
            </CardTitle>
            <p className="text-blue-600 text-sm">
              We've extracted the following information from your voice input. Please review and confirm.
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Original Text */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Original voice input:</p>
                <p className="text-gray-800 italic">"{extractedDetails.originalText}"</p>
              </div>

              {/* Extracted Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-gray-700">Event Type:</span>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      {extractedDetails.eventType}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-600" />
                    <span className="font-medium text-gray-700">Services:</span>
                    <div className="flex flex-wrap gap-1">
                      {extractedDetails.services.map((service: string, index: number) => (
                        <Badge key={index} variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-gray-700">Budget:</span>
                    {extractedDetails.budget ? (
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        ₹{extractedDetails.budget.min.toLocaleString()} - ₹{extractedDetails.budget.max.toLocaleString()}
                      </Badge>
                    ) : (
                      <span className="text-gray-500 text-sm">Not specified</span>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-indigo-600" />
                    <span className="font-medium text-gray-700">Duration:</span>
                    <span className="text-sm text-gray-600">{extractedDetails.duration}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-600" />
                    <span className="font-medium text-gray-700">Location:</span>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      {extractedDetails.location}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-600" />
                    <span className="font-medium text-gray-700">Guest Count:</span>
                    <span className="text-sm text-gray-600">{extractedDetails.guestCount}</span>
                  </div>
                </div>
              </div>

              {/* Additional Requirements */}
              {extractedDetails.additionalRequirements && extractedDetails.additionalRequirements.length > 0 && (
                <div>
                  <span className="font-medium text-gray-700">Additional Requirements:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {extractedDetails.additionalRequirements.map((req: string, index: number) => (
                      <Badge key={index} variant="outline" className="bg-gray-100 text-gray-800 text-xs">
                        {req}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Errors for incomplete requests */}
              {extractedDetails.isIncomplete && extractedDetails.errors && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-yellow-800 font-medium text-sm mb-2">Some information is missing:</p>
                  <ul className="text-yellow-700 text-sm space-y-1">
                    {extractedDetails.errors.map((error: string, index: number) => (
                      <li key={index} className="flex items-center gap-2">
                        <X className="h-3 w-3" />
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={handleConfirmDetails}
                  className="bg-green-500 hover:bg-green-600 text-white flex-1"
                  disabled={!parsedRequest}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Confirm & Find Vendors
                </Button>
                <Button
                  onClick={handleEditDetails}
                  variant="outline"
                  className="border-orange-300 text-orange-700 hover:bg-orange-50"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Details
                </Button>
                <Button
                  onClick={handleReRecord}
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  <Mic className="h-4 w-4 mr-2" />
                  Re-record
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Examples */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg text-gray-700">Need inspiration? Try these examples:</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              "Wedding photographer and makeup artist for 15th March in Hyderabad, budget 1 lakh",
              "Birthday decoration for my daughter's 5th birthday next week in Bangalore",
              "Corporate event planner for our annual conference in Mumbai, 200 guests",
              "DJ and lighting for wedding reception on 20th April in Chennai"
            ].map((example, index) => (
              <Button
                key={index}
                variant="outline"
                className="text-left justify-start h-auto p-3 text-sm hover:bg-orange-50 hover:border-orange-200"
                onClick={() => {
                  setText(example);
                  handleTextChange(example);
                }}
              >
                {example}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartRequestInput;
