import * as XLSX from 'xlsx';

export interface VendorBulkData {
  vendorName: string;
  contactPersonName: string;
  phoneNumber: string;
  email: string;
  category: string;
  subCategory?: string;
  location: string;
  serviceRegions?: string;
  priceRangeMin?: number;
  priceRangeMax?: number;
  packagesOffered?: string;
  genderPreference?: string;
  yearsOfExperience?: number;
  availability?: string;
  photosVideosLink?: string;
  paymentOptionsAdvance?: number;
  negotiable?: boolean;
  shortBio?: string;
  address?: string;
  languagesSpoken?: string;
  startingPrice?: number;
}

export interface ParsedVendorData {
  success: boolean;
  data: VendorBulkData[];
  errors: string[];
  totalRows: number;
  validRows: number;
}

const REQUIRED_FIELDS = [
  'Vendor Name',
  'Contact Person Name', 
  'Phone Number',
  'Email',
  'Category',
  'Location (City)'
];

const FIELD_MAPPING: Record<string, keyof VendorBulkData> = {
  'Vendor Name': 'vendorName',
  'Contact Person Name': 'contactPersonName',
  'Phone Number': 'phoneNumber',
  'Email': 'email',
  'Category': 'category',
  'Sub-Category / Specialization': 'subCategory',
  'Location (City)': 'location',
  'Service Regions': 'serviceRegions',
  'Price Range (Min)': 'priceRangeMin',
  'Price Range (Max)': 'priceRangeMax',
  'Packages Offered': 'packagesOffered',
  'Gender Preference': 'genderPreference',
  'Years of Experience': 'yearsOfExperience',
  'Availability': 'availability',
  'Photos/Videos Link': 'photosVideosLink',
  'Payment Options (Advance %)': 'paymentOptionsAdvance',
  'Negotiable?': 'negotiable',
  'Short Bio / About Vendor': 'shortBio',
  'Address': 'address',
  'Languages Spoken': 'languagesSpoken',
  'Starting Price': 'startingPrice'
};

export const parseExcelFile = async (file: File): Promise<ParsedVendorData> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        const result = processExcelData(jsonData);
        resolve(result);
      } catch (error) {
        resolve({
          success: false,
          data: [],
          errors: [`Error parsing Excel file: ${error}`],
          totalRows: 0,
          validRows: 0
        });
      }
    };
    
    reader.onerror = () => {
      resolve({
        success: false,
        data: [],
        errors: ['Error reading file'],
        totalRows: 0,
        validRows: 0
      });
    };
    
    reader.readAsArrayBuffer(file);
  });
};

export const parseCSVFile = async (file: File): Promise<ParsedVendorData> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        const csvData = lines.map(line => line.split(',').map(cell => cell.trim().replace(/^"|"$/g, '')));
        
        const result = processExcelData(csvData);
        resolve(result);
      } catch (error) {
        resolve({
          success: false,
          data: [],
          errors: [`Error parsing CSV file: ${error}`],
          totalRows: 0,
          validRows: 0
        });
      }
    };
    
    reader.onerror = () => {
      resolve({
        success: false,
        data: [],
        errors: ['Error reading file'],
        totalRows: 0,
        validRows: 0
      });
    };
    
    reader.readAsText(file);
  });
};

const processExcelData = (data: any[][]): ParsedVendorData => {
  if (data.length < 2) {
    return {
      success: false,
      data: [],
      errors: ['File must contain at least a header row and one data row'],
      totalRows: 0,
      validRows: 0
    };
  }

  const headers = data[0];
  const rows = data.slice(1);
  const errors: string[] = [];
  const validData: VendorBulkData[] = [];

  // Validate headers
  const missingHeaders = REQUIRED_FIELDS.filter(field => !headers.includes(field));
  if (missingHeaders.length > 0) {
    errors.push(`Missing required columns: ${missingHeaders.join(', ')}`);
  }

  // Process each row
  rows.forEach((row, index) => {
    const rowNumber = index + 2; // +2 because we start from row 2 (after header)
    const rowData: Partial<VendorBulkData> = {};
    let hasErrors = false;

    // Map each column to the corresponding field
    headers.forEach((header, colIndex) => {
      const fieldName = FIELD_MAPPING[header];
      if (fieldName && colIndex < row.length) {
        const value = row[colIndex];
        
        if (fieldName === 'priceRangeMin' || fieldName === 'priceRangeMax' || 
            fieldName === 'yearsOfExperience' || fieldName === 'paymentOptionsAdvance' || 
            fieldName === 'startingPrice') {
          rowData[fieldName] = value ? Number(value) : undefined;
        } else if (fieldName === 'negotiable') {
          rowData[fieldName] = value === 'Yes' || value === 'true' || value === '1';
        } else if (fieldName === 'languagesSpoken') {
          rowData[fieldName] = value ? value.split(',').map(lang => lang.trim()) : undefined;
        } else {
          rowData[fieldName] = value || undefined;
        }
      }
    });

    // Validate required fields
    REQUIRED_FIELDS.forEach(requiredField => {
      const fieldName = FIELD_MAPPING[requiredField];
      if (!rowData[fieldName as keyof VendorBulkData]) {
        errors.push(`Row ${rowNumber}: ${requiredField} is required`);
        hasErrors = true;
      }
    });

    // Validate email format
    if (rowData.email && !isValidEmail(rowData.email)) {
      errors.push(`Row ${rowNumber}: Invalid email format`);
      hasErrors = true;
    }

    // Validate phone number
    if (rowData.phoneNumber && !isValidPhone(rowData.phoneNumber)) {
      errors.push(`Row ${rowNumber}: Invalid phone number format`);
      hasErrors = true;
    }

    if (!hasErrors) {
      validData.push(rowData as VendorBulkData);
    }
  });

  return {
    success: errors.length === 0,
    data: validData,
    errors,
    totalRows: rows.length,
    validRows: validData.length
  };
};

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

export const downloadTemplate = () => {
  const link = document.createElement('a');
  link.href = '/templates/vendor_bulk_upload_template.csv';
  link.download = 'vendor_bulk_upload_template.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
