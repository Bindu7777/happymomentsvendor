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
}

export interface ServiceCategory {
  keywords: string[];
  category: string;
  subcategories?: string[];
}

// Service category mapping for AI parsing
const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    keywords: ['photographer', 'photography', 'photo', 'camera', 'shoot', 'candid', 'wedding photos'],
    category: 'Photographers',
    subcategories: ['Wedding Photography', 'Pre-wedding', 'Candid', 'Traditional', 'Drone']
  },
  {
    keywords: ['makeup', 'makeup artist', 'beauty', 'bridal makeup', 'glamour', 'cosmetics'],
    category: 'Makeup Artists',
    subcategories: ['Bridal Makeup', 'Party Makeup', 'Traditional', 'Glamour']
  },
  {
    keywords: ['decorator', 'decoration', 'decoration', 'floral', 'balloon', 'stage', 'mandap', 'backdrop'],
    category: 'Decorators',
    subcategories: ['Wedding Decoration', 'Birthday Decoration', 'Corporate Decoration', 'Floral Arrangements']
  },
  {
    keywords: ['caterer', 'catering', 'food', 'catering', 'catering', 'catering', 'catering'],
    category: 'Caterers',
    subcategories: ['Wedding Catering', 'Corporate Catering', 'Birthday Catering', 'Traditional Cuisine']
  },
  {
    keywords: ['dj', 'music', 'entertainment', 'sound', 'lighting', 'dance', 'party music'],
    category: 'DJs, Lighting, and Entertainment',
    subcategories: ['Wedding DJ', 'Party Music', 'Lighting', 'Sound System']
  },
  {
    keywords: ['venue', 'hall', 'banquet', 'resort', 'hotel', 'garden', 'outdoor venue'],
    category: 'Venues',
    subcategories: ['Wedding Venues', 'Corporate Venues', 'Birthday Venues', 'Garden Venues']
  },
  {
    keywords: ['planner', 'event planner', 'coordinator', 'organizer', 'event management'],
    category: 'Event Planners',
    subcategories: ['Wedding Planning', 'Corporate Events', 'Birthday Planning', 'Full Service']
  },
  {
    keywords: ['anchor', 'emcee', 'host', 'announcer', 'master of ceremonies'],
    category: 'Anchors',
    subcategories: ['Wedding Anchoring', 'Corporate Events', 'Birthday Parties', 'Cultural Events']
  },
  {
    keywords: ['transport', 'car', 'vehicle', 'rental', 'transportation', 'bus', 'car rental'],
    category: 'Transportation Services',
    subcategories: ['Wedding Cars', 'Corporate Transport', 'Airport Transfer', 'Group Transport']
  },
  {
    keywords: ['fashion', 'costume', 'designer', 'outfit', 'dress', 'suit', 'clothing'],
    category: 'Fashion/Costume Designers',
    subcategories: ['Wedding Wear', 'Traditional Wear', 'Party Wear', 'Custom Design']
  },
  {
    keywords: ['tent', 'equipment', 'rental', 'furniture', 'tent rental', 'equipment rental'],
    category: 'Tent & Equipment Rentals',
    subcategories: ['Wedding Tents', 'Corporate Equipment', 'Furniture Rental', 'Event Equipment']
  }
];

// Event type keywords
const EVENT_TYPES = [
  { keywords: ['wedding', 'marriage', 'shaadi', 'vivah', 'kalyana'], type: 'Wedding' },
  { keywords: ['birthday', 'bday', 'birthday party', 'birthday celebration'], type: 'Birthday' },
  { keywords: ['corporate', 'office', 'business', 'company', 'corporate event'], type: 'Corporate' },
  { keywords: ['anniversary', 'anniversary celebration', 'wedding anniversary'], type: 'Anniversary' },
  { keywords: ['engagement', 'ring ceremony', 'sagai'], type: 'Engagement' },
  { keywords: ['baby shower', 'godh bharai', 'seemantham'], type: 'Baby Shower' },
  { keywords: ['housewarming', 'griha pravesh', 'new home'], type: 'Housewarming' },
  { keywords: ['festival', 'festival celebration', 'religious', 'puja'], type: 'Festival' }
];

