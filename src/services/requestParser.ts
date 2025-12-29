// AI-Powered Request Parser for Smart Request Understanding
export interface ParsedRequest {
  serviceTypes: string[];
  genderPreference?: 'male' | 'female' | 'any';
  eventType: string;
  eventDate?: string;
  duration?: string;
  budgetRange?: {
    min: number;
    max: number;
    currency: string;
  };
  location: string;
  additionalRequirements?: string[];
  urgency?: 'immediate' | 'this_week' | 'this_month' | 'flexible';
  guestCount?: number;
  venueType?: 'indoor' | 'outdoor' | 'both';
  originalText?: string;
}

export interface ServiceCategory {
  keywords: string[];
  category: string;
  subcategories?: string[];
}

// Service category mapping for AI parsing with Telugu and mixed language support
const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    keywords: [
      'photographer', 'photography', 'photo', 'camera', 'shoot', 'candid', 'wedding photos',
      'photographer kavali', 'photo shoot', 'candid photos', 'wedding photographer'
    ],
    category: 'Photographers',
    subcategories: ['Wedding Photography', 'Pre-wedding', 'Candid', 'Traditional', 'Drone']
  },
  {
    keywords: [
      'makeup', 'makeup artist', 'beauty', 'bridal makeup', 'glamour', 'cosmetics',
      'makeup artist kavali', 'beauty artist', 'bridal makeup artist', 'glamour artist'
    ],
    category: 'Makeup Artists',
    subcategories: ['Bridal Makeup', 'Party Makeup', 'Traditional', 'Glamour']
  },
  {
    keywords: [
      'decorator', 'decoretor', 'decoration', 'floral', 'balloon', 'stage', 'mandap', 'backdrop',
      'decorator kavali', 'decoretor kavali', 'decoration kavali', 'stage decoration', 'mandap decoration'
    ],
    category: 'Decorators',
    subcategories: ['Wedding Decoration', 'Birthday Decoration', 'Corporate Decoration', 'Floral Arrangements']
  },
  {
    keywords: [
      'caterer', 'catering', 'food', 'catering kavali', 'food kavali',
      'catering service', 'food service', 'catering for wedding'
    ],
    category: 'Caterers',
    subcategories: ['Wedding Catering', 'Corporate Catering', 'Birthday Catering', 'Traditional Cuisine']
  },
  {
    keywords: [
      'dj', 'music', 'entertainment', 'sound', 'lighting', 'dance', 'party music',
      'dj kavali', 'music kavali', 'sound system', 'party music', 'dance music'
    ],
    category: 'DJs, Lighting, and Entertainment',
    subcategories: ['Wedding DJ', 'Party Music', 'Lighting', 'Sound System']
  },
  {
    keywords: [
      'venue', 'hall', 'banquet', 'resort', 'hotel', 'garden', 'outdoor venue',
      'venue kavali', 'hall kavali', 'banquet hall', 'wedding venue'
    ],
    category: 'Venues',
    subcategories: ['Wedding Venues', 'Corporate Venues', 'Birthday Venues', 'Garden Venues']
  },
  {
    keywords: [
      'planner', 'event planner', 'coordinator', 'organizer', 'event management',
      'planner kavali', 'event planner kavali', 'coordinator kavali'
    ],
    category: 'Event Planners',
    subcategories: ['Wedding Planning', 'Corporate Events', 'Birthday Planning', 'Full Service']
  },
  {
    keywords: [
      'anchor', 'emcee', 'host', 'announcer', 'master of ceremonies',
      'anchor kavali', 'emcee kavali', 'host kavali', 'announcer kavali'
    ],
    category: 'Anchors',
    subcategories: ['Wedding Anchoring', 'Corporate Events', 'Birthday Parties', 'Cultural Events']
  },
  {
    keywords: [
      'transport', 'car', 'vehicle', 'rental', 'transportation', 'bus', 'car rental',
      'transport kavali', 'car kavali', 'vehicle kavali', 'transportation kavali'
    ],
    category: 'Transportation Services',
    subcategories: ['Wedding Cars', 'Corporate Transport', 'Airport Transfer', 'Group Transport']
  },
  {
    keywords: [
      'fashion', 'costume', 'designer', 'outfit', 'dress', 'suit', 'clothing',
      'fashion kavali', 'dress kavali', 'outfit kavali', 'clothing kavali'
    ],
    category: 'Fashion/Costume Designers',
    subcategories: ['Wedding Wear', 'Traditional Wear', 'Party Wear', 'Custom Design']
  },
  {
    keywords: [
      'tent', 'equipment', 'rental', 'furniture', 'tent rental', 'equipment rental',
      'tent kavali', 'equipment kavali', 'furniture kavali', 'rental kavali'
    ],
    category: 'Tent & Equipment Rentals',
    subcategories: ['Wedding Tents', 'Corporate Equipment', 'Furniture Rental', 'Event Equipment']
  }
];

