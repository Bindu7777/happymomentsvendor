// Voice Integration Service
// Connects voice processing with existing vendor filtering and navigation

import { VoiceExtractedData } from './voiceProcessingService';
import { useNavigate } from 'react-router-dom';

export interface VoiceFilterData {
  serviceType: string;
  location: string;
  budget: string;
  rawData: VoiceExtractedData;
}

/**
 * Convert voice extracted data to vendor search parameters
 */
export const convertVoiceDataToSearchParams = (data: VoiceExtractedData): VoiceFilterData => {
  const filters: VoiceFilterData = {
    serviceType: 'all',
    location: 'all',
    budget: 'all',
    rawData: data
  };

  // Map service type
  if (data.serviceType) {
    filters.serviceType = data.serviceType;
  }

  // Map location (prefer state over city)
  if (data.state) {
    filters.location = data.state;
  } else if (data.city) {
    // Try to get state from city
    const state = getStateFromCityName(data.city);
    filters.location = state || data.city;
  }

  // Map budget
  if (data.budgetRange) {
    filters.budget = data.budgetRange;
  }

  return filters;
};

/**
 * Get state from city name (helper function)
 */
const getStateFromCityName = (cityName: string): string | null => {
  const cityStateMap: Record<string, string> = {
    'hyderabad': 'telangana',
    'bangalore': 'karnataka',
    'bengaluru': 'karnataka',
    'chennai': 'tamil-nadu',
    'mumbai': 'maharashtra',
    'delhi': 'delhi',
    'kolkata': 'west-bengal',
    'pune': 'maharashtra',
    'ahmedabad': 'gujarat',
    'jaipur': 'rajasthan',
    'lucknow': 'uttar-pradesh',
    'kanpur': 'uttar-pradesh',
    'nagpur': 'maharashtra',
    'indore': 'madhya-pradesh',
    'bhopal': 'madhya-pradesh',
    'visakhapatnam': 'andhra-pradesh',
    'patna': 'bihar',
    'vadodara': 'gujarat',
    'ludhiana': 'punjab',
    'agra': 'uttar-pradesh',
    'nashik': 'maharashtra',
    'faridabad': 'haryana',
    'meerut': 'uttar-pradesh',
    'rajkot': 'gujarat',
    'kalyan': 'maharashtra',
    'varanasi': 'uttar-pradesh',
    'srinagar': 'jammu-kashmir',
    'aurangabad': 'maharashtra',
    'noida': 'uttar-pradesh',
    'solapur': 'maharashtra',
    'ranchi': 'jharkhand',
    'howrah': 'west-bengal',
    'coimbatore': 'tamil-nadu',
    'raipur': 'chhattisgarh',
    'jabalpur': 'madhya-pradesh',
    'gwalior': 'madhya-pradesh',
    'madurai': 'tamil-nadu',
    'mysore': 'karnataka',
    'mysuru': 'karnataka',
    'tiruchirapalli': 'tamil-nadu',
    'bhubaneswar': 'odisha',
    'kochi': 'kerala',
    'bhavnagar': 'gujarat',
    'salem': 'tamil-nadu',
    'warangal': 'telangana',
    'guntur': 'andhra-pradesh'
  };

  return cityStateMap[cityName.toLowerCase()] || null;
};

/**
 * Navigate to vendors page with voice-extracted filters
 */
export const navigateToVendorsWithVoiceFilters = (
  filters: VoiceFilterData,
  navigate: ReturnType<typeof useNavigate>
) => {
  const params = new URLSearchParams();
  
  if (filters.serviceType !== 'all') {
    params.append('service', filters.serviceType);
  }
  
  if (filters.location !== 'all') {
    params.append('location', filters.location);
  }
  
  if (filters.budget !== 'all') {
    params.append('budget', filters.budget);
  }

  // Add voice search indicator
  params.append('voice', 'true');
  params.append('confidence', filters.rawData.confidence.toString());

  const queryString = params.toString();
  navigate(`/vendors${queryString ? `?${queryString}` : ''}`);
};

/**
 * Generate search summary from voice data
 */
export const generateVoiceSearchSummary = (data: VoiceExtractedData): string => {
  const parts: string[] = [];

  if (data.serviceType) {
    const serviceName = data.serviceType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    parts.push(serviceName);
  }

  if (data.city || data.state) {
    const location = data.city && data.state 
      ? `${data.city}, ${data.state}` 
      : (data.city || data.state);
    parts.push(`in ${location}`);
  }

  if (data.budgetValue) {
    parts.push(`with budget ₹${data.budgetValue.toLocaleString()}`);
  }

  return parts.join(' ');
};

