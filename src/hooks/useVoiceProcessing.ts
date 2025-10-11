import { useState, useCallback, useRef } from 'react';
import { processVoiceInput, validateAndEnhanceData, VoiceExtractedData } from '../services/voiceProcessingService';

interface UseVoiceProcessingReturn {
  isListening: boolean;
  transcript: string;
  extractedData: VoiceExtractedData | null;
  startListening: () => void;
  stopListening: () => void;
  processTranscript: (text: string) => VoiceExtractedData;
  clearData: () => void;
  error: string | null;
}

export const useVoiceProcessing = (): UseVoiceProcessingReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [extractedData, setExtractedData] = useState<VoiceExtractedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Speech Recognition
  const initializeSpeechRecognition = useCallback(() => {
    if (typeof window === 'undefined') return null;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser');
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN'; // Indian English
    recognition.maxAlternatives = 1;

    return recognition;
  }, []);

  // Process transcript and extract structured data
  const processTranscript = useCallback((text: string): VoiceExtractedData => {
    console.log('🎤 Processing voice transcript:', text);
    
    const rawData = processVoiceInput(text);
    const enhancedData = validateAndEnhanceData(rawData);
    
    console.log('📊 Extracted voice data:', enhancedData);
    
    return enhancedData;
  }, []);

  // Start listening for voice input
  const startListening = useCallback(() => {
    if (isListening) return;

    setError(null);
    setTranscript('');
    setExtractedData(null);

    const recognition = initializeSpeechRecognition();
    if (!recognition) return;

    recognitionRef.current = recognition;

    recognition.onstart = () => {
      console.log('🎤 Voice recognition started');
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const currentTranscript = finalTranscript || interimTranscript;
      setTranscript(currentTranscript);

      // Process final results
      if (finalTranscript) {
        const extracted = processTranscript(finalTranscript);
        setExtractedData(extracted);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('🎤 Speech recognition error:', event.error);
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      console.log('🎤 Voice recognition ended');
      setIsListening(false);
    };

    // Auto-stop after 10 seconds of silence
    timeoutRef.current = setTimeout(() => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }, 10000);

    try {
      recognition.start();
    } catch (err) {
      console.error('🎤 Failed to start speech recognition:', err);
      setError('Failed to start voice recognition');
    }
  }, [isListening, initializeSpeechRecognition, processTranscript]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    setIsListening(false);
  }, []);

  // Clear all data
  const clearData = useCallback(() => {
    setTranscript('');
    setExtractedData(null);
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    extractedData,
    startListening,
    stopListening,
    processTranscript,
    clearData,
    error
  };
};

export default useVoiceProcessing;