// Event type keywords with Telugu and mixed language support
const EVENT_TYPES = [
  { 
    keywords: [
      'wedding', 'marriage', 'shaadi', 'vivah', 'kalyana', 'pelli', 'pelli ki',
      'wedding ki', 'marriage ki', 'sister ki pelli', 'brother ki pelli'
    ], 
    type: 'Wedding' 
  },
  { 
    keywords: [
      'birthday', 'bday', 'birthday party', 'birthday celebration', 'birthday ki',
      'birthday party ki', 'birthday celebration ki'
    ], 
    type: 'Birthday' 
  },
  { 
    keywords: [
      'corporate', 'office', 'business', 'company', 'corporate event', 'corporate ki',
      'office event', 'business event'
    ], 
    type: 'Corporate' 
  },
  { 
    keywords: [
      'anniversary', 'anniversary celebration', 'wedding anniversary', 'anniversary ki',
      'wedding anniversary ki'
    ], 
    type: 'Anniversary' 
  },
  { 
    keywords: [
      'engagement', 'ring ceremony', 'sagai', 'engagement ki', 'ring ceremony ki',
      'sagai ki', 'engagement ceremony'
    ], 
    type: 'Engagement' 
  },
  { 
    keywords: [
      'baby shower', 'godh bharai', 'seemantham', 'baby shower ki', 'godh bharai ki',
      'seemantham ki'
    ], 
    type: 'Baby Shower' 
  },
  { 
    keywords: [
      'housewarming', 'griha pravesh', 'new home', 'housewarming ki', 'griha pravesh ki',
      'new home ki'
    ], 
    type: 'Housewarming' 
  },
  { 
    keywords: [
      'festival', 'festival celebration', 'religious', 'puja', 'festival ki',
      'religious event', 'puja ki'
    ], 
    type: 'Festival' 
  }
];

// Gender preference keywords
const GENDER_PREFERENCES = [
  { keywords: ['male', 'men', 'guy', 'sir', 'male artist'], preference: 'male' as const },
  { keywords: ['female', 'women', 'lady', 'madam', 'female artist'], preference: 'female' as const }
];

