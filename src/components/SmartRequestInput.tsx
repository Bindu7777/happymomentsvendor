import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Loader2, Edit3, Check, X, Volume2 } from 'lucide-react';
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
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-IN';

      recognitionInstance.onstart = () => {
        setIsListening(true);
        setTranscript('');
      };

      recognitionInstance.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript + interimTranscript);
        
        if (finalTranscript) {
          setText(finalTranscript);
          handleTextChange(finalTranscript);
        }
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
        setIsRecording(false);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setIsRecording(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

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
          } else {
            setParsedRequest(null);
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

    setIsRecording(true);
    recognition.start();
  };

  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
    }
    setIsRecording(false);
  };

  const handleSubmit = () => {
    if (parsedRequest) {
      onRequestSubmit(parsedRequest);
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
                    className="bg-white hover:bg-gray-50"
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={stopRecording}
                    className="animate-pulse"
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
