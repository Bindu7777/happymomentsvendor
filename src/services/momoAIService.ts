import { getAIEventAdvisorPrompt, formatVendorForAdvisor } from './aiEventAdvisorPrompt';
import { Vendor } from '@/lib/supabase';

/**
 * Momo AI Service
 * Uses free AI models to provide intelligent vendor recommendations
 */

interface MomoMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Call Hugging Face Inference API (free, no auth required for public models)
 */
async function callHuggingFaceAPI(messages: MomoMessage[]): Promise<string> {
  try {
    // Using Hugging Face's free inference API with a good model
    // Model: microsoft/Phi-3-mini-4k-instruct (free, fast, good quality)
    const formattedPrompt = formatMessagesForHF(messages);
    
    const response = await fetch(
      'https://api-inference.huggingface.co/models/microsoft/Phi-3-mini-4k-instruct',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: formattedPrompt,
          parameters: {
            max_new_tokens: 800,
            temperature: 0.7,
            top_p: 0.9,
            return_full_text: false,
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Hugging Face API error: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    if (Array.isArray(data) && data[0]?.generated_text) {
      return data[0].generated_text.trim();
    }
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    if (data[0]?.generated_text) {
      return data[0].generated_text.trim();
    }
    
    return 'I apologize, but I encountered an issue processing your request.';
  } catch (error) {
    console.error('Hugging Face API error:', error);
    throw error;
  }
}

/**
 * Format messages for Hugging Face API
 */
function formatMessagesForHF(messages: MomoMessage[]): string {
  // Format as a conversation prompt
  let prompt = '';
  
  messages.forEach(msg => {
    if (msg.role === 'system') {
      prompt += `<|system|>\n${msg.content}<|end|>\n`;
    } else if (msg.role === 'user') {
      prompt += `<|user|>\n${msg.content}<|end|>\n`;
    } else {
      prompt += `<|assistant|>\n${msg.content}<|end|>\n`;
    }
  });
  
  prompt += `<|assistant|>\n`;
  
  return prompt;
}

/**
 * Call Groq API (free tier, very fast)
 */
async function callGroqAPI(messages: MomoMessage[]): Promise<string> {
  try {
    // Groq has a free tier with fast inference
    // Using llama-3.1-8b-instant model (free)
    const apiKey = import.meta.env.VITE_GROQ_API_KEY || '';
    
    if (!apiKey) {
      throw new Error('Groq API key not configured');
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Groq API error');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'I apologize, but I encountered an issue.';
  } catch (error) {
    console.error('Groq API error:', error);
    throw error;
  }
}

/**
 * Intelligent vendor recommendation using AI
 */
export async function getMomoRecommendation(
  query: string,
  vendors: Vendor[]
): Promise<string> {
  try {
    // Format all vendors for AI context
    const allVendorsData = vendors.map(vendor => formatVendorForAdvisor(vendor));
    
    // Get system prompt
    const systemPrompt = getAIEventAdvisorPrompt();
    
    // Create vendor context summary
    const vendorContext = createVendorContextSummary(vendors, allVendorsData);
    
    // Prepare messages for AI
    const messages: MomoMessage[] = [
      {
        role: 'system',
        content: `${systemPrompt}\n\nYou have access to ${vendors.length} vendors. Here's a summary:\n\n${vendorContext}\n\nRemember: You are Momo, the AI Event Advisor. Be confident, specific, and helpful.`
      },
      {
        role: 'user',
        content: query
      }
    ];

    // Try Groq first (faster), fallback to Hugging Face, then to intelligent local response
    try {
      return await callGroqAPI(messages);
    } catch (groqError) {
      console.log('Groq failed, trying Hugging Face...', groqError);
      try {
        return await callHuggingFaceAPI(messages);
      } catch (hfError) {
        console.log('Hugging Face failed, using intelligent local response...', hfError);
        return generateIntelligentLocalResponse(query, vendors, allVendorsData);
      }
    }
  } catch (error) {
    console.error('Error getting Momo recommendation:', error);
    return generateIntelligentLocalResponse(query, vendors, vendors.map(formatVendorForAdvisor));
  }
}

/**
 * Create a summary of vendor context for AI
 */
function createVendorContextSummary(vendors: Vendor[], formattedVendors: any[]): string {
  const categories = new Set<string>();
  const locations = new Set<string>();
  let totalEvents = 0;
  let totalRating = 0;
  let ratedCount = 0;

  vendors.forEach(vendor => {
    const cats = Array.isArray(vendor.category) ? vendor.category : [vendor.category];
    cats.forEach(cat => categories.add(cat || ''));
    
    if (vendor.address) {
      locations.add(vendor.address.split(',')[vendor.address.split(',').length - 1]?.trim() || '');
    }
    
    if (vendor.events_completed) {
      totalEvents += vendor.events_completed;
    }
    
    if (vendor.rating) {
      totalRating += vendor.rating;
      ratedCount++;
    }
  });

  const avgRating = ratedCount > 0 ? (totalRating / ratedCount).toFixed(1) : 'N/A';
  
  return `Vendor Database Summary:
- Total Vendors: ${vendors.length}
- Categories: ${Array.from(categories).join(', ')}
- Locations: ${Array.from(locations).slice(0, 10).join(', ')}${locations.size > 10 ? '...' : ''}
- Total Events Completed: ${totalEvents}+
- Average Rating: ${avgRating}/5
- Verified Vendors: ${vendors.filter(v => v.verified).length}

Full vendor details are available in the context. Analyze each vendor's:
- Services and packages
- Pricing (starting_price, packages)
- Experience and events_completed
- Location and service_areas
- Reviews and ratings
- Highlight features
- Booking policies
- Additional information`;
}

/**
 * Generate intelligent local response when AI APIs are unavailable
 */
function generateIntelligentLocalResponse(
  query: string,
  vendors: Vendor[],
  formattedVendors: any[]
): string {
  const lowerQuery = query.toLowerCase();
  
  // Extract budget, location, event type from query
  const budgetMatch = query.match(/(\d+[,\s]?\d*)\s*(lakh|lac|k|thousand|000)/i);
  const budget = budgetMatch ? parseBudget(budgetMatch[0]) : null;
  
  const locationMatch = query.match(/(hyderabad|bangalore|chennai|mumbai|delhi|pune|kolkata|ahmedabad|jaipur|surat|lucknow|kanpur|nagpur|indore|thane|bhopal|visakhapatnam|patna|vadodara|ghaziabad|coimbatore|faro|kochi|gurgaon|chandigarh|guwahati|nashik|madurai|raipur|jodhpur|varanasi|srinagar|amritsar|nellore|raipur|jalandhar|tiruchirappalli|bhubaneswar|salem|warangal|mira-bhayandar|thiruvananthapuram|bhiwandi|saharanpur|guntur|amravati|bikaner|noida|jamshedpur|bhilai|cutack|firozabad|kozhikode|akola|belgaum|rajahmundry|tirunelveli|ujjain|sangli|loni|jammu|mangalore|erode|raichur|tumkur|khandwa|bidar|morena|barmer|dhar|pali|bhilwara|ahmednagar|ichalkaranji|tirupati|karnal|bathinda|rampur|shivamogga|ratlam|modinagar|durgapur|alappuzha|katni|thanjavur|bharatpur|new delhi|panipat|darbhanga|bally|nizamabad|bihar sharif|panaji|phagwara|roorkee|eluru|ottappalam|sagar|tadepalligudem|rajsamand|lahore|karachi|islamabad|rawalpindi|faisalabad|multan|peshawar|quetta|sialkot|bahawalpur|sargodha|sukkur|jhang|sheikhupura|mardan|gujranwala|kasur|daska|chakwal|mianwali|toba tek singh|jhelum|khanewal|hafizabad|kohat|bannu|d.i.khan|bhimber|kotli|mirpur|muzaffarabad|rawalakot|skardu|gilgit|chitral|hunza|nagar|ghizer|diamer|astore|gupis|yasin|ishkoman|punial|gahkuch|shimshal|passu|karimabad|altit|baltit|nagar|hunza|karachi|lahore|islamabad|rawalpindi|peshawar|quetta|multan|faisalabad|sargodha|bahawalpur|sialkot|sukkur|jhang|sheikhupura|mardan|gujranwala|kasur|daska|chakwal|mianwali|toba tek singh|jhelum|khanewal|hafizabad|kohat|bannu|d.i.khan|bhimber|kotli|mirpur|muzaffarabad|rawalakot|skardu|gilgit|chitral|hunza|nagar|ghizer|diamer|astore|gupis|yasin|ishkoman|punial|gahkuch|shimshal|passu|karimabad|altit|baltit)/i);
  const location = locationMatch ? locationMatch[1] : null;
  
  const eventTypes = ['wedding', 'birthday', 'corporate', 'anniversary', 'engagement', 'event planning', 'event'];
  const eventType = eventTypes.find(type => lowerQuery.includes(type)) || null;
  
  // Filter vendors based on criteria
  let filteredVendors = [...vendors];
  
  // Filter by location
  if (location) {
    filteredVendors = filteredVendors.filter(v => {
      const address = (v.address || '').toLowerCase();
      const serviceAreas = (v.additional_info?.service_areas || []).join(',').toLowerCase();
      return address.includes(location.toLowerCase()) || serviceAreas.includes(location.toLowerCase());
    });
  }
  
  // Filter by budget
  if (budget) {
    filteredVendors = filteredVendors.filter(v => {
      if (!v.starting_price) return true; // Include vendors without starting price
      return v.starting_price <= budget * 1.2; // Allow 20% flexibility
    });
  }
  
  // Filter by event type / category
  if (eventType) {
    filteredVendors = filteredVendors.filter(v => {
      const categories = Array.isArray(v.category) ? v.category : [v.category];
      const categoryText = categories.join(' ').toLowerCase();
      const description = ((v.detailed_intro || '') + ' ' + (v.quick_intro || '')).toLowerCase();
      
      if (eventType === 'event planning') {
        return categoryText.includes('event planner') || categoryText.includes('event management') || description.includes('event planning');
      }
      return categoryText.includes(eventType) || description.includes(eventType);
    });
  }
  
  // Sort by rating and experience
  filteredVendors.sort((a, b) => {
    const scoreA = (a.rating || 0) * 10 + (a.events_completed || 0) / 100;
    const scoreB = (b.rating || 0) * 10 + (b.events_completed || 0) / 100;
    return scoreB - scoreA;
  });
  
  // Generate recommendation
  if (filteredVendors.length === 0) {
    return `I couldn't find vendors matching your exact criteria (${location ? `Location: ${location}, ` : ''}${budget ? `Budget: ₹${budget.toLocaleString()}, ` : ''}${eventType ? `Event: ${eventType}` : ''}).\n\nHowever, I have ${vendors.length} vendors available. Would you like me to:\n- Show vendors in nearby locations?\n- Suggest vendors with flexible budgets?\n- Recommend vendors for similar event types?\n\nLet me know and I'll find the best match for you!`;
  }
  
  const topVendor = filteredVendors[0];
  const secondVendor = filteredVendors[1];
  
  let recommendation = `Based on your requirements${location ? ` in ${location}` : ''}${budget ? ` with a budget of ₹${budget.toLocaleString()}` : ''}${eventType ? ` for ${eventType}` : ''}, I recommend:\n\n`;
  
  recommendation += `**🥇 ${topVendor.brand_name}**\n`;
  recommendation += `- Rating: ${topVendor.rating || 'N/A'}/5\n`;
  recommendation += `- Experience: ${topVendor.experience || 'Not specified'}\n`;
  recommendation += `- Events Completed: ${topVendor.events_completed || 0}+\n`;
  recommendation += `- Starting Price: ${topVendor.starting_price ? `₹${topVendor.starting_price.toLocaleString()}` : 'Contact for pricing'}\n`;
  if (topVendor.highlight_features && topVendor.highlight_features.length > 0) {
    recommendation += `- Key Strengths: ${topVendor.highlight_features.join(', ')}\n`;
  }
  if (topVendor.address) {
    recommendation += `- Location: ${topVendor.address}\n`;
  }
  if (topVendor.detailed_intro) {
    recommendation += `- About: ${topVendor.detailed_intro.substring(0, 150)}...\n`;
  }
  
  if (secondVendor && filteredVendors.length > 1) {
    recommendation += `\n**🥈 Alternative: ${secondVendor.brand_name}**\n`;
    recommendation += `- Rating: ${secondVendor.rating || 'N/A'}/5\n`;
    recommendation += `- Starting Price: ${secondVendor.starting_price ? `₹${secondVendor.starting_price.toLocaleString()}` : 'Contact for pricing'}\n`;
  }
  
  recommendation += `\nI found ${filteredVendors.length} vendor(s) matching your criteria. Would you like more details about any of these vendors?`;
  
  return recommendation;
}

/**
 * Parse budget from text
 */
function parseBudget(budgetText: string): number {
  const clean = budgetText.toLowerCase().replace(/[,\s]/g, '');
  
  if (clean.includes('lakh') || clean.includes('lac')) {
    const num = parseFloat(clean.replace(/[^\d.]/g, ''));
    return num * 100000;
  } else if (clean.includes('k') || clean.includes('thousand')) {
    const num = parseFloat(clean.replace(/[^\d.]/g, ''));
    return num * 1000;
  } else if (clean.includes('000')) {
    const num = parseFloat(clean.replace(/[^\d.]/g, ''));
    return num;
  }
  
  return parseFloat(clean.replace(/[^\d.]/g, '')) || 0;
}

