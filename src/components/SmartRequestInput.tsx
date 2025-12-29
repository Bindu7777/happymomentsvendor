import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Send, Loader2, Edit3, Check, X, Volume2, Languages, Clock, Users, DollarSign, Trash2, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { parseRequest, validateParsedRequest, ParsedRequest } from '../services/requestParser';
import { processVoiceInput, VoiceExtractedData } from '../services/voiceProcessingService';
import { createVendorFilterCriteria, searchVendorsWithFilters } from '../services/enhancedVendorFiltering';
import { useSearchTracking } from '../hooks/use-search-tracking';

interface SmartRequestInputProps {
  onRequestParsed: (request: ParsedRequest) => void;
  onRequestSubmit: (request: ParsedRequest) => void;
  onEntitiesExtracted?: (entities: ExtractedEntities) => void;
  isLoading?: boolean;
}

const SmartRequestInput: React.FC<SmartRequestInputProps> = ({
  onRequestParsed,
  onRequestSubmit,
  onEntitiesExtracted,
  isLoading = false
}) => {
  const navigate = useNavigate();
  const { trackVoiceSearch } = useSearchTracking();
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
  const [enhancedEntities, setEnhancedEntities] = useState<ExtractedEntities | null>(null);
  const [audioProcessingResult, setAudioProcessingResult] = useState<any>(null);
  const [isCardMinimized, setIsCardMinimized] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Process transcript to improve accuracy and handle mixed languages
  const processTranscript = (transcript: string): string => {
    let processed = transcript.toLowerCase().trim();
    
    // Common Telugu to English mappings for better understanding
    const teluguMappings: { [key: string]: string } = {
      'kavali': 'need',
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
      'people': 'people',
      // Enhanced mappings for better extraction
      'naaku': 'i need',
      'aravai': 'good',
      'velu': 'good',
      'manchi': 'good',
      'event planner': 'event planner',
      'planner': 'planner',
      'within': 'within',
      'budgetw': 'budget', // Speech recognition error correction
      'budget': 'budget',
      // Special handling for mixed service + budget phrases
      'uplakshya': 'within budget',
      // Telugu number mappings
      'oka': '1',
      'rendu': '2',
      'moodu': '3',
      'naalugu': '4',
      'aidhu': '5',
      'aaru': '6',
      'eedhu': '7',
      'enimidi': '8',
      'thommidhi': '9',
      'padi': '10',
      'iravai': '20',
      'muppai': '30',
      'nalabhai': '40',
      'aidabhai': '50',
      'aaruvaai': '60',
      'eedabhai': '70',
      'enabhai': '80',
      'thombhai': '90',
      'vanda': '100',
      'laksha': 'lakh',
      'oka laksha': '1 lakh',
      'rendu laksha': '2 lakh',
      'moodu laksha': '3 lakh',
      'naalugu laksha': '4 lakh',
      'aidhu laksha': '5 lakh',
      'aaru laksha': '6 lakh',
      'eedhu laksha': '7 lakh',
      'enimidi laksha': '8 lakh',
      'thommidhi laksha': '9 lakh',
      'padi laksha': '10 lakh',
      'koti': 'crore',
      'oka koti': '1 crore',
      'rendu koti': '2 crore',
      'moodu koti': '3 crore',
      'hyderabad': 'hyderabad',
      'telangana': 'telangana',
      'bangalore': 'bangalore',
      'chennai': 'chennai',
      'mumbai': 'mumbai',
      'delhi': 'delhi',
      'kolkata': 'kolkata',
      'pune': 'pune',
      'ahmedabad': 'ahmedabad',
      'jaipur': 'jaipur',
      'lucknow': 'lucknow',
      'kanpur': 'kanpur',
      'nagpur': 'nagpur',
      'indore': 'indore',
      'thane': 'thane',
      'bhopal': 'bhopal',
      'visakhapatnam': 'visakhapatnam',
      'vijayawada': 'vijayawada',
      'guntur': 'guntur',
      'warangal': 'warangal',
      'nellore': 'nellore',
      'kadapa': 'kadapa',
      'kurnool': 'kurnool',
      'tirupati': 'tirupati',
      'anantapur': 'anantapur',
      'karimnagar': 'karimnagar',
      'nizamabad': 'nizamabad',
      'khammam': 'khammam',
      'mahabubnagar': 'mahabubnagar',
      'nalgonda': 'nalgonda',
      'suryapet': 'suryapet',
      'miryalaguda': 'miryalaguda',
      'siddipet': 'siddipet',
      'jagtial': 'jagtial',
      'peddapalli': 'peddapalli',
      'kamareddy': 'kamareddy',
      'sangareddy': 'sangareddy',
      'medak': 'medak',
      'adilabad': 'adilabad',
      'asifabad': 'asifabad',
      'komaram bheem': 'komaram bheem',
      'mancherial': 'mancherial',
      'bhupalpally': 'bhupalpally',
      'mulugu': 'mulugu',
      'jayashankar': 'jayashankar',
      'bhadradri': 'bhadradri',
      'kothagudem': 'kothagudem',
      'yadadri': 'yadadri',
      'bhuvanagiri': 'bhuvanagiri',
      'rangareddy': 'rangareddy',
      'vikarabad': 'vikarabad',
      'medchal': 'medchal',
      'malkajgiri': 'malkajgiri',
      'secunderabad': 'secunderabad',
      'hyderabad': 'hyderabad'
    };

    // Replace Telugu phrases with English equivalents
    Object.entries(teluguMappings).forEach(([telugu, english]) => {
      const regex = new RegExp(telugu, 'gi');
      processed = processed.replace(regex, english);
    });

    // Special handling for mixed service + budget phrases
    // Fix cases like "photographer 1 lakh" being treated as location
    processed = processed
      .replace(/\bphotographer\s+(\d+)\s+(lakh|lakhs?)\b/gi, 'photographer budget $1 lakh')
      .replace(/\bphotographer\s+one\s+(lakh|lakhs?)\b/gi, 'photographer budget 1 lakh')
      .replace(/\bphotographer\s+oka\s+(lakh|lakhs?)\b/gi, 'photographer budget 1 lakh')
      .replace(/\b(makeup|decorator|catering|dj|music|venue|planner)\s+(\d+)\s+(lakh|lakhs?)\b/gi, '$1 budget $2 lakh')
      .replace(/\b(makeup|decorator|catering|dj|music|venue|planner)\s+(one|oka)\s+(lakh|lakhs?)\b/gi, '$1 budget 1 lakh')
      .replace(/\bbudget\s+lo\b/gi, 'budget')
      .replace(/\buplakshya\s+budget\b/gi, 'within budget')
      .replace(/\bbudget\s+within\b/gi, 'within budget');

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
      
      recognitionInstance.continuous = false; // Changed to false for better control
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = selectedLanguage === 'auto' ? 'en-IN' : selectedLanguage;
      recognitionInstance.maxAlternatives = 3; // Get multiple alternatives for better accuracy

      recognitionInstance.onstart = () => {
        console.log('Speech recognition started');
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
        setIsRecording(false); // Also set recording to false when recognition ends
        // Clear timeout when recognition naturally ends
        if (recordingTimeout) {
          clearTimeout(recordingTimeout);
          setRecordingTimeout(null);
        }
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setIsRecording(false);
        
        // Clear timeout on error
        if (recordingTimeout) {
          clearTimeout(recordingTimeout);
          setRecordingTimeout(null);
        }
        
        // Handle specific errors
        if (event.error === 'no-speech') {
          console.log('No speech detected, stopping recognition');
        } else if (event.error === 'audio-capture') {
          alert('Microphone not accessible. Please check your microphone permissions.');
        } else if (event.error === 'not-allowed') {
          alert('Microphone access denied. Please allow microphone access and try again.');
        } else if (event.error === 'aborted') {
          console.log('Speech recognition was aborted');
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

  const handleTextChange = async (newText: string) => {
    setText(newText);
    
    if (newText.trim().length > 10) {
      setIsProcessing(true);
      
      // Debounce the parsing - only parse, don't submit automatically
      const timeoutId = setTimeout(async () => {
        try {
          // Convert voice processing result to legacy format for compatibility
          const parsed = parseRequest(newText);
          
          // Always include the original text
          parsed.originalText = newText.trim();
          
          // Only use voice processing for actual voice input, not manual typing
          if (isRecording || transcript) {
            // Use our improved voice processing service only for voice input
            const voiceResult = processVoiceInput(newText);
            
            // Update parsed request with voice processing results
            if (voiceResult.serviceType) {
              parsed.serviceTypes = [voiceResult.serviceType];
            }
            if (voiceResult.state) {
              parsed.location = voiceResult.state;
            }
            if (voiceResult.budgetRange) {
              parsed.budgetRange = voiceResult.budgetRange;
            }
          }
          
          const validation = validateParsedRequest(parsed);
          
          if (validation.isValid) {
            setParsedRequest(parsed);
            onRequestParsed(parsed);
            
            // Track voice search when it's processed
            if (isRecording || transcript) {
              await trackVoiceSearch(newText, voiceResult);
            }
            
            // Only auto-submit for voice input, not manual typing
            if (isRecording || transcript) {
              onRequestSubmit(parsed);
            }
          } else {
            setParsedRequest(null);
            // For invalid requests, still try to submit with available data only for voice input
            if ((isRecording || transcript) && parsed.serviceTypes && parsed.serviceTypes.length > 0) {
              setParsedRequest(parsed);
              onRequestParsed(parsed);
              onRequestSubmit(parsed);
            }
          }
        } catch (error) {
          console.error('Error processing request:', error);
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
    console.log('Stopping recording...');
    
    // Clear the timeout first
    if (recordingTimeout) {
      clearTimeout(recordingTimeout);
      setRecordingTimeout(null);
    }
    
    // Stop recognition if it's running
    if (recognition && isListening) {
      try {
        recognition.stop();
        console.log('Speech recognition stopped successfully');
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
    
    // Always reset the states
    setIsRecording(false);
    setIsListening(false);
  };

  const handleSubmit = () => {
    if (parsedRequest) {
      // Ensure originalText is set from current text input
      const requestWithText = {
        ...parsedRequest,
        originalText: text.trim() || parsedRequest.originalText
      };
      onRequestSubmit(requestWithText);
    } else if (text.trim()) {
      // If parsing hasn't completed, try to parse now
      try {
        const parsed = parseRequest(text.trim());
        parsed.originalText = text.trim();
        setParsedRequest(parsed);
        onRequestParsed(parsed);
        onRequestSubmit(parsed);
      } catch (error) {
        console.error('Error parsing request on submit:', error);
        // Fallback: create a minimal request with just the text
        // The vendors page will parse it using parsePromptAndUpdateFilters
        const minimalRequest: ParsedRequest = {
          serviceTypes: [],
          eventType: '',
          location: '',
          originalText: text.trim()
        };
        onRequestSubmit(minimalRequest);
      }
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

  const handleClearInput = () => {
    setText('');
    setTranscript('');
    setParsedRequest(null);
    setIsEditing(false);
    setIsProcessing(false);
    // Clear the textarea focus
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (parsedRequest) {
      setText(parsedRequest.serviceTypes.join(', ') + ' for ' + parsedRequest.eventType);
    }
  };

  const formatBudget = (budget: { min: number; max: number; currency: string } | string) => {
    // Handle string format from voice processing service
    if (typeof budget === 'string') {
      // Convert budget range strings like "10k-50k" to display format
      switch (budget) {
        case '10k-50k':
          return '₹10K - ₹50K';
        case '50k-1l':
          return '₹50K - ₹1L';
        case '1l-3l':
          return '₹1L - ₹3L';
        case '3l-10l':
          return '₹3L - ₹10L';
        case '10l-15l':
          return '₹10L - ₹15L';
        case '15l-25l':
          return '₹15L - ₹25L';
        case '25l-50l':
          return '₹25L - ₹50L';
        case '50l-1cr':
          return '₹50L - ₹1CR';
        default:
          return budget; // Return as-is if not recognized
      }
    }

    // Handle object format (legacy)
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
          <div className="flex items-center justify-between mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Navigate to home page - force reload to reset Hero component state
                window.location.href = '/';
              }}
              className="text-orange-700 hover:text-orange-900 hover:bg-orange-100"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Home
            </Button>
          </div>
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder="E.g., 'I need a wedding photographer and makeup artist for my wedding on 15th March in Hyderabad, budget around 1 lakh'"
                className="min-h-[120px] text-lg pr-20"
                disabled={isLoading}
              />
              
              {/* Voice Recording Button */}
              <div className="absolute bottom-3 right-3 flex gap-2">
                {/* Clear Button */}
                {text && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleClearInput}
                    disabled={isLoading}
                    className="bg-white hover:bg-red-50 border-red-300 hover:border-red-400 text-red-600 hover:text-red-700"
                    title="Clear input"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                
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
                  disabled={!text.trim() || isLoading}
                  className="bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
                    onClick={() => setIsCardMinimized(!isCardMinimized)}
                    className="text-green-700 border-green-300 hover:bg-green-50"
                    title={isCardMinimized ? "Expand details" : "Minimize details"}
                  >
                    {isCardMinimized ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronUp className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEdit}
                    className="text-green-700 border-green-300 hover:bg-green-50"
                  >
                    <Edit3 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearInput}
                    className="text-red-700 border-red-300 hover:bg-red-50"
                    title="Close this summary"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
          </CardHeader>
          {!isCardMinimized && (
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
                  
                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t mt-4">
                    <Button
                      onClick={handleSubmit}
                      className="bg-orange-500 hover:bg-orange-600 text-white flex-1"
                      disabled={!parsedRequest || (!parsedRequest.serviceTypes || parsedRequest.serviceTypes.length === 0)}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Find Vendors
                    </Button>
                    <Button
                      onClick={handleEdit}
                      variant="outline"
                      className="border-orange-300 text-orange-700 hover:bg-orange-50"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      onClick={handleClearInput}
                      variant="outline"
                      className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          )}
          
          {/* Minimized state - show only action buttons */}
          {isCardMinimized && (
            <CardContent className="p-4">
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={handleSubmit}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                  disabled={!parsedRequest || (!parsedRequest.serviceTypes || parsedRequest.serviceTypes.length === 0)}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Find Vendors
                </Button>
                <Button
                  onClick={handleEdit}
                  variant="outline"
                  className="border-orange-300 text-orange-700 hover:bg-orange-50"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  onClick={handleClearInput}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      )}


    </div>
  );
};

export default SmartRequestInput;
