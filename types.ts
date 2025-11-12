export interface UserProfile {
  id: string;
  email?: string;
  plan: 'free' | 'pro' | 'enterprise';
  used_quota: number;
  created_at: string;
}

export interface GeneratedImageData {
  id?: string;
  user_id: string;
  original_url: string;
  generated_urls: string[];
  category: string;
  prompt: string;
  created_at?: string;
}
