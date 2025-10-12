// Voice Processing Service for Intelligent Context Extraction
// Handles city-to-state mapping, budget extraction, and service type identification

// Comprehensive City-to-State Mapping Dataset
const CITY_STATE_MAPPING: Record<string, string> = {
  // Andhra Pradesh
  'hyderabad': 'telangana',
  'visakhapatnam': 'andhra-pradesh',
  'vijayawada': 'andhra-pradesh',
  'guntur': 'andhra-pradesh',
  'nellore': 'andhra-pradesh',
  'kurnool': 'andhra-pradesh',
  'kadapa': 'andhra-pradesh',
  'anantapur': 'andhra-pradesh',
  'chittoor': 'andhra-pradesh',
  'tirupati': 'andhra-pradesh',
  'rajahmundry': 'andhra-pradesh',
  'kakinada': 'andhra-pradesh',
  'ongole': 'andhra-pradesh',
  'eluru': 'andhra-pradesh',
  'vizianagaram': 'andhra-pradesh',
  'srikakulam': 'andhra-pradesh',

  // Telangana
  'secunderabad': 'telangana',
  'warangal': 'telangana',
  'nizamabad': 'telangana',
  'khammam': 'telangana',
  'karimnagar': 'telangana',
  'ramagundam': 'telangana',
  'adilabad': 'telangana',
  'mahabubnagar': 'telangana',
  'nalgonda': 'telangana',
  'suryapet': 'telangana',
  'miryalaguda': 'telangana',
  'bhongir': 'telangana',
  'siddipet': 'telangana',
  'medak': 'telangana',
  'sangareddy': 'telangana',

  // Karnataka
  'bangalore': 'karnataka',
  'bengaluru': 'karnataka',
  'mysore': 'karnataka',
  'mysuru': 'karnataka',
  'hubli': 'karnataka',
  'dharwad': 'karnataka',
  'mangalore': 'karnataka',
  'mangaluru': 'karnataka',
  'belgaum': 'karnataka',
  'belagavi': 'karnataka',
  'gulbarga': 'karnataka',
  'kalaburagi': 'karnataka',
  'davangere': 'karnataka',
  'bellary': 'karnataka',
  'ballari': 'karnataka',
  'bijapur': 'karnataka',
  'vijayapura': 'karnataka',
  'shimoga': 'karnataka',
  'shivamogga': 'karnataka',
  'tumkur': 'karnataka',
  'tumakuru': 'karnataka',
  'raichur': 'karnataka',
  'bidar': 'karnataka',
  'hospet': 'karnataka',
  'gadag': 'karnataka',
  'chitradurga': 'karnataka',
  'kolar': 'karnataka',
  'mandya': 'karnataka',
  'hassan': 'karnataka',
  'udupi': 'karnataka',

  // Tamil Nadu
  'chennai': 'tamil-nadu',
  'madras': 'tamil-nadu',
  'coimbatore': 'tamil-nadu',
  'madurai': 'tamil-nadu',
  'tiruchirapalli': 'tamil-nadu',
  'trichy': 'tamil-nadu',
  'salem': 'tamil-nadu',
  'tirunelveli': 'tamil-nadu',
  'tiruppur': 'tamil-nadu',
  'erode': 'tamil-nadu',
  'vellore': 'tamil-nadu',
  'thoothukudi': 'tamil-nadu',
  'tuticorin': 'tamil-nadu',
  'dindigul': 'tamil-nadu',
  'thanjavur': 'tamil-nadu',
  'ranipet': 'tamil-nadu',
  'sivakasi': 'tamil-nadu',
  'karur': 'tamil-nadu',
  'hosur': 'tamil-nadu',
  'nagercoil': 'tamil-nadu',
  'cuddalore': 'tamil-nadu',
  'kanchipuram': 'tamil-nadu',
  'kumbakonam': 'tamil-nadu',
  'tiruvannamalai': 'tamil-nadu',
  'pollachi': 'tamil-nadu',
  'rajapalayam': 'tamil-nadu',
  'gudiyatham': 'tamil-nadu',
  'ambattur': 'tamil-nadu',
  'pudukkottai': 'tamil-nadu',

  // Kerala
  'thiruvananthapuram': 'kerala',
  'trivandrum': 'kerala',
  'kochi': 'kerala',
  'cochin': 'kerala',
  'kozhikode': 'kerala',
  'calicut': 'kerala',
  'thrissur': 'kerala',
  'palakkad': 'kerala',
  'kollam': 'kerala',
  'quilon': 'kerala',
  'alappuzha': 'kerala',
  'alleppey': 'kerala',
  'malappuram': 'kerala',
  'kannur': 'kerala',
  'cannanore': 'kerala',
  'kasaragod': 'kerala',
  'kottayam': 'kerala',
  'pathanamthitta': 'kerala',
  'idukki': 'kerala',
  'wayanad': 'kerala',

  // Maharashtra
  'mumbai': 'maharashtra',
  'pune': 'maharashtra',
  'nagpur': 'maharashtra',
  'nashik': 'maharashtra',
  'thane': 'maharashtra',
  'aurangabad': 'maharashtra',
  'solapur': 'maharashtra',
  'amravati': 'maharashtra',
  'kolhapur': 'maharashtra',
  'sangli': 'maharashtra',
  'malegaon': 'maharashtra',
  'ulhasnagar': 'maharashtra',
  'jalgaon': 'maharashtra',
  'akola': 'maharashtra',
  'latur': 'maharashtra',
  'dhule': 'maharashtra',
  'ahmednagar': 'maharashtra',
  'chandrapur': 'maharashtra',
  'parbhani': 'maharashtra',
  'ichalkaranji': 'maharashtra',
  'jalna': 'maharashtra',
  'ambarnath': 'maharashtra',
  'bhusawal': 'maharashtra',
  'panvel': 'maharashtra',

  // Gujarat
  'ahmedabad': 'gujarat',
  'surat': 'gujarat',
  'vadodara': 'gujarat',
  'baroda': 'gujarat',
  'rajkot': 'gujarat',
  'bhavnagar': 'gujarat',
  'juniagadh': 'gujarat',
  'gandhinagar': 'gujarat',
  'nadiad': 'gujarat',
  'morbi': 'gujarat',
  'nandurbar': 'gujarat',
  'anand': 'gujarat',
  'mehsana': 'gujarat',
  'bhuj': 'gujarat',
  'jamnagar': 'gujarat',
  'gandhidham': 'gujarat',
  'veraval': 'gujarat',
  'dhangadhra': 'gujarat',
  'navsari': 'gujarat',
  'vapi': 'gujarat',

  // Rajasthan
  'jaipur': 'rajasthan',
  'jodhpur': 'rajasthan',
  'udaipur': 'rajasthan',
  'kota': 'rajasthan',
  'bikaner': 'rajasthan',
  'ajmer': 'rajasthan',
  'bharatpur': 'rajasthan',
  'bhilwara': 'rajasthan',
  'alwar': 'rajasthan',
  'sikar': 'rajasthan',
  'pali': 'rajasthan',
  'ganganagar': 'rajasthan',
  'tonk': 'rajasthan',
  'beawar': 'rajasthan',
  'kishangarh': 'rajasthan',
  'hanumangarh': 'rajasthan',
  'dausa': 'rajasthan',
  'churu': 'rajasthan',
  'sawai madhopur': 'rajasthan',
  'gangapur': 'rajasthan',

  // Delhi
  'delhi': 'delhi',
  'new delhi': 'delhi',
  'noida': 'uttar-pradesh',
  'gurgaon': 'haryana',
  'gurugram': 'haryana',
  'faridabad': 'haryana',
  'ghaziabad': 'uttar-pradesh',

  // Uttar Pradesh
  'lucknow': 'uttar-pradesh',
  'kanpur': 'uttar-pradesh',
  'agra': 'uttar-pradesh',
  'varanasi': 'uttar-pradesh',
  'banaras': 'uttar-pradesh',
  'meerut': 'uttar-pradesh',
  'allahabad': 'uttar-pradesh',
  'prayagraj': 'uttar-pradesh',
  'bareilly': 'uttar-pradesh',
  'gorakhpur': 'uttar-pradesh',
  'moradabad': 'uttar-pradesh',
  'aligarh': 'uttar-pradesh',
  'saharanpur': 'uttar-pradesh',
  'jhansi': 'uttar-pradesh',
  'muzaffarnagar': 'uttar-pradesh',
  'mathura': 'uttar-pradesh',
  'shahjahanpur': 'uttar-pradesh',
  'firozabad': 'uttar-pradesh',
  'ayodhya': 'uttar-pradesh',
  'rampur': 'uttar-pradesh',

  // West Bengal
  'kolkata': 'west-bengal',
  'calcutta': 'west-bengal',
  'asansol': 'west-bengal',
  'siliguri': 'west-bengal',
  'durgapur': 'west-bengal',
  'bardhaman': 'west-bengal',
  'malda': 'west-bengal',
  'baharampur': 'west-bengal',
  'habra': 'west-bengal',
  'kharagpur': 'west-bengal',
  'shantipur': 'west-bengal',
  'dhulian': 'west-bengal',
  'ranaghat': 'west-bengal',
  'haldia': 'west-bengal',
  'raiganj': 'west-bengal',
  'krishnanagar': 'west-bengal',
  'nabadwip': 'west-bengal',
  'medinipur': 'west-bengal',
  'jalpaiguri': 'west-bengal',
  'balurghat': 'west-bengal',

  // Haryana
  'chandigarh': 'chandigarh',
  'panchkula': 'haryana',
  'ambala': 'haryana',
  'yamunanagar': 'haryana',
  'karnal': 'haryana',
  'hisar': 'haryana',
  'rohtak': 'haryana',
  'panipat': 'haryana',
  'sonipat': 'haryana',
  'bhiwani': 'haryana',
  'sirsa': 'haryana',
  'bahadurgarh': 'haryana',
  'thanesar': 'haryana',
  'kaithal': 'haryana',
  'rewari': 'haryana',
  'palwal': 'haryana',
  'narnaul': 'haryana',
  'narwana': 'haryana',

  // Punjab
  'amritsar': 'punjab',
  'ludhiana': 'punjab',
  'jalandhar': 'punjab',
  'patiala': 'punjab',
  'bathinda': 'punjab',
  'moga': 'punjab',
  'hoshiarpur': 'punjab',
  'batala': 'punjab',
  'muktsar': 'punjab',
  'sangrur': 'punjab',
  'barnala': 'punjab',
  'firozpur': 'punjab',
  'kapurthala': 'punjab',
  'phagwara': 'punjab',
  'rajpura': 'punjab',
  'mohali': 'punjab',
  'sahibzada ajit singh nagar': 'punjab',

  // Madhya Pradesh
  'bhopal': 'madhya-pradesh',
  'indore': 'madhya-pradesh',
  'gwalior': 'madhya-pradesh',
  'jabalpur': 'madhya-pradesh',
  'ujjain': 'madhya-pradesh',
  'sagar': 'madhya-pradesh',
  'dewas': 'madhya-pradesh',
  'satna': 'madhya-pradesh',
  'ratlam': 'madhya-pradesh',
  'rewa': 'madhya-pradesh',
  'murwara': 'madhya-pradesh',
  'singrauli': 'madhya-pradesh',
  'burhanpur': 'madhya-pradesh',
  'khandwa': 'madhya-pradesh',
  'morena': 'madhya-pradesh',
  'bhind': 'madhya-pradesh',
  'vidisha': 'madhya-pradesh',
  'chhindwara': 'madhya-pradesh',
  'guna': 'madhya-pradesh',
  'shivpuri': 'madhya-pradesh',

  // Odisha
  'bhubaneswar': 'odisha',
  'cuttack': 'odisha',
  'rourkela': 'odisha',
  'berhampur': 'odisha',
  'sambalpur': 'odisha',
  'puri': 'odisha',
  'balasore': 'odisha',
  'bhadrak': 'odisha',
  'baripada': 'odisha',
  'baleshwar': 'odisha',
  'jajpur': 'odisha',
  'kendujhar': 'odisha',
  'jagatsinghpur': 'odisha',
  'kendrapara': 'odisha',

  // Assam
  'guwahati': 'assam',
  'silchar': 'assam',
  'dibrugarh': 'assam',
  'jorhat': 'assam',
  'nagaon': 'assam',
  'tezpur': 'assam',
  'tinsukia': 'assam',
  'bongaigaon': 'assam',
  'dhubri': 'assam',
  'karimganj': 'assam',
  'goalpara': 'assam',
  'barpeta': 'assam',
  'lakhimpur': 'assam',
  'kokrajhar': 'assam',
  'nalbari': 'assam',

  // Jharkhand
  'ranchi': 'jharkhand',
  'jamshedpur': 'jharkhand',
  'dhanbad': 'jharkhand',
  'bokaro': 'jharkhand',
  'deoghar': 'jharkhand',
  'phusro': 'jharkhand',
  'hazaribagh': 'jharkhand',
  'giridih': 'jharkhand',
  'ramgarh': 'jharkhand',
  'medininagar': 'jharkhand',
  'chaibasa': 'jharkhand',
  'gumla': 'jharkhand',
  'dumka': 'jharkhand',
  'hazaribag': 'jharkhand',

  // Chhattisgarh
  'raipur': 'chhattisgarh',
  'bhilai': 'chhattisgarh',
  'bilaspur': 'chhattisgarh',
  'korba': 'chhattisgarh',
  'rajnandgaon': 'chhattisgarh',
  'raigarh': 'chhattisgarh',
  'ambikapur': 'chhattisgarh',
  'jagdalpur': 'chhattisgarh',
  'durg': 'chhattisgarh',
  'dhamtari': 'chhattisgarh',

  // Uttarakhand
  'dehradun': 'uttarakhand',
  'haridwar': 'uttarakhand',
  'roorkee': 'uttarakhand',
  'kashipur': 'uttarakhand',
  'rudrapur': 'uttarakhand',
  'haldwani': 'uttarakhand',
  'nainital': 'uttarakhand',
  'mussoorie': 'uttarakhand',
  'rishikesh': 'uttarakhand',

  // Himachal Pradesh
  'shimla': 'himachal-pradesh',
  'dharamshala': 'himachal-pradesh',
  'solan': 'himachal-pradesh',
  'baddi': 'himachal-pradesh',
  'parwanoo': 'himachal-pradesh',
  'una': 'himachal-pradesh',
  'palampur': 'himachal-pradesh',
  'mandi': 'himachal-pradesh',
  'chamba': 'himachal-pradesh',
  'kullu': 'himachal-pradesh',
  'manali': 'himachal-pradesh',

  // Goa
  'panaji': 'goa',
  'margao': 'goa',
  'vasco da gama': 'goa',
  'mapusa': 'goa',
  'ponda': 'goa',
  'bicholim': 'goa',

  // Jammu and Kashmir
  'srinagar': 'jammu-kashmir',
  'jammu': 'jammu-kashmir',
  'baramulla': 'jammu-kashmir',
  'anantnag': 'jammu-kashmir',
  'sopore': 'jammu-kashmir',
  'udhampur': 'jammu-kashmir',

  // Ladakh
  'leh': 'ladakh',
  'kargil': 'ladakh',

  // Northeastern States
  'imphal': 'manipur',
  'aizawl': 'mizoram',
  'kohima': 'nagaland',
  'shillong': 'meghalaya',
  'agartala': 'tripura',
  'gangtok': 'sikkim',
  'itanagar': 'arunachal-pradesh',

  // Union Territories
  'port blair': 'andaman-nicobar',
  'kavaratti': 'lakshadweep',
  'pondicherry': 'puducherry',
  'puducherry': 'puducherry',
  'daman': 'daman-diu',
  'diu': 'daman-diu',
  'silvassa': 'dadra-nagar-haveli'
};

