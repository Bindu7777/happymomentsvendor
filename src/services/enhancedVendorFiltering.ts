// Enhanced Vendor Filtering Service
// This service provides advanced filtering capabilities based on extracted entities

import { Vendor } from '../lib/supabase';
import { getAllVendors, getVendorsByCategory } from './supabaseService';
import { VendorFilterCriteria, ExtractedEntities } from './enhancedAudioEngine';

export interface FilteredVendorResult {
  vendor: Vendor;
  matchScore: number;
  matchReasons: string[];
  priceMatch: 'exact' | 'within_range' | 'above_range' | 'below_range' | 'unknown';
  locationMatch: boolean;
  experienceMatch: boolean;
  styleMatch: boolean;
  availabilityMatch: boolean;
  preferenceMatches: {
    gender?: boolean;
    experience?: boolean;
    style?: boolean;
  };
}

export interface VendorSearchResult {
  perfectMatches: FilteredVendorResult[];
  nearMatches: FilteredVendorResult[];
  allMatches: FilteredVendorResult[];
  totalFound: number;
  searchCriteria: VendorFilterCriteria;
  filtersApplied: {
    categories: string[];
    location: string;
    budgetRange?: { min: number; max: number };
    preferences: any;
  };
}

export class EnhancedVendorFiltering {
  private criteria: VendorFilterCriteria;
  private allVendors: Vendor[] = [];

  constructor(criteria: VendorFilterCriteria) {
    this.criteria = criteria;
  }

  async searchVendors(): Promise<VendorSearchResult> {
    try {
      // Fetch all relevant vendors
      await this.fetchVendors();
      
      // Apply advanced filtering
      const filteredResults = this.filterVendors();
      
      // Calculate match scores
      const scoredResults = this.calculateMatchScores(filteredResults);
      
      // Sort by match score
      scoredResults.sort((a, b) => b.matchScore - a.matchScore);
      
      // Categorize results
      const perfectMatches = scoredResults.filter(result => result.matchScore >= 85);
      const nearMatches = scoredResults.filter(result => result.matchScore >= 70 && result.matchScore < 85);
      const allMatches = scoredResults.filter(result => result.matchScore >= 50);
      
      return {
        perfectMatches,
        nearMatches,
        allMatches,
        totalFound: scoredResults.length,
        searchCriteria: this.criteria,
        filtersApplied: {
          categories: this.criteria.categories,
          location: this.criteria.location,
          budgetRange: this.criteria.budgetRange,
          preferences: this.criteria.preferences
        }
      };
    } catch (error) {
      console.error('Error searching vendors:', error);
      return {
        perfectMatches: [],
        nearMatches: [],
        allMatches: [],
        totalFound: 0,
        searchCriteria: this.criteria,
        filtersApplied: {
          categories: this.criteria.categories,
          location: this.criteria.location,
          budgetRange: this.criteria.budgetRange,
          preferences: this.criteria.preferences
        }
      };
    }
  }

  private async fetchVendors(): Promise<void> {
    try {
      if (this.criteria.categories.length === 0) {
        // If no specific categories, fetch all vendors
        this.allVendors = await getAllVendors();
      } else {
        // Fetch vendors for each category
        const vendorPromises = this.criteria.categories.map(category =>
          getVendorsByCategory(category).catch(error => {
            console.error(`Error fetching vendors for ${category}:`, error);
            return [];
          })
        );
        
        const vendorResults = await Promise.all(vendorPromises);
        this.allVendors = vendorResults.flat();
      }
      
      // Remove duplicates based on vendor_id
      this.allVendors = this.allVendors.filter((vendor, index, self) =>
        index === self.findIndex(v => v.vendor_id === vendor.vendor_id)
      );
      
      console.log(`Fetched ${this.allVendors.length} vendors for filtering`);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      this.allVendors = [];
    }
  }

  private filterVendors(): Vendor[] {
    let filteredVendors = [...this.allVendors];
    
    // Filter by categories (if specified)
    if (this.criteria.categories.length > 0) {
      filteredVendors = filteredVendors.filter(vendor =>
        this.criteria.categories.includes(vendor.category)
      );
    }
    
    // Filter by location
    if (this.criteria.location) {
      filteredVendors = filteredVendors.filter(vendor =>
        this.isLocationMatch(vendor, this.criteria.location)
      );
    }
    
    // Filter by budget range
    if (this.criteria.budgetRange) {
      filteredVendors = filteredVendors.filter(vendor =>
        this.isBudgetMatch(vendor, this.criteria.budgetRange!)
      );
    }
    
    // Filter by date availability (if specified)
    if (this.criteria.dateRange) {
      filteredVendors = filteredVendors.filter(vendor =>
        this.isDateAvailable(vendor, this.criteria.dateRange!)
      );
    }
    
    console.log(`Filtered to ${filteredVendors.length} vendors after basic filtering`);
    return filteredVendors;
  }

