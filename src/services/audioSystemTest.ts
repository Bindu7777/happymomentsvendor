// Test file for Enhanced Audio System
// This file demonstrates the capabilities of the enhanced audio system

import { processAudioInput, ExtractedEntities } from './enhancedAudioEngine';
import { createVendorFilterCriteria, searchVendorsWithFilters } from './enhancedVendorFiltering';

// Test cases for the enhanced audio system
export const testCases = [
  {
    name: "Wedding Photographer Request",
    input: "I need a marriage photographer in Hyderabad, starting price 60,000, maximum 1 lakh, female if possible",
    expectedEntities: {
      eventType: "Wedding",
      serviceTypes: ["Photographers"],
      location: "Hyderabad",
      budget: { min: 60000, max: 100000, type: "range" },
      preferences: { gender: "female" }
    }
  },
  {
    name: "Telugu Mixed Language Input",
    input: "Pelli ki photographer kavali, Hyderabad lo, budget 1 lakh, experienced kavali",
    expectedEntities: {
      eventType: "Wedding",
      serviceTypes: ["Photographers"],
      location: "Hyderabad",
      budget: { min: 100000, max: 120000, type: "around" },
      preferences: { experience: "experienced" }
    }
  },
  {
    name: "Multiple Services Request",
    input: "Birthday party decoration and catering for 50 guests in Bangalore, budget around 25k",
    expectedEntities: {
      eventType: "Birthday",
      serviceTypes: ["Decorators", "Caterers"],
      location: "Bangalore",
      budget: { min: 20000, max: 30000, type: "around" },
      guestCount: 50
    }
  },
  {
    name: "Corporate Event Request",
    input: "Corporate event planner for our annual conference in Mumbai, 200 guests, budget 2 lakh",
    expectedEntities: {
      eventType: "Corporate",
      serviceTypes: ["Event Planners"],
      location: "Mumbai",
      budget: { min: 200000, max: 240000, type: "around" },
      guestCount: 200
    }
  },
  {
    name: "Telugu Number Test",
    input: "Oka laksha budget lo photographer kavali, Hyderabad lo",
    expectedEntities: {
      eventType: "Wedding",
      serviceTypes: ["Photographers"],
      location: "Hyderabad",
      budget: { min: 100000, max: 120000, type: "around" }
    }
  },
  {
    name: "Style Preference Test",
    input: "Wedding photographer in Chennai, traditional style, experienced, budget 80k",
    expectedEntities: {
      eventType: "Wedding",
      serviceTypes: ["Photographers"],
      location: "Chennai",
      budget: { min: 80000, max: 96000, type: "around" },
      preferences: { 
        experience: "experienced",
        style: ["traditional"]
      }
    }
  }
];

