import axios from 'axios';
import { InvoiceExtractionResult, ReconciliationResult } from '../types';

// Update this to your backend URL - default to localhost
const API_BASE_URL = 'http://localhost:5000/api';

// For testing on physical device, replace localhost with your computer's IP
// Example: const API_BASE_URL = 'http://192.168.1.100:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds for file processing
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadFile = async (file: {
  uri: string;
  name: string;
  type: string;
}): Promise<{ 
  content: string; 
  filepath: string;
  file_type: string;
  parsed_data: any;
  metadata: any;
}> => {
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.type,
  } as any);

  const response = await api.post('/upload-file', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const extractInvoice = async (
  file: { uri: string; name: string; type: string },
  maxRows: number = 50
): Promise<InvoiceExtractionResult> => {
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.type,
  } as any);
  formData.append('max_rows', maxRows.toString());

  const response = await api.post('/extract-invoice', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const reconcileInvoice = async (
  extractedData: any,
  options?: {
    mapping_folder?: string;
    string_threshold?: number;
    number_tolerance?: number;
  }
): Promise<ReconciliationResult> => {
  const response = await api.post('/reconcile-invoice', {
    extracted_data: extractedData,
    mapping_folder: options?.mapping_folder || '../MediaBillingNotebook/mapping',
    string_threshold: options?.string_threshold || 0.8,
    number_tolerance: options?.number_tolerance || 5,
  });

  return response.data;
};

export const healthCheck = async (): Promise<{ status: string; service: string }> => {
  const response = await api.get('/health');
  return response.data;
};

export const analyzeDiscrepancy = async (
  discrepancy: any,
  invoiceContext: { vendor_name?: string; invoice_number?: string }
): Promise<{
  success: boolean;
  reasoning: string;
  remediation_plan: string;
  priority: string;
  priority_score: number;
  estimated_impact: string;
}> => {
  const response = await api.post('/analyze-discrepancy', {
    discrepancy,
    invoice_context: invoiceContext,
  });
  return response.data;
};

export const analyzeDiscrepanciesBatch = async (
  discrepancies: any[],
  invoiceContext: { vendor_name?: string; invoice_number?: string },
  maxAnalyses: number = 10
): Promise<{
  success: boolean;
  analyzed_count: number;
  results: any[];
}> => {
  const response = await api.post('/analyze-discrepancies-batch', {
    discrepancies,
    invoice_context: invoiceContext,
    max_analyses: maxAnalyses,
  });
  return response.data;
};