  private isLocationMatch(vendor: Vendor, targetLocation: string): boolean {
    if (!vendor.address) return false;
    
    const vendorLocation = vendor.address.toLowerCase();
    const target = targetLocation.toLowerCase();
    
    // Exact match
    if (vendorLocation.includes(target)) return true;
    
    // City-state combinations
    const locationParts = target.split(' ');
    if (locationParts.length >= 2) {
      const city = locationParts[0];
      const state = locationParts.slice(1).join(' ');
      
      if (vendorLocation.includes(city)) return true;
      if (vendorLocation.includes(state)) return true;
    }
    
    // Common location aliases
    const locationAliases: { [key: string]: string[] } = {
      'hyderabad': ['hyd', 'secunderabad', 'cyberabad'],
      'bangalore': ['bengaluru', 'blr'],
      'mumbai': ['bombay'],
      'chennai': ['madras'],
      'kolkata': ['calcutta'],
      'delhi': ['new delhi', 'ncr'],
      'pune': ['punekar']
    };
    
    const aliases = locationAliases[target];
    if (aliases) {
      return aliases.some(alias => vendorLocation.includes(alias));
    }
    
    return false;
  }

  private isBudgetMatch(vendor: Vendor, budgetRange: { min: number; max: number }): boolean {
    if (!vendor.starting_price) return false;
    
    const vendorPrice = vendor.starting_price;
    
    // Vendor price should be within or below the budget range
    // Allow some flexibility for negotiation
    return vendorPrice <= budgetRange.max * 1.1; // 10% buffer for negotiation
  }

  private isDateAvailable(vendor: Vendor, dateRange: { start: string; end: string }): boolean {
    // For now, we'll assume all vendors are available
    // In a real implementation, you'd check vendor availability calendar
    return vendor.currently_available !== false;
  }

  private calculateMatchScores(vendors: Vendor[]): FilteredVendorResult[] {
    return vendors.map(vendor => {
      const result: FilteredVendorResult = {
        vendor,
        matchScore: 0,
        matchReasons: [],
        priceMatch: 'unknown',
        locationMatch: false,
        experienceMatch: false,
        styleMatch: false,
        availabilityMatch: false,
        preferenceMatches: {}
      };
      
      // Calculate individual match scores
      result.matchScore += this.calculateCategoryScore(vendor, result);
      result.matchScore += this.calculateLocationScore(vendor, result);
      result.matchScore += this.calculateBudgetScore(vendor, result);
      result.matchScore += this.calculateExperienceScore(vendor, result);
      result.matchScore += this.calculateStyleScore(vendor, result);
      result.matchScore += this.calculateAvailabilityScore(vendor, result);
      result.matchScore += this.calculatePreferenceScore(vendor, result);
      
      return result;
    });
  }

  private calculateCategoryScore(vendor: Vendor, result: FilteredVendorResult): number {
    if (this.criteria.categories.includes(vendor.category)) {
      result.matchReasons.push(`Provides ${vendor.category} services`);
      return 25; // High weight for category match
    }
    return 0;
  }

  private calculateLocationScore(vendor: Vendor, result: FilteredVendorResult): number {
    if (this.isLocationMatch(vendor, this.criteria.location)) {
      result.locationMatch = true;
      result.matchReasons.push(`Located in ${this.criteria.location}`);
      return 20; // High weight for location match
    }
    return 0;
  }

  private calculateBudgetScore(vendor: Vendor, result: FilteredVendorResult): number {
    if (!this.criteria.budgetRange || !vendor.starting_price) {
      return 0;
    }
    
    const vendorPrice = vendor.starting_price;
    const budgetMin = this.criteria.budgetRange.min;
    const budgetMax = this.criteria.budgetRange.max;
    
    if (vendorPrice >= budgetMin && vendorPrice <= budgetMax) {
      result.priceMatch = 'within_range';
      result.matchReasons.push(`Price ₹${vendorPrice.toLocaleString()} within budget`);
      return 20; // High weight for exact budget match
    } else if (vendorPrice < budgetMin) {
      result.priceMatch = 'below_range';
      result.matchReasons.push(`Price ₹${vendorPrice.toLocaleString()} below budget`);
      return 15; // Good weight for below budget
    } else if (vendorPrice <= budgetMax * 1.2) {
      result.priceMatch = 'above_range';
      result.matchReasons.push(`Price ₹${vendorPrice.toLocaleString()} slightly above budget`);
      return 10; // Lower weight for above budget
    } else {
      result.priceMatch = 'above_range';
      return 0; // No points for significantly above budget
    }
  }

