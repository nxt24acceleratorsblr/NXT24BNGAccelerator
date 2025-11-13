import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Upload any file type (PDF, CSV, XML, Images) to backend
export const uploadFile = async (file: File): Promise<{ 
  content: string; 
  filepath: string;
  file_type: string;
  parsed_data: any;
  metadata: any;
}> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post(`${API_BASE_URL}/upload-file`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

// Legacy PDF upload (for backward compatibility)
export const uploadPDF = uploadFile;

// Extract invoice data using production notebook
export const extractInvoice = async (file: File, maxRows: number = 50): Promise<{
  invoice_data: {
    invoice_header: any;
    line_items: any[];
    notes: string | null;
  };
  validation: {
    valid: boolean;
    errors: string[];
    warnings: string[];
  };
  filepath: string;
}> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('max_rows', maxRows.toString());

  const response = await axios.post(`${API_BASE_URL}/extract-invoice`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};
