import axios from 'axios';
import type { MarketResearch, ContentStrategy, SocialMediaCampaign, EmailCampaign } from '../types';

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

// Generate complete campaign using backend CrewAI agents
export const generateFullCampaign = async (
  productName: string = 'iPhone 17',
  pdfContent?: string
): Promise<{
  marketResearch: string;
  contentStrategy: string;
  socialMedia: string;
  emailCampaign: string;
}> => {
  const response = await axios.post(`${API_BASE_URL}/generate-campaign`, {
    product_name: productName,
    pdf_content: pdfContent || '',
  });

  if (!response.data.success) {
    throw new Error(response.data.error || 'Campaign generation failed');
  }

  return response.data.results;
};

// Generate market research only
export const generateMarketResearchAPI = async (
  productName: string = 'iPhone 17',
  pdfContent?: string
): Promise<string> => {
  const response = await axios.post(`${API_BASE_URL}/generate-research`, {
    product_name: productName,
    pdf_content: pdfContent || '',
  });

  if (!response.data.success) {
    throw new Error(response.data.error || 'Research generation failed');
  }

  return response.data.research;
};

// Keep original mock functions for fallback/testing
// Helper functions to extract structured data from LLM responses
const extractFeatures = (content: string): string[] => {
  const featuresMatch = content.match(/features?:?\s*([\s\S]*?)(?=\n\n|competitors?|target audience|\*\*|$)/i);
  if (featuresMatch) {
    return featuresMatch[1]
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '').trim())
      .filter(Boolean)
      .slice(0, 5);
  }
  return [
    'Advanced AI-powered camera system',
    'All-day battery life',
    'Premium build quality',
  ];
};

const extractCompetitors = (content: string): string[] => {
  const competitorsMatch = content.match(/competitors?:?\s*([\s\S]*?)(?=\n\n|target audience|\*\*|$)/i);
  if (competitorsMatch) {
    return competitorsMatch[1]
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '').trim())
      .filter(Boolean);
  }
  return ['Samsung Galaxy S24', 'Google Pixel 9'];
};

const extractAudience = (content: string): string => {
  const audienceMatch = content.match(/target audience:?\s*([\s\S]*?)(?=\n\n|\*\*|$)/i);
  return audienceMatch ? audienceMatch[1].trim() : 'Tech enthusiasts aged 25-45';
};

const extractUSPs = (content: string): string[] => {
  const uspMatch = content.match(/usps?|unique selling points?:?\s*([\s\S]*?)(?=\n\n|$)/i);
  if (uspMatch) {
    return uspMatch[1]
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '').trim())
      .filter(Boolean)
      .slice(0, 3);
  }
  return [
    'Most advanced camera ever in a smartphone',
    'Unmatched battery life for all-day power',
    'Premium titanium design',
  ];
};

const extractSocialPosts = (content: string): Array<{ platform: string; content: string }> => {
  const posts: Array<{ platform: string; content: string }> = [];
  const platforms = ['Instagram', 'Twitter', 'TikTok', 'LinkedIn', 'Facebook'];
  
  for (const platform of platforms) {
    const regex = new RegExp(`${platform}:?\\s*([\\s\\S]*?)(?=\\n\\n|${platforms.join('|')}|$)`, 'i');
    const match = content.match(regex);
    if (match && match[1].trim()) {
      posts.push({
        platform,
        content: match[1].trim().replace(/^[-*•]\s*/, '').trim(),
      });
    }
  }
  
  return posts.length > 0 ? posts : [
    { platform: 'Instagram', content: 'Stunning photos, stunning design. #iPhone17' },
    { platform: 'Twitter', content: 'The future is here. Experience iPhone 17.' },
  ];
};

const extractEmailSubjects = (content: string): string[] => {
  const subjectMatch = content.match(/subject lines?:?\s*([\s\S]*?)(?=\n\n|email body|$)/i);
  if (subjectMatch) {
    return subjectMatch[1]
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '').trim())
      .filter(Boolean)
      .slice(0, 3);
  }
  return ['Introducing iPhone 17 - Pre-order Now'];
};

const extractEmailBody = (content: string): string => {
  const bodyMatch = content.match(/email body:?\s*([\s\S]*?)(?=\n\n|cta|$)/i);
  return bodyMatch ? bodyMatch[1].trim() : 'Experience the future of smartphones with iPhone 17.';
};

const extractCTA = (content: string): string => {
  const ctaMatch = content.match(/cta|call to action:?\s*([\s\S]*?)$/i);
  return ctaMatch ? ctaMatch[1].trim() : 'Pre-order Now';
};

// Export original mock functions (kept for backward compatibility)
export { extractFeatures, extractCompetitors, extractAudience, extractUSPs, extractSocialPosts, extractEmailSubjects, extractEmailBody, extractCTA };
