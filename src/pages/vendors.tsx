import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Phone, Mail, Instagram, Heart, MessageCircle, Camera, Award, Users, Zap, Clock, ChevronLeft, Search, Filter, SlidersHorizontal, TrendingUp, DollarSign, ChevronDown, ChevronUp, User, Shield, X, Mic, MicOff, Send, Loader2, Edit3, Check, Volume2, Languages, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Checkbox } from '../components/ui/checkbox';
import Header from '../components/layout/Header';
import LikeButton from '@/components/LikeButton';
import WhatsAppButton from '@/components/WhatsAppButton';
import VendorShortCard from '@/components/VendorShortCard';
import { Vendor } from '@/lib/supabase';
import { getAllVendors } from '@/services/supabaseService';
import { parseRequest, validateParsedRequest, ParsedRequest } from '../services/requestParser';
import { useVoiceProcessing } from '@/hooks/useVoiceProcessing';
import { getStateForLocation, findStateForLocation } from '../services/locationService';

// Local interface for parsed filter data
interface ParsedFilterData {
  serviceType: string;
  location: string;
  budget: string;
  originalQuery: string;
}


// Service types for dropdown
const serviceTypes = [
  { value: 'all', label: 'All Services' },
  { value: 'photography', label: 'Photography/Videography' },
  { value: 'makeup', label: 'Makeup Artist' },
  { value: 'decor', label: 'Decorator' },
  { value: 'catering', label: 'Caterer' },
  { value: 'venues', label: 'Venue' },
  { value: 'music', label: 'DJ/Music' },
  { value: 'attire', label: 'Clothing Designer' },
  { value: 'planning', label: 'Event Planner' },
];

// Budget ranges for dropdown
const budgetRanges = [
  { value: 'all', label: 'All Budgets' },
  { value: '10k-50k', label: '₹10,000 - ₹50,000' },
  { value: '50k-1l', label: '₹50,000 - ₹1L' },
  { value: '1l-3l', label: '₹1L - ₹3L' },
  { value: '3l-10l', label: '₹3L - ₹10L' },
  { value: '10l-15l', label: '₹10L - ₹15L' },
  { value: '15l-25l', label: '₹15L - ₹25L' },
  { value: '25l-50l', label: '₹25L - ₹50L' },
  { value: '50l-1cr', label: '₹50L - ₹1CR' },
];

// States for dropdown (matching the Hero component)
const cities = [
  { value: 'all', label: 'All Locations' },
  { value: 'andhra-pradesh', label: 'Andhra Pradesh' },
  { value: 'arunachal-pradesh', label: 'Arunachal Pradesh' },
  { value: 'assam', label: 'Assam' },
  { value: 'bihar', label: 'Bihar' },
  { value: 'chhattisgarh', label: 'Chhattisgarh' },
  { value: 'goa', label: 'Goa' },
  { value: 'gujarat', label: 'Gujarat' },
  { value: 'haryana', label: 'Haryana' },
  { value: 'himachal-pradesh', label: 'Himachal Pradesh' },
  { value: 'jharkhand', label: 'Jharkhand' },
  { value: 'karnataka', label: 'Karnataka' },
  { value: 'kerala', label: 'Kerala' },
  { value: 'madhya-pradesh', label: 'Madhya Pradesh' },
  { value: 'maharashtra', label: 'Maharashtra' },
  { value: 'manipur', label: 'Manipur' },
  { value: 'meghalaya', label: 'Meghalaya' },
  { value: 'mizoram', label: 'Mizoram' },
  { value: 'nagaland', label: 'Nagaland' },
  { value: 'odisha', label: 'Odisha' },
  { value: 'punjab', label: 'Punjab' },
  { value: 'rajasthan', label: 'Rajasthan' },
  { value: 'sikkim', label: 'Sikkim' },
  { value: 'tamil-nadu', label: 'Tamil Nadu' },
  { value: 'telangana', label: 'Telangana' },
  { value: 'tripura', label: 'Tripura' },
  { value: 'uttar-pradesh', label: 'Uttar Pradesh' },
  { value: 'uttarakhand', label: 'Uttarakhand' },
  { value: 'west-bengal', label: 'West Bengal' },
  { value: 'andaman-nicobar', label: 'Andaman and Nicobar Islands' },
  { value: 'chandigarh', label: 'Chandigarh' },
  { value: 'dadra-nagar-haveli', label: 'Dadra and Nagar Haveli' },
  { value: 'daman-diu', label: 'Daman and Diu' },
  { value: 'delhi', label: 'Delhi' },
  { value: 'jammu-kashmir', label: 'Jammu and Kashmir' },
  { value: 'ladakh', label: 'Ladakh' },
  { value: 'lakshadweep', label: 'Lakshadweep' },
  { value: 'puducherry', label: 'Puducherry' },
];

const VendorsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const topRef = useRef<HTMLDivElement>(null);
  
  // ULTIMATE FIX: Lock scroll position completely
  useEffect(() => {
    // Step 1: Disable browser scroll restoration
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    
    // Step 2: Remove hash
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    
    // Step 3: Lock body overflow to prevent ALL scrolling
    const originalOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    // Step 4: Force scroll to top
    const forceScrollToTop = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      if (topRef.current) {
        topRef.current.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
    };
    
    // Step 5: Disable smooth scroll
    const originalScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    
    // Step 6: Scroll immediately
    forceScrollToTop();
    
    // Step 7: MutationObserver to watch for ANY changes
    const observer = new MutationObserver(() => {
      if (window.scrollY !== 0 || document.documentElement.scrollTop !== 0) {
        forceScrollToTop();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
    observer.observe(document.documentElement, { attributes: true });
    
    // Step 8: Continuous scroll enforcement
    const scrollInterval = setInterval(() => {
      if (window.scrollY !== 0 || document.documentElement.scrollTop !== 0) {
        forceScrollToTop();
      }
    }, 1);
    
    // Step 9: Prevent ALL scroll-related events
    const preventAll = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      forceScrollToTop();
      return false;
    };
    
    const events = ['scroll', 'wheel', 'touchmove', 'touchstart', 'touchend', 'keydown', 'keyup'];
    events.forEach(evt => {
      window.addEventListener(evt, preventAll, { passive: false, capture: true });
      document.addEventListener(evt, preventAll, { passive: false, capture: true });
    });
    
    // Step 10: Prevent focus scroll
    const handleFocus = () => {
      setTimeout(forceScrollToTop, 0);
      setTimeout(forceScrollToTop, 10);
      setTimeout(forceScrollToTop, 50);
    };
    document.addEventListener('focusin', handleFocus, { capture: true });
    document.addEventListener('focus', handleFocus, { capture: true });
    
    // Step 11: Multiple RAF calls
    let rafId: number;
    const runRAF = () => {
      forceScrollToTop();
      rafId = requestAnimationFrame(runRAF);
    };
    runRAF();
    
    // Step 12: Cleanup after 15 seconds
    const cleanupTimeout = setTimeout(() => {
      clearInterval(scrollInterval);
      cancelAnimationFrame(rafId);
      observer.disconnect();
      document.body.style.overflow = originalOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.documentElement.style.scrollBehavior = originalScrollBehavior;
      events.forEach(evt => {
        window.removeEventListener(evt, preventAll, { capture: true });
        document.removeEventListener(evt, preventAll, { capture: true });
      });
      document.removeEventListener('focusin', handleFocus, { capture: true });
      document.removeEventListener('focus', handleFocus, { capture: true });
    }, 15000);
    
    return () => {
      clearInterval(scrollInterval);
      cancelAnimationFrame(rafId);
      observer.disconnect();
      clearTimeout(cleanupTimeout);
      document.body.style.overflow = originalOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.documentElement.style.scrollBehavior = originalScrollBehavior;
      events.forEach(evt => {
        window.removeEventListener(evt, preventAll, { capture: true });
        document.removeEventListener(evt, preventAll, { capture: true });
      });
      document.removeEventListener('focusin', handleFocus, { capture: true });
      document.removeEventListener('focus', handleFocus, { capture: true });
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'auto';
      }
    };
  }, []); // Only run on mount
  
  // Filter states - Multi-select arrays
  const [selectedServiceTypes, setSelectedServiceTypes] = useState<string[]>(() => {
    const serviceParam = searchParams.get('service');
    return serviceParam && serviceParam !== 'all' ? [serviceParam] : [];
  });
  const [selectedLocations, setSelectedLocations] = useState<string[]>(() => {
    const locationParam = searchParams.get('location');
    return locationParam && locationParam !== 'all' ? [locationParam] : [];
  });
  const [selectedBudgetRanges, setSelectedBudgetRanges] = useState<string[]>(() => {
    const budgetParam = searchParams.get('budget');
    return budgetParam && budgetParam !== 'all' ? [budgetParam] : [];
  });
  const [showCustomBudget, setShowCustomBudget] = useState(false);
  const [customMinBudget, setCustomMinBudget] = useState('');
  const [customMaxBudget, setCustomMaxBudget] = useState('');
  
  // Legacy single-value states for backward compatibility (will be removed)
  const serviceType = selectedServiceTypes.length === 0 ? 'all' : selectedServiceTypes[0];
  const location = selectedLocations.length === 0 ? 'all' : selectedLocations[0];
  const budget = selectedBudgetRanges.length === 0 ? 'all' : selectedBudgetRanges[0];
  const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || '');
  const [displayQuery, setDisplayQuery] = useState(searchParams.get('query') || '');
  const [originalSmartRequest, setOriginalSmartRequest] = useState(searchParams.get('original') || '');
  
  const [ratingFilter, setRatingFilter] = useState('all');
  
  // Voice processing hook
  const {
    isListening,
    transcript,
    extractedData,
    startListening,
    stopListening,
    processTranscript,
    clearData,
    error: voiceError
  } = useVoiceProcessing();
  
  // Additional voice states
  const [parsedRequest, setParsedRequest] = useState<ParsedFilterData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'en-IN' | 'te-IN' | 'auto'>('auto');
  const [isCardMinimized, setIsCardMinimized] = useState(false);
  
  // UI states
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Toggle functions for multi-select
  const toggleServiceType = (value: string) => {
    if (value === 'all') {
      setSelectedServiceTypes([]);
    } else {
      setSelectedServiceTypes(prev => 
        prev.includes(value) 
          ? prev.filter(v => v !== value)
          : [...prev, value]
      );
    }
  };
  
  const toggleLocation = (value: string) => {
    if (value === 'all') {
      setSelectedLocations([]);
    } else {
      setSelectedLocations(prev => 
        prev.includes(value) 
          ? prev.filter(v => v !== value)
          : [...prev, value]
      );
    }
  };
  
  const toggleBudgetRange = (value: string) => {
    if (value === 'all') {
      setSelectedBudgetRanges([]);
      setCustomMinBudget('');
      setCustomMaxBudget('');
      setShowCustomBudget(false);
    } else {
      setSelectedBudgetRanges(prev => 
        prev.includes(value) 
          ? prev.filter(v => v !== value)
          : [...prev, value]
      );
    }
  };
  
  // Format number with Indian numbering system
  const formatIndianNumber = (value: string): string => {
    const numStr = value.replace(/[^\d]/g, '');
    if (!numStr) return '';
    const num = parseInt(numStr);
    if (isNaN(num)) return '';
    return num.toLocaleString('en-IN');
  };

  // Handle custom budget input
  const handleCustomBudgetChange = (type: 'min' | 'max', value: string) => {
    const numStr = value.replace(/[^\d]/g, '');
    if (type === 'min') {
      // Allow empty string or '0' for min (will default to 0)
      setCustomMinBudget(numStr);
    } else {
      setCustomMaxBudget(numStr);
    }
  };

  // Apply custom budget filter
  const applyCustomBudget = () => {
    const min = parseInt(customMinBudget.replace(/[^\d]/g, '')) || 0;
    const max = parseInt(customMaxBudget.replace(/[^\d]/g, ''));
    
    if (isNaN(max) || max <= 0) {
      alert('Please enter a valid maximum budget value');
      return;
    }
    
    if (min < 0) {
      alert('Minimum budget cannot be negative');
      return;
    }
    
    if (min > max) {
      alert('Minimum budget cannot be greater than maximum budget');
      return;
    }
    
    if (min <= 0 || max <= 0) {
      alert('Budget values must be greater than 0');
      return;
    }
    
    // Add 'custom' to selected ranges if not already present
    if (!selectedBudgetRanges.includes('custom')) {
      setSelectedBudgetRanges(prev => [...prev, 'custom']);
    }
  };


  // Fetch all vendors from Supabase
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        console.log('Fetching all vendors...');
        const vendorData = await getAllVendors();
        console.log('Fetched vendors:', vendorData);
        console.log('Total vendors fetched:', vendorData.length);
        
        setVendors(vendorData);
        
        // CRITICAL: After vendors load, force scroll to top again
        // This prevents scroll that might happen when content renders
        setTimeout(() => {
          window.scrollTo(0, 0);
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
          if (topRef.current) {
            topRef.current.scrollIntoView({ behavior: 'instant', block: 'start' });
          }
        }, 0);
      } catch (error) {
        console.error('Error fetching vendors:', error);
      } finally {
        setLoading(false);
        
        // Also scroll after loading completes
        setTimeout(() => {
          window.scrollTo(0, 0);
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        }, 0);
      }
    };

    fetchVendors();
  }, []);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedServiceTypes.length > 0) {
      selectedServiceTypes.forEach(s => params.append('service', s));
    }
    if (selectedLocations.length > 0) {
      selectedLocations.forEach(l => params.append('location', l));
    }
    if (selectedBudgetRanges.length > 0) {
      selectedBudgetRanges.forEach(b => params.append('budget', b));
    }
    
    setSearchParams(params, { replace: true });
    
    // Removed auto-scroll when filters change - let user stay at their current scroll position
  }, [selectedServiceTypes, selectedLocations, selectedBudgetRanges, setSearchParams, vendors.length]);

  // Sync searchQuery with URL when URL changes (for direct navigation)
  useEffect(() => {
    const urlQuery = searchParams.get('query') || '';
    if (urlQuery !== searchQuery) {
      setSearchQuery(urlQuery);
    }
  }, [searchParams]);

  // Auto-parse prompt when navigating from Hero page with query/original param
  useEffect(() => {
    const urlQuery = searchParams.get('query') || '';
    const urlOriginal = searchParams.get('original') || '';
    const promptToParse = urlOriginal || urlQuery;
    
    // Only parse if we have a prompt and it hasn't been processed yet
    // This runs when component mounts or when searchParams change (navigation from Hero)
    if (promptToParse && promptToParse.trim()) {
      // Check if this is a fresh navigation (original param exists means it came from Hero)
      if (urlOriginal) {
        console.log('🔄 Auto-parsing prompt from Hero page:', promptToParse);
        setOriginalSmartRequest(urlOriginal);
        setDisplayQuery(urlOriginal);
        parsePromptAndUpdateFilters(promptToParse);
      } else if (urlQuery && urlQuery !== displayQuery) {
        // If only query param exists and it's different, also parse it
        console.log('🔄 Auto-parsing query param:', urlQuery);
        setDisplayQuery(urlQuery);
        parsePromptAndUpdateFilters(urlQuery);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // Only run when searchParams change (on initial load or navigation)

  // Parse prompt and update filters automatically
  const parsePromptAndUpdateFilters = async (promptText: string) => {
    if (!promptText.trim()) {
      console.log('⚠️ Empty prompt text');
      return;
    }
    
    setIsProcessing(true);
    try {
      const promptLower = promptText.toLowerCase();
      console.log('🔍 ===== PARSING PROMPT =====');
      console.log('🔍 Prompt text:', promptText);
      console.log('🔍 Current selectedServiceTypes:', selectedServiceTypes);
      console.log('🔍 Current selectedBudgetRanges:', selectedBudgetRanges);
      
      // Helper function for fuzzy matching (handles typos)
      const fuzzyMatch = (text: string, pattern: string, maxDistance: number = 2): boolean => {
        const textLower = text.toLowerCase();
        const patternLower = pattern.toLowerCase();
        
        // Exact match first
        if (textLower.includes(patternLower)) return true;
        
        // Check if pattern is close enough (Levenshtein-like approach)
        // For simple cases, check if removing 1-2 characters makes it match
        if (patternLower.length >= 4) {
          // Try removing common typos: extra letters, swapped letters
          const variations = [
            patternLower,
            patternLower.replace(/e{2,}/g, 'e'), // "decorator" -> "decorator" (handle "decoratorer")
            patternLower.replace(/(.)\1/g, '$1'), // "decorator" -> "decorator" (handle double letters)
          ];
          
          for (const variation of variations) {
            if (textLower.includes(variation) || variation.includes(textLower.substring(0, Math.min(variation.length + 2, textLower.length)))) {
              return true;
            }
          }
        }
        
        return false;
      };

      // DIRECT KEYWORD MATCHING - Find ALL service types mentioned in prompt (with typo tolerance)
      const serviceKeywordMap: Record<string, string> = {
        // Event Planners - check longest matches first
        'event planners': 'planning',
        'event planner': 'planning',
        'event planning': 'planning',
        'event management': 'planning',
        'planners': 'planning',
        'planner': 'planning',
        'planning': 'planning',
        'coordinator': 'planning',
        'organizer': 'planning',
        'event coordinator': 'planning',
        'event organizer': 'planning',
        // Common misspellings for planning
        'plannar': 'planning',
        'plannner': 'planning',
        'planer': 'planning',
        'coordinater': 'planning',
        'organiser': 'planning',
        'organisor': 'planning',
        // Photography
        'photographers': 'photography',
        'photographer': 'photography',
        'photography': 'photography',
        'photo': 'photography',
        'video': 'photography',
        'videography': 'photography',
        'camera': 'photography',
        'photo shoot': 'photography',
        'video shoot': 'photography',
        // Common misspellings for photography
        'photograpger': 'photography',
        'photographe': 'photography',
        'photograpghy': 'photography',
        'photograpy': 'photography',
        'photograhpy': 'photography',
        'fotographer': 'photography',
        'fotography': 'photography',
        'videograpghy': 'photography',
        'videograpy': 'photography',
        // Makeup
        'makeup artists': 'makeup',
        'makeup artist': 'makeup',
        'makeup': 'makeup',
        'beauty': 'makeup',
        'beauty artist': 'makeup',
        'bridal makeup': 'makeup',
        // Common misspellings for makeup
        'make up': 'makeup',
        'make-up': 'makeup',
        'makeupartist': 'makeup',
        'beuty': 'makeup',
        'beauti': 'makeup',
        'bridal make up': 'makeup',
        // Decor
        'decorators': 'decor',
        'decorator': 'decor',
        'decoration': 'decor',
        'decor': 'decor',
        'floral': 'decor',
        'florist': 'decor',
        'stage decoration': 'decor',
        'mandap decoration': 'decor',
        // Common misspellings for decorator
        'decoreter': 'decor',
        'decorater': 'decor',
        'decoratorer': 'decor',
        'decoratr': 'decor',
        'decoratoor': 'decor',
        'decorat': 'decor',
        'decorationer': 'decor',
        'decorations': 'decor',
        'florists': 'decor',
        // Catering
        'caterers': 'catering',
        'caterer': 'catering',
        'catering': 'catering',
        'food': 'catering',
        'catering service': 'catering',
        'food service': 'catering',
        // Common misspellings for caterer
        'caterar': 'catering',
        'caterrer': 'catering',
        'cateror': 'catering',
        'caterring': 'catering',
        'caterin': 'catering',
        'caterig': 'catering',
        'caterng': 'catering',
        // Venues
        'venues': 'venues',
        'venue': 'venues',
        'hall': 'venues',
        'banquet hall': 'venues',
        'wedding hall': 'venues',
        'marriage hall': 'venues',
        // Common misspellings for venue
        'venu': 'venues',
        'veneu': 'venues',
        'vennue': 'venues',
        'banquet': 'venues',
        'banquette': 'venues',
        // Music/DJ
        'djs': 'music',
        'dj': 'music',
        'music': 'music',
        'entertainment': 'music',
        'sound system': 'music',
        'lighting': 'music',
        // Common misspellings for DJ/Music
        'deejay': 'music',
        'd j': 'music',
        'd-j': 'music',
        'musik': 'music',
        'musick': 'music',
        'entertainmnt': 'music',
        'entertainmant': 'music',
        // Attire/Clothing Designer
        'fashion': 'attire',
        'clothing': 'attire',
        'attire': 'attire',
        'clothing designer': 'attire',
        'fashion designer': 'attire',
        'dress': 'attire',
        'outfit': 'attire',
        // Common misspellings for attire/clothing
        'clothng': 'attire',
        'fashon': 'attire',
        'fashoin': 'attire',
        'desiner': 'attire',
        'designer': 'attire',
        'desinger': 'attire',
        'dres': 'attire',
        'dreses': 'attire'
      };
      
      // Find ALL service types by checking keywords (longest first to avoid partial matches)
      const sortedKeywords = Object.keys(serviceKeywordMap).sort((a, b) => b.length - a.length);
      const foundServiceTypes = new Set<string>();
      
      // First pass: Exact word boundary matching for accuracy
      for (const keyword of sortedKeywords) {
        // Escape special regex characters in keyword
        const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Use word boundary to avoid partial matches (e.g., "photo" shouldn't match "photography" when we want "photography")
        const keywordRegex = new RegExp(`\\b${escapedKeyword}\\b`, 'i');
        if (keywordRegex.test(promptText)) {
          const serviceType = serviceKeywordMap[keyword];
          foundServiceTypes.add(serviceType);
          console.log(`✅ Found exact keyword "${keyword}" → filter "${serviceType}"`);
        }
      }
      
      // Second pass: Fuzzy matching for typos (only if no exact match found for that service type)
      // Split prompt into words and check each word for fuzzy matches
      const promptWords = promptLower.split(/\s+/);
      const serviceTypeKeywords: Record<string, string[]> = {
        'planning': ['planner', 'planning', 'coordinator', 'organizer'],
        'photography': ['photographer', 'photography', 'photo', 'video', 'videography', 'camera'],
        'makeup': ['makeup', 'beauty', 'artist'],
        'decor': ['decorator', 'decoration', 'decor', 'floral', 'florist'],
        'catering': ['caterer', 'catering', 'food'],
        'venues': ['venue', 'hall', 'banquet'],
        'music': ['dj', 'music', 'entertainment', 'sound'],
        'attire': ['clothing', 'fashion', 'designer', 'dress', 'attire']
      };
      
      for (const word of promptWords) {
        // Skip very short words
        if (word.length < 4) continue;
        
        // Check each service type category
        for (const [serviceType, keywords] of Object.entries(serviceTypeKeywords)) {
          // Skip if already found via exact match
          if (foundServiceTypes.has(serviceType)) continue;
          
          // Check fuzzy match against keywords
          for (const keyword of keywords) {
            if (fuzzyMatch(word, keyword, 2)) {
              foundServiceTypes.add(serviceType);
              console.log(`✅ Found fuzzy match "${word}" → "${keyword}" → filter "${serviceType}"`);
              break;
            }
          }
        }
      }
      
      // Add all found service types
      if (foundServiceTypes.size > 0) {
        console.log('✅ Found service types:', Array.from(foundServiceTypes));
        // Use functional update to avoid stale state
        setSelectedServiceTypes(prev => {
          const updated = [...prev];
          let hasChanges = false;
          
          // Add all found service types that aren't already selected
          foundServiceTypes.forEach(serviceType => {
            if (!updated.includes(serviceType)) {
              updated.push(serviceType);
              hasChanges = true;
              console.log(`✅ Added service type: ${serviceType}`);
            } else {
              console.log(`⚠️ Service type already selected: ${serviceType}`);
            }
          });
          
          if (hasChanges) {
          console.log('✅ Updated service types state:', updated);
          return updated;
          }
          return prev; // No changes
        });
      } else {
        console.log('⚠️ No service types found in prompt');
      }
      
      // DIRECT BUDGET EXTRACTION - Handle both single amounts and ranges
      // First try to extract budget range (e.g., "50000 to 1 lakh", "50000 - 1 lakh")
      const budgetRangePatterns = [
        /(\d{1,3}(?:,\d{2,3})*|\d{4,})\s*(?:to|-|and)\s*(\d{1,3}(?:,\d{2,3})*|\d{4,})\s*(?:lakh|lakhs?|l)?/i,  // "50000 to 1 lakh" or "50000 - 1 lakh"
        /(\d+)\s*(?:lakh|lakhs?|l)\s*(?:to|-|and)\s*(\d+)\s*(?:lakh|lakhs?|l)/i,  // "2 lakh to 3 lakh"
        /budget\s+(?:of|is)?\s*(\d{1,3}(?:,\d{2,3})*|\d{4,})\s*(?:to|-|and)\s*(\d{1,3}(?:,\d{2,3})*|\d{4,})\s*(?:lakh|lakhs?|l)?/i  // "budget 50000 to 1 lakh"
      ];
      
      let customMinBudgetValue = 0;
      let customMaxBudgetValue = 0;
      let foundRange = false;
      
      console.log('💰 Extracting budget from:', promptText);
      
      // Try to find budget range first
      for (const pattern of budgetRangePatterns) {
        const match = promptText.match(pattern);
        if (match && match[1] && match[2]) {
          let minStr = match[1].replace(/,/g, '');
          let maxStr = match[2].replace(/,/g, '');
          let minNum = parseInt(minStr);
          let maxNum = parseInt(maxStr);
          
          // Check if pattern contains "lakh" for max value
          if (pattern.source.includes('lakh') && match[0].toLowerCase().includes('lakh')) {
            // If max value is followed by "lakh", multiply by 100000
            const maxPart = match[0].toLowerCase();
            if (maxPart.includes(maxStr + ' lakh') || maxPart.endsWith('lakh')) {
              maxNum = maxNum * 100000;
            }
            // If min value is also in lakhs (check the full match)
            if (maxPart.includes(minStr + ' lakh')) {
              minNum = minNum * 100000;
            }
          }
          
          // Handle cases where max is in lakhs but min is not
          if (maxNum < 100000 && minNum >= 100000) {
            // Max might be in lakhs, min is in rupees
            maxNum = maxNum * 100000;
          } else if (maxNum < 1000 && minNum >= 1000) {
            // Both might need conversion, but max is likely in lakhs
            maxNum = maxNum * 100000;
          }
          
          if (minNum > 0 && maxNum > minNum) {
            customMinBudgetValue = minNum;
            customMaxBudgetValue = maxNum;
            foundRange = true;
            console.log(`✅ Extracted budget range: ${customMinBudgetValue} to ${customMaxBudgetValue}`);
            break;
          }
        }
      }
      
      // If no range found, try single amount
      if (!foundRange) {
      const budgetPatterns = [
        /for\s+(\d{1,3}(?:,\d{2,3})*|\d{4,})/i,  // "for 200000" or "for 2,00,000" - check first!
        /(\d{1,3}(?:,\d{2,3})*)\s*(?:lakh|lakhs?|l)/i,  // 2 lakh, 2,00,000
        /(\d+)\s*(?:lakh|lakhs?|l)/i,  // 2 lakh
        /(\d{1,3}(?:,\d{2,3})+)/,  // 2,00,000
        /(\d{5,})/,  // 200000 (5+ digits) - standalone large numbers
        /budget\s+(?:of|is)?\s*(\d{1,3}(?:,\d{2,3})*|\d{4,})/i  // "budget 200000"
      ];
      
      for (const pattern of budgetPatterns) {
        const match = promptText.match(pattern);
        console.log('💰 Pattern:', pattern.source, 'Match:', match);
        if (match && match[1]) {
          let numStr = match[1].replace(/,/g, '');
          const num = parseInt(numStr);
          console.log('💰 Parsed number:', num);
          
          // If pattern contains "lakh", multiply by 100000
          if (pattern.source.includes('lakh')) {
              customMaxBudgetValue = num * 100000;
              console.log('💰 Multiplied by 100000 (lakh):', customMaxBudgetValue);
          } else if (num >= 100000) {
            // Already in rupees (200000 = 2 lakh)
              customMaxBudgetValue = num;
              console.log('💰 Using as-is (>= 100000):', customMaxBudgetValue);
          } else if (num >= 1000 && num < 100000) {
            // Could be in thousands, but treat as rupees
              customMaxBudgetValue = num;
              console.log('💰 Using as-is (1000-100000):', customMaxBudgetValue);
          }
          
            if (customMaxBudgetValue > 0) {
              customMinBudgetValue = 0; // Default min to 0 for single amount
              console.log(`✅ Extracted budget: ${customMaxBudgetValue} from pattern: ${pattern.source}`);
            break;
            }
          }
        }
      }
      
      // Also try parseRequest as fallback if no budget found
      if (customMaxBudgetValue === 0) {
        try {
          const parsedRequest = parseRequest(promptText);
      if (parsedRequest.budgetRange) {
            customMinBudgetValue = parsedRequest.budgetRange.min || 0;
            customMaxBudgetValue = parsedRequest.budgetRange.max || parsedRequest.budgetRange.min || 0;
            console.log('💰 Budget from parseRequest:', customMinBudgetValue, 'to', customMaxBudgetValue);
          }
        } catch (e) {
          console.log('⚠️ parseRequest failed, using direct extraction');
        }
      }
      
      // Set budget filters
      if (customMaxBudgetValue > 0) {
        console.log(`💰 Setting custom budget: min=${customMinBudgetValue}, max=${customMaxBudgetValue}`);
        
        // Set custom budget with extracted min and max
        setCustomMinBudget(String(customMinBudgetValue));
        setCustomMaxBudget(String(customMaxBudgetValue));
        
        // Only add custom budget range, not preset ranges
        setSelectedBudgetRanges(prev => {
          // Remove any preset ranges and only keep custom
          const updated = prev.filter(range => range === 'custom');
          // Add custom if not present
          if (!updated.includes('custom')) {
            updated.push('custom');
          }
          console.log('✅ Updated budget ranges (custom only):', updated);
          return updated;
        });
        setShowCustomBudget(true);
      } else {
        console.log('⚠️ No budget found in prompt');
      }
      
      // LOCATION EXTRACTION - Map cities to states
      const cityToStateMap: Record<string, string> = {
        // Telangana cities
        'hyderabad': 'telangana',
        'secunderabad': 'telangana',
        'warangal': 'telangana',
        'nizamabad': 'telangana',
        'karimnagar': 'telangana',
        'khammam': 'telangana',
        'ramagundam': 'telangana',
        'mahabubnagar': 'telangana',
        'nalgonda': 'telangana',
        'adilabad': 'telangana',
        'suryapet': 'telangana',
        'miryalaguda': 'telangana',
        'jagtial': 'telangana',
        'peddapalli': 'telangana',
        'kamareddy': 'telangana',
        'siddipet': 'telangana',
        'wanaparthy': 'telangana',
        'bhongir': 'telangana',
        'bodhan': 'telangana',
        'palwancha': 'telangana',
        'mandamarri': 'telangana',
        'koratla': 'telangana',
        'mancherial': 'telangana',
        'kothagudem': 'telangana',
        'dharmabad': 'telangana',
        'basheerabad': 'telangana',
        'uzhavarkarai': 'telangana',
        'nagarkurnool': 'telangana',
        'gadwal': 'telangana',
        'sircilla': 'telangana',
        'vikarabad': 'telangana',
        'sangareddy': 'telangana',
        'medak': 'telangana',
        'narayanpet': 'telangana',
        'andhra pradesh cities': 'andhra-pradesh',
        'visakhapatnam': 'andhra-pradesh',
        'vizag': 'andhra-pradesh',
        'vijayawada': 'andhra-pradesh',
        'guntur': 'andhra-pradesh',
        'nellore': 'andhra-pradesh',
        'kurnool': 'andhra-pradesh',
        'rajahmundry': 'andhra-pradesh',
        'kakinada': 'andhra-pradesh',
        'tirupati': 'andhra-pradesh',
        'anantapur': 'andhra-pradesh',
        'kadapa': 'andhra-pradesh',
        'eluru': 'andhra-pradesh',
        'ongole': 'andhra-pradesh',
        'nandyal': 'andhra-pradesh',
        'machilipatnam': 'andhra-pradesh',
        'adoni': 'andhra-pradesh',
        'tenali': 'andhra-pradesh',
        'chittoor': 'andhra-pradesh',
        'proddatur': 'andhra-pradesh',
        'bhimavaram': 'andhra-pradesh',
        'tadepalligudem': 'andhra-pradesh',
        'dharmavaram': 'andhra-pradesh',
        'gudivada': 'andhra-pradesh',
        'srikakulam': 'andhra-pradesh',
        'hindupur': 'andhra-pradesh',
        'tadpatri': 'andhra-pradesh',
        'kavali': 'andhra-pradesh',
        'chilakaluripet': 'andhra-pradesh',
        'palakollu': 'andhra-pradesh',
        'tanuku': 'andhra-pradesh',
        'tadepalli': 'andhra-pradesh',
        'rajamundry': 'andhra-pradesh',
        'rajamahendravaram': 'andhra-pradesh',
        'tamil nadu cities': 'tamil-nadu',
        'chennai': 'tamil-nadu',
        'madras': 'tamil-nadu',
        'coimbatore': 'tamil-nadu',
        'madurai': 'tamil-nadu',
        'tiruchirappalli': 'tamil-nadu',
        'salem': 'tamil-nadu',
        'tirunelveli': 'tamil-nadu',
        'erode': 'tamil-nadu',
        'vellore': 'tamil-nadu',
        'dindigul': 'tamil-nadu',
        'thanjavur': 'tamil-nadu',
        'tuticorin': 'tamil-nadu',
        'kanchipuram': 'tamil-nadu',
        'nagercoil': 'tamil-nadu',
        'karur': 'tamil-nadu',
        'hosur': 'tamil-nadu',
        'karnataka cities': 'karnataka',
        'bangalore': 'karnataka',
        'bengaluru': 'karnataka',
        'mysore': 'karnataka',
        'hubli': 'karnataka',
        'mangalore': 'karnataka',
        'belgaum': 'karnataka',
        'gulbarga': 'karnataka',
        'davangere': 'karnataka',
        'bellary': 'karnataka',
        'bijapur': 'karnataka',
        'raichur': 'karnataka',
        'tumkur': 'karnataka',
        'bidar': 'karnataka',
        'hospet': 'karnataka',
        'hassan': 'karnataka',
        'shimoga': 'karnataka',
        'gadag': 'karnataka',
        'chitradurga': 'karnataka',
        'udupi': 'karnataka',
        'maharashtra cities': 'maharashtra',
        'mumbai': 'maharashtra',
        'pune': 'maharashtra',
        'nagpur': 'maharashtra',
        'thane': 'maharashtra',
        'nashik': 'maharashtra',
        'kalyan': 'maharashtra',
        'vasai': 'maharashtra',
        'solapur': 'maharashtra',
        'aurangabad': 'maharashtra',
        'nanded': 'maharashtra',
        'sangli': 'maharashtra',
        'kolhapur': 'maharashtra',
        'ulhasnagar': 'maharashtra',
        'akola': 'maharashtra',
        'latur': 'maharashtra',
        'dhule': 'maharashtra',
        'amravati': 'maharashtra',
        'ichalkaranji': 'maharashtra',
        'jalgaon': 'maharashtra',
        'bhusawal': 'maharashtra',
        'panvel': 'maharashtra',
        'satara': 'maharashtra',
        'beed': 'maharashtra',
        'yavatmal': 'maharashtra',
        'kamptee': 'maharashtra',
        'gondia': 'maharashtra',
        'barshi': 'maharashtra',
        'achalpur': 'maharashtra',
        'osmanabad': 'maharashtra',
        'nandurbar': 'maharashtra',
        'wardha': 'maharashtra',
        'udgir': 'maharashtra',
        'hinganghat': 'maharashtra',
        'delhi cities': 'delhi',
        'new delhi': 'delhi',
        'delhi': 'delhi',
        'kerala cities': 'kerala',
        'kochi': 'kerala',
        'cochin': 'kerala',
        'thiruvananthapuram': 'kerala',
        'trivandrum': 'kerala',
        'calicut': 'kerala',
        'kozhikode': 'kerala',
        'thrissur': 'kerala',
        'palakkad': 'kerala',
        'kannur': 'kerala',
        'kollam': 'kerala',
        'alappuzha': 'kerala',
        'kottayam': 'kerala',
        'tirur': 'kerala',
        'koyilandy': 'kerala',
        'malappuram': 'kerala',
        'thalassery': 'kerala',
        'payyannur': 'kerala',
        'kanhangad': 'kerala',
        'vadakara': 'kerala',
        'neyyattinkara': 'kerala',
        'neyyatinkara': 'kerala',
        'pallakad': 'kerala',
        'punjab cities': 'punjab',
        'ludhiana': 'punjab',
        'amritsar': 'punjab',
        'jalandhar': 'punjab',
        'patiala': 'punjab',
        'bathinda': 'punjab',
        'pathankot': 'punjab',
        'hoshiarpur': 'punjab',
        'batala': 'punjab',
        'moga': 'punjab',
        'abohar': 'punjab',
        'khanna': 'punjab',
        'phagwara': 'punjab',
        'muktsar': 'punjab',
        'barnala': 'punjab',
        'firozpur': 'punjab',
        'kapurthala': 'punjab',
        'rajasthan cities': 'rajasthan',
        'jaipur': 'rajasthan',
        'jodhpur': 'rajasthan',
        'kota': 'rajasthan',
        'bikaner': 'rajasthan',
        'ajmer': 'rajasthan',
        'udaipur': 'rajasthan',
        'bhilwara': 'rajasthan',
        'alwar': 'rajasthan',
        'bharatpur': 'rajasthan',
        'ganganagar': 'rajasthan',
        'sirohi': 'rajasthan',
        'tonk': 'rajasthan',
        'pali': 'rajasthan',
        'sikar': 'rajasthan',
        'haryana cities': 'haryana',
        'faridabad': 'haryana',
        'gurgaon': 'haryana',
        'gurugram': 'haryana',
        'panipat': 'haryana',
        'ambala': 'haryana',
        'yamunanagar': 'haryana',
        'rohtak': 'haryana',
        'hisar': 'haryana',
        'karnal': 'haryana',
        'sonipat': 'haryana',
        'panchkula': 'haryana',
        'bhiwani': 'haryana',
        'bahadurgarh': 'haryana',
        'jind': 'haryana',
        'sirsa': 'haryana',
        'thanesar': 'haryana',
        'kaithal': 'haryana',
        'palwal': 'haryana',
        'rewari': 'haryana',
        'gujarat cities': 'gujarat',
        'ahmedabad': 'gujarat',
        'surat': 'gujarat',
        'vadodara': 'gujarat',
        'baroda': 'gujarat',
        'rajkot': 'gujarat',
        'bhavnagar': 'gujarat',
        'jamnagar': 'gujarat',
        'gandhinagar': 'gujarat',
        'anand': 'gujarat',
        'bharuch': 'gujarat',
        'junagadh': 'gujarat',
        'navsari': 'gujarat',
        'morbi': 'gujarat',
        'nadiad': 'gujarat',
        'surendranagar': 'gujarat',
        'gandhidham': 'gujarat',
        'veraval': 'gujarat',
        'porbandar': 'gujarat',
        'mehsana': 'gujarat',
        'bhuj': 'gujarat',
        'godhra': 'gujarat',
        'palanpur': 'gujarat',
        'vapi': 'gujarat',
        'ankleshwar': 'gujarat',
        'west bengal cities': 'west-bengal',
        'kolkata': 'west-bengal',
        'calcutta': 'west-bengal',
        'howrah': 'west-bengal',
        'durgapur': 'west-bengal',
        'asansol': 'west-bengal',
        'siliguri': 'west-bengal',
        'bardhaman': 'west-bengal',
        'malda': 'west-bengal',
        'bhatpara': 'west-bengal',
        'kharagpur': 'west-bengal',
        'shantipur': 'west-bengal',
        'ranchi': 'west-bengal',
        'dhanbad': 'west-bengal',
        'jamshedpur': 'west-bengal',
        'bokaro': 'west-bengal',
        'hazaribagh': 'west-bengal',
        'giridih': 'west-bengal',
        'ramgarh': 'west-bengal',
        'medininagar': 'west-bengal',
        'chirkunda': 'west-bengal',
        'uttar pradesh cities': 'uttar-pradesh',
        'lucknow': 'uttar-pradesh',
        'kanpur': 'uttar-pradesh',
        'agra': 'uttar-pradesh',
        'meerut': 'uttar-pradesh',
        'varanasi': 'uttar-pradesh',
        'banaras': 'uttar-pradesh',
        'allahabad': 'uttar-pradesh',
        'prayagraj': 'uttar-pradesh',
        'ghaziabad': 'uttar-pradesh',
        'noida': 'uttar-pradesh',
        'greater noida': 'uttar-pradesh',
        'aligarh': 'uttar-pradesh',
        'bareilly': 'uttar-pradesh',
        'gorakhpur': 'uttar-pradesh',
        'moradabad': 'uttar-pradesh',
        'saharanpur': 'uttar-pradesh',
        'jhansi': 'uttar-pradesh',
        'faizabad': 'uttar-pradesh',
        'ayodhya': 'uttar-pradesh',
        'mathura': 'uttar-pradesh',
        'firozabad': 'uttar-pradesh',
        'shahjahanpur': 'uttar-pradesh',
        'rampur': 'uttar-pradesh',
        'modinagar': 'uttar-pradesh',
        'hapur': 'uttar-pradesh',
        'amroha': 'uttar-pradesh',
        'mainpuri': 'uttar-pradesh',
        'hardoi': 'uttar-pradesh',
        'fatehpur': 'uttar-pradesh',
        'raebareli': 'uttar-pradesh',
        'orissa cities': 'odisha',
        'odisha cities': 'odisha',
        'bhubaneswar': 'odisha',
        'cuttack': 'odisha',
        'rourkela': 'odisha',
        'berhampur': 'odisha',
        'sambalpur': 'odisha',
        'puri': 'odisha',
        'baleshwar': 'odisha',
        'baripada': 'odisha',
        'bhadrak': 'odisha',
        'balangir': 'odisha',
        'jharsuguda': 'odisha',
        'bargarh': 'odisha',
        'paradip': 'odisha',
        'bhawanipatna': 'odisha',
        'jeypore': 'odisha',
        'dhenkanal': 'odisha',
        'angul': 'odisha',
        'kendrapara': 'odisha',
        'goa cities': 'goa',
        'panaji': 'goa',
        'panjim': 'goa',
        'margao': 'goa',
        'vasco da gama': 'goa',
        'vasco': 'goa',
        'mapusa': 'goa',
        'pondicherry cities': 'puducherry',
        'puducherry cities': 'puducherry',
        'pondicherry': 'puducherry',
        'puducherry': 'puducherry',
        'karaikal': 'puducherry',
        'yanam': 'puducherry',
        'mahe': 'puducherry',
      };
      
      // Also map state names directly
      const stateNameMap: Record<string, string> = {
        'telangana': 'telangana',
        'andhra pradesh': 'andhra-pradesh',
        'andhra': 'andhra-pradesh',
        'ap': 'andhra-pradesh',
        'tamil nadu': 'tamil-nadu',
        'tamilnadu': 'tamil-nadu',
        'tn': 'tamil-nadu',
        'karnataka': 'karnataka',
        'ka': 'karnataka',
        'maharashtra': 'maharashtra',
        'mh': 'maharashtra',
        'delhi': 'delhi',
        'kerala': 'kerala',
        'kl': 'kerala',
        'punjab': 'punjab',
        'pb': 'punjab',
        'rajasthan': 'rajasthan',
        'rj': 'rajasthan',
        'haryana': 'haryana',
        'hr': 'haryana',
        'gujarat': 'gujarat',
        'gj': 'gujarat',
        'west bengal': 'west-bengal',
        'wb': 'west-bengal',
        'uttar pradesh': 'uttar-pradesh',
        'up': 'uttar-pradesh',
        'odisha': 'odisha',
        'orissa': 'odisha',
        'or': 'odisha',
        'goa': 'goa',
        'ga': 'goa',
        'puducherry': 'puducherry',
        'pondicherry': 'puducherry',
        'py': 'puducherry',
      };
      
      // Extract location - use comprehensive location service with API fallback
      let foundLocation: string | null = null;
      console.log('📍 Extracting location from:', promptText);
      
      // First, try local database lookup for known cities/towns/villages
      const sortedCities = Object.keys(cityToStateMap).sort((a, b) => b.length - a.length);
      for (const city of sortedCities) {
        const cityRegex = new RegExp(`\\b${city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (cityRegex.test(promptText)) {
          foundLocation = cityToStateMap[city];
          console.log(`✅ Found city "${city}" → state "${foundLocation}"`);
          break;
        }
      }
      
      // If no city found in local map, try location service (includes more locations)
      if (!foundLocation) {
        // Extract potential location words from prompt (2-20 character words that might be locations)
        const words = promptText.match(/\b[a-z]{2,20}\b/gi) || [];
        for (const word of words) {
          const locationResult = findStateForLocation(word);
          if (locationResult) {
            foundLocation = locationResult;
            console.log(`✅ Found location "${word}" → state "${foundLocation}" via location service`);
            break;
          }
        }
      }
      
      // If still not found, try state names
      if (!foundLocation) {
        const sortedStates = Object.keys(stateNameMap).sort((a, b) => b.length - a.length);
        for (const state of sortedStates) {
          const stateRegex = new RegExp(`\\b${state.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
          if (stateRegex.test(promptText)) {
            foundLocation = stateNameMap[state];
            console.log(`✅ Found state "${state}" → filter "${foundLocation}"`);
            break;
          }
        }
      }
      
      // Last resort: Try geocoding API for unknown locations (async)
      if (!foundLocation) {
        // Extract potential location (try to find location-like words)
        const locationWords = promptText.match(/\b[a-z]{3,15}\b/gi) || [];
        for (const word of locationWords) {
          // Skip common non-location words
          const skipWords = ['need', 'want', 'looking', 'for', 'budget', 'lakh', 'event', 'planner', 'caterer', 'photographer', 'makeup', 'decorator', 'venue', 'music', 'dj', 'clothing', 'designer', 'at', 'in', 'on', 'the', 'a', 'an', 'and', 'or', 'to', 'from'];
          if (skipWords.includes(word.toLowerCase())) continue;
          
          // Try geocoding API (async - will update state when result comes)
          getStateForLocation(word).then(state => {
            if (state) {
              console.log(`✅ Found location "${word}" → state "${state}" via geocoding API`);
              setSelectedLocations(prev => {
                if (!prev.includes(state)) {
                  return [...prev, state];
                }
                return prev;
              });
            }
          }).catch(err => {
            console.log(`⚠️ Geocoding failed for "${word}":`, err);
          });
        }
      }
      
      // Set location filter
      if (foundLocation) {
        console.log('✅ Setting location:', foundLocation);
        setSelectedLocations(prev => {
          if (prev.includes(foundLocation!)) {
            console.log('⚠️ Location already selected:', foundLocation);
            return prev; // Already selected, no change
          }
          const updated = [...prev, foundLocation!];
          console.log('✅ Updated locations state:', updated);
          return updated;
        });
      } else {
        console.log('⚠️ No location found in prompt');
      }
      
      // Update search query for text search
      setSearchQuery(promptText);
      
      // Update URL params
      const params = new URLSearchParams(searchParams);
      params.set('query', promptText);
      setSearchParams(params);
      
    } catch (error) {
      console.error('Error parsing prompt:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle voice data extraction
  useEffect(() => {
    if (extractedData && transcript) {
      console.log('🎤 Voice data extracted:', extractedData);
      
      // Update the display query with the transcript
      setDisplayQuery(transcript);
      setOriginalSmartRequest(transcript);
      
      // Process the extracted data to update filters
      if (extractedData.serviceType) {
        if (!selectedServiceTypes.includes(extractedData.serviceType)) {
          setSelectedServiceTypes(prev => [...prev, extractedData.serviceType]);
        }
      }
      // Parse the transcript and update all filters
      parsePromptAndUpdateFilters(transcript);
      
      // Clear voice data after processing
      clearData();
    }
  }, [extractedData, transcript, searchParams, setSearchParams, clearData]);

  // Enhanced filtering and sorting
  const filteredAndSortedVendors = vendors
    .filter(vendor => {
      // Debug: Log all vendors being filtered for photography
      if (serviceType === 'photography') {
        console.log(`🔍 Filtering vendor: ${vendor.brand_name}`, {
          category: vendor.category,
          serviceType,
          location,
          budget
        });
      }
      
      // Service type filter - check ALL categories, not just the first one
      const matchesServiceType = serviceType === 'all' || (() => {
        const vendorCategories = Array.isArray(vendor.category) 
          ? vendor.category 
          : (vendor.categories || (vendor.category ? [vendor.category] : []));
        
        if (vendorCategories.length === 0) return false;
        
        // Check ALL categories, not just the first one
        return vendorCategories.some(cat => {
          const vendorCategory = String(cat).toLowerCase();
        
        switch (serviceType) {
          case 'photography':
            return vendorCategory.includes('photograph') || 
                   vendorCategory.includes('photo') || 
                   vendorCategory.includes('video') ||
                   vendorCategory.includes('camera') ||
                   vendorCategory === 'photography/videography' ||
                   vendorCategory === '03';
          case 'makeup':
            return vendorCategory.includes('makeup') || 
                   vendorCategory.includes('beauty') ||
                   vendorCategory === 'makeup artists' ||
                   vendorCategory === '06';
          case 'decor':
            return vendorCategory.includes('decor') || 
                   vendorCategory.includes('decoration') ||
                   vendorCategory === 'decorators' ||
                   vendorCategory === '04';
          case 'catering':
            return vendorCategory.includes('cater') || 
                   vendorCategory.includes('food') ||
                   vendorCategory === 'caterers' ||
                   vendorCategory === '05';
          case 'venues':
            return vendorCategory.includes('venue') || 
                   vendorCategory.includes('hall') ||
                   vendorCategory === 'venues' ||
                   vendorCategory === '02';
          case 'music':
            return vendorCategory.includes('music') || 
                   vendorCategory.includes('dj') ||
                   vendorCategory.includes('entertainment') ||
                   vendorCategory === 'djs, lighting, and entertainment' ||
                   vendorCategory === '07';
          case 'attire':
            return vendorCategory.includes('fashion') || 
                   vendorCategory.includes('clothing') ||
                   vendorCategory.includes('designer') ||
                   vendorCategory === 'fashion/costume designers' ||
                   vendorCategory === '10';
          case 'planning':
            return vendorCategory.includes('planning') || 
                   vendorCategory.includes('planner') ||
                   vendorCategory.includes('event management') ||
                   vendorCategory === 'event planners' ||
                   vendorCategory === '01';
          default:
            return false;
        }
        });
      })();

      // Debug logging for service type filtering
      if (serviceType !== 'all') {
        const vendorCategories = Array.isArray(vendor.category) 
          ? vendor.category 
          : (vendor.categories || (vendor.category ? [vendor.category] : []));
        console.log(`🔍 Checking vendor ${vendor.brand_name} for service type "${serviceType}":`, {
          vendor_category: vendorCategories,
          matches_service_type: matchesServiceType
        });
      }
      
      // Location filter - check both address and service_areas with flexible matching (match ANY selected location)
      const matchesLocation = selectedLocations.length === 0 || (() => {
        return selectedLocations.some(selectedLocation => {
          const locationLower = selectedLocation.toLowerCase();
          
          // Check address
          if (vendor.address && vendor.address.toLowerCase().includes(locationLower)) {
            return true;
          }
          
          // Check service_areas array with flexible matching
          if (vendor.additional_info?.service_areas && Array.isArray(vendor.additional_info.service_areas)) {
            return vendor.additional_info.service_areas.some((area: string) => {
              const areaLower = String(area).toLowerCase();
              // Exact match
              if (areaLower === locationLower) return true;
              // Contains match
              if (areaLower.includes(locationLower) || locationLower.includes(areaLower)) return true;
              // Handle state names (e.g., "telangana" matches "Telangana", "TELANGANA")
              const normalizedArea = areaLower.replace(/[^a-z]/g, '');
              const normalizedLocation = locationLower.replace(/[^a-z]/g, '');
              if (normalizedArea === normalizedLocation) return true;
              return false;
            });
          }
          
          return false;
        });
      })();

      // Budget filter - Show vendors whose starting price is within ANY of the selected budget ranges
      const matchesBudget = (() => {
        if (selectedBudgetRanges.length === 0) return true;
        
        const vendorStartingPrice = vendor.starting_price || 0;
        
        // Check if vendor price falls within ANY of the selected ranges
        return selectedBudgetRanges.some(range => {
          if (range === 'custom' && customMinBudget !== '' && customMaxBudget) {
            const min = parseInt(customMinBudget.replace(/[^\d]/g, '')) || 0;
            const max = parseInt(customMaxBudget.replace(/[^\d]/g, ''));
            if (!isNaN(min) && !isNaN(max) && min >= 0 && max > 0) {
              return vendorStartingPrice >= min && vendorStartingPrice <= max;
            }
            return false;
          }
          
          switch (range) {
          case '10k-50k':
              return vendorStartingPrice >= 10000 && vendorStartingPrice <= 50000;
          case '50k-1l':
              return vendorStartingPrice >= 50000 && vendorStartingPrice <= 100000;
          case '1l-3l':
              return vendorStartingPrice >= 100000 && vendorStartingPrice <= 300000;
          case '3l-10l':
              return vendorStartingPrice >= 300000 && vendorStartingPrice <= 1000000;
          case '10l-15l':
              return vendorStartingPrice >= 1000000 && vendorStartingPrice <= 1500000;
          case '15l-25l':
              return vendorStartingPrice >= 1500000 && vendorStartingPrice <= 2500000;
          case '25l-50l':
              return vendorStartingPrice >= 2500000 && vendorStartingPrice <= 5000000;
          case '50l-1cr':
              return vendorStartingPrice >= 5000000 && vendorStartingPrice <= 10000000;
          default:
            return true;
        }
        });
      })();
      
      // Debug logging for location filtering
      if (location !== 'all' && location === 'telangana') {
        console.log(`🔍 Checking vendor ${vendor.brand_name} for location "${location}":`, {
          vendor_address: vendor.address,
          service_areas: vendor.additional_info?.service_areas,
          address_matches: vendor.address?.toLowerCase().includes(location.toLowerCase()),
          service_areas_matches: vendor.additional_info?.service_areas?.includes(location),
          final_location_match: matchesLocation
        });
      }
      
      // Search query filter - simple text search like CategoryVendors
      const matchesSearch = !searchQuery.trim() ||
        vendor.brand_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (vendor.spoc_name && vendor.spoc_name.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Price filter - removed as per user request
      
      // Rating filter - SIMPLIFIED FOR DEBUGGING
      const matchesRating = (() => {
        if (ratingFilter === 'all') {
          console.log(`✅ Rating filter: ALL - showing ${vendor.brand_name}`);
          return true;
        }
        
        const rating = vendor.rating || 0;
        const numericRating = parseFloat(String(rating));
        
        console.log(`🔍 RATING FILTER CHECK:`, {
          vendor: vendor.brand_name,
          original_rating: vendor.rating,
          numeric_rating: numericRating,
          selected_filter: ratingFilter,
          filter_type: typeof ratingFilter
        });
        
        let result = false;
        switch (ratingFilter) {
          case '5':
            result = numericRating >= 5;
            console.log(`${vendor.brand_name}: 5+ filter - rating ${numericRating} >= 5? ${result}`);
            break;
          case '4.5':
            result = numericRating >= 4.5 && numericRating < 5;
            console.log(`${vendor.brand_name}: 4.5+ filter - rating ${numericRating} >= 4.5 and < 5? ${result}`);
            break;
          case '4':
            result = numericRating >= 4 && numericRating < 4.5;
            console.log(`${vendor.brand_name}: 4+ filter - rating ${numericRating} >= 4 and < 4.5? ${result}`);
            break;
          case '3.5':
            result = numericRating >= 3.5 && numericRating < 4;
            break;
          case '3':
            result = numericRating >= 3 && numericRating < 3.5;
            break;
          case '2':
            result = numericRating >= 2 && numericRating < 3;
            break;
          case '1':
            result = numericRating >= 1 && numericRating < 2;
            break;
          default:
            result = true;
        }
        
        console.log(`🎯 FINAL RESULT for ${vendor.brand_name}: ${result ? 'SHOW' : 'HIDE'}`);
        return result;
      })();
      
      // When all filters are empty, show all vendors (only apply search query if provided)
      const allFiltersAreAll = selectedServiceTypes.length === 0 && selectedLocations.length === 0 && selectedBudgetRanges.length === 0 && ratingFilter === 'all';
      
      const finalMatch = allFiltersAreAll 
        ? matchesSearch  // Only apply search query filter when all others are empty
        : (matchesServiceType && matchesLocation && matchesBudget && matchesSearch && matchesRating);

      // Debug logging for overall filtering
      if (serviceType === 'photography' && location === 'telangana') {
        console.log(`🔍 Final filter result for vendor ${vendor.brand_name}:`, {
          vendor_rating: vendor.rating,
          ratingFilter,
          matchesServiceType,
          matchesLocation,
          matchesBudget,
          matchesSearch,
          matchesRating,
          allFiltersAreAll,
          finalMatch
        });
      }
      
      // Debug rating filtering specifically
      if (ratingFilter !== 'all') {
        console.log(`🔍 Rating filter check for ${vendor.brand_name}:`, {
          vendor_rating: vendor.rating,
          ratingFilter,
          matches: matchesRating
        });
      }

      return finalMatch;
    });

  // Debug: Log filtering results
  console.log(`🔍 ===== FILTERING RESULTS =====`);
  console.log(`Current filters: serviceType="${serviceType}", location="${location}", budget="${budget}", ratingFilter="${ratingFilter}"`);
  console.log(`Total vendors in database: ${vendors.length}`);
  console.log(`Vendors after filtering: ${filteredAndSortedVendors.length}`);
  console.log(`Rating filter value: "${ratingFilter}" (type: ${typeof ratingFilter})`);
  
  // Debug: Show rating distribution
  if (ratingFilter !== 'all') {
    const ratingStats = vendors.reduce((acc, vendor) => {
      const rating = parseFloat(String(vendor.rating || 0)) || 0;
      const range = Math.floor(rating);
      acc[range] = (acc[range] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    console.log('Rating distribution:', ratingStats);
  }

  const sortedVendors = filteredAndSortedVendors
    .sort((a, b) => {
      // Default sorting by rating (highest first)
          return (b.rating || 0) - (a.rating || 0);
    });

  // Debug: Log final results
  if (serviceType === 'photography') {
    console.log('Photography vendors after filtering and sorting:', sortedVendors.map(v => v.brand_name));
  }

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedServiceTypes([]);
    setSelectedLocations([]);
    setSelectedBudgetRanges([]);
    setSearchQuery('');
    setDisplayQuery('');
    setOriginalSmartRequest('');
    setRatingFilter('all');
    // Removed auto-scroll when clearing filters - let user stay at their current scroll position
  };

  // Navigate to individual vendor profile
  const handleCardClick = (vendorId: number) => {
    navigate(`/vendor/${vendorId}`);
  };

  // WhatsApp integration - now handled by WhatsAppButton component

  return (
    <div ref={topRef} className="min-h-screen bg-gradient-to-br from-amber-50/30 via-white to-orange-50/30 pb-8">
      {/* Smart Request Input Section - Fixed Layout */}
      <div className="relative py-4 pt-4 overflow-visible min-h-[180px]">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600 via-orange-500 to-orange-400"></div>
        
        {/* Back Button - Far Left */}
        <div className="absolute top-4 left-4 z-30">
            <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="bg-white/90 hover:bg-white border-white/50 text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg shadow-sm"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
            </Button>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="mb-3">
            {/* Main Content Area */}
            <div className="w-full">
              <Card className="border border-orange-200 shadow-lg mx-0 w-full relative z-20 mb-3">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 py-3 px-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl font-bold text-orange-800">Your Prompt</span>
                  </div>

                  {isListening && (
                    <div className="flex items-center gap-2 text-red-600 text-xs mt-1">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                      <span>Listening...</span>
                    </div>
                  )}
                </CardHeader>
                  <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Compact Text Input */}
                    <div className="relative">
                      <Textarea
                        value={originalSmartRequest || displayQuery || ""}
                        onChange={(e) => {
                          setOriginalSmartRequest(e.target.value);
                          setDisplayQuery(e.target.value);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            // Parse prompt and update filters
                            const queryToSearch = originalSmartRequest || displayQuery;
                            if (queryToSearch.trim()) {
                              parsePromptAndUpdateFilters(queryToSearch);
                            }
                          }
                        }}
                        placeholder="Describe what you need for your event..."
                        className="min-h-[60px] text-sm pr-20"
                        disabled={loading}
                      />
                        
                      {/* Action Buttons */}
                      <div className="absolute bottom-2 right-2 flex gap-2">
                        {/* Clear Button */}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setOriginalSmartRequest('');
                            setDisplayQuery('');
                                setSearchQuery('');
                            // Clear URL params as well
                            const params = new URLSearchParams(searchParams);
                            params.delete('query');
                            setSearchParams(params);
                              }}
                          disabled={loading || (!originalSmartRequest?.trim() && !displayQuery?.trim())}
                          className="h-5 w-5 p-0 bg-white hover:bg-red-50 border-red-300 hover:border-red-400 text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Clear input"
                            >
                          <Trash2 className="h-3 w-3" />
                            </Button>
                          
                          {!isListening ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                            onClick={() => {
                              startListening();
                            }}
                              disabled={loading}
                            className="h-5 w-5 p-0 bg-white hover:bg-gray-50 border-orange-300 hover:border-orange-400"
                              title="Start voice recording"
                            >
                            <Mic className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                            onClick={() => {
                              stopListening();
                            }}
                            className="h-5 w-5 p-0 animate-pulse bg-red-500 hover:bg-red-600"
                              title="Stop voice recording"
                            >
                            <MicOff className="h-4 w-4" />
                            </Button>
                          )}
                          
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            // Parse prompt and update filters
                            const queryToSearch = originalSmartRequest || displayQuery;
                            console.log('🚀 Send button clicked with text:', queryToSearch);
                            if (queryToSearch.trim()) {
                              parsePromptAndUpdateFilters(queryToSearch);
                              console.log('✅ Parsing function called');
                            } else {
                              console.log('⚠️ No text to parse');
                            }
                          }}
                          disabled={loading || isProcessing || (!originalSmartRequest?.trim() && !displayQuery?.trim())}
                          className="h-5 w-5 p-0 bg-orange-500 hover:bg-orange-600 text-white"
                          title="Send search query"
                          >
                          {loading || isProcessing ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </Button>
                      </div>
                    </div>

                    {/* Compact Voice Transcript */}
                    {transcript && (
                      <div className="bg-blue-50 border border-blue-200 rounded p-2">
                        <p className="text-xs text-blue-700">
                          <strong>Listening:</strong> {transcript}
                        </p>
                      </div>
                    )}

                    {/* Voice Error */}
                    {voiceError && (
                      <div className="bg-red-50 border border-red-200 rounded p-2">
                        <p className="text-xs text-red-700">
                          <strong>Error:</strong> {voiceError}
                        </p>
                      </div>
                    )}

                    {/* Compact Processing Indicator */}
                    {isProcessing && (
                      <div className="flex items-center gap-2 text-orange-600">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span className="text-xs">Understanding your request...</span>
                      </div>
                    )}
                  </div>
                  </CardContent>
                </Card>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-white rounded-t-2xl shadow-inner"></div>
      </div>

      {/* Filters Section */}
      <div className="container mx-auto px-4 sm:px-6 py-4 mt-2">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/40 p-3 mb-4">
          {/* Main Filter Row */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3">
            {/* Service Type - Multi-select */}
            <div className="flex-1">
              <label className="block text-wedding-navy text-xs font-semibold mb-2 text-left flex items-center gap-1">
                <Camera className="h-3 w-3 text-orange-500" />
                What do you need?
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-9 border border-gray-200 bg-white text-wedding-navy hover:border-orange-300 transition-all duration-200 rounded-lg text-sm justify-start"
                  >
                    <span>
                      {selectedServiceTypes.length === 0 
                        ? 'All Services' 
                        : selectedServiceTypes.length === 1
                        ? serviceTypes.find(s => s.value === selectedServiceTypes[0])?.label || '1 Service'
                        : `${selectedServiceTypes.length} Services`
                      }
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-0" align="start">
                  <div className="p-3 border-b">
                    <p className="text-sm font-semibold text-gray-700">Select Services</p>
                  </div>
                  <div className="max-h-64 overflow-y-auto p-2">
                    {serviceTypes.filter(s => s.value !== 'all').map((type) => {
                      const isChecked = selectedServiceTypes.includes(type.value);
                      return (
                        <div
                          key={type.value}
                          className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded"
                        >
                          <Checkbox
                            id={`service-${type.value}`}
                            checked={isChecked}
                            onCheckedChange={() => toggleServiceType(type.value)}
                          />
                          <label 
                            htmlFor={`service-${type.value}`}
                            className="text-sm text-gray-700 cursor-pointer flex-1"
                          >
                      {type.label}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                  {selectedServiceTypes.length > 0 && (
                    <div className="p-2 border-t">
                      <Button
                        variant="ghost"
                    size="sm"
                        className="w-full text-xs"
                        onClick={() => setSelectedServiceTypes([])}
                      >
                        Clear All
                  </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Location - Multi-select */}
            <div className="flex-1">
              <label className="block text-wedding-navy text-xs font-semibold mb-2 text-left flex items-center gap-1">
                <MapPin className="h-3 w-3 text-orange-500" />
                Where?
              </label>
              <Popover>
                <PopoverTrigger asChild>
                <Button
                  variant="outline"
                    className="w-full h-9 border border-gray-200 bg-white text-wedding-navy hover:border-orange-300 transition-all duration-200 rounded-lg text-sm justify-start"
                  >
                    <span>
                      {selectedLocations.length === 0 
                        ? 'All Locations' 
                        : selectedLocations.length === 1
                        ? cities.find(c => c.value === selectedLocations[0])?.label || '1 Location'
                        : `${selectedLocations.length} Locations`
                      }
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-0" align="start">
                  <div className="p-3 border-b">
                    <p className="text-sm font-semibold text-gray-700">Select Locations</p>
                  </div>
                  <div className="max-h-64 overflow-y-auto p-2">
                    {cities.filter(c => c.value !== 'all').map((city) => {
                      const isChecked = selectedLocations.includes(city.value);
                      return (
                        <div
                          key={city.value}
                          className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded"
                        >
                          <Checkbox
                            id={`location-${city.value}`}
                            checked={isChecked}
                            onCheckedChange={() => toggleLocation(city.value)}
                          />
                          <label 
                            htmlFor={`location-${city.value}`}
                            className="text-sm text-gray-700 cursor-pointer flex-1"
                          >
                      {city.label}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                  {selectedLocations.length > 0 && (
                    <div className="p-2 border-t">
                      <Button
                        variant="ghost"
                  size="sm"
                        className="w-full text-xs"
                        onClick={() => setSelectedLocations([])}
                >
                        Clear All
                </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Budget - Multi-select */}
            <div className="flex-1">
              <label className="block text-wedding-navy text-xs font-semibold mb-2 text-left flex items-center gap-1">
                <Users className="h-3 w-3 text-orange-500" />
                Your budget (Optional)
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-9 border border-gray-200 bg-white text-wedding-navy hover:border-orange-300 transition-all duration-200 rounded-lg text-sm justify-start"
                  >
                    <span>
                      {selectedBudgetRanges.length === 0 
                        ? 'All Budgets' 
                        : selectedBudgetRanges.length === 1
                        ? (selectedBudgetRanges[0] === 'custom' 
                          ? `₹${formatIndianNumber(customMinBudget)}-₹${formatIndianNumber(customMaxBudget)}`
                          : budgetRanges.find(b => b.value === selectedBudgetRanges[0])?.label || '1 Range')
                        : `${selectedBudgetRanges.length} Ranges`
                      }
                    </span>
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-0" align="start">
                  <div className="p-3 border-b">
                    <p className="text-sm font-semibold text-gray-700">Select Budget Ranges</p>
                </div>
                  <div className="max-h-64 overflow-y-auto p-2">
                    {budgetRanges.filter(b => b.value !== 'all').map((range) => {
                      const isChecked = selectedBudgetRanges.includes(range.value);
                      return (
                        <div
                          key={range.value}
                          className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded"
                        >
                          <Checkbox
                            id={`budget-${range.value}`}
                            checked={isChecked}
                            onCheckedChange={() => toggleBudgetRange(range.value)}
                          />
                          <label 
                            htmlFor={`budget-${range.value}`}
                            className="text-sm text-gray-700 cursor-pointer flex-1"
                          >
                      {range.label}
                          </label>
              </div>
                      );
                    })}
              </div>
              
                  <div className="border-t p-2">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="budget-custom"
                          checked={selectedBudgetRanges.includes('custom')}
                          onCheckedChange={() => {
                            if (!selectedBudgetRanges.includes('custom')) {
                              setShowCustomBudget(true);
                              if (!selectedBudgetRanges.includes('custom')) {
                                setSelectedBudgetRanges(prev => [...prev, 'custom']);
                              }
                            } else {
                              toggleBudgetRange('custom');
                              setCustomMinBudget('');
                              setCustomMaxBudget('');
                              setShowCustomBudget(false);
                            }
                          }}
                        />
                        <label 
                          htmlFor="budget-custom"
                          className="text-sm font-semibold text-gray-700 cursor-pointer flex-1"
                        >
                          Custom Budget
                        </label>
                </div>
                      {selectedBudgetRanges.includes('custom') && (
                        <div className="space-y-2 pl-6">
                          <div className="grid grid-cols-2 gap-2">
                <div>
                              <label className="text-xs text-gray-500 mb-1 block">Min (₹)</label>
                              <Input
                                type="text"
                                placeholder="Min"
                                value={customMinBudget ? `₹${formatIndianNumber(customMinBudget)}` : ''}
                                onChange={(e) => handleCustomBudgetChange('min', e.target.value)}
                                className="text-sm"
                              />
                </div>
                <div>
                              <label className="text-xs text-gray-500 mb-1 block">Max (₹)</label>
                              <Input
                                type="text"
                                placeholder="Max"
                                value={customMaxBudget ? `₹${formatIndianNumber(customMaxBudget)}` : ''}
                                onChange={(e) => handleCustomBudgetChange('max', e.target.value)}
                                className="text-sm"
                              />
                </div>
              </div>
                <Button
                            onClick={applyCustomBudget}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm"
                            disabled={!customMaxBudget}
                          >
                            Apply
                </Button>
              </div>
                      )}
                    </div>
                  </div>
                  
                  {selectedBudgetRanges.length > 0 && (
                    <div className="p-2 border-t">
                  <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs"
                    onClick={() => {
                          setSelectedBudgetRanges([]);
                          setCustomMinBudget('');
                          setCustomMaxBudget('');
                          setShowCustomBudget(false);
                        }}
                      >
                        Clear All
                  </Button>
                </div>
            )}
                </PopoverContent>
              </Popover>
        </div>
            
            {/* Rating Filter - In main row */}
            <div className="flex-1">
              <label className="block text-wedding-navy text-xs font-semibold mb-2 text-left flex items-center gap-1">
                <Star className="h-3 w-3 text-orange-500" />
                Rating
              </label>
                <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="w-full h-9 border border-gray-200 bg-white text-wedding-navy hover:border-orange-300 transition-all duration-200 rounded-lg text-sm">
                  <SelectValue placeholder="All Ratings" />
                  </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 rounded-lg">
                    <SelectItem value="all">All Ratings</SelectItem>
                    <SelectItem value="5">5+ Stars</SelectItem>
                    <SelectItem value="4.5">4.5+ Stars</SelectItem>
                    <SelectItem value="4">4+ Stars</SelectItem>
                    <SelectItem value="3.5">3.5+ Stars</SelectItem>
                    <SelectItem value="3">3+ Stars</SelectItem>
                    <SelectItem value="2">2+ Stars</SelectItem>
                    <SelectItem value="1">1+ Stars</SelectItem>
                  </SelectContent>
                </Select>
            </div>
            
            {/* Search Bar - In main row */}
            <div className="flex-1">
              <label className="block text-wedding-navy text-xs font-semibold mb-2 text-left flex items-center gap-1">
                <Search className="h-3 w-3 text-orange-500" />
                Search
              </label>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                <Input
                  placeholder="Search vendors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 h-9 border border-gray-200 bg-white text-wedding-navy hover:border-orange-300 focus:border-orange-400 focus:ring-1 focus:ring-orange-200 rounded-lg text-sm transition-all duration-200"
                />
              </div>
            </div>
            </div>
            
        </div>
      </div>

      {/* Results Section */}
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between mb-3">
          <div>
                <h2 className="text-2xl font-bold text-gray-900">
              {sortedVendors.length} Vendors Found
            </h2>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading vendors...</p>
          </div>
        ) : (
          <>
            {/* Vendor Cards Grid - Using Unified Short Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedVendors.map((vendor) => (
                <VendorShortCard
                  key={vendor.vendor_id}
                            vendor={vendor}
                />
              ))}
            </div>

            {/* No Results */}
            {filteredAndSortedVendors.length === 0 && (
              <div className="text-center py-8">
                <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No vendors found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your search criteria or browse all vendors</p>
                <Button 
                  onClick={clearAllFilters}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom CTA Section */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white py-12 mt-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Can't Find the Perfect Vendor?</h2>
          <p className="text-amber-100 mb-6 max-w-2xl mx-auto">
            Let us help you find the ideal professional for your special event. 
            Our team will connect you with verified vendors in your area.
          </p>
          <Button 
            className="bg-white text-amber-600 hover:bg-amber-50 px-8 py-3 text-lg font-semibold rounded-xl shadow-lg"
            onClick={() => window.open('https://wa.me/1234567890?text=Hi! I need personalized vendor recommendations for my event.', '_blank')}
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Get Personalized Recommendations
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VendorsPage;