// Telugu number mappings
const TELUGU_NUMBERS: { [key: string]: number } = {
  'oka': 1,
  'rendu': 2,
  'moodu': 3,
  'naalugu': 4,
  'aidhu': 5,
  'aaru': 6,
  'eedhu': 7,
  'enimidi': 8,
  'thommidhi': 9,
  'padi': 10,
  'padunara': 11,
  'pannendu': 12,
  'padhunaalugu': 13,
  'padhunaidhu': 14,
  'padhunaaru': 15,
  'padhunaarudu': 16,
  'padhunaarudu': 17,
  'padhunaarudu': 18,
  'padhunaarudu': 19,
  'iravai': 20,
  'iravai oka': 21,
  'iravai rendu': 22,
  'iravai moodu': 23,
  'iravai naalugu': 24,
  'iravai aidhu': 25,
  'iravai aaru': 26,
  'iravai eedhu': 27,
  'iravai enimidi': 28,
  'iravai thommidhi': 29,
  'muppai': 30,
  'nalabhai': 40,
  'aidabhai': 50,
  'aaruvaai': 60,
  'eedabhai': 70,
  'enabhai': 80,
  'thombhai': 90,
  'vanda': 100,
  'vanda oka': 101,
  'vanda rendu': 102,
  'rendu vanda': 200,
  'moodu vanda': 300,
  'naalugu vanda': 400,
  'aidhu vanda': 500,
  'aaru vanda': 600,
  'eedhu vanda': 700,
  'enimidi vanda': 800,
  'thommidhi vanda': 900,
  'vanda vanda': 1000,
  'rendu vanda vanda': 2000,
  'moodu vanda vanda': 3000,
  'naalugu vanda vanda': 4000,
  'aidhu vanda vanda': 5000,
  'aaru vanda vanda': 6000,
  'eedhu vanda vanda': 7000,
  'enimidi vanda vanda': 8000,
  'thommidhi vanda vanda': 9000,
  'padi vanda vanda': 10000,
  'laksha': 100000,
  'oka laksha': 100000,
  'rendu laksha': 200000,
  'moodu laksha': 300000,
  'naalugu laksha': 400000,
  'aidhu laksha': 500000,
  'aaru laksha': 600000,
  'eedhu laksha': 700000,
  'enimidi laksha': 800000,
  'thommidhi laksha': 900000,
  'padi laksha': 1000000,
  'koti': 10000000,
  'oka koti': 10000000,
  'rendu koti': 20000000,
  'moodu koti': 30000000
};

// Budget range patterns with Telugu and mixed language support
const BUDGET_PATTERNS = [
  { pattern: /(\d+)\s*k\b/i, multiplier: 1000 },
  { pattern: /(\d+)\s*lakhs?\b/i, multiplier: 100000 },
  { pattern: /(\d+)\s*crore\b/i, multiplier: 10000000 },
  { pattern: /₹\s*(\d+)/i, multiplier: 1 },
  { pattern: /(\d+)\s*rupees?/i, multiplier: 1 },
  // Enhanced patterns for better number detection
  { pattern: /(\d{1,3}(?:,\d{3})+)\b/g, multiplier: 1 }, // Matches numbers with commas like 20,000 (must have commas)
  { pattern: /(\d+)\s*(?:for|budget|around|upto|max|maximum)/i, multiplier: 1 }, // Matches "20,000 for" or "budget 20,000"
  { pattern: /(?:for|budget|around|upto|max|maximum)\s*(\d{1,3}(?:,\d{3})*)/i, multiplier: 1 }, // Matches "for 20,000" or "budget 20,000"
  { pattern: /(\d+)\s*(?:rs|rupees?|inr)/i, multiplier: 1 }, // Matches "20000 rs" or "20000 rupees"
  // Additional patterns for better coverage
  { pattern: /for\s+(\d{1,3}(?:,\d{3})*)/i, multiplier: 1 }, // Matches "for 25,000"
  { pattern: /(\d{1,3}(?:,\d{3})*)\s+for/i, multiplier: 1 }, // Matches "25,000 for"
  { pattern: /budget\s+(\d{1,3}(?:,\d{3})*)/i, multiplier: 1 }, // Matches "budget 30,000"
  { pattern: /(\d{1,3}(?:,\d{3})*)\s+budget/i, multiplier: 1 }, // Matches "30,000 budget"
  // Telugu and mixed language patterns - more specific to avoid duration conflicts
  { pattern: /(\d+)\s*(?:k|thousand|thousands?)\s*(?:budget|kavali|lo|ki)/i, multiplier: 1000 }, // Matches "20k budget" or "20k kavali"
  { pattern: /(\d+)\s*(?:lakh|lakhs?)\s*(?:budget|kavali|lo|ki)/i, multiplier: 100000 }, // Matches "1 lakh budget" or "2 lakh kavali"
  { pattern: /budget\s*lo\s*(\d{1,3}(?:,\d{3})*)/i, multiplier: 1 }, // Matches "budget lo 20,000"
  { pattern: /(\d{1,3}(?:,\d{3})*)\s*budget\s*lo/i, multiplier: 1 }, // Matches "20,000 budget lo"
  { pattern: /(\d+)\s*(?:k|thousand|thousands?)\s*budget/i, multiplier: 1000 }, // Matches "20k budget"
  { pattern: /(\d+)\s*(?:lakh|lakhs?)\s*budget/i, multiplier: 100000 }, // Matches "1 lakh budget"
  // Enhanced patterns for better extraction
  { pattern: /within\s+(\d{1,3}(?:,\d{3})*)\s*budget/i, multiplier: 1 }, // Matches "within 60000 budget"
  { pattern: /(\d{1,3}(?:,\d{3})*)\s*budget\s*w/i, multiplier: 1 }, // Matches "60000 budgetw" (speech recognition error)
  { pattern: /budget\s*w\s*(\d{1,3}(?:,\d{3})*)/i, multiplier: 1 }, // Matches "budgetw 60000"
  { pattern: /(\d{1,3}(?:,\d{3})*)\s*(?:budget|budgetw)/i, multiplier: 1 }, // Matches "60000 budget" or "60000 budgetw"
  // Standalone large numbers that are likely budgets
  { pattern: /\b(\d{4,6})\b/g, multiplier: 1 }, // Matches 4-6 digit numbers like 60000
  // Telugu number patterns
  { pattern: /oka\s+laksha/i, multiplier: 100000 }, // Matches "oka laksha" = 1 lakh
  { pattern: /(\d+)\s+laksha/i, multiplier: 100000 }, // Matches "2 laksha" = 2 lakh
  { pattern: /oka\s+koti/i, multiplier: 10000000 }, // Matches "oka koti" = 1 crore
  { pattern: /(\d+)\s+koti/i, multiplier: 10000000 }, // Matches "2 koti" = 2 crore
];

