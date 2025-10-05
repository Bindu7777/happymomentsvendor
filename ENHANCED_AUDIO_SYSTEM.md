# Enhanced Audio System Documentation

## Overview

The Enhanced Audio System provides advanced speech-to-text and entity extraction capabilities for the Happy Moments platform. It supports both English and Telugu languages, with intelligent mixed-language processing and comprehensive vendor filtering.

## Core Features

### 1. Advanced Speech Recognition
- **Multi-language Support**: English, Telugu, and mixed-language inputs
- **High Accuracy**: Enhanced preprocessing and error correction
- **Real-time Processing**: Continuous speech recognition with interim results
- **Context Awareness**: Understands domain-specific vocabulary

### 2. Intelligent Entity Extraction
- **Event Types**: Wedding, Birthday, Corporate, Anniversary, Engagement, etc.
- **Service Categories**: Photographers, Makeup Artists, Decorators, Caterers, DJs, etc.
- **Location Recognition**: Cities, states, and localities across India
- **Budget Parsing**: Supports various formats (K, Lakh, Crore, exact amounts, ranges)
- **Date/Time**: Relative dates, specific dates, and date ranges
- **Preferences**: Gender, experience level, style preferences, urgency

### 3. Enhanced Vendor Filtering
- **Multi-criteria Matching**: Categories, location, budget, preferences
- **Confidence Scoring**: AI-powered match scoring with detailed reasons
- **Flexible Budget Handling**: Supports various budget types and ranges
- **Preference Matching**: Gender, experience, style, and availability preferences

## Usage Examples

### Example 1: Wedding Photographer Request
**Input**: "I need a marriage photographer in Hyderabad, starting price 60,000, maximum 1 lakh, female if possible"

**Extracted Entities**:
```json
{
  "eventType": {
    "value": "Wedding",
    "confidence": 0.9
  },
  "serviceTypes": [
    {
      "value": "photographer",
      "category": "Photographers",
      "confidence": 0.9
    }
  ],
  "location": {
    "city": "Hyderabad",
    "confidence": 0.9
  },
  "budget": {
    "min": 60000,
    "max": 100000,
    "type": "range",
    "confidence": 0.9
  },
  "preferences": {
    "gender": "female"
  }
}
```

### Example 2: Telugu Mixed Language Input
**Input**: "Pelli ki photographer kavali, Hyderabad lo, budget 1 lakh, experienced kavali"

**Extracted Entities**:
```json
{
  "eventType": {
    "value": "Wedding",
    "confidence": 0.9
  },
  "serviceTypes": [
    {
      "value": "photographer",
      "category": "Photographers",
      "confidence": 0.9
    }
  ],
  "location": {
    "city": "Hyderabad",
    "confidence": 0.9
  },
  "budget": {
    "min": 100000,
    "max": 120000,
    "type": "around",
    "confidence": 0.8
  },
  "preferences": {
    "experience": "experienced"
  }
}
```

### Example 3: Multiple Services Request
**Input**: "Birthday party decoration and catering for 50 guests in Bangalore, budget around 25k"

**Extracted Entities**:
```json
{
  "eventType": {
    "value": "Birthday",
    "confidence": 0.9
  },
  "serviceTypes": [
    {
      "value": "decoration",
      "category": "Decorators",
      "confidence": 0.9
    },
    {
      "value": "catering",
      "category": "Caterers",
      "confidence": 0.9
    }
  ],
  "location": {
    "city": "Bangalore",
    "confidence": 0.9
  },
  "budget": {
    "min": 20000,
    "max": 30000,
    "type": "around",
    "confidence": 0.8
  },
  "guestCount": 50
}
```

## API Reference

### EnhancedAudioEngine

#### `processAudioInput(text: string): Promise<AudioProcessingResult>`
Processes audio input text and extracts entities.

**Parameters**:
- `text`: The input text to process

**Returns**: Promise resolving to `AudioProcessingResult`

#### `extractVendorFilters(text: string): Promise<VendorFilterCriteria>`
Extracts vendor filter criteria from text input.

**Parameters**:
- `text`: The input text to process

**Returns**: Promise resolving to `VendorFilterCriteria`

### EnhancedVendorFiltering

#### `searchVendorsWithFilters(criteria: VendorFilterCriteria): Promise<VendorSearchResult>`
Searches vendors using enhanced filtering criteria.

**Parameters**:
- `criteria`: The filter criteria to use

**Returns**: Promise resolving to `VendorSearchResult`

#### `createVendorFilterCriteria(entities: ExtractedEntities): VendorFilterCriteria`
Creates vendor filter criteria from extracted entities.

**Parameters**:
- `entities`: The extracted entities

**Returns**: `VendorFilterCriteria`

## Supported Patterns