// Budget Range Configuration
const BUDGET_RANGES = [
  { min: 10000, max: 50000, label: '₹10,000 - ₹50,000', key: '10k-50k' },
  { min: 50000, max: 100000, label: '₹50,000 - ₹1L', key: '50k-1l' },
  { min: 100000, max: 300000, label: '₹1L - ₹3L', key: '1l-3l' },
  { min: 300000, max: 1000000, label: '₹3L - ₹10L', key: '3l-10l' },
  { min: 1000000, max: 1500000, label: '₹10L - ₹15L', key: '10l-15l' },
  { min: 1500000, max: 2500000, label: '₹15L - ₹25L', key: '15l-25l' },
  { min: 2500000, max: 5000000, label: '₹25L - ₹50L', key: '25l-50l' },
  { min: 5000000, max: 10000000, label: '₹50L - ₹1CR', key: '50l-1cr' }
];

// Service Type Keywords Mapping
const SERVICE_KEYWORDS: Record<string, string[]> = {
  'photography': [
    'photographer', 'photography', 'photo', 'camera', 'videography', 'video',
    'photoshoot', 'photo shoot', 'wedding photography', 'event photography',
    'cinematography', 'camera man', 'cameraman', 'photography services',
    'video shooting', 'photo session', 'picture', 'pictures', 'photographs',
    // Telugu transliterations
    'fotografer', 'foto', 'camera man', 'photographer 1', 'photographer one'
  ],
  'makeup': [
    'makeup', 'makeup artist', 'make up', 'beauty', 'bridal makeup',
    'party makeup', 'beauty artist', 'cosmetics', 'makeup services',
    'beauty services', 'glamour', 'styling', 'hair and makeup',
    'beauty expert', 'makeup specialist',
    // Telugu transliterations
    'mekap', 'beauty artist', 'makeup artist'
  ],
  'decor': [
    'decorator', 'decoration', 'decor', 'decoration services',
    'wedding decoration', 'event decoration', 'floral decoration',
    'stage decoration', 'venue decoration', 'decoration setup',
    'decoration design', 'party decoration', 'decoration work',
    // Telugu transliterations
    'decoration', 'decorator'
  ],
  'catering': [
    'catering', 'caterer', 'food', 'catering services', 'catering company',
    'food services', 'banquet', 'food provider', 'catering menu',
    'food catering', 'event catering', 'wedding catering', 'party food'
  ],
  'venues': [
    'venue', 'hall', 'banquet hall', 'marriage hall', 'wedding venue',
    'event venue', 'party venue', 'reception hall', 'conference hall',
    'function hall', 'marriage palace', 'wedding hall', 'venue booking'
  ],
  'music': [
    'dj', 'music', 'dj services', 'music services', 'sound', 'sound system',
    'lighting', 'entertainment', 'music band', 'live music', 'dj music',
    'party music', 'wedding music', 'sound and lighting', 'audio'
  ],
  'attire': [
    'clothes', 'clothing', 'fashion', 'designer', 'dress', 'outfit',
    'costume', 'fashion designer', 'clothing designer', 'dress designer',
    'wedding dress', 'bridal wear', 'groom wear', 'fashion services'
  ],
  'planning': [
    'planner', 'planning', 'event planner', 'wedding planner',
    'event management', 'event organizer', 'party planner',
    'event coordination', 'planning services', 'event consultant'
  ]
};

