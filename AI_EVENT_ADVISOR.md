# AI Event Advisor System

## Overview

The AI Event Advisor is a sophisticated recommendation system that acts as a trusted event planning expert. It provides personalized vendor recommendations based on deep understanding of both vendors and customer needs.

## System Prompt

The system prompt is defined in `/src/services/aiEventAdvisorPrompt.ts` and contains comprehensive instructions for the AI advisor's behavior and decision-making process.

## Key Features

### 1. Deep Vendor Understanding
The advisor builds comprehensive mental profiles of each vendor including:
- Category and services
- Experience and track record
- Price range and budget fit
- Location coverage
- Quality indicators
- Style and specializations
- Reliability assessment

### 2. Customer-Centric Recommendations
- Asks only essential clarifying questions
- Provides confident, single-vendor recommendations
- Explains reasoning in human, relatable language
- Offers backup options when relevant
- Warns about budget/scope mismatches

### 3. Trustworthy Tone
- Speaks like an experienced event planner
- Avoids generic marketing language
- Makes judgment calls confidently
- Explains trade-offs honestly

## Usage

### Import the System Prompt

```typescript
import { getAIEventAdvisorPrompt, formatVendorForAdvisor } from './services/aiEventAdvisorPrompt';

// Get the system prompt
const systemPrompt = getAIEventAdvisorPrompt();

// Format vendor data for the advisor
const vendorData = formatVendorForAdvisor(vendor);
```

### Integration with AI Services

When integrating with AI services (OpenAI, Anthropic, etc.), use the system prompt as follows:

```typescript
const messages = [
  {
    role: 'system',
    content: getAIEventAdvisorPrompt()
  },
  {
    role: 'user',
    content: 'I need a photographer for my wedding in Hyderabad, budget around 50k'
  }
];

// Send to AI service
const response = await aiService.chat(messages);
```

## Vendor Data Format

The `formatVendorForAdvisor` function standardizes vendor data for the AI advisor:

```typescript
{
  id: string,
  name: string,
  category: string | string[],
  services: any[],
  experience: string,
  eventsCompleted: number,
  priceRange: number,
  location: string,
  serviceAreas: string[],
  rating: number,
  reviewCount: number,
  reviews: any[],
  highlightFeatures: string[],
  description: string,
  images: any[],
  verified: boolean,
  languages: string[],
  bookingPolicies: any
}
```

## Best Practices

1. **Always use the system prompt** when making vendor recommendations
2. **Format vendor data** using `formatVendorForAdvisor` before sending to AI
3. **Provide context** about customer needs in user messages
4. **Include vendor options** in the conversation for the AI to choose from
5. **Maintain consistency** - the AI should remember patterns across conversations

## Example Implementation

```typescript
import { getAIEventAdvisorPrompt, formatVendorForAdvisor } from './services/aiEventAdvisorPrompt';
import { searchVendorsWithFilters } from './services/enhancedVendorFiltering';

async function getVendorRecommendation(customerRequest: string, filters: any) {
  // Search for relevant vendors
  const searchResult = await searchVendorsWithFilters(filters);
  const vendors = searchResult.vendors;

  // Format vendors for the advisor
  const formattedVendors = vendors.map(formatVendorForAdvisor);

  // Prepare the conversation
  const messages = [
    {
      role: 'system',
      content: getAIEventAdvisorPrompt()
    },
    {
      role: 'user',
      content: `${customerRequest}\n\nAvailable vendors:\n${JSON.stringify(formattedVendors, null, 2)}`
    }
  ];

  // Get AI recommendation
  const recommendation = await aiService.chat(messages);
  
  return recommendation;
}
```

## Notes

- The system prompt is designed to make the AI act like a human event planner
- The advisor should be confident and make clear recommendations
- Avoid generic responses - always provide specific, actionable advice
- The advisor learns from patterns and improves recommendations over time