### Budget Patterns
- **Exact Amounts**: "₹50,000", "50k", "1 lakh", "1 crore"
- **Ranges**: "50k to 1 lakh", "₹30,000 - ₹50,000"
- **Starting From**: "starting from 25k", "minimum 30k"
- **Upto**: "upto 1 lakh", "maximum 50k"
- **Around**: "around 25k", "approximately 1 lakh"

### Location Patterns
- **Cities**: Hyderabad, Bangalore, Chennai, Mumbai, Delhi, etc.
- **States**: Telangana, Karnataka, Tamil Nadu, Maharashtra, etc.
- **Combinations**: "Hyderabad Telangana", "Bangalore Karnataka"
- **Telugu**: "Hyderabad lo", "Bangalore ki"

### Service Patterns
- **English**: photographer, makeup artist, decorator, caterer, dj
- **Telugu**: photographer kavali, makeup artist kavali, decorator kavali
- **Mixed**: "pelli ki photographer", "wedding makeup artist"

### Event Type Patterns
- **Wedding**: wedding, marriage, shaadi, vivah, kalyana, pelli
- **Birthday**: birthday, birthday party, birthday celebration
- **Corporate**: corporate, office event, business event
- **Others**: anniversary, engagement, baby shower, housewarming

## Configuration

### Language Detection
The system automatically detects the primary language:
- **English**: When English keywords dominate
- **Telugu**: When Telugu keywords dominate  
- **Mixed**: When both languages are present

### Confidence Scoring
The system calculates confidence scores based on:
- **Event Type Match**: 20% weight
- **Service Types Match**: 30% weight
- **Location Match**: 15% weight
- **Budget Match**: 20% weight
- **Date Match**: 10% weight
- **Preferences Match**: 5% weight

### Vendor Matching
Vendors are scored based on:
- **Category Match**: 25 points
- **Location Match**: 20 points
- **Budget Match**: 20 points
- **Experience Match**: 10 points
- **Style Match**: 15 points
- **Availability Match**: 10 points

## Error Handling

### Common Speech Recognition Errors
- **Filler Words**: Automatically removed (um, uh, ah, er)
- **Speech Errors**: Corrected (budgetw → budget)
- **Number Formatting**: Standardized (20k → 20,000)

### Fallback Mechanisms
- **Partial Matches**: Shows partial results even with incomplete data
- **Default Values**: Uses sensible defaults when information is missing
- **Error Recovery**: Graceful degradation when processing fails

## Performance Optimization

### Caching
- **Entity Extraction**: Results cached for repeated inputs
- **Vendor Data**: Frequently accessed vendor data cached
- **Pattern Matching**: Compiled regex patterns cached

### Debouncing
- **Text Processing**: 1-second debounce for text input changes
- **Voice Processing**: Continuous processing with interim results
- **Search Queries**: Debounced to prevent excessive API calls

## Testing

### Test Cases
```typescript
// Test Telugu number extraction
const result = await processAudioInput("oka laksha budget");
// Should extract: budget = { min: 100000, max: 120000 }

// Test mixed language
const result = await processAudioInput("pelli ki photographer Hyderabad lo");
// Should extract: eventType = "Wedding", serviceTypes = ["Photographers"], location = "Hyderabad"

// Test budget range
const result = await processAudioInput("budget 50k to 1 lakh");
// Should extract: budget = { min: 50000, max: 100000, type: "range" }
```

## Future Enhancements

### Planned Features
1. **Real-time Translation**: Live translation between English and Telugu
2. **Voice Cloning**: Personalized voice responses
3. **Advanced NER**: Named Entity Recognition for better accuracy
4. **Machine Learning**: Continuous learning from user interactions
5. **Multi-modal Input**: Support for image and text combinations

### Performance Improvements
1. **Web Workers**: Offload processing to background threads
2. **Streaming**: Real-time streaming of speech recognition
3. **Compression**: Optimize data transfer and storage
4. **Indexing**: Advanced search indexing for faster results

## Troubleshooting

### Common Issues

#### Speech Recognition Not Working
- Check microphone permissions
- Ensure browser supports Web Speech API
- Try different browsers (Chrome recommended)

#### Low Accuracy
- Speak clearly and at moderate pace
- Reduce background noise
- Use domain-specific vocabulary

#### Entity Extraction Errors
- Check if input contains sufficient context
- Verify language detection is correct
- Review extracted entities in confirmation modal

### Debug Mode
Enable debug logging by setting:
```typescript
localStorage.setItem('audioDebug', 'true');
```

This will log detailed information about:
- Speech recognition events
- Entity extraction process
- Vendor matching scores
- Performance metrics

## Support

For technical support or feature requests, please contact the development team or create an issue in the project repository.