// Gender preference keywords
const GENDER_PREFERENCES = [
  { keywords: ['male', 'men', 'guy', 'sir', 'male artist'], preference: 'male' as const },
  { keywords: ['female', 'women', 'lady', 'madam', 'female artist'], preference: 'female' as const }
];

// Budget range patterns
const BUDGET_PATTERNS = [
  { pattern: /(\d+)\s*k\b/i, multiplier: 1000 },
  { pattern: /(\d+)\s*lakh\b/i, multiplier: 100000 },
  { pattern: /(\d+)\s*crore\b/i, multiplier: 10000000 },
  { pattern: /₹\s*(\d+)/i, multiplier: 1 },
  { pattern: /(\d+)\s*rupees?/i, multiplier: 1 }
];

// Location patterns
const LOCATION_PATTERNS = [
  /in\s+([^,]+)/i,
  /at\s+([^,]+)/i,
  /near\s+([^,]+)/i,
  /location\s*:?\s*([^,]+)/i,
  /place\s*:?\s*([^,]+)/i
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
  private parsedRequest: Partial<ParsedRequest>;

  constructor(text: string) {
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

    // Default to wedding if no specific event type found
    if (!this.parsedRequest.eventType) {
      this.parsedRequest.eventType = 'Wedding';
    }
  }

  private extractBudgetRange(): void {
    let minBudget: number | undefined;
    let maxBudget: number | undefined;

    // Look for budget patterns
    for (const pattern of BUDGET_PATTERNS) {
      const match = this.text.match(pattern.pattern);
      if (match) {
        const amount = parseInt(match[1]) * pattern.multiplier;
        
        if (!minBudget) {
          minBudget = amount;
        } else if (amount > minBudget) {
          maxBudget = amount;
        } else {
          maxBudget = minBudget;
          minBudget = amount;
        }
      }
    }

    // Look for range patterns (e.g., "50k to 1 lakh")
    const rangeMatch = this.text.match(/(\d+)\s*(k|lakh|crore)?\s*(to|and|-)\s*(\d+)\s*(k|lakh|crore)?/i);
    if (rangeMatch) {
      const minAmount = parseInt(rangeMatch[1]) * this.getMultiplier(rangeMatch[2]);
      const maxAmount = parseInt(rangeMatch[4]) * this.getMultiplier(rangeMatch[5]);
      
      minBudget = Math.min(minAmount, maxAmount);
      maxBudget = Math.max(minAmount, maxAmount);
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

  private extractLocation(): void {
    for (const pattern of LOCATION_PATTERNS) {
      const match = this.text.match(pattern);
      if (match) {
        this.parsedRequest.location = match[1].trim();
        return;
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
    const durationMatch = this.text.match(/(\d+)\s*(hours?|days?|weeks?)/i);
    if (durationMatch) {
      this.parsedRequest.duration = `${durationMatch[1]} ${durationMatch[2]}`;
    }
  }

  private extractGuestCount(): void {
    const guestMatch = this.text.match(/(\d+)\s*(guests?|people|persons?)/i);
    if (guestMatch) {
      this.parsedRequest.guestCount = parseInt(guestMatch[1]);
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
    
    // Look for specific requirements
    const requirementKeywords = [
      'traditional', 'modern', 'vintage', 'rustic', 'luxury', 'budget',
      'same day', 'quick', 'professional', 'experienced', 'award winning',
      'eco friendly', 'sustainable', 'custom', 'personalized'
    ];

    for (const keyword of requirementKeywords) {
      if (this.text.includes(keyword)) {
        requirements.push(keyword);
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

export const validateParsedRequest = (request: ParsedRequest): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!request.serviceTypes || request.serviceTypes.length === 0) {
    errors.push('No service types identified. Please specify what services you need.');
  }

  if (!request.eventType) {
    errors.push('Event type not specified. Please mention the type of event.');
  }

  if (!request.location) {
    errors.push('Location not specified. Please mention your location.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
