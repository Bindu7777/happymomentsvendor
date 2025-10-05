// Enhanced Audio Engine for Advanced Speech Recognition and Entity Extraction
// This module provides comprehensive audio processing capabilities with high accuracy

export interface AudioProcessingResult {
  originalText: string;
  processedText: string;
  extractedEntities: ExtractedEntities;
  confidence: number;
  language: 'en' | 'te' | 'mixed';
  errors?: string[];
}

export interface ExtractedEntities {
  eventType?: {
    value: string;
    confidence: number;
    synonyms: string[];
  };
  serviceTypes: {
    value: string;
    category: string;
    confidence: number;
  }[];
  location?: {
    city: string;
    state?: string;
    locality?: string;
    confidence: number;
  };
  budget?: {
    min: number;
    max: number;
    currency: string;
    type: 'exact' | 'range' | 'starting_from' | 'upto' | 'around';
    confidence: number;
  };
  date?: {
    value: string;
    type: 'specific' | 'relative' | 'range';
    confidence: number;
  };
  preferences: {
    gender?: 'male' | 'female' | 'any';
    experience?: 'experienced' | 'beginner' | 'expert';
    style?: string[];
    urgency?: 'immediate' | 'this_week' | 'this_month' | 'flexible';
    availability?: 'available_now' | 'flexible';
  };
  additionalInfo: string[];
}

export interface VendorFilterCriteria {
  categories: string[];
  location: string;
  budgetRange?: {
    min: number;
    max: number;
  };
  dateRange?: {
    start: string;
    end: string;
  };
  preferences: {
    gender?: string;
    experience?: string;
    style?: string[];
  };
  additionalRequirements: string[];
}

