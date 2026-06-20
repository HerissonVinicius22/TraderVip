export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: 'admin' | 'student';
  is_blocked: boolean;
  is_vip?: boolean;
  avatar_url?: string;
  created_at: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  cover_image_url: string;
  order_index: number;
  is_vip?: boolean;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  youtube_url: string;
  duration: string; // e.g. "12:30"
  description?: string;
  order_index: number;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  completed_at?: string;
}

export interface TermsAcceptance {
  id: string;
  user_id: string;
  accepted: boolean;
  accepted_at: string;
}

export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  averageProgress: number; // percentage
}

export interface VipOffers {
  monthly_title: string;
  monthly_price: string;
  monthly_installment_value: string;
  monthly_checkout_url: string;
  lifetime_title: string;
  lifetime_price: string;
  lifetime_installment_value: string;
  lifetime_checkout_url: string;
}