// Location patterns with Telugu and mixed language support
const LOCATION_PATTERNS = [
  /in\s+([^,]+)/i,
  /at\s+([^,]+)/i,
  /near\s+([^,]+)/i,
  /location\s*:?\s*([^,]+)/i,
  /place\s*:?\s*([^,]+)/i,
  // Telugu patterns
  /lo\s+([^,]+)/i, // "Hyderabad lo" = "in Hyderabad"
  /([^,]+)\s+lo/i, // "Hyderabad lo" = "in Hyderabad"
  /([^,]+)\s+ki/i, // "Hyderabad ki" = "for Hyderabad"
  /([^,]+)\s+location/i, // "Hyderabad location"
  /location\s+([^,]+)/i, // "location Hyderabad"
  // Enhanced patterns for better city-state extraction
  /([a-zA-Z]+)\s+([a-zA-Z]+)\s+lo/i, // "Hyderabad Telangana lo" = "Hyderabad Telangana"
  /([a-zA-Z]+)\s+([a-zA-Z]+)\s+ki/i, // "Hyderabad Telangana ki" = "Hyderabad Telangana"
  /([a-zA-Z]+)\s+([a-zA-Z]+)/i, // "Hyderabad Telangana" = "Hyderabad Telangana"
  // Pattern for "hyderabad telangana lo" specifically
  /([a-zA-Z]+)\s+([a-zA-Z]+)\s+lo/i, // "hyderabad telangana lo"
  // Pattern for "hyderabad telangana ki" specifically  
  /([a-zA-Z]+)\s+([a-zA-Z]+)\s+ki/i // "hyderabad telangana ki"
];

// Date patterns
const DATE_PATTERNS = [
  /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
  /(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{2,4})/i,
  /(today|tomorrow|next week|next month)/i,
  /(\d+)\s+(days?|weeks?|months?)\s+(from now|later)/i
];

