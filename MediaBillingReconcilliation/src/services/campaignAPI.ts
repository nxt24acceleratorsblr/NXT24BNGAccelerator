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