// Enhanced Telugu-English mapping with context awareness
const ENHANCED_TELUGU_MAPPINGS = {
  // Event Types
  events: {
    'pelli': 'wedding',
    'pelli ki': 'for wedding',
    'kalyana': 'wedding',
    'vivah': 'wedding',
    'shaadi': 'wedding',
    'birthday': 'birthday',
    'birthday party': 'birthday party',
    'birthday ki': 'for birthday',
    'corporate': 'corporate',
    'office event': 'corporate event',
    'business event': 'corporate event',
    'anniversary': 'anniversary',
    'engagement': 'engagement',
    'sagai': 'engagement',
    'baby shower': 'baby shower',
    'godh bharai': 'baby shower',
    'seemantham': 'baby shower',
    'housewarming': 'housewarming',
    'griha pravesh': 'housewarming',
    'festival': 'festival',
    'puja': 'religious event'
  },
  
  // Services
  services: {
    'photographer': 'photographer',
    'photo': 'photographer',
    'camera': 'photographer',
    'photo shoot': 'photographer',
    'wedding photos': 'photographer',
    'photographer kavali': 'need photographer',
    'makeup artist': 'makeup artist',
    'makeup': 'makeup artist',
    'beauty': 'makeup artist',
    'bridal makeup': 'makeup artist',
    'makeup artist kavali': 'need makeup artist',
    'decorator': 'decorator',
    'decoration': 'decorator',
    'floral': 'decorator',
    'stage decoration': 'decorator',
    'mandap decoration': 'decorator',
    'decorator kavali': 'need decorator',
    'caterer': 'caterer',
    'catering': 'caterer',
    'food': 'caterer',
    'catering kavali': 'need catering',
    'food kavali': 'need food',
    'dj': 'dj',
    'music': 'dj',
    'sound system': 'dj',
    'lighting': 'dj',
    'party music': 'dj',
    'dj kavali': 'need dj',
    'music kavali': 'need music',
    'venue': 'venue',
    'hall': 'venue',
    'banquet': 'venue',
    'wedding venue': 'venue',
    'venue kavali': 'need venue',
    'hall kavali': 'need hall',
    'planner': 'event planner',
    'event planner': 'event planner',
    'coordinator': 'event planner',
    'organizer': 'event planner',
    'event management': 'event planner',
    'planner kavali': 'need planner',
    'event planner kavali': 'need event planner',
    'anchor': 'anchor',
    'emcee': 'anchor',
    'host': 'anchor',
    'announcer': 'anchor',
    'anchor kavali': 'need anchor',
    'transport': 'transportation',
    'car': 'transportation',
    'vehicle': 'transportation',
    'transportation': 'transportation',
    'car rental': 'transportation',
    'transport kavali': 'need transport',
    'car kavali': 'need car',
    'fashion': 'fashion designer',
    'designer': 'fashion designer',
    'outfit': 'fashion designer',
    'dress': 'fashion designer',
    'clothing': 'fashion designer',
    'fashion kavali': 'need fashion designer',
    'dress kavali': 'need dress',
    'tent': 'tent rental',
    'equipment': 'tent rental',
    'furniture': 'tent rental',
    'tent kavali': 'need tent',
    'equipment kavali': 'need equipment'
  },
  
  // Locations
  locations: {
    'hyderabad': 'Hyderabad',
    'bangalore': 'Bangalore',
    'chennai': 'Chennai',
    'mumbai': 'Mumbai',
    'delhi': 'Delhi',
    'kolkata': 'Kolkata',
    'pune': 'Pune',
    'ahmedabad': 'Ahmedabad',
    'jaipur': 'Jaipur',
    'lucknow': 'Lucknow',
    'kanpur': 'Kanpur',
    'nagpur': 'Nagpur',
    'indore': 'Indore',
    'thane': 'Thane',
    'bhopal': 'Bhopal',
    'visakhapatnam': 'Visakhapatnam',
    'vijayawada': 'Vijayawada',
    'guntur': 'Guntur',
    'warangal': 'Warangal',
    'nellore': 'Nellore',
    'kadapa': 'Kadapa',
    'kurnool': 'Kurnool',
    'tirupati': 'Tirupati',
    'anantapur': 'Anantapur',
    'karimnagar': 'Karimnagar',
    'nizamabad': 'Nizamabad',
    'khammam': 'Khammam',
    'mahabubnagar': 'Mahabubnagar',
    'nalgonda': 'Nalgonda',
    'suryapet': 'Suryapet',
    'miryalaguda': 'Miryalaguda',
    'siddipet': 'Siddipet',
    'jagtial': 'Jagtial',
    'peddapalli': 'Peddapalli',
    'kamareddy': 'Kamareddy',
    'sangareddy': 'Sangareddy',
    'medak': 'Medak',
    'adilabad': 'Adilabad',
    'asifabad': 'Asifabad',
    'komaram bheem': 'Komaram Bheem',
    'mancherial': 'Mancherial',
    'bhupalpally': 'Bhupalpally',
    'mulugu': 'Mulugu',
    'jayashankar': 'Jayashankar',
    'bhadradri': 'Bhadradri',
    'kothagudem': 'Kothagudem',
    'yadadri': 'Yadadri',
    'bhuvanagiri': 'Bhuvanagiri',
    'rangareddy': 'Rangareddy',
    'vikarabad': 'Vikarabad',
    'medchal': 'Medchal',
    'malkajgiri': 'Malkajgiri',
    'secunderabad': 'Secunderabad',
    'telangana': 'Telangana',
    'andhra pradesh': 'Andhra Pradesh',
    'karnataka': 'Karnataka',
    'tamil nadu': 'Tamil Nadu',
    'maharashtra': 'Maharashtra',
    'west bengal': 'West Bengal',
    'gujarat': 'Gujarat',
    'rajasthan': 'Rajasthan',
    'uttar pradesh': 'Uttar Pradesh'
  },
  
  // Numbers and Currency
  numbers: {
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
    'moodu koti': '3 crore'
  },
  
  // Common phrases
  phrases: {
    'naaku': 'i need',
    'kavali': 'need',
    'aravai': 'good',
    'velu': 'good',
    'manchi': 'good',
    'budget lo': 'within budget',
    'budget ki': 'for budget',
    'discount kavali': 'need discount',
    'discount ivvara': 'can you give discount',
    'family ki': 'for family',
    'family kosam': 'for family',
    'sister ki': 'for sister',
    'brother ki': 'for brother',
    'within': 'within',
    'around': 'around',
    'upto': 'upto',
    'maximum': 'maximum',
    'minimum': 'minimum',
    'starting from': 'starting from',
    'at least': 'at least',
    'not more than': 'not more than',
    'female if possible': 'prefer female',
    'male if possible': 'prefer male',
    'experienced': 'experienced',
    'professional': 'professional',
    'creative': 'creative',
    'traditional': 'traditional',
    'modern': 'modern',
    'luxury': 'luxury',
    'budget friendly': 'budget friendly',
    'same day': 'same day',
    'quick': 'quick',
    'immediate': 'immediate',
    'urgent': 'urgent',
    'this week': 'this week',
    'next week': 'next week',
    'this month': 'this month',
    'next month': 'next month'
  }
};