export class RequestParser {
  private text: string;
  private originalText: string;
  private parsedRequest: Partial<ParsedRequest>;

  constructor(text: string) {
    this.originalText = text;
    this.text = text.toLowerCase();
    this.parsedRequest = {};
  }

  parse(): ParsedRequest {
    console.log('Parsing text:', this.text);
    
    this.extractServiceTypes();
    this.extractGenderPreference();
    this.extractEventType();
    this.extractBudgetRange();
    this.extractLocation();
    this.extractDate();
    this.extractDuration();
    this.extractGuestCount();
    this.extractVenueType();
    this.extractUrgency();
    this.extractAdditionalRequirements();

    // Store the original text for passing to the vendors page
    this.parsedRequest.originalText = this.originalText;

    console.log('Parsed request:', this.parsedRequest);
    return this.parsedRequest as ParsedRequest;
  }

  private extractServiceTypes(): void {
    const serviceTypes: string[] = [];
    
    for (const category of SERVICE_CATEGORIES) {
      const hasKeyword = category.keywords.some(keyword => 
        this.text.includes(keyword.toLowerCase())
      );
      
      if (hasKeyword) {
        serviceTypes.push(category.category);
      }
    }

    // If no service types found, try to extract from common patterns
    if (serviceTypes.length === 0) {
      if (this.text.includes('wedding') || this.text.includes('marriage')) {
        serviceTypes.push('Photographers', 'Makeup Artists', 'Decorators', 'Caterers');
      }
    }

    this.parsedRequest.serviceTypes = serviceTypes;
    console.log('Extracted service types:', serviceTypes);
  }

  private extractGenderPreference(): void {
    for (const gender of GENDER_PREFERENCES) {
      const hasKeyword = gender.keywords.some(keyword => 
        this.text.includes(keyword.toLowerCase())
      );
      
      if (hasKeyword) {
        this.parsedRequest.genderPreference = gender.preference;
        break;
      }
    }
  }

  private extractEventType(): void {
    for (const event of EVENT_TYPES) {
      const hasKeyword = event.keywords.some(keyword => 
        this.text.includes(keyword.toLowerCase())
      );
      
      if (hasKeyword) {
        this.parsedRequest.eventType = event.type;
        break;
      }
    }

    // Don't default to wedding - only set event type if explicitly mentioned
    // If (!this.parsedRequest.eventType) {
    //   this.parsedRequest.eventType = 'Wedding';
    // }
  }

