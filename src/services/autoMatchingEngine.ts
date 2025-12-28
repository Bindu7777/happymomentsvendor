import { Vendor } from '../lib/supabase';
import { ParsedRequest } from './requestParser';
import { getVendorsByCategory } from './supabaseService';

export interface VendorMatch {
  vendor: Vendor;
  matchScore: number;
  matchReasons: string[];
  priceMatch: 'exact' | 'within_range' | 'above_range' | 'below_range' | 'unknown';
  availabilityMatch: boolean;
  locationMatch: boolean;
  experienceMatch: boolean;
  ratingMatch: boolean;
}

export interface MatchingResult {
  perfectMatches: VendorMatch[];
  nearMatches: VendorMatch[];
  allMatches: VendorMatch[];
  totalFound: number;
  searchCriteria: ParsedRequest;
}

export class AutoMatchingEngine {
  private parsedRequest: ParsedRequest;
  private allVendors: Vendor[] = [];

  constructor(parsedRequest: ParsedRequest) {
    this.parsedRequest = parsedRequest;
  }

  async findMatches(): Promise<MatchingResult> {
    try {
      // Fetch vendors for each service type
      const vendorPromises = this.parsedRequest.serviceTypes.map(serviceType =>
        getVendorsByCategory(serviceType).catch(error => {
          console.error(`Error fetching vendors for ${serviceType}:`, error);
          return []; // Return empty array on error
        })
      );

      const vendorResults = await Promise.all(vendorPromises);
      this.allVendors = vendorResults.flat();
      
      console.log('Fetched vendors:', this.allVendors.length);
    } catch (error) {
      console.error('Error in findMatches:', error);
      this.allVendors = [];
    }

    // Remove duplicates based on vendor_id
    const uniqueVendors = this.allVendors.filter((vendor, index, self) =>
      index === self.findIndex(v => v.vendor_id === vendor.vendor_id)
    );

    // Calculate match scores for each vendor
    const matches: VendorMatch[] = uniqueVendors.map(vendor => 
      this.calculateMatchScore(vendor)
    );

    // Sort by match score (highest first)
    matches.sort((a, b) => b.matchScore - a.matchScore);

    // Categorize matches
    const perfectMatches = matches.filter(match => match.matchScore >= 80);
    const nearMatches = matches.filter(match => match.matchScore >= 60 && match.matchScore < 80);
    const allMatches = matches.filter(match => match.matchScore >= 40);

    return {
      perfectMatches,
      nearMatches,
      allMatches,
      totalFound: matches.length,
      searchCriteria: this.parsedRequest
    };
  }