// Advanced Entity Extraction Patterns
const ENTITY_PATTERNS = {
  // Event Type Patterns
  eventTypes: [
    { pattern: /(?:wedding|marriage|shaadi|vivah|kalyana|pelli|pelli\s+ki)/i, type: 'Wedding', confidence: 0.9 },
    { pattern: /(?:birthday|bday|birthday\s+party|birthday\s+celebration|birthday\s+ki)/i, type: 'Birthday', confidence: 0.9 },
    { pattern: /(?:corporate|office|business|company|corporate\s+event|corporate\s+ki)/i, type: 'Corporate', confidence: 0.9 },
    { pattern: /(?:anniversary|anniversary\s+celebration|wedding\s+anniversary|anniversary\s+ki)/i, type: 'Anniversary', confidence: 0.9 },
    { pattern: /(?:engagement|ring\s+ceremony|sagai|engagement\s+ki|ring\s+ceremony\s+ki)/i, type: 'Engagement', confidence: 0.9 },
    { pattern: /(?:baby\s+shower|godh\s+bharai|seemantham|baby\s+shower\s+ki)/i, type: 'Baby Shower', confidence: 0.9 },
    { pattern: /(?:housewarming|griha\s+pravesh|new\s+home|housewarming\s+ki)/i, type: 'Housewarming', confidence: 0.9 },
    { pattern: /(?:festival|festival\s+celebration|religious|puja|festival\s+ki)/i, type: 'Festival', confidence: 0.9 }
  ],
  
  // Service Type Patterns
  serviceTypes: [
    { pattern: /(?:photographer|photography|photo|camera|shoot|candid|wedding\s+photos|photographer\s+kavali)/i, category: 'Photographers', confidence: 0.9 },
    { pattern: /(?:makeup|makeup\s+artist|beauty|bridal\s+makeup|glamour|makeup\s+artist\s+kavali)/i, category: 'Makeup Artists', confidence: 0.9 },
    { pattern: /(?:decorator|decoration|floral|balloon|stage|mandap|backdrop|decorator\s+kavali)/i, category: 'Decorators', confidence: 0.9 },
    { pattern: /(?:caterer|catering|food|catering\s+kavali|food\s+kavali)/i, category: 'Caterers', confidence: 0.9 },
    { pattern: /(?:dj|music|entertainment|sound|lighting|dance|party\s+music|dj\s+kavali)/i, category: 'DJs, Lighting, and Entertainment', confidence: 0.9 },
    { pattern: /(?:venue|hall|banquet|resort|hotel|garden|outdoor\s+venue|venue\s+kavali)/i, category: 'Venues', confidence: 0.9 },
    { pattern: /(?:planner|event\s+planner|coordinator|organizer|event\s+management|planner\s+kavali)/i, category: 'Event Planners', confidence: 0.9 },
    { pattern: /(?:anchor|emcee|host|announcer|master\s+of\s+ceremonies|anchor\s+kavali)/i, category: 'Anchors', confidence: 0.9 },
    { pattern: /(?:transport|car|vehicle|rental|transportation|bus|car\s+rental|transport\s+kavali)/i, category: 'Transportation Services', confidence: 0.9 },
    { pattern: /(?:fashion|costume|designer|outfit|dress|suit|clothing|fashion\s+kavali)/i, category: 'Fashion/Costume Designers', confidence: 0.9 },
    { pattern: /(?:tent|equipment|rental|furniture|tent\s+rental|equipment\s+rental|tent\s+kavali)/i, category: 'Tent & Equipment Rentals', confidence: 0.9 }
  ],
  
  // Budget Patterns with enhanced accuracy
  budgetPatterns: [
    // Exact amounts
    { pattern: /(\d{1,3}(?:,\d{3})*)\s*(?:rupees?|rs|inr|₹)/i, type: 'exact', multiplier: 1 },
    { pattern: /₹\s*(\d{1,3}(?:,\d{3})*)/i, type: 'exact', multiplier: 1 },
    
    // K format (thousands)
    { pattern: /(\d+)\s*k\s*(?:budget|kavali|lo|ki|for|upto|maximum|max)/i, type: 'exact', multiplier: 1000 },
    { pattern: /(?:budget|kavali|lo|ki|for|upto|maximum|max)\s*(\d+)\s*k/i, type: 'exact', multiplier: 1000 },
    { pattern: /(\d+)\s*k\b/i, type: 'exact', multiplier: 1000 },
    
    // Lakh format
    { pattern: /(\d+)\s*lakh\s*(?:budget|kavali|lo|ki|for|upto|maximum|max)/i, type: 'exact', multiplier: 100000 },
    { pattern: /(?:budget|kavali|lo|ki|for|upto|maximum|max)\s*(\d+)\s*lakh/i, type: 'exact', multiplier: 100000 },
    { pattern: /(\d+)\s*lakh\b/i, type: 'exact', multiplier: 100000 },
    
    // Crore format
    { pattern: /(\d+)\s*crore\s*(?:budget|kavali|lo|ki|for|upto|maximum|max)/i, type: 'exact', multiplier: 10000000 },
    { pattern: /(?:budget|kavali|lo|ki|for|upto|maximum|max)\s*(\d+)\s*crore/i, type: 'exact', multiplier: 10000000 },
    { pattern: /(\d+)\s*crore\b/i, type: 'exact', multiplier: 10000000 },
    
    // Range patterns
    { pattern: /(\d+)\s*(?:k|lakh|crore)?\s*(?:to|and|-)\s*(\d+)\s*(?:k|lakh|crore)/i, type: 'range', multiplier: [1000, 100000, 10000000] },
    
    // Starting from patterns
    { pattern: /(?:starting|from|minimum|min)\s*(\d+)\s*(?:k|lakh|crore)?/i, type: 'starting_from', multiplier: [1000, 100000, 10000000] },
    { pattern: /(\d+)\s*(?:k|lakh|crore)?\s*(?:starting|from|minimum|min)/i, type: 'starting_from', multiplier: [1000, 100000, 10000000] },
    
    // Upto patterns
    { pattern: /(?:upto|maximum|max|not\s+more\s+than)\s*(\d+)\s*(?:k|lakh|crore)?/i, type: 'upto', multiplier: [1000, 100000, 10000000] },
    { pattern: /(\d+)\s*(?:k|lakh|crore)?\s*(?:upto|maximum|max)/i, type: 'upto', multiplier: [1000, 100000, 10000000] },
    
    // Around patterns
    { pattern: /(?:around|about|approximately)\s*(\d+)\s*(?:k|lakh|crore)?/i, type: 'around', multiplier: [1000, 100000, 10000000] },
    { pattern: /(\d+)\s*(?:k|lakh|crore)?\s*(?:around|about|approximately)/i, type: 'around', multiplier: [1000, 100000, 10000000] },
    
    // Telugu patterns
    { pattern: /oka\s+laksha/i, type: 'exact', amount: 100000 },
    { pattern: /(\d+)\s+laksha/i, type: 'exact', multiplier: 100000 },
    { pattern: /oka\s+koti/i, type: 'exact', amount: 10000000 },
    { pattern: /(\d+)\s+koti/i, type: 'exact', multiplier: 10000000 }
  ],
  
  // Location Patterns
  locationPatterns: [
    { pattern: /(?:in|at|near|location|place|lo|ki)\s+([a-zA-Z]+(?:\s+[a-zA-Z]+)*)/i, confidence: 0.8 },
    { pattern: /([a-zA-Z]+(?:\s+[a-zA-Z]+)*)\s+(?:lo|ki|location|place)/i, confidence: 0.8 },
    { pattern: /([a-zA-Z]+)\s+(telangana|andhra\s+pradesh|karnataka|tamil\s+nadu|maharashtra)/i, confidence: 0.9 }
  ],
  
  // Date Patterns
  datePatterns: [
    { pattern: /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/, type: 'specific' },
    { pattern: /(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{2,4})/i, type: 'specific' },
    { pattern: /(?:on|for)\s+(\d{1,2})(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december)/i, type: 'specific' },
    { pattern: /(today|tomorrow|next\s+week|next\s+month|this\s+week|this\s+month)/i, type: 'relative' },
    { pattern: /(\d+)\s+(days?|weeks?|months?)\s+(?:from\s+now|later|after)/i, type: 'relative' }
  ],
  
  // Preference Patterns
  preferencePatterns: [
    // Gender preferences
    { pattern: /(?:female|women|lady|madam|female\s+artist|female\s+if\s+possible)/i, preference: 'gender', value: 'female' },
    { pattern: /(?:male|men|guy|sir|male\s+artist|male\s+if\s+possible)/i, preference: 'gender', value: 'male' },
    
    // Experience preferences
    { pattern: /(?:experienced|professional|expert|senior|experienced\s+kavali)/i, preference: 'experience', value: 'experienced' },
    { pattern: /(?:beginner|new|fresh|junior)/i, preference: 'experience', value: 'beginner' },
    
    // Style preferences
    { pattern: /(?:traditional|traditional\s+style|traditional\s+kavali)/i, preference: 'style', value: 'traditional' },
    { pattern: /(?:modern|contemporary|modern\s+style)/i, preference: 'style', value: 'modern' },
    { pattern: /(?:creative|artistic|unique|creative\s+kavali)/i, preference: 'style', value: 'creative' },
    { pattern: /(?:luxury|premium|high\s+end|luxury\s+kavali)/i, preference: 'style', value: 'luxury' },
    { pattern: /(?:budget|affordable|cheap|budget\s+friendly|budget\s+kavali)/i, preference: 'style', value: 'budget' },
    
    // Urgency preferences
    { pattern: /(?:immediate|urgent|asap|immediate\s+kavali|urgent\s+kavali)/i, preference: 'urgency', value: 'immediate' },
    { pattern: /(?:this\s+week|within\s+a\s+week|this\s+week\s+kavali)/i, preference: 'urgency', value: 'this_week' },
    { pattern: /(?:this\s+month|within\s+a\s+month|this\s+month\s+kavali)/i, preference: 'urgency', value: 'this_month' },
    
    // Availability preferences
    { pattern: /(?:available\s+now|immediate\s+availability|available\s+now\s+kavali)/i, preference: 'availability', value: 'available_now' },
    { pattern: /(?:flexible|flexible\s+timing|flexible\s+kavali)/i, preference: 'availability', value: 'flexible' }
  ]
};