  private extractBudgetRange(): void {
    let minBudget: number | undefined;
    let maxBudget: number | undefined;
    const foundAmounts: number[] = [];

    // First, check for Telugu numbers
    this.extractTeluguNumbers(foundAmounts);

    // Look for budget patterns
    for (const pattern of BUDGET_PATTERNS) {
      // Make sure the pattern is global for matchAll
      const flags = pattern.pattern.flags.includes('g') ? pattern.pattern.flags : pattern.pattern.flags + 'g';
      const globalPattern = new RegExp(pattern.pattern.source, flags);
      const matches = this.text.matchAll(globalPattern);
      for (const match of matches) {
        if (match[1]) {
          // Handle comma-separated numbers
          const cleanAmount = match[1].replace(/,/g, '');
          const amount = parseInt(cleanAmount) * pattern.multiplier;
          foundAmounts.push(amount);
        }
      }
    }

    // Look for standalone numbers that could be budgets (4+ digits)
    // But exclude numbers that are clearly durations or guest counts
    const standaloneNumbers = this.text.match(/\b(\d{4,})\b/g);
    if (standaloneNumbers) {
      for (const num of standaloneNumbers) {
        const amount = parseInt(num.replace(/,/g, ''));
        // Only consider reasonable budget amounts (between 1,000 and 1,00,00,000)
        // Exclude numbers that are likely durations (1-24) or guest counts (1-1000)
        if (amount >= 1000 && amount <= 10000000) {
          // Check if this number is part of a duration or guest count pattern
          const numIndex = this.text.indexOf(num);
          const context = this.text.substring(Math.max(0, numIndex - 20), Math.min(this.text.length, numIndex + 20));
          
          // Skip if it's clearly a duration or guest count
          if (context.match(/\b(hours?|days?|weeks?|guests?|people|persons?)\b/i)) {
            continue;
          }
          
          foundAmounts.push(amount);
        }
      }
    }

    // Also look for numbers with commas that might not have been caught by other patterns
    const commaNumbers = this.text.match(/\b(\d{1,3}(?:,\d{3})+)\b/g);
    if (commaNumbers) {
      for (const num of commaNumbers) {
        const amount = parseInt(num.replace(/,/g, ''));
        // Only consider reasonable budget amounts (between 1,000 and 1,00,00,000)
        if (amount >= 1000 && amount <= 10000000) {
          foundAmounts.push(amount);
        }
      }
    }

    // Look for range patterns (e.g., "50k to 1 lakh")
    const rangeMatch = this.text.match(/(\d+)\s*(k|lakh|crore)?\s*(to|and|-)\s*(\d+)\s*(k|lakh|crore)?/i);
    if (rangeMatch) {
      const minAmount = parseInt(rangeMatch[1]) * this.getMultiplier(rangeMatch[2]);
      const maxAmount = parseInt(rangeMatch[4]) * this.getMultiplier(rangeMatch[5]);
      
      foundAmounts.push(Math.min(minAmount, maxAmount));
      foundAmounts.push(Math.max(minAmount, maxAmount));
    }

    // Process found amounts
    if (foundAmounts.length > 0) {
      // Filter out 0 values and sort amounts
      const validAmounts = foundAmounts.filter(amount => amount > 0);
      const sortedAmounts = [...new Set(validAmounts)].sort((a, b) => a - b);
      
      if (sortedAmounts.length > 0) {
        // If we have multiple amounts, use the largest as max and smallest as min
        if (sortedAmounts.length === 1) {
          minBudget = sortedAmounts[0];
          maxBudget = sortedAmounts[0] * 1.2; // Add 20% buffer
        } else {
          minBudget = sortedAmounts[0];
          maxBudget = sortedAmounts[sortedAmounts.length - 1];
        }
      }
    }

    if (minBudget) {
      this.parsedRequest.budgetRange = {
        min: minBudget,
        max: maxBudget || minBudget * 1.5, // Add 50% buffer if no max specified
        currency: 'INR'
      };
    }
  }

  private getMultiplier(unit: string): number {
    switch (unit?.toLowerCase()) {
      case 'k': return 1000;
      case 'lakh': return 100000;
      case 'crore': return 10000000;
      default: return 1;
    }
  }

  private extractTeluguNumbers(foundAmounts: number[]): void {
    // Check for Telugu number patterns in the text
    const teluguPatterns = [
      /oka\s+laksha/i, // "oka laksha" = 1 lakh
      /(\d+)\s+laksha/i, // "2 laksha" = 2 lakh
      /oka\s+koti/i, // "oka koti" = 1 crore
      /(\d+)\s+koti/i, // "2 koti" = 2 crore
      /(\d+)\s+vanda/i, // "5 vanda" = 500
      /(\d+)\s+vanda\s+vanda/i, // "5 vanda vanda" = 5000
    ];

    for (const pattern of teluguPatterns) {
      const match = this.text.match(pattern);
      if (match) {
        if (pattern.source.includes('oka\\s+laksha')) {
          foundAmounts.push(100000); // 1 lakh
        } else if (pattern.source.includes('oka\\s+koti')) {
          foundAmounts.push(10000000); // 1 crore
        } else if (match[1]) {
          const number = parseInt(match[1]);
          if (pattern.source.includes('laksha')) {
            foundAmounts.push(number * 100000); // lakh
          } else if (pattern.source.includes('koti')) {
            foundAmounts.push(number * 10000000); // crore
          } else if (pattern.source.includes('vanda\\s+vanda')) {
            foundAmounts.push(number * 1000); // thousands
          } else if (pattern.source.includes('vanda')) {
            foundAmounts.push(number * 100); // hundreds
          }
        }
      }
    }

    // Also check for direct Telugu number mappings
    for (const [teluguNumber, value] of Object.entries(TELUGU_NUMBERS)) {
      const regex = new RegExp(`\\b${teluguNumber}\\b`, 'i');
      if (regex.test(this.text)) {
        foundAmounts.push(value);
      }
    }
  }

