import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import ImageUploadTest from '../components/ImageUploadTest';

const ImageUploadTestPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <Button 
                onClick={() => navigate('/')}
                variant="outline"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Image Upload System Test</h1>
                <p className="text-gray-600">Test Google Drive integration and image processing</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-medium text-blue-900 mb-2">Testing Instructions</h3>
          <div className="text-blue-800 space-y-1">
            <p>1. Create <code className="bg-blue-100 px-1 rounded">.env.local</code> file with Google Drive credentials</p>
            <p>2. Click "Test Google Drive Config" to verify setup</p>
            <p>3. Click "Test Image Compression" to test image processing</p>
            <p>4. Try uploading images to test the full workflow</p>
          </div>
        </div>

        <ImageUploadTest />

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-lg font-medium text-yellow-900 mb-2">Environment Setup</h3>
          <div className="text-yellow-800 space-y-1">
            <p><strong>API Key:</strong> AIzaSyBsMX0piWSsVwzynEFBNUTSBVJMgFSWuCA</p>
            <p><strong>Client ID:</strong> 295583515951-tv75o801vqgf92ouikuijhkjkgvp28g4.apps.googleusercontent.com</p>
            <p><strong>Folder ID:</strong> 1WyLMdcHvf76_Q9uCN3Hog0P2Mn3ycIsr</p>
            <p><strong>Folder URL:</strong> <a href="https://drive.google.com/drive/folders/1WyLMdcHvf76_Q9uCN3Hog0P2Mn3ycIsr?usp=sharing" target="_blank" className="text-blue-600 underline">View Google Drive Folder</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadTestPage;