export class EnhancedAudioEngine {
  private text: string;
  private processedText: string;
  private entities: ExtractedEntities;

  constructor(text: string) {
    this.text = text.toLowerCase().trim();
    this.processedText = '';
    this.entities = {
      serviceTypes: [],
      preferences: {},
      additionalInfo: []
    };
  }

  async processAudio(): Promise<AudioProcessingResult> {
    try {
      // Step 1: Pre-process text for better accuracy
      this.processedText = this.preprocessText(this.text);
      
      // Step 2: Detect language
      const language = this.detectLanguage(this.processedText);
      
      // Step 3: Extract entities using enhanced patterns
      await this.extractEntities();
      
      // Step 4: Calculate confidence score
      const confidence = this.calculateConfidence();
      
      // Step 5: Validate and clean extracted entities
      this.validateEntities();
      
      return {
        originalText: this.text,
        processedText: this.processedText,
        extractedEntities: this.entities,
        confidence,
        language,
        errors: this.validateEntities()
      };
    } catch (error) {
      console.error('Error processing audio:', error);
      return {
        originalText: this.text,
        processedText: this.text,
        extractedEntities: this.entities,
        confidence: 0,
        language: 'en',
        errors: ['Error processing audio input']
      };
    }
  }

  private preprocessText(text: string): string {
    let processed = text.toLowerCase().trim();
    
    // Apply Telugu mappings
    Object.entries(ENHANCED_TELUGU_MAPPINGS.events).forEach(([telugu, english]) => {
      const regex = new RegExp(`\\b${telugu}\\b`, 'gi');
      processed = processed.replace(regex, english);
    });
    
    Object.entries(ENHANCED_TELUGU_MAPPINGS.services).forEach(([telugu, english]) => {
      const regex = new RegExp(`\\b${telugu}\\b`, 'gi');
      processed = processed.replace(regex, english);
    });
    
    Object.entries(ENHANCED_TELUGU_MAPPINGS.locations).forEach(([telugu, english]) => {
      const regex = new RegExp(`\\b${telugu}\\b`, 'gi');
      processed = processed.replace(regex, english);
    });
    
    Object.entries(ENHANCED_TELUGU_MAPPINGS.numbers).forEach(([telugu, english]) => {
      const regex = new RegExp(`\\b${telugu}\\b`, 'gi');
      processed = processed.replace(regex, english);
    });
    
    Object.entries(ENHANCED_TELUGU_MAPPINGS.phrases).forEach(([telugu, english]) => {
      const regex = new RegExp(`\\b${telugu}\\b`, 'gi');
      processed = processed.replace(regex, english);
    });
    
    // Clean up common speech recognition errors
    processed = processed
      .replace(/\b(um|uh|ah|er|like|you know)\b/g, '') // Remove filler words
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\b(budgetw|budget\s+w)\b/gi, 'budget') // Fix common speech errors
      .replace(/\b(photographer\s+w)\b/gi, 'photographer') // Fix speech errors
      .trim();
    
