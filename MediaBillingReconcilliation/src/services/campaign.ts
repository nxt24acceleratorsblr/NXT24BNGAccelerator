import { callLLM } from './llm';
import type { MarketResearch, ContentStrategy, SocialMediaCampaign, EmailCampaign } from '../types';

export const generateMarketResearch = async (
  productName: string = 'iPhone 17',
  pdfContext?: string
): Promise<MarketResearch> => {
  const systemPrompt = `You are a senior market research analyst specializing in smartphones. 
You analyze markets, identify target audiences, and understand what makes products successful.`;

  const contextSection = pdfContext 
    ? `\n\nPRODUCT INFORMATION FROM FILE:\n${pdfContext}\n\n` 
    : '';

  const prompt = `${contextSection}Research ${productName} comprehensively:

1. Top 5 key features and specifications
2. Main competitors (Samsung, Google) and how ${productName} beats them
3. Target audience profile (age, interests, income)

Provide a clear, structured analysis with specific data points.`;

  const response = await callLLM(prompt, systemPrompt);

  return {
    features: extractFeatures(response.content),
    competitors: extractCompetitors(response.content),
    targetAudience: extractAudience(response.content),
    rawOutput: response.content,
  };
};

export const generateContentStrategy = async (
  productName: string = 'iPhone 17',
  researchData: string
): Promise<ContentStrategy> => {
  const systemPrompt = `You are a creative strategist who knows how to make products irresistible. 
You craft taglines, product descriptions, and key messages that convert.`;

  const prompt = `Using this research: ${researchData}

Create compelling content for ${productName}:

1. ONE powerful tagline (4-6 words max) - emotional and memorable
2. Product description (100 words) - tell a story, connect features to emotions
3. Three USPs (Unique Selling Points) - focus on benefits, not just features

Format your response clearly with sections.`;

  const response = await callLLM(prompt, systemPrompt);

  return {
    tagline: extractTagline(response.content),
    description: extractDescription(response.content),
    usps: extractUSPs(response.content),
    rawOutput: response.content,
  };
};

export const generateSocialMediaCampaign = async (
  productName: string = 'iPhone 17',
  contentData: string
): Promise<SocialMediaCampaign> => {
  const systemPrompt = `You are a social media guru who creates viral content. 
You know what works on Instagram, Twitter, and TikTok.`;

  const prompt = `Using this content: ${contentData}

Create a viral social media campaign for ${productName}:

1. Two Instagram post ideas with compelling captions, emojis, and hashtags
2. One Twitter thread (5 tweets) with hook, building interest, and strong CTA

Make everything designed to go viral!`;

  const response = await callLLM(prompt, systemPrompt);

  return {
    instagramPosts: extractInstagramPosts(response.content),
    twitterThread: extractTwitterThread(response.content),
    rawOutput: response.content,
  };
};

export const generateEmailCampaign = async (
  productName: string = 'iPhone 17',
  fullCampaignData: string
): Promise<EmailCampaign> => {
  const systemPrompt = `You are an expert email marketer who writes emails that convert. 
You understand email psychology, subject line optimization, and call-to-action design.`;

  const prompt = `Using this campaign data: ${fullCampaignData}

Create a professional marketing email for ${productName} launch:

1. Compelling subject line (5-8 words)
2. Email body (200-300 words) with clear call-to-action
3. Two versions:
   - Version A: For existing Apple customers
   - Version B: For potential new customers

Make it conversion-focused with clear next steps!`;

  const response = await callLLM(prompt, systemPrompt);

  return {
    subjectLine: extractSubjectLine(response.content),
    emailBody: extractEmailBody(response.content),
    versionA: extractVersionA(response.content),
    versionB: extractVersionB(response.content),
    rawOutput: response.content,
  };
};