// Voice Processing Interface
export interface VoiceExtractedData {
  state?: string;
  city?: string;
  budgetRange?: string;
  budgetValue?: number;
  serviceType?: string;
  confidence: number;
  rawText: string;
}

// Number word to digit mapping
const NUMBER_WORDS: Record<string, number> = {
  'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
  'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
  'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
  'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19,
  'twenty': 20, 'thirty': 30, 'forty': 40, 'fifty': 50,
  'sixty': 60, 'seventy': 70, 'eighty': 80, 'ninety': 90,
  'hundred': 100, 'thousand': 1000, 'lakh': 100000, 'lakhs': 100000,
  'crore': 10000000, 'crores': 10000000
};

/**
 * Extract state from city name
 */
export const getStateFromCity = (cityName: string): string | null => {
  const normalizedCity = cityName.toLowerCase().trim();
  return CITY_STATE_MAPPING[normalizedCity] || null;
};

/**
 * Extract numerical value from text (handles both digits and words)
 */
export const extractNumberFromText = (text: string): number | null => {
  const cleanText = text.toLowerCase().replace(/[^\w\s]/g, ' ');
  
  // First try to extract direct numbers
  const directNumberMatch = text.match(/(\d+(?:,\d{3})*(?:\.\d+)?)/);
  if (directNumberMatch) {
    return parseInt(directNumberMatch[1].replace(/,/g, ''));
  }
  
  // Special handling for "lakh" format (e.g., "1 lakh")
  const lakhMatch = cleanText.match(/(\d+)\s*lakh/);
  if (lakhMatch) {
    return parseInt(lakhMatch[1]) * 100000;
  }
  
  // Handle word-based numbers
  const words = cleanText.split(/\s+/);
  let result = 0;
  let currentNumber = 0;
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    
    if (word in NUMBER_WORDS) {
      const value = NUMBER_WORDS[word];
      
      if (value === 100) {
        currentNumber *= 100;
      } else if (value === 1000) {
        currentNumber *= 1000;
        result += currentNumber;
        currentNumber = 0;
      } else if (value === 100000) { // lakh
        currentNumber *= 100000;
        result += currentNumber;
        currentNumber = 0;
      } else if (value === 10000000) { // crore
        currentNumber *= 10000000;
        result += currentNumber;
        currentNumber = 0;
      } else {
        currentNumber += value;
      }
    }
  }
  
  result += currentNumber;
  return result > 0 ? result : null;
};

