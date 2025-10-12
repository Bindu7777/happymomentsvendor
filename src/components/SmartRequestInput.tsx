import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Send, Loader2, Edit3, Check, X, Volume2, Languages, Clock, Users, DollarSign, Trash2 } from 'lucide-react';
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
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [extractedDetails, setExtractedDetails] = useState<any>(null);
  const [enhancedEntities, setEnhancedEntities] = useState<ExtractedEntities | null>(null);
  const [audioProcessingResult, setAudioProcessingResult] = useState<any>(null);
  
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
      
      // Debounce the parsing
      const timeoutId = setTimeout(async () => {
        try {
          // Use our improved voice processing service
          const voiceResult = processVoiceInput(newText);
          
          // Convert voice processing result to legacy format for compatibility
          const parsed = parseRequest(newText);
          
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
          
          const validation = validateParsedRequest(parsed);
          
          if (validation.isValid) {
            setParsedRequest(parsed);
            onRequestParsed(parsed);
            
            // Show confirmation UI for both voice and text input
            // Track voice search when it's processed
            if (isRecording || transcript) {
              await trackVoiceSearch(newText, voiceResult);
            }
            
            setExtractedDetails({
              eventType: parsed.eventType || 'Not specified',
              services: voiceResult.serviceType ? [voiceResult.serviceType] : parsed.serviceTypes || [],
              budget: voiceResult.budgetRange || parsed.budgetRange || 'Not specified',
              location: voiceResult.state || voiceResult.city || parsed.location || 'Not specified',
              duration: parsed.duration || 'Not specified',
              guestCount: parsed.guestCount || 'Not specified',
              additionalRequirements: parsed.additionalRequirements || [],
              confidence: voiceResult.confidence,
              language: 'en',
              originalText: newText
            });
            setShowConfirmation(true);
          } else {
            setParsedRequest(null);
            // Show partial results even if incomplete
            setExtractedDetails({
              eventType: parsed.eventType || 'Not specified',
              services: voiceResult.serviceType ? [voiceResult.serviceType] : parsed.serviceTypes || [],
              budget: voiceResult.budgetRange || parsed.budgetRange || 'Not specified',
              location: voiceResult.state || voiceResult.city || parsed.location || 'Not specified',
              duration: parsed.duration || 'Not specified',
              guestCount: parsed.guestCount || 'Not specified',
              additionalRequirements: parsed.additionalRequirements || [],
              confidence: voiceResult.confidence,
              language: 'en',
              originalText: newText,
              isIncomplete: true,
              errors: validation.errors
            });
            setShowConfirmation(true);
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
      onRequestSubmit(parsedRequest);
    }
  };

  const navigateToVendors = () => {
    if (!extractedDetails && !parsedRequest) return;
    
    // Build URL parameters from extracted details or parsed request
    const params = new URLSearchParams();
    
    if (extractedDetails) {
      // Use voice processing results
      if (extractedDetails.services && extractedDetails.services.length > 0) {
        // Map service type to the format expected by vendors page
        const serviceMap: Record<string, string> = {
          'photography': 'photography',
          'makeup': 'makeup',
          'decor': 'decor',
          'catering': 'catering',
          'venues': 'venues',
          'music': 'music',
          'attire': 'attire',
          'planning': 'planning'
        };
        const serviceType = extractedDetails.services[0];
        if (serviceMap[serviceType]) {
          params.append('service', serviceMap[serviceType]);
        }
      }
      
      if (extractedDetails.location && extractedDetails.location !== 'Not specified') {
        // Map location to the format expected by vendors page
        const locationMap: Record<string, string> = {
          'telangana': 'telangana',
          'andhra pradesh': 'andhra-pradesh',
          'tamil nadu': 'tamil-nadu',
          'karnataka': 'karnataka',
          'maharashtra': 'maharashtra',
          'kerala': 'kerala',
          'delhi': 'delhi',
          'punjab': 'punjab',
          'rajasthan': 'rajasthan',
          'gujarat': 'gujarat',
          'west bengal': 'west-bengal',
          'uttar pradesh': 'uttar-pradesh'
        };
        const location = extractedDetails.location.toLowerCase();
        if (locationMap[location]) {
          params.append('location', locationMap[location]);
        }
      }
      
      if (extractedDetails.budget && extractedDetails.budget !== 'Not specified') {
        // Map budget to the format expected by vendors page
        const budgetMap: Record<string, string> = {
          '₹10K - ₹50K': '10k-50k',
          '₹50K - ₹1L': '50k-1l',
          '₹1L - ₹3L': '1l-3l',
          '₹3L - ₹10L': '3l-10l',
          '₹10L - ₹15L': '10l-15l',
          '₹15L - ₹25L': '15l-25l',
          '₹25L - ₹50L': '25l-50l',
          '₹50L - ₹1CR': '50l-1cr'
        };
        if (budgetMap[extractedDetails.budget]) {
          params.append('budget', budgetMap[extractedDetails.budget]);
        }
      }
    } else if (parsedRequest) {
      // Use parsed request results
      if (parsedRequest.serviceTypes && parsedRequest.serviceTypes.length > 0) {
        const serviceMap: Record<string, string> = {
          'photography': 'photography',
          'makeup': 'makeup',
          'decor': 'decor',
          'catering': 'catering',
          'venues': 'venues',
          'music': 'music',
          'attire': 'attire',
          'planning': 'planning'
        };
        const serviceType = parsedRequest.serviceTypes[0];
        if (serviceMap[serviceType]) {
          params.append('service', serviceMap[serviceType]);
        }
      }
      
      if (parsedRequest.location) {
        const locationMap: Record<string, string> = {
          'telangana': 'telangana',
          'andhra pradesh': 'andhra-pradesh',
          'tamil nadu': 'tamil-nadu',
          'karnataka': 'karnataka',
          'maharashtra': 'maharashtra',
          'kerala': 'kerala',
          'delhi': 'delhi',
          'punjab': 'punjab',
          'rajasthan': 'rajasthan',
          'gujarat': 'gujarat',
          'west bengal': 'west-bengal',
          'uttar pradesh': 'uttar-pradesh'
        };
        const location = parsedRequest.location.toLowerCase();
        if (locationMap[location]) {
          params.append('location', locationMap[location]);
        }
      }
      
      if (parsedRequest.budgetRange) {
        const budgetMap: Record<string, string> = {
          '10k-50k': '10k-50k',
          '50k-1l': '50k-1l',
          '1l-3l': '1l-3l',
          '3l-10l': '3l-10l',
          '10l-15l': '10l-15l',
          '15l-25l': '15l-25l',
          '25l-50l': '25l-50l',
          '50l-1cr': '50l-1cr'
        };
        if (budgetMap[parsedRequest.budgetRange]) {
          params.append('budget', budgetMap[parsedRequest.budgetRange]);
        }
      }
    }
    
    // Navigate to vendors page with parameters
    const url = `/vendors?${params.toString()}`;
    console.log('Navigating to vendors page with URL:', url);
    navigate(url);
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

  const handleClearInput = () => {
    setText('');
    setTranscript('');
    setExtractedDetails(null);
    setParsedRequest(null);
    setShowConfirmation(false);
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
                
                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t mt-4">
                  <Button
                    onClick={navigateToVendors}
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
              We've extracted the following information from your input. Please review and confirm.
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Original Text */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Original input:</p>
                <p className="text-gray-800 italic">"{extractedDetails.originalText}"</p>
              </div>

              {/* Enhanced Extracted Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-gray-700">Event Type:</span>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      {extractedDetails.eventType}
                    </Badge>
                    {extractedDetails.confidence && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-600 text-xs">
                        {Math.round(extractedDetails.confidence * 100)}% confidence
                      </Badge>
                    )}
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
                    {extractedDetails.budget && extractedDetails.budget !== 'Not specified' ? (
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        {formatBudget(extractedDetails.budget)}
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

                  {/* Language Detection */}
                  {extractedDetails.language && (
                    <div className="flex items-center gap-2">
                      <Languages className="h-4 w-4 text-indigo-600" />
                      <span className="font-medium text-gray-700">Language:</span>
                      <Badge variant="outline" className="bg-indigo-100 text-indigo-800">
                        {extractedDetails.language === 'en' ? 'English' : 
                         extractedDetails.language === 'te' ? 'Telugu' : 'Mixed'}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Enhanced Preferences */}
              {extractedDetails.preferences && Object.keys(extractedDetails.preferences).length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-700 mb-2">Preferences:</h4>
                  <div className="flex flex-wrap gap-2">
                    {extractedDetails.preferences.gender && (
                      <Badge variant="outline" className="bg-pink-100 text-pink-800">
                        Gender: {extractedDetails.preferences.gender}
                      </Badge>
                    )}
                    {extractedDetails.preferences.experience && (
                      <Badge variant="outline" className="bg-purple-100 text-purple-800">
                        Experience: {extractedDetails.preferences.experience}
                      </Badge>
                    )}
                    {extractedDetails.preferences.style && extractedDetails.preferences.style.length > 0 && (
                      extractedDetails.preferences.style.map((style: string, index: number) => (
                        <Badge key={index} variant="outline" className="bg-yellow-100 text-yellow-800">
                          Style: {style}
                        </Badge>
                      ))
                    )}
                    {extractedDetails.preferences.urgency && (
                      <Badge variant="outline" className="bg-red-100 text-red-800">
                        Urgency: {extractedDetails.preferences.urgency.replace('_', ' ')}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

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
                  onClick={navigateToVendors}
                  className="bg-green-500 hover:bg-green-600 text-white flex-1"
                  disabled={!extractedDetails || (!extractedDetails.services || extractedDetails.services.length === 0)}
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
                <Button
                  onClick={handleClearInput}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
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