// Helper functions to extract specific parts from LLM responses
function extractFeatures(content: string): string[] {
  const lines = content.split('\n');
  const features: string[] = [];
  let inFeaturesSection = false;

  for (const line of lines) {
    if (line.toLowerCase().includes('feature') || line.toLowerCase().includes('specification')) {
      inFeaturesSection = true;
      continue;
    }
    if (inFeaturesSection && (line.trim().startsWith('-') || line.trim().startsWith('•') || /^\d+\./.test(line.trim()))) {
      features.push(line.trim().replace(/^[-•\d.]+\s*/, ''));
      if (features.length >= 5) break;
    }
  }
  return features.length > 0 ? features : ['Advanced camera system', 'All-day battery life', 'Premium design', 'Fast performance', '5G connectivity'];
}

function extractCompetitors(content: string): string {
  const match = content.match(/competitor[s]?[:\s]+(.*?)(?:\n\n|\n[A-Z]|$)/is);
  return match ? match[1].trim() : 'Main competitors include Samsung Galaxy S25 and Google Pixel 10';
}

function extractAudience(content: string): string {
  const match = content.match(/target audience[:\s]+(.*?)(?:\n\n|\n[A-Z]|$)/is);
  return match ? match[1].trim() : 'Tech-savvy professionals aged 25-45 with high income';
}

function extractTagline(content: string): string {
  const match = content.match(/tagline[:\s]+["']?([^"\n]{4,30})["']?/i);
  return match ? match[1].trim() : 'Beyond Innovation';
}

function extractDescription(content: string): string {
  const match = content.match(/description[:\s]+(.*?)(?:\n\n|USP|$)/is);
  return match ? match[1].trim().substring(0, 300) : 'Experience the future of mobile technology...';
}

function extractUSPs(content: string): string[] {
  const lines = content.split('\n');
  const usps: string[] = [];
  let inUSPSection = false;

  for (const line of lines) {
    if (line.toLowerCase().includes('usp') || line.toLowerCase().includes('selling point')) {
      inUSPSection = true;
      continue;
    }
    if (inUSPSection && (line.trim().startsWith('-') || line.trim().startsWith('•') || /^\d+\./.test(line.trim()))) {
      usps.push(line.trim().replace(/^[-•\d.]+\s*/, ''));
      if (usps.length >= 3) break;
    }
  }
  return usps.length > 0 ? usps : ['Industry-leading performance', 'Unmatched camera quality', 'Sustainable design'];
}

function extractInstagramPosts(content: string): string[] {
  const posts: string[] = [];
  const sections = content.split(/instagram post|post \d+/i);
  
  for (let i = 1; i < Math.min(sections.length, 3); i++) {
    const post = sections[i].trim().split('\n\n')[0];
    if (post) posts.push(post);
  }
  
  return posts.length > 0 ? posts : ['🚀 Introducing the future...', '📸 Camera that captures life...'];
}

function extractTwitterThread(content: string): string {
  const match = content.match(/twitter thread[:\s]+(.*?)(?:\n\n[A-Z]|$)/is);
  return match ? match[1].trim() : '1/ Thread about iPhone 17...\n2/ Amazing features...\n3/ Why you need it...';
}

function extractSubjectLine(content: string): string {
  const match = content.match(/subject line[:\s]+["']?([^"\n]{5,50})["']?/i);
  return match ? match[1].trim() : 'iPhone 17: Your Exclusive Early Access';
}

function extractEmailBody(content: string): string {
  const match = content.match(/email body[:\s]+(.*?)(?:\n\nVersion|$)/is);
  return match ? match[1].trim() : 'Dear valued customer...';
}

function extractVersionA(content: string): string {
  const match = content.match(/version a[:\s]+(.*?)(?:\n\nVersion B|$)/is);
  return match ? match[1].trim() : 'Version A content...';
}

function extractVersionB(content: string): string {
  const match = content.match(/version b[:\s]+(.*?)$/is);
  return match ? match[1].trim() : 'Version B content...';
}

export default {
  generateMarketResearch,
  generateContentStrategy,
  generateSocialMediaCampaign,
  generateEmailCampaign,
};