    return processed;
  }

  private detectLanguage(text: string): 'en' | 'te' | 'mixed' {
    const teluguWords = ['kavali', 'ki', 'lo', 'pelli', 'laksha', 'koti', 'naaku', 'aravai', 'velu', 'manchi'];
    const englishWords = ['wedding', 'photographer', 'budget', 'hyderabad', 'need', 'want', 'for', 'in', 'at'];
    
    const teluguCount = teluguWords.filter(word => text.includes(word)).length;
    const englishCount = englishWords.filter(word => text.includes(word)).length;
    
    if (teluguCount > englishCount) return 'te';
    if (englishCount > teluguCount) return 'en';
    return 'mixed';
  }

  private async extractEntities(): Promise<void> {
    // Extract Event Type
    this.extractEventType();
    
    // Extract Service Types
    this.extractServiceTypes();
    
    // Extract Location
    this.extractLocation();
    
    // Extract Budget
    this.extractBudget();
    
    // Extract Date
    this.extractDate();
    
    // Extract Preferences
    this.extractPreferences();
    
    // Extract Additional Info
    this.extractAdditionalInfo();
  }

  private extractEventType(): void {
    for (const pattern of ENTITY_PATTERNS.eventTypes) {
      const match = this.processedText.match(pattern.pattern);
      if (match) {
        this.entities.eventType = {
          value: pattern.type,
          confidence: pattern.confidence,
          synonyms: [match[0]]
        };
        break;
      }
    }
  }

  private extractServiceTypes(): void {
    for (const pattern of ENTITY_PATTERNS.serviceTypes) {
      const match = this.processedText.match(pattern.pattern);
      if (match) {
        this.entities.serviceTypes.push({
          value: match[0],
          category: pattern.category,
          confidence: pattern.confidence
        });
      }
    }
  }

  private extractLocation(): void {
    for (const pattern of ENTITY_PATTERNS.locationPatterns) {
      const match = this.processedText.match(pattern.pattern);
      if (match) {
        const locationText = match[1].trim();
        const parts = locationText.split(' ');
        
        if (parts.length >= 2) {
          // Likely city-state combination
          this.entities.location = {
            city: parts[0],
            state: parts.slice(1).join(' '),
            confidence: pattern.confidence
          };
        } else {
          // Single location
          this.entities.location = {
            city: parts[0],
            confidence: pattern.confidence
          };
        }
        break;
      }
    }
  }

  private extractBudget(): void {
    for (const pattern of ENTITY_PATTERNS.budgetPatterns) {
      const match = this.processedText.match(pattern.pattern);
      if (match) {
        let amount: number;
        let type: 'exact' | 'range' | 'starting_from' | 'upto' | 'around' = 'exact';
        
        if (pattern.type === 'exact') {
          if ('amount' in pattern) {
            amount = pattern.amount;
          } else {
            const cleanAmount = match[1].replace(/,/g, '');
            amount = parseInt(cleanAmount) * (pattern.multiplier as number);
          }
        } else if (pattern.type === 'range') {
          const minAmount = parseInt(match[1].replace(/,/g, ''));
          const maxAmount = parseInt(match[2].replace(/,/g, ''));
          const minMultiplier = this.getMultiplier(match[1], pattern.multiplier as number[]);
          const maxMultiplier = this.getMultiplier(match[2], pattern.multiplier as number[]);
          
          this.entities.budget = {
            min: minAmount * minMultiplier,
            max: maxAmount * maxMultiplier,
            currency: 'INR',
            type: 'range',
            confidence: 0.8
          };
          return;
        } else {
          const cleanAmount = match[1].replace(/,/g, '');
          amount = parseInt(cleanAmount) * (pattern.multiplier as number);
          type = pattern.type;
        }
        
        if (type === 'starting_from') {
          this.entities.budget = {
            min: amount,
            max: amount * 2, // Add 100% buffer
            currency: 'INR',
            type: 'starting_from',
            confidence: 0.8
          };
        } else if (type === 'upto') {
          this.entities.budget = {
            min: amount * 0.5, // Start from 50% of max
            max: amount,
            currency: 'INR',
            type: 'upto',
            confidence: 0.8
          };
        } else if (type === 'around') {
          this.entities.budget = {
            min: amount * 0.8, // ±20% tolerance
            max: amount * 1.2,
            currency: 'INR',
            type: 'around',
            confidence: 0.7
          };
        } else {
          this.entities.budget = {
            min: amount,
            max: amount * 1.2, // Add 20% buffer
            currency: 'INR',
            type: 'exact',
            confidence: 0.9
          };
        }
        break;
      }
    }
  }

  private extractDate(): void {
    for (const pattern of ENTITY_PATTERNS.datePatterns) {
      const match = this.processedText.match(pattern.pattern);
      if (match) {
        if (pattern.type === 'specific') {
          // Parse specific date
          const dateStr = this.parseSpecificDate(match);
          this.entities.date = {
            value: dateStr,
            type: 'specific',
            confidence: 0.9
          };
        } else if (pattern.type === 'relative') {
          // Parse relative date
          const dateStr = this.parseRelativeDate(match[1]);
          this.entities.date = {
            value: dateStr,
            type: 'relative',
            confidence: 0.8
          };
        }
        break;
      }
    }
  }

  private extractPreferences(): void {
    for (const pattern of ENTITY_PATTERNS.preferencePatterns) {
      const match = this.processedText.match(pattern.pattern);
      if (match) {
        if (pattern.preference === 'gender') {
          this.entities.preferences.gender = pattern.value as 'male' | 'female' | 'any';
        } else if (pattern.preference === 'experience') {
          this.entities.preferences.experience = pattern.value as 'experienced' | 'beginner' | 'expert';
        } else if (pattern.preference === 'style') {
          if (!this.entities.preferences.style) {
            this.entities.preferences.style = [];
          }
          this.entities.preferences.style.push(pattern.value as string);
        } else if (pattern.preference === 'urgency') {
          this.entities.preferences.urgency = pattern.value as 'immediate' | 'this_week' | 'this_month' | 'flexible';
        } else if (pattern.preference === 'availability') {
          this.entities.preferences.availability = pattern.value as 'available_now' | 'flexible';
        }
      }
    }
  }

  private extractAdditionalInfo(): void {
    const additionalKeywords = [
      'traditional', 'modern', 'vintage', 'rustic', 'luxury', 'budget',
      'same day', 'quick', 'professional', 'experienced', 'award winning',
      'eco friendly', 'sustainable', 'custom', 'personalized',
      'creative', 'artistic', 'unique', 'special', 'different',
      'family', 'complete', 'full coverage', 'partial', 'flexible'
    ];
    
    for (const keyword of additionalKeywords) {
      if (this.processedText.includes(keyword)) {
        this.entities.additionalInfo.push(keyword);
      }
    }
  }

  private getMultiplier(amount: string, multipliers: number[]): number {
    // Determine which multiplier to use based on the amount
    const num = parseInt(amount);
    if (num >= 1000000) return multipliers[2] || 10000000; // crore
    if (num >= 100000) return multipliers[1] || 100000; // lakh
    return multipliers[0] || 1000; // k
  }

  private parseSpecificDate(match: RegExpMatchArray): string {
    // Simplified date parsing - in production, use a proper date library
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  private parseRelativeDate(relative: string): string {
    const today = new Date();
    switch (relative.toLowerCase()) {
      case 'today':
        return today.toISOString().split('T')[0];
      case 'tomorrow':
        today.setDate(today.getDate() + 1);
        return today.toISOString().split('T')[0];
      case 'next week':
        today.setDate(today.getDate() + 7);
        return today.toISOString().split('T')[0];
      case 'next month':
        today.setMonth(today.getMonth() + 1);
        return today.toISOString().split('T')[0];
      default:
        return today.toISOString().split('T')[0];
    }
  }

  private calculateConfidence(): number {
    let confidence = 0;
    let totalFactors = 0;
    
    // Event type confidence (20%)
    if (this.entities.eventType) {
      confidence += this.entities.eventType.confidence * 0.2;
      totalFactors += 0.2;
    }
    
    // Service types confidence (30%)
    if (this.entities.serviceTypes.length > 0) {
      const avgServiceConfidence = this.entities.serviceTypes.reduce((sum, service) => sum + service.confidence, 0) / this.entities.serviceTypes.length;
      confidence += avgServiceConfidence * 0.3;
      totalFactors += 0.3;
    }
    
    // Location confidence (15%)
    if (this.entities.location) {
      confidence += this.entities.location.confidence * 0.15;
      totalFactors += 0.15;
    }
    
    // Budget confidence (20%)
    if (this.entities.budget) {
      confidence += this.entities.budget.confidence * 0.2;
      totalFactors += 0.2;
    }
    
    // Date confidence (10%)
    if (this.entities.date) {
      confidence += this.entities.date.confidence * 0.1;
      totalFactors += 0.1;
    }
    
    // Preferences confidence (5%)
    if (Object.keys(this.entities.preferences).length > 0) {
      confidence += 0.05;
      totalFactors += 0.05;
    }
    
    return totalFactors > 0 ? confidence / totalFactors : 0;
  }

  private validateEntities(): string[] {
    const errors: string[] = [];
    
    if (!this.entities.eventType) {
      errors.push('Event type not specified');
    }
    
    if (this.entities.serviceTypes.length === 0) {
      errors.push('No service types identified');
    }
    
    if (!this.entities.location) {
      errors.push('Location not specified');
    }
    
    return errors;
  }

  // Convert extracted entities to vendor filter criteria
  toVendorFilterCriteria(): VendorFilterCriteria {
    return {
      categories: this.entities.serviceTypes.map(service => service.category),
      location: this.entities.location?.city || 'Hyderabad',
      budgetRange: this.entities.budget ? {
        min: this.entities.budget.min,
        max: this.entities.budget.max
      } : undefined,
      preferences: {
        gender: this.entities.preferences.gender,
        experience: this.entities.preferences.experience,
        style: this.entities.preferences.style
      },
      additionalRequirements: this.entities.additionalInfo
    };
  }
}

// Export utility functions
export const processAudioInput = async (text: string): Promise<AudioProcessingResult> => {
  const engine = new EnhancedAudioEngine(text);
  return await engine.processAudio();
};

export const extractVendorFilters = async (text: string): Promise<VendorFilterCriteria> => {
  const result = await processAudioInput(text);
  const engine = new EnhancedAudioEngine(text);
  return engine.toVendorFilterCriteria();
};
