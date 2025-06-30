export interface User {
  id: string;
  auth_id: string;
  email: string;
  full_name: string;
  role: 'seeker' | 'supporter';
  interests: string[];
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  upi_id: string;
  bank_account: string;
  paypal_email: string;
  profile_photo_url?: string;
  cover_photo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, role: 'seeker' | 'supporter') => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  completeProfile: (profileData: Partial<User>) => Promise<void>;
}

export interface ProfileFormData {
  full_name: string;
  interests: string[];
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  upi_id: string;
  bank_account: string;
  paypal_email: string;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  media_url: string | null;
  media_type: 'image' | 'video' | null;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  text: string;
  created_at: string;
  updated_at: string;
}

export interface Like {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface Report {
  id: string;
  post_id: string;
  user_id: string;
  reason: 'spam' | 'hate' | 'scam' | 'false_info' | 'inappropriate' | 'other';
  message: string;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
}