  private calculateExperienceScore(vendor: Vendor, result: FilteredVendorResult): number {
    if (!this.criteria.preferences.experience) return 0;
    
    const vendorExperience = vendor.experience || '';
    const requestedExperience = this.criteria.preferences.experience;
    
    if (requestedExperience === 'experienced') {
      if (vendorExperience.includes('year') && parseInt(vendorExperience) >= 3) {
        result.experienceMatch = true;
        result.matchReasons.push(`Experienced with ${vendorExperience}`);
        return 10;
      }
    } else if (requestedExperience === 'expert') {
      if (vendorExperience.includes('year') && parseInt(vendorExperience) >= 5) {
        result.experienceMatch = true;
        result.matchReasons.push(`Expert level with ${vendorExperience}`);
        return 15;
      }
    } else if (requestedExperience === 'beginner') {
      if (!vendorExperience.includes('year') || parseInt(vendorExperience) < 3) {
        result.experienceMatch = true;
        result.matchReasons.push(`Suitable for budget-conscious clients`);
        return 8;
      }
    }
    
    return 0;
  }

  private calculateStyleScore(vendor: Vendor, result: FilteredVendorResult): number {
    if (!this.criteria.preferences.style || this.criteria.preferences.style.length === 0) {
      return 0;
    }
    
    const vendorSpecialties = vendor.specialties || [];
    const vendorDescription = (vendor.description || '').toLowerCase();
    const vendorIntro = (vendor.quick_intro || '').toLowerCase();
    
    let styleScore = 0;
    
    for (const style of this.criteria.preferences.style) {
      const styleLower = style.toLowerCase();
      
      // Check in specialties
      if (vendorSpecialties.some(specialty => 
        specialty.toLowerCase().includes(styleLower)
      )) {
        styleScore += 5;
        result.matchReasons.push(`Offers ${style} style`);
      }
      
      // Check in description
      if (vendorDescription.includes(styleLower) || vendorIntro.includes(styleLower)) {
        styleScore += 3;
      }
    }
    
    if (styleScore > 0) {
      result.styleMatch = true;
    }
    
    return Math.min(styleScore, 15); // Cap at 15 points
  }

  private calculateAvailabilityScore(vendor: Vendor, result: FilteredVendorResult): number {
    if (vendor.currently_available) {
      result.availabilityMatch = true;
      result.matchReasons.push('Available now');
      return 10;
    }
    return 0;
  }

  private calculatePreferenceScore(vendor: Vendor, result: FilteredVendorResult): number {
    let score = 0;
    
    // Gender preference (if implemented in vendor data)
    if (this.criteria.preferences.gender) {
      // This would need to be implemented based on your vendor data structure
      // For now, we'll skip this as it's not in the current schema
    }
    
    // Additional requirements matching
    if (this.criteria.additionalRequirements.length > 0) {
      const vendorSpecialties = vendor.specialties || [];
      const vendorDescription = (vendor.description || '').toLowerCase();
      
      for (const requirement of this.criteria.additionalRequirements) {
        const reqLower = requirement.toLowerCase();
        
        if (vendorSpecialties.some(specialty => 
          specialty.toLowerCase().includes(reqLower)
        )) {
          score += 3;
          result.matchReasons.push(`Meets requirement: ${requirement}`);
        } else if (vendorDescription.includes(reqLower)) {
          score += 2;
          result.matchReasons.push(`Mentioned: ${requirement}`);
        }
      }
    }
    
    return Math.min(score, 10); // Cap at 10 points
  }
}

// Export utility functions
export const searchVendorsWithFilters = async (criteria: VendorFilterCriteria): Promise<VendorSearchResult> => {
  const filter = new EnhancedVendorFiltering(criteria);
  return await filter.searchVendors();
};

export const createVendorFilterCriteria = (entities: ExtractedEntities): VendorFilterCriteria => {
  return {
    categories: entities.serviceTypes.map(service => service.category),
    location: entities.location?.city || 'Hyderabad',
    budgetRange: entities.budget ? {
      min: entities.budget.min,
      max: entities.budget.max
    } : undefined,
    preferences: {
      gender: entities.preferences.gender,
      experience: entities.preferences.experience,
      style: entities.preferences.style
    },
    additionalRequirements: entities.additionalInfo
  };
};
