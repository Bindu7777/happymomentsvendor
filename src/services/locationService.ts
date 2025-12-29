// Location Service for comprehensive city/town/village to state mapping
// Includes fallback to geocoding API for unknown locations

// Comprehensive location database - cities, towns, villages, areas
const LOCATION_DATABASE: Record<string, string> = {
  // Andhra Pradesh - Major Cities
  'visakhapatnam': 'andhra-pradesh', 'vizag': 'andhra-pradesh', 'vijayawada': 'andhra-pradesh',
  'guntur': 'andhra-pradesh', 'nellore': 'andhra-pradesh', 'kurnool': 'andhra-pradesh',
  'rajahmundry': 'andhra-pradesh', 'kakinada': 'andhra-pradesh', 'tirupati': 'andhra-pradesh',
  'anantapur': 'andhra-pradesh', 'kadapa': 'andhra-pradesh', 'eluru': 'andhra-pradesh',
  'ongole': 'andhra-pradesh', 'nandyal': 'andhra-pradesh', 'machilipatnam': 'andhra-pradesh',
  'adoni': 'andhra-pradesh', 'tenali': 'andhra-pradesh', 'chittoor': 'andhra-pradesh',
  'proddatur': 'andhra-pradesh', 'bhimavaram': 'andhra-pradesh', 'tadepalligudem': 'andhra-pradesh',
  'dharmavaram': 'andhra-pradesh', 'gudivada': 'andhra-pradesh', 'srikakulam': 'andhra-pradesh',
  'hindupur': 'andhra-pradesh', 'tadpatri': 'andhra-pradesh', 'kavali': 'andhra-pradesh',
  'chilakaluripet': 'andhra-pradesh', 'palakollu': 'andhra-pradesh', 'tanuku': 'andhra-pradesh',
  'tadepalli': 'andhra-pradesh', 'rajamundry': 'andhra-pradesh', 'rajamahendravaram': 'andhra-pradesh',
  
  // Andhra Pradesh - Towns and Villages (West Godavari, East Godavari, Krishna, Guntur districts)
  'narasapuram': 'andhra-pradesh', 'attili': 'andhra-pradesh', 'akividu': 'andhra-pradesh',
  'undrajavaram': 'andhra-pradesh', 'palacole': 'andhra-pradesh', 'poduru': 'andhra-pradesh',
  'penugonda': 'andhra-pradesh', 'penumantra': 'andhra-pradesh', 'iyyuru': 'andhra-pradesh',
  'koyyalagudem': 'andhra-pradesh', 'kovvur': 'andhra-pradesh', 'kovvuru': 'andhra-pradesh',
  'amalapuram': 'andhra-pradesh', 'ramachandrapuram': 'andhra-pradesh', 'mandapeta': 'andhra-pradesh',
  'tuni': 'andhra-pradesh', 'pithapuram': 'andhra-pradesh', 'peddapuram': 'andhra-pradesh',
  'samalkot': 'andhra-pradesh', 'yeleswaram': 'andhra-pradesh', 'annavaram': 'andhra-pradesh',
  'tallarevu': 'andhra-pradesh', 'kotipalli': 'andhra-pradesh', 'gollaprolu': 'andhra-pradesh',
  'prathipadu': 'andhra-pradesh', 'gandepalli': 'andhra-pradesh', 'rajanagaram': 'andhra-pradesh',
  'rangampeta': 'andhra-pradesh', 'korukonda': 'andhra-pradesh', 'mallavaram': 'andhra-pradesh',
  'mummidivaram': 'andhra-pradesh', 'allavaram': 'andhra-pradesh', 'ainavilli': 'andhra-pradesh',
  'kapileswarapuram': 'andhra-pradesh', 'sakhinetipalli': 'andhra-pradesh', 'rayavaram': 'andhra-pradesh',
  'atreyapuram': 'andhra-pradesh', 'karapa': 'andhra-pradesh', 'thondangi': 'andhra-pradesh',
  'gollapalem': 'andhra-pradesh', 'kakinada rural': 'andhra-pradesh', 'peddapappur': 'andhra-pradesh',
  'jaggampeta': 'andhra-pradesh', 'yellamanchili': 'andhra-pradesh', 'narsipatnam': 'andhra-pradesh',
  'chintapalli': 'andhra-pradesh', 'paderu': 'andhra-pradesh', 'araku valley': 'andhra-pradesh',
  'araku': 'andhra-pradesh', 'chintapalle': 'andhra-pradesh', 'nathavaram': 'andhra-pradesh',
  'ravulapalem': 'andhra-pradesh', 'anaparthy': 'andhra-pradesh', 'kadiam': 'andhra-pradesh',
  'peravali': 'andhra-pradesh', 'mallam': 'andhra-pradesh', 'gokavaram': 'andhra-pradesh',
  
  // Telangana - Major Cities
  'hyderabad': 'telangana', 'secunderabad': 'telangana', 'warangal': 'telangana',
  'nizamabad': 'telangana', 'karimnagar': 'telangana', 'khammam': 'telangana',
  'ramagundam': 'telangana', 'mahabubnagar': 'telangana', 'nalgonda': 'telangana',
  'adilabad': 'telangana', 'suryapet': 'telangana', 'miryalaguda': 'telangana',
  'jagtial': 'telangana', 'peddapalli': 'telangana', 'kamareddy': 'telangana',
  'siddipet': 'telangana', 'wanaparthy': 'telangana', 'bhongir': 'telangana',
  'bodhan': 'telangana', 'palwancha': 'telangana', 'mandamarri': 'telangana',
  'koratla': 'telangana', 'mancherial': 'telangana', 'kothagudem': 'telangana',
  'dharmabad': 'telangana', 'basheerabad': 'telangana', 'uzhavarkarai': 'telangana',
  'nagarkurnool': 'telangana', 'gadwal': 'telangana', 'sircilla': 'telangana',
  'vikarabad': 'telangana', 'sangareddy': 'telangana', 'medak': 'telangana',
  'narayanpet': 'telangana',
  
  // Add more locations for other states...
  // (Keeping it focused on AP and Telangana for now, can expand)
};