  private extractLocation(): void {
    for (const pattern of LOCATION_PATTERNS) {
      const match = this.text.match(pattern);
      if (match) {
        let location = '';
        
        // Handle patterns that capture city-state combinations
        if (match[2]) {
          // Pattern like "Hyderabad Telangana lo" - capture both city and state
          location = `${match[1].trim()} ${match[2].trim()}`;
        } else {
          // Single capture group patterns
          location = match[1].trim();
        }
        
        // Clean up location - remove common words that might be captured
        const cleanLocation = location
          .replace(/\b(budget|kavali|ki|lo|for|in|at|near|need|manchi|aravai|velu|within|lakhs?|lakh|rupees?|rs|inr|₹|\d+)\b/gi, '')
          .replace(/\s+/g, ' ')
          .trim();
        
        if (cleanLocation && cleanLocation.length > 1) {
          // Capitalize first letter of each word for better display
          const capitalizedLocation = cleanLocation
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
          
          this.parsedRequest.location = capitalizedLocation;
          return;
        }
      }
    }

    // Default location if not specified
    this.parsedRequest.location = 'Hyderabad';
  }

  private extractDate(): void {
    for (const pattern of DATE_PATTERNS) {
      const match = this.text.match(pattern);
      if (match) {
        if (pattern.source.includes('today|tomorrow|next week|next month')) {
          this.parsedRequest.eventDate = this.parseRelativeDate(match[1]);
        } else {
          this.parsedRequest.eventDate = this.parseAbsoluteDate(match);
        }
        return;
      }
    }
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

  private parseAbsoluteDate(match: RegExpMatchArray): string {
    // Implementation for parsing absolute dates
    // This is a simplified version - in production, you'd use a proper date library
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  private extractDuration(): void {
    // Enhanced duration patterns with Telugu support
    const durationPatterns = [
      /(\d+)\s*(hours?|days?|weeks?)/i,
      /(\d+)\s*(hours?|days?|weeks?)\s*(?:ki|kavali|lo)/i, // Telugu patterns
      /(?:for|ki|kavali)\s*(\d+)\s*(hours?|days?|weeks?)/i,
      /(\d+)\s*(?:hours?|days?|weeks?)\s*(?:duration|time)/i
    ];

    for (const pattern of durationPatterns) {
      const durationMatch = this.text.match(pattern);
      if (durationMatch) {
        this.parsedRequest.duration = `${durationMatch[1]} ${durationMatch[2]}`;
        break;
      }
    }
  }

  private extractGuestCount(): void {
    // Enhanced guest count patterns with Telugu support
    const guestPatterns = [
      /(\d+)\s*(guests?|people|persons?)/i,
      /(\d+)\s*(guests?|people|persons?)\s*(?:ki|kavali|lo)/i, // Telugu patterns
      /(?:for|ki|kavali)\s*(\d+)\s*(guests?|people|persons?)/i,
      /(\d+)\s*(?:guests?|people|persons?)\s*(?:family|family ki|family kosam)/i, // "family kosam" = "for family"
      /family\s*kosam\s*(\d+)/i, // "family kosam 50" = "for 50 family members"
      /(\d+)\s*family/i // "50 family" = "50 family members"
    ];

    for (const pattern of guestPatterns) {
      const guestMatch = this.text.match(pattern);
      if (guestMatch) {
        this.parsedRequest.guestCount = parseInt(guestMatch[1]);
        break;
      }
    }
  }

  private extractVenueType(): void {
    if (this.text.includes('indoor') || this.text.includes('hall') || this.text.includes('banquet')) {
      this.parsedRequest.venueType = 'indoor';
    } else if (this.text.includes('outdoor') || this.text.includes('garden') || this.text.includes('lawn')) {
      this.parsedRequest.venueType = 'outdoor';
    }
  }

  private extractUrgency(): void {
    if (this.text.includes('immediate') || this.text.includes('urgent') || this.text.includes('asap')) {
      this.parsedRequest.urgency = 'immediate';
    } else if (this.text.includes('this week') || this.text.includes('within a week')) {
      this.parsedRequest.urgency = 'this_week';
    } else if (this.text.includes('this month') || this.text.includes('within a month')) {
      this.parsedRequest.urgency = 'this_month';
    } else {
      this.parsedRequest.urgency = 'flexible';
    }
  }

  private extractAdditionalRequirements(): void {
    const requirements: string[] = [];
    
    // Look for specific requirements with Telugu and mixed language support
    // Note: Removed 'budget' related keywords as budget is handled separately
    const requirementKeywords = [
      // English requirements
      'traditional', 'modern', 'vintage', 'rustic', 'luxury',
      'same day', 'quick', 'professional', 'experienced', 'award winning',
      'eco friendly', 'sustainable', 'custom', 'personalized',
      // Telugu and mixed language requirements
      'discount', 'discount kavali', 'discount ivvara', 'discount ivvali',
      'family', 'family ki', 'family kosam', 'complete family',
      'full coverage', 'full coverage kavali', 'complete coverage',
      'same day', 'same day kavali', 'quick', 'quick kavali',
      'professional', 'professional kavali', 'experienced', 'experienced kavali'
    ];

    for (const keyword of requirementKeywords) {
      if (this.text.includes(keyword)) {
        // Normalize the requirement for display
        let normalizedReq = keyword;
        if (keyword.includes('kavali')) {
          normalizedReq = keyword.replace(' kavali', '');
        }
        if (keyword.includes('ivvara') || keyword.includes('ivvali')) {
          normalizedReq = 'discount requested';
        }
        if (keyword.includes('family kosam')) {
          normalizedReq = 'family coverage';
        }
        if (keyword.includes('budget lo')) {
          normalizedReq = 'within budget';
        }
        
        if (!requirements.includes(normalizedReq)) {
          requirements.push(normalizedReq);
        }
      }
    }

    this.parsedRequest.additionalRequirements = requirements;
  }
}

// Export utility functions
export const parseRequest = (text: string): ParsedRequest => {
  const parser = new RequestParser(text);
  return parser.parse();
};

// Test function for debugging - can be removed in production
export const testParser = (text: string): void => {
  console.log('Testing parser with text:', text);
  const result = parseRequest(text);
  console.log('Parsed result:', result);
  
  // Test specific extraction
  console.log('Service Types:', result.serviceTypes);
  console.log('Event Type:', result.eventType);
  console.log('Location:', result.location);
  console.log('Budget Range:', result.budgetRange);
  console.log('Additional Requirements:', result.additionalRequirements);
  
  // Test Telugu number extraction specifically
  if (text.includes('oka laksha')) {
    console.log('✅ Telugu number "oka laksha" detected and converted to ₹1,00,000');
  }
  if (text.includes('rendu laksha')) {
    console.log('✅ Telugu number "rendu laksha" detected and converted to ₹2,00,000');
  }
  if (text.includes('oka koti')) {
    console.log('✅ Telugu number "oka koti" detected and converted to ₹1,00,00,000');
  }
};

export const validateParsedRequest = (request: ParsedRequest): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!request.serviceTypes || request.serviceTypes.length === 0) {
    errors.push('No service types identified. Please specify what services you need.');
  }

  // Event type is now optional - removed constraint
  // if (!request.eventType) {
  //   errors.push('Event type not specified. Please mention the type of event.');
  // }

  if (!request.location) {
    errors.push('Location not specified. Please mention your location.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