/**
 * Validate voice extracted data quality
 */
export const validateVoiceDataQuality = (data: VoiceExtractedData): {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
} => {
  const issues: string[] = [];
  const suggestions: string[] = [];

  // Check confidence level
  if (data.confidence < 0.3) {
    issues.push('Low confidence in voice recognition');
    suggestions.push('Try speaking more clearly and closer to the microphone');
  }

  // Check for missing essential information
  if (!data.serviceType && !data.state && !data.budgetRange) {
    issues.push('No clear service, location, or budget detected');
    suggestions.push('Try saying something like "I need a photographer in Hyderabad with a budget of fifty thousand"');
  }

  // Check for incomplete location information
  if (data.city && !data.state) {
    const state = getStateFromCityName(data.city);
    if (!state) {
      issues.push('Could not determine state from city name');
      suggestions.push('Try mentioning the state name as well');
    }
  }

  // Check for budget range issues
  if (data.budgetValue && data.budgetValue < 10000) {
    issues.push('Budget seems too low for most event services');
    suggestions.push('Consider increasing your budget or specifying if this is for a specific service');
  }

  if (data.budgetValue && data.budgetValue > 10000000) {
    issues.push('Budget seems unusually high');
    suggestions.push('Please verify the budget amount');
  }

  return {
    isValid: issues.length === 0 && data.confidence >= 0.3,
    issues,
    suggestions
  };
};

/**
 * Enhance voice data with additional context
 */
export const enhanceVoiceData = (data: VoiceExtractedData): VoiceExtractedData => {
  const enhanced = { ...data };

  // If we have a city but no state, try to find the state
  if (enhanced.city && !enhanced.state) {
    const state = getStateFromCityName(enhanced.city);
    if (state) {
      enhanced.state = state;
    }
  }

  // If we have a budget value but no range, classify it
  if (enhanced.budgetValue && !enhanced.budgetRange) {
    enhanced.budgetRange = classifyBudgetValue(enhanced.budgetValue);
  }

  return enhanced;
};

/**
 * Classify budget value into range (helper function)
 */
const classifyBudgetValue = (value: number): string => {
  if (value >= 10000 && value <= 50000) return '10k-50k';
  if (value > 50000 && value <= 100000) return '50k-1l';
  if (value > 100000 && value <= 300000) return '1l-3l';
  if (value > 300000 && value <= 1000000) return '3l-10l';
  if (value > 1000000 && value <= 1500000) return '10l-15l';
  if (value > 1500000 && value <= 2500000) return '15l-25l';
  if (value > 2500000 && value <= 5000000) return '25l-50l';
  if (value > 5000000 && value <= 10000000) return '50l-1cr';
  return '10k-50k'; // Default
};

/**
 * Get user-friendly error messages for voice processing
 */
export const getVoiceProcessingErrorMessages = (error: string): {
  title: string;
  message: string;
  suggestion: string;
} => {
  const errorMap: Record<string, { title: string; message: string; suggestion: string }> = {
    'not-allowed': {
      title: 'Microphone Access Denied',
      message: 'Please allow microphone access to use voice search.',
      suggestion: 'Click the microphone icon in your browser\'s address bar and allow access.'
    },
    'no-speech': {
      title: 'No Speech Detected',
      message: 'We didn\'t hear anything. Please try speaking again.',
      suggestion: 'Make sure you\'re speaking clearly and your microphone is working.'
    },
    'audio-capture': {
      title: 'Audio Capture Failed',
      message: 'Unable to access your microphone.',
      suggestion: 'Please check your microphone connection and browser permissions.'
    },
    'network': {
      title: 'Network Error',
      message: 'Unable to process voice input due to network issues.',
      suggestion: 'Please check your internet connection and try again.'
    }
  };

  return errorMap[error] || {
    title: 'Voice Recognition Error',
    message: 'An unexpected error occurred while processing your voice input.',
    suggestion: 'Please try speaking again or use the text search instead.'
  };
};

export default {
  convertVoiceDataToSearchParams,
  navigateToVendorsWithVoiceFilters,
  generateVoiceSearchSummary,
  validateVoiceDataQuality,
  enhanceVoiceData,
  getVoiceProcessingErrorMessages
};