// State name variations
const STATE_NAME_MAP: Record<string, string> = {
  'telangana': 'telangana', 'ts': 'telangana',
  'andhra pradesh': 'andhra-pradesh', 'andhra': 'andhra-pradesh', 'ap': 'andhra-pradesh',
  'tamil nadu': 'tamil-nadu', 'tamilnadu': 'tamil-nadu', 'tn': 'tamil-nadu',
  'karnataka': 'karnataka', 'ka': 'karnataka',
  'maharashtra': 'maharashtra', 'mh': 'maharashtra',
  'delhi': 'delhi', 'nct': 'delhi',
  'kerala': 'kerala', 'kl': 'kerala',
  'punjab': 'punjab', 'pb': 'punjab',
  'rajasthan': 'rajasthan', 'rj': 'rajasthan',
  'haryana': 'haryana', 'hr': 'haryana',
  'gujarat': 'gujarat', 'gj': 'gujarat',
  'west bengal': 'west-bengal', 'wb': 'west-bengal',
  'uttar pradesh': 'uttar-pradesh', 'up': 'uttar-pradesh',
  'odisha': 'odisha', 'orissa': 'odisha', 'or': 'odisha',
  'goa': 'goa', 'ga': 'goa',
  'puducherry': 'puducherry', 'pondicherry': 'puducherry', 'py': 'puducherry',
};

/**
 * Find state for a given location using local database
 */
export function findStateForLocation(location: string): string | null {
  const locationLower = location.toLowerCase().trim();
  
  // Check exact match in database
  if (LOCATION_DATABASE[locationLower]) {
    return LOCATION_DATABASE[locationLower];
  }
  
  // Check state names
  if (STATE_NAME_MAP[locationLower]) {
    return STATE_NAME_MAP[locationLower];
  }
  
  // Try fuzzy matching for common variations
  const normalized = locationLower.replace(/[^a-z]/g, '');
  for (const [key, state] of Object.entries(LOCATION_DATABASE)) {
    const keyNormalized = key.replace(/[^a-z]/g, '');
    if (normalized === keyNormalized || 
        normalized.includes(keyNormalized) || 
        keyNormalized.includes(normalized)) {
      return state;
    }
  }
  
  return null;
}

/**
 * Geocode location using OpenStreetMap Nominatim API (free, no key required)
 * Fallback for unknown locations
 */
export async function geocodeLocation(location: string): Promise<string | null> {
  try {
    // Use Nominatim API (OpenStreetMap) - free and no API key needed
    const encodedLocation = encodeURIComponent(location + ', India');
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodedLocation}&format=json&limit=1&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'HappyMomentsVendor/1.0' // Required by Nominatim
        }
      }
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data && data.length > 0) {
      const result = data[0];
      const address = result.address || {};
      
      // Extract state from address
      const state = address.state || address.region || address.province;
      if (state) {
        // Map state name to our state code format
        const stateLower = state.toLowerCase();
        if (stateLower.includes('andhra pradesh') || stateLower.includes('andhra')) {
          return 'andhra-pradesh';
        } else if (stateLower.includes('telangana')) {
          return 'telangana';
        } else if (stateLower.includes('tamil nadu') || stateLower.includes('tamilnadu')) {
          return 'tamil-nadu';
        } else if (stateLower.includes('karnataka')) {
          return 'karnataka';
        } else if (stateLower.includes('maharashtra')) {
          return 'maharashtra';
        } else if (stateLower.includes('kerala')) {
          return 'kerala';
        } else if (stateLower.includes('punjab')) {
          return 'punjab';
        } else if (stateLower.includes('rajasthan')) {
          return 'rajasthan';
        } else if (stateLower.includes('haryana')) {
          return 'haryana';
        } else if (stateLower.includes('gujarat')) {
          return 'gujarat';
        } else if (stateLower.includes('west bengal') || stateLower.includes('west bengal')) {
          return 'west-bengal';
        } else if (stateLower.includes('uttar pradesh') || stateLower.includes('up')) {
          return 'uttar-pradesh';
        } else if (stateLower.includes('odisha') || stateLower.includes('orissa')) {
          return 'odisha';
        } else if (stateLower.includes('goa')) {
          return 'goa';
        } else if (stateLower.includes('puducherry') || stateLower.includes('pondicherry')) {
          return 'puducherry';
        } else if (stateLower.includes('delhi')) {
          return 'delhi';
        }
      }
    }
  } catch (error) {
    console.error('Geocoding error:', error);
  }
  
  return null;
}

/**
 * Main function to get state for location - tries local DB first, then geocoding API
 */
export async function getStateForLocation(location: string): Promise<string | null> {
  // First try local database
  const localResult = findStateForLocation(location);
  if (localResult) {
    return localResult;
  }
  
  // If not found, try geocoding API
  const geocodeResult = await geocodeLocation(location);
  if (geocodeResult) {
    // Cache it for future use
    LOCATION_DATABASE[location.toLowerCase()] = geocodeResult;
    return geocodeResult;
  }
  
  return null;
}