/**
 * Classify budget value into appropriate range
 */
export const classifyBudgetRange = (budgetValue: number): string | null => {
  for (const range of BUDGET_RANGES) {
    if (budgetValue >= range.min && budgetValue <= range.max) {
      return range.key;
    }
  }
  
  // Handle values outside predefined ranges
  if (budgetValue < 10000) {
    return '10k-50k'; // Default to lowest range
  } else if (budgetValue > 10000000) {
    return '50l-1cr'; // Default to highest range
  }
  
  return null;
};

/**
 * Identify service type from text
 */
export const identifyServiceType = (text: string): string | null => {
  const normalizedText = text.toLowerCase();
  
  for (const [serviceType, keywords] of Object.entries(SERVICE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (normalizedText.includes(keyword)) {
        return serviceType;
      }
    }
  }
  
  return null;
};

/**
 * Main voice processing function
 */
export const processVoiceInput = (transcript: string): VoiceExtractedData => {
  const normalizedText = transcript.toLowerCase();
  let confidence = 0;
  const extractedData: VoiceExtractedData = {
    confidence: 0,
    rawText: transcript
  };
  
  // Special handling for Telugu transliterations and mixed text
  // Clean up common Telugu transliteration issues
  let cleanedText = normalizedText
    .replace(/\bphotographer\s+1\s+(lakh|lakhs?)\b/g, 'photographer budget 1 lakh')
    .replace(/\bphotographer\s+one\s+(lakh|lakhs?)\b/g, 'photographer budget 1 lakh')
    .replace(/\bphotographer\s+(\d+)\s+(lakh|lakhs?)\b/g, 'photographer budget $1 lakh')
    .replace(/\b(lakh|lakhs?)\s+within\s+budget\b/g, 'budget 1 lakh')
    .replace(/\bbudget\s+lo\b/g, 'budget')
    .replace(/\bkavali\b/g, 'needed')
    .replace(/\boka\b/g, 'one')
    .replace(/\buplakshya\b/g, 'within budget');
  
  // Extract city and state - prioritize city extraction for better state mapping
  const cityMatch = cleanedText.match(/\b(hyderabad|bangalore|chennai|mumbai|delhi|kolkata|pune|ahmedabad|jaipur|lucknow|kanpur|nagpur|indore|bhopal|visakhapatnam|pimpri|patna|vadodara|ludhiana|agra|nashik|faridabad|meerut|rajkot|kalyan|vasai|varanasi|srinagar|aurangabad|noida|solapur|ranchi|howrah|coimbatore|raipur|jabalpur|gwalior|madurai|mysore|tiruchirapalli|bhubaneswar|kochi|bhavnagar|salem|warangal|guntur|bhiwandi|amravati|nanded|kolhapur|sangli|malegaon|ulhasnagar|jalgaon|akola|latur|dhule|ahmednagar|chandrapur|parbhani|ichalkaranji|jalna|ambarnath|bhusawal|panvel|satna|ratlam|rewa|murwara|singrauli|burhanpur|khandwa|morena|bhind|vidisha|chhindwara|guna|shivpuri|durg|rajnandgaon|raigarh|ambikapur|jagdalpur|dhamtari|korba|bhilai|bilaspur|rourkela|berhampur|sambalpur|puri|balasore|bhadrak|baripada|baleshwar|jajpur|kendujhar|jagatsinghpur|kendrapara|guwahati|silchar|dibrugarh|jorhat|nagaon|tezpur|tinsukia|bongaigaon|dhubri|karimganj|goalpara|barpeta|lakhimpur|kokrajhar|nalbari|ranchi|jamshedpur|dhanbad|bokaro|deoghar|phusro|hazaribagh|giridih|ramgarh|medininagar|chaibasa|gumla|dumka|hazaribag|raipur|bhilai|bilaspur|korba|rajnandgaon|raigarh|ambikapur|jagdalpur|durg|dhamtari|dehradun|haridwar|roorkee|kashipur|rudrapur|haldwani|nainital|mussoorie|rishikesh|shimla|dharamshala|solan|baddi|parwanoo|una|palampur|mandi|chamba|kullu|manali|panaji|margao|vasco da gama|mapusa|ponda|bicholim|srinagar|jammu|baramulla|anantnag|sopore|udhampur|leh|kargil|imphal|aizawl|kohima|shillong|agartala|gangtok|itanagar|port blair|kavaratti|pondicherry|puducherry|daman|diu|silvassa)\b/);
  
  if (cityMatch) {
    const city = cityMatch[0];
    const state = getStateFromCity(city);
    if (state) {
      extractedData.city = city;
      extractedData.state = state;
      confidence += 0.3;
    }
  }
  
  // Extract budget information - improved patterns for better accuracy
  const budgetPatterns = [
    // Pattern for "1 lakh budget" format
    /\b(\d+)\s+(lakh|lakhs?)\s+(?:budget|price|cost)/i,
    // Pattern for "budget is 1 lakh" format
    /\b(?:budget|price|cost)\s*(?:is|of|for)?\s*(\d+)\s+(lakh|lakhs?)/i,
    // Pattern for standalone "1 lakh" with budget context
    /\b(\d+)\s+(lakh|lakhs?)\s*(?:rupees?|rs)?/i,
    // Pattern for budget followed by amount
    /\b(?:budget|price|cost|spending|spend|around|about|approximately|upto|up to|max|maximum)\s*(?:is|of|for)?\s*([\w\s,]+?)(?:\s|$|rupees?|rs|lakhs?|crores?|thousand|k|l)/i,
    // Pattern for direct numbers
    /\b(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:rupees?|rs|lakhs?|crores?|thousand|k|l)?/i,
    // Pattern for word-based numbers
    /\b(forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|lakh|crore)\s*(?:thousand|lakhs?|crores?)?\s*(?:rupees?|rs)?/i
  ];
  
  for (const pattern of budgetPatterns) {
    const match = cleanedText.match(pattern);
    if (match) {
      // Handle different pattern types
      let budgetValue: number | null = null;
      
      // For lakh patterns (patterns 1-3), extract the number and multiply by 100000
      if (pattern.source.includes('lakh')) {
        const numberMatch = match[1];
        if (numberMatch) {
          budgetValue = parseInt(numberMatch) * 100000;
        }
      } else {
        // For other patterns, use the existing extraction logic
        const budgetText = match[1] || match[0];
        budgetValue = extractNumberFromText(budgetText);
      }
      
      if (budgetValue) {
        const budgetRange = classifyBudgetRange(budgetValue);
        if (budgetRange) {
          extractedData.budgetValue = budgetValue;
          extractedData.budgetRange = budgetRange;
          confidence += 0.3;
          break;
        }
      }
    }
  }
  
  // Extract service type - use cleaned text for better recognition
  const serviceType = identifyServiceType(cleanedText);
  if (serviceType) {
    extractedData.serviceType = serviceType;
    confidence += 0.4;
  }
  
  extractedData.confidence = Math.min(confidence, 1.0);
  return extractedData;
};

