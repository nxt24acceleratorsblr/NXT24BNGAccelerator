export interface MarketResearch {
  features: string[];
  competitors: string;
  targetAudience: string;
  rawOutput: string;
}

export interface ContentStrategy {
  tagline: string;
  description: string;
  usps: string[];
  rawOutput: string;
}

export interface SocialMediaCampaign {
  instagramPosts: string[];
  twitterThread: string;
  rawOutput: string;
}

export interface EmailCampaign {
  subjectLine: string;
  emailBody: string;
  versionA: string;
  versionB: string;
  rawOutput: string;
}

export interface CampaignResult {
  marketResearch?: MarketResearch;
  contentStrategy?: ContentStrategy;
  socialMedia?: SocialMediaCampaign;
  emailCampaign?: EmailCampaign;
  status: 'idle' | 'loading' | 'success' | 'error';
  currentStep?: number;
  error?: string;
}

export interface AgentTask {
  id: number;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  result?: string;
}