  private calculateMatchScore(vendor: Vendor): VendorMatch {
    let score = 0;
    const reasons: string[] = [];
    let priceMatch: VendorMatch['priceMatch'] = 'unknown';
    let availabilityMatch = false;
    let locationMatch = false;
    let experienceMatch = false;
    let ratingMatch = false;

    // Service Type Match (40 points)
    if (this.parsedRequest.serviceTypes.includes(vendor.category)) {
      score += 40;
      reasons.push(`Provides ${vendor.category} services`);
    }

    // Gender Preference Match (10 points)
    if (this.parsedRequest.genderPreference) {
      // This would need to be implemented based on your vendor data structure
      // For now, we'll skip this as it's not in the current schema
    }

    // Location Match (20 points)
    if (this.parsedRequest.location && vendor.address) {
      const vendorLocation = vendor.address.toLowerCase();
      const searchLocation = this.parsedRequest.location.toLowerCase();
      
      if (vendorLocation.includes(searchLocation) || searchLocation.includes(vendorLocation)) {
        score += 20;
        locationMatch = true;
        reasons.push(`Located in ${vendor.address}`);
      } else {
        // Partial location match (10 points)
        const commonWords = this.findCommonWords(vendorLocation, searchLocation);
        if (commonWords.length > 0) {
          score += 10;
          reasons.push(`Nearby location: ${vendor.address}`);
        }
      }
    }

    // Budget Match (15 points)
    if (this.parsedRequest.budgetRange && vendor.starting_price) {
      const vendorPrice = vendor.starting_price;
      const { min, max } = this.parsedRequest.budgetRange;

      if (vendorPrice >= min && vendorPrice <= max) {
        score += 15;
        priceMatch = 'exact';
        reasons.push(`Price fits your budget (₹${vendorPrice.toLocaleString()})`);
      } else if (vendorPrice < min) {
        score += 10;
        priceMatch = 'below_range';
        reasons.push(`Under budget (₹${vendorPrice.toLocaleString()})`);
      } else if (vendorPrice <= max * 1.2) {
        score += 8;
        priceMatch = 'above_range';
        reasons.push(`Slightly above budget (₹${vendorPrice.toLocaleString()})`);
      } else {
        priceMatch = 'above_range';
        reasons.push(`Above budget (₹${vendorPrice.toLocaleString()})`);
      }
    }

    // Availability Match (10 points)
    if (vendor.currently_available) {
      score += 10;
      availabilityMatch = true;
      reasons.push('Currently available');
    }

    // Experience Match (10 points)
    if (vendor.experience) {
      const experienceYears = this.extractExperienceYears(vendor.experience);
      if (experienceYears >= 5) {
        score += 10;
        experienceMatch = true;
        reasons.push(`Experienced (${vendor.experience})`);
      } else if (experienceYears >= 2) {
        score += 5;
        reasons.push(`Some experience (${vendor.experience})`);
      }
    }

    // Rating Match (10 points)
    if (vendor.rating) {
      if (vendor.rating >= 4.5) {
        score += 10;
        ratingMatch = true;
        reasons.push(`Highly rated (${vendor.rating}/5)`);
      } else if (vendor.rating >= 4.0) {
        score += 7;
        reasons.push(`Well rated (${vendor.rating}/5)`);
      } else if (vendor.rating >= 3.5) {
        score += 5;
        reasons.push(`Good rating (${vendor.rating}/5)`);
      }
    }

    // Review Count Bonus (5 points)
    if (vendor.review_count && vendor.review_count >= 10) {
      score += 5;
      reasons.push(`Many reviews (${vendor.review_count})`);
    }

    // Verified Vendor Bonus (5 points)
    if (vendor.verified) {
      score += 5;
      reasons.push('Verified vendor');
    }

    // Event Type Match (5 points)
    if (this.parsedRequest.eventType) {
      // Check if vendor's services or specialties match the event type
      const eventKeywords = this.getEventKeywords(this.parsedRequest.eventType);
      const vendorCategories = Array.isArray(vendor.category) 
        ? vendor.category 
        : (vendor.categories || (vendor.category ? [vendor.category] : []));
      const vendorText = `${vendorCategories.join(' ')} ${vendor.quick_intro || ''} ${vendor.detailed_intro || ''}`.toLowerCase();
      
      const hasEventMatch = eventKeywords.some(keyword => 
        vendorText.includes(keyword.toLowerCase())
      );
      
      if (hasEventMatch) {
        score += 5;
        reasons.push(`Specializes in ${this.parsedRequest.eventType} events`);
      }
    }

    // Additional Requirements Match (5 points)
    if (this.parsedRequest.additionalRequirements && this.parsedRequest.additionalRequirements.length > 0) {
      const vendorText = `${vendor.quick_intro || ''} ${vendor.detailed_intro || ''} ${vendor.highlight_features?.join(' ') || ''}`.toLowerCase();
      
      const matchedRequirements = this.parsedRequest.additionalRequirements.filter(req =>
        vendorText.includes(req.toLowerCase())
      );
      
      if (matchedRequirements.length > 0) {
        score += Math.min(5, matchedRequirements.length * 2);
        reasons.push(`Meets requirements: ${matchedRequirements.join(', ')}`);
      }
    }

    return {
      vendor,
      matchScore: Math.min(100, score), // Cap at 100
      matchReasons: reasons,
      priceMatch,
      availabilityMatch,
      locationMatch,
      experienceMatch,
      ratingMatch
    };
  }

  private findCommonWords(str1: string, str2: string): string[] {
    const words1 = str1.split(/\s+/);
    const words2 = str2.split(/\s+/);
    
    return words1.filter(word => 
      word.length > 2 && words2.some(w => w.includes(word) || word.includes(w))
    );
  }

  private extractExperienceYears(experience: string): number {
    const match = experience.match(/(\d+)\+?\s*years?/i);
    return match ? parseInt(match[1]) : 0;
  }

  private getEventKeywords(eventType: string): string[] {
    const eventKeywordMap: Record<string, string[]> = {
      'Wedding': ['wedding', 'marriage', 'bridal', 'groom', 'bride', 'shaadi', 'vivah'],
      'Birthday': ['birthday', 'bday', 'party', 'celebration', 'kids', 'children'],
      'Corporate': ['corporate', 'business', 'office', 'conference', 'meeting', 'professional'],
      'Anniversary': ['anniversary', 'celebration', 'milestone'],
      'Engagement': ['engagement', 'ring ceremony', 'sagai', 'pre-wedding'],
      'Baby Shower': ['baby shower', 'godh bharai', 'seemantham', 'baby'],
      'Housewarming': ['housewarming', 'griha pravesh', 'new home', 'home'],
      'Festival': ['festival', 'religious', 'puja', 'celebration', 'traditional']
    };

    return eventKeywordMap[eventType] || [];
  }
}

// Utility functions
export const findBestMatches = async (parsedRequest: ParsedRequest): Promise<MatchingResult> => {
  const engine = new AutoMatchingEngine(parsedRequest);
  return await engine.findMatches();
};

export const getMatchQuality = (matchScore: number): 'excellent' | 'good' | 'fair' | 'poor' => {
  if (matchScore >= 80) return 'excellent';
  if (matchScore >= 60) return 'good';
  if (matchScore >= 40) return 'fair';
  return 'poor';
};

export const formatMatchReasons = (reasons: string[]): string => {
  if (reasons.length === 0) return 'No specific match reasons';
  if (reasons.length === 1) return reasons[0];
  if (reasons.length === 2) return reasons.join(' and ');
  return `${reasons.slice(0, -1).join(', ')} and ${reasons[reasons.length - 1]}`;
};