/**
 * Get budget range label from key
 */
export const getBudgetRangeLabel = (rangeKey: string): string => {
  const range = BUDGET_RANGES.find(r => r.key === rangeKey);
  return range ? range.label : 'Unknown Range';
};

/**
 * Validate and enhance extracted data
 */
export const validateAndEnhanceData = (data: VoiceExtractedData): VoiceExtractedData => {
  const enhanced = { ...data };
  
  // If we have a city but no state, try to find the state
  if (enhanced.city && !enhanced.state) {
    const state = getStateFromCity(enhanced.city);
    if (state) {
      enhanced.state = state;
    }
  }
  
  // If we have a budget value but no range, classify it
  if (enhanced.budgetValue && !enhanced.budgetRange) {
    enhanced.budgetRange = classifyBudgetRange(enhanced.budgetValue);
  }
  
  // Recalculate confidence
  let newConfidence = 0;
  if (enhanced.state) newConfidence += 0.3;
  if (enhanced.budgetRange) newConfidence += 0.3;
  if (enhanced.serviceType) newConfidence += 0.4;
  
  enhanced.confidence = Math.min(newConfidence, 1.0);
  
  return enhanced;
};

export default {
  processVoiceInput,
  getStateFromCity,
  extractNumberFromText,
  classifyBudgetRange,
  identifyServiceType,
  getBudgetRangeLabel,
  validateAndEnhanceData
};
