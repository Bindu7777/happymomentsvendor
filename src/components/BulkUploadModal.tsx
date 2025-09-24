import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  X, 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Users,
  Eye,
  EyeOff
} from 'lucide-react';
import { parseExcelFile, parseCSVFile, downloadTemplate, VendorBulkData } from '@/services/excelParserService';
import { bulkUploadVendors, downloadCredentialsCSV, BulkUploadResult } from '@/services/vendorBulkService';

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const BulkUploadModal: React.FC<BulkUploadModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<'upload' | 'preview' | 'processing' | 'result'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<VendorBulkData[]>([]);
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [showPasswords, setShowPasswords] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setErrors([]);

    try {
      let result;
      if (selectedFile.name.endsWith('.csv')) {
        result = await parseCSVFile(selectedFile);
      } else if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        result = await parseExcelFile(selectedFile);
      } else {
        setErrors(['Please select a valid CSV or Excel file']);
        return;
      }

      if (result.success) {
        setParsedData(result.data);
        setStep('preview');
      } else {
        setErrors(result.errors);
      }
    } catch (error) {
      setErrors([`Error parsing file: ${error}`]);
    }
  };

  const handleUpload = async () => {
    if (parsedData.length === 0) return;

    setStep('processing');
    
    try {
      const result = await bulkUploadVendors(parsedData);
      setUploadResult(result);
      setStep('result');
      
      if (result.success) {
        onSuccess();
      }
    } catch (error) {
      setUploadResult({
        success: false,
        totalProcessed: parsedData.length,
        successful: 0,
        failed: parsedData.length,
        credentials: [],
        errors: [`Upload failed: ${error}`]
      });
      setStep('result');
    }
  };

  const handleDownloadTemplate = () => {
    downloadTemplate();
  };

  const handleDownloadCredentials = () => {
    if (uploadResult?.credentials) {
      downloadCredentialsCSV(uploadResult.credentials);
    }
  };

  const handleClose = () => {
    setStep('upload');
    setFile(null);
    setParsedData([]);
    setUploadResult(null);
    setErrors([]);
    setShowPasswords(false);
    onClose();
  };

  const resetToUpload = () => {
    setStep('upload');
    setFile(null);
    setParsedData([]);
    setUploadResult(null);
    setErrors([]);
    setShowPasswords(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Upload className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Bulk Upload Vendors</h2>
              <p className="text-sm text-gray-600">Upload Excel/CSV file to create multiple vendor profiles</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {step === 'upload' && (
            <div className="space-y-6">
              {/* Template Download */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Download Template
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Download our template to ensure your file has the correct format and all required fields.
                  </p>
                  <Button onClick={handleDownloadTemplate} className="bg-orange-500 hover:bg-orange-600">
                    <Download className="h-4 w-4 mr-2" />
                    Download CSV Template
                  </Button>
                </CardContent>
              </Card>

              {/* File Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Upload File
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">Choose your file</p>
                    <p className="text-gray-600 mb-4">Supports CSV and Excel files (.csv, .xlsx, .xls)</p>
                    <Button 
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      Select File
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Errors */}
              {errors.length > 0 && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-red-800 mb-2">File Validation Errors:</h4>
                        <ul className="text-sm text-red-700 space-y-1">
                          {errors.map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Preview Data ({parsedData.length} vendors)</h3>
                <Button variant="outline" onClick={resetToUpload}>
                  Upload Different File
                </Button>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-1 gap-4">
                  {parsedData.slice(0, 5).map((vendor, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{vendor.vendorName}</h4>
                          <p className="text-sm text-gray-600">{vendor.contactPersonName}</p>
                          <p className="text-sm text-gray-500">{vendor.email}</p>
                          <Badge variant="secondary" className="mt-2">
                            {vendor.category}
                          </Badge>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <p>{vendor.location}</p>
                          {vendor.startingPrice && (
                            <p>₹{vendor.startingPrice.toLocaleString()}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {parsedData.length > 5 && (
                    <p className="text-center text-gray-500 text-sm">
                      ... and {parsedData.length - 5} more vendors
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleUpload} className="bg-orange-500 hover:bg-orange-600 flex-1">
                  <Users className="h-4 w-4 mr-2" />
                  Create {parsedData.length} Vendor Profiles
                </Button>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="h-8 w-8 text-orange-600 animate-pulse" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Upload</h3>
              <p className="text-gray-600 mb-6">Creating vendor profiles and generating credentials...</p>
              <Progress value={66} className="w-full max-w-md mx-auto" />
            </div>
          )}

          {step === 'result' && uploadResult && (
            <div className="space-y-6">
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  uploadResult.success ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {uploadResult.success ? (
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  ) : (
                    <AlertCircle className="h-8 w-8 text-red-600" />
                  )}
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${
                  uploadResult.success ? 'text-green-900' : 'text-red-900'
                }`}>
                  {uploadResult.success ? 'Upload Successful!' : 'Upload Failed'}
                </h3>
                <p className="text-gray-600">
                  {uploadResult.successful} of {uploadResult.totalProcessed} vendors created successfully
                </p>
              </div>

              {uploadResult.success && uploadResult.credentials.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>Generated Credentials</span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowPasswords(!showPasswords)}
                        >
                          {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDownloadCredentials}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download CSV
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                      <div className="grid grid-cols-1 gap-2">
                        {uploadResult.credentials.map((cred, index) => (
                          <div key={index} className="flex items-center justify-between bg-white p-3 rounded border">
                            <div>
                              <p className="font-medium">{cred.vendorName}</p>
                              <p className="text-sm text-gray-600">{cred.email}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-mono text-sm">{cred.vendorId}</p>
                              <p className="font-mono text-sm text-gray-600">
                                {showPasswords ? cred.password : '••••••••'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {uploadResult.errors.length > 0 && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-red-800 mb-2">Errors:</h4>
                        <ul className="text-sm text-red-700 space-y-1">
                          {uploadResult.errors.map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-3">
                <Button onClick={resetToUpload} variant="outline" className="flex-1">
                  Upload More Vendors
                </Button>
                <Button onClick={handleClose} className="bg-orange-500 hover:bg-orange-600 flex-1">
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkUploadModal;