// Function to run all test cases
export const runAudioSystemTests = async () => {
  console.log("🎯 Starting Enhanced Audio System Tests...\n");
  
  const results = [];
  
  for (const testCase of testCases) {
    console.log(`\n📝 Test: ${testCase.name}`);
    console.log(`Input: "${testCase.input}"`);
    
    try {
      // Process the audio input
      const audioResult = await processAudioInput(testCase.input);
      
      console.log(`✅ Processing successful`);
      console.log(`Language: ${audioResult.language}`);
      console.log(`Confidence: ${Math.round(audioResult.confidence * 100)}%`);
      
      // Display extracted entities
      console.log("\n📊 Extracted Entities:");
      console.log(`Event Type: ${audioResult.extractedEntities.eventType?.value || 'Not specified'}`);
      console.log(`Services: ${audioResult.extractedEntities.serviceTypes.map(s => s.category).join(', ')}`);
      console.log(`Location: ${audioResult.extractedEntities.location?.city || 'Not specified'}`);
      
      if (audioResult.extractedEntities.budget) {
        console.log(`Budget: ₹${audioResult.extractedEntities.budget.min.toLocaleString()} - ₹${audioResult.extractedEntities.budget.max.toLocaleString()} (${audioResult.extractedEntities.budget.type})`);
      } else {
        console.log(`Budget: Not specified`);
      }
      
      if (Object.keys(audioResult.extractedEntities.preferences).length > 0) {
        console.log(`Preferences: ${JSON.stringify(audioResult.extractedEntities.preferences)}`);
      }
      
      if (audioResult.extractedEntities.additionalInfo.length > 0) {
        console.log(`Additional Info: ${audioResult.extractedEntities.additionalInfo.join(', ')}`);
      }
      
      // Test vendor filtering
      console.log("\n🔍 Testing Vendor Filtering...");
      const filterCriteria = createVendorFilterCriteria(audioResult.extractedEntities);
      const searchResult = await searchVendorsWithFilters(filterCriteria);
      
      console.log(`Found ${searchResult.totalFound} vendors`);
      console.log(`Perfect matches: ${searchResult.perfectMatches.length}`);
      console.log(`Near matches: ${searchResult.nearMatches.length}`);
      
      // Display top matches
      if (searchResult.perfectMatches.length > 0) {
        console.log("\n🏆 Top Matches:");
        searchResult.perfectMatches.slice(0, 3).forEach((match, index) => {
          console.log(`${index + 1}. ${match.vendor.brand_name} (${match.matchScore}% match)`);
          console.log(`   Reasons: ${match.matchReasons.join(', ')}`);
        });
      }
      
      results.push({
        testCase: testCase.name,
        success: true,
        confidence: audioResult.confidence,
        vendorsFound: searchResult.totalFound
      });
      
    } catch (error) {
      console.error(`❌ Test failed: ${error.message}`);
      results.push({
        testCase: testCase.name,
        success: false,
        error: error.message
      });
    }
    
    console.log("\n" + "=".repeat(80));
  }
  
  // Summary
  console.log("\n📈 Test Summary:");
  const successfulTests = results.filter(r => r.success).length;
  const totalTests = results.length;
  const averageConfidence = results
    .filter(r => r.success && r.confidence)
    .reduce((sum, r) => sum + r.confidence, 0) / successfulTests;
  
  console.log(`✅ Successful tests: ${successfulTests}/${totalTests}`);
  console.log(`📊 Average confidence: ${Math.round(averageConfidence * 100)}%`);
  
  const totalVendorsFound = results
    .filter(r => r.success && r.vendorsFound)
    .reduce((sum, r) => sum + r.vendorsFound, 0);
  
  console.log(`🔍 Total vendors found across all tests: ${totalVendorsFound}`);
  
  return results;
};

// Function to test specific functionality
export const testSpecificFunctionality = async () => {
  console.log("🧪 Testing Specific Functionality...\n");
  
  // Test Telugu number extraction
  console.log("1. Testing Telugu Number Extraction:");
  const teluguTest = await processAudioInput("oka laksha budget lo photographer kavali");
  console.log(`Input: "oka laksha budget lo photographer kavali"`);
  console.log(`Extracted budget: ₹${teluguTest.extractedEntities.budget?.min.toLocaleString()} - ₹${teluguTest.extractedEntities.budget?.max.toLocaleString()}`);
  
  // Test mixed language
  console.log("\n2. Testing Mixed Language Processing:");
  const mixedTest = await processAudioInput("pelli ki photographer Hyderabad lo, budget 1 lakh");
  console.log(`Input: "pelli ki photographer Hyderabad lo, budget 1 lakh"`);
  console.log(`Language detected: ${mixedTest.language}`);
  console.log(`Event type: ${mixedTest.extractedEntities.eventType?.value}`);
  console.log(`Location: ${mixedTest.extractedEntities.location?.city}`);
  
  // Test budget range
  console.log("\n3. Testing Budget Range Extraction:");
  const rangeTest = await processAudioInput("budget 50k to 1 lakh for wedding photographer");
  console.log(`Input: "budget 50k to 1 lakh for wedding photographer"`);
  console.log(`Budget type: ${rangeTest.extractedEntities.budget?.type}`);
  console.log(`Budget range: ₹${rangeTest.extractedEntities.budget?.min.toLocaleString()} - ₹${rangeTest.extractedEntities.budget?.max.toLocaleString()}`);
  
  // Test preference extraction
  console.log("\n4. Testing Preference Extraction:");
  const preferenceTest = await processAudioInput("experienced female photographer, traditional style, budget 80k");
  console.log(`Input: "experienced female photographer, traditional style, budget 80k"`);
  console.log(`Preferences: ${JSON.stringify(preferenceTest.extractedEntities.preferences)}`);
  
  console.log("\n✅ Specific functionality tests completed!");
};

// Export test runner function
export const runAllTests = async () => {
  await runAudioSystemTests();
  await testSpecificFunctionality();
};

// Example usage in browser console:
// import { runAllTests } from './audioSystemTest';
// runAllTests();
