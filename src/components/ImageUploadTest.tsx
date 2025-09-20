import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import ImageUpload from './ImageUpload';
import imageProcessingService from '../services/imageProcessingService';
import googleDriveService from '../services/googleDriveService';

// Simple test component to verify Google Drive image upload functionality
const ImageUploadTest: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isTestingCompression, setIsTestingCompression] = useState(false);

  // Test image compression without Google Drive
  const testImageCompression = async () => {
    setIsTestingCompression(true);
    setTestResults(['Testing image compression...']);

    try {
      // Create a test file input
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        setTestResults(prev => [...prev, `Selected file: ${file.name} (${file.size} bytes)`]);

        // Test validation
        const validation = imageProcessingService.validateImageFile(file);
        setTestResults(prev => [...prev, `Validation: ${validation.isValid ? 'PASSED' : 'FAILED - ' + validation.error}`]);

        if (validation.isValid) {
          // Test compression
          const result = await imageProcessingService.processImage(file);
          if (result.success) {
            setTestResults(prev => [...prev, 
              `Compression: SUCCESS`,
              `Original: ${result.originalSize} bytes`,
              `Compressed: ${result.compressedSize} bytes`,
              `Reduction: ${result.compressionRatio?.toFixed(1)}%`
            ]);
          } else {
            setTestResults(prev => [...prev, `Compression: FAILED - ${result.error}`]);
          }
        }
        
        setIsTestingCompression(false);
      };

      input.click();
    } catch (error) {
      setTestResults(prev => [...prev, `Error: ${error}`]);
      setIsTestingCompression(false);
    }
  };

  // Test Google Drive service initialization
  const testGoogleDriveInit = async () => {
    setTestResults(['Testing Google Drive initialization...']);
    
    try {
      // Test if environment variables are set
      const apiKey = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY;
      const clientId = import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_ID;
      const rootFolderId = import.meta.env.VITE_GOOGLE_DRIVE_ROOT_FOLDER_ID;

      setTestResults(prev => [...prev, 
        `API Key: ${apiKey ? 'SET ✅' : 'MISSING ❌'}`,
        `Client ID: ${clientId ? 'SET ✅' : 'MISSING ❌'}`,
        `Root Folder ID: ${rootFolderId ? 'SET ✅' : 'MISSING ❌'}`
      ]);

      // Show expected values for debugging
      setTestResults(prev => [...prev,
        '',
        'Expected Configuration:',
        `API Key should be: AIzaSyBsMX0piWSsVwzynEFBNUTSBVJMgFSWuCA`,
        `Client ID should be: 295583515951-tv75o801vqgf92ouikuijhkjkgvp28g4.apps.googleusercontent.com`,
        `Folder ID should be: 1WyLMdcHvf76_Q9uCN3Hog0P2Mn3ycIsr`,
        '',
        'Folder URL: https://drive.google.com/drive/folders/1WyLMdcHvf76_Q9uCN3Hog0P2Mn3ycIsr?usp=sharing'
      ]);

      if (!apiKey || !clientId || !rootFolderId) {
        setTestResults(prev => [...prev, 
          '⚠️ Please create .env.local file with the Google Drive credentials.',
          'Copy env.example to .env.local and it should work automatically.'
        ]);
      } else {
        setTestResults(prev => [...prev, '✅ Google Drive configuration is complete!']);
        
        // Test if we can load Google API
        try {
          const initResult = await googleDriveService.initialize();
          setTestResults(prev => [...prev, 
            initResult ? '✅ Google Drive API initialized successfully!' : '❌ Failed to initialize Google Drive API'
          ]);
        } catch (initError) {
          setTestResults(prev => [...prev, `❌ Google Drive API error: ${initError}`]);
        }
      }
    } catch (error) {
      setTestResults(prev => [...prev, `Error: ${error}`]);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Image Upload System Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Test Buttons */}
        <div className="flex gap-3">
          <Button onClick={testImageCompression} disabled={isTestingCompression}>
            {isTestingCompression ? 'Testing...' : 'Test Image Compression'}
          </Button>
          <Button onClick={testGoogleDriveInit} variant="outline">
            Test Google Drive Config
          </Button>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Test Results:</h4>
            <div className="space-y-1 text-sm font-mono">
              {testResults.map((result, index) => (
                <div key={index} className="text-gray-700">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sample ImageUpload Component */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Sample Upload Component:</h4>
          <ImageUpload
            vendorId="14"
            category="catalog"
            maxImages={13}
            onUploadComplete={(urls) => {
              setTestResults(prev => [...prev, `Upload completed: ${urls.length} images`]);
            }}
            onUploadError={(error) => {
              setTestResults(prev => [...prev, `Upload error: ${error}`]);
            }}
            existingImages={[]}
            allowHighlight={true}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageUploadTest;
