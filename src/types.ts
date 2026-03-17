export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  photo?: string;
  role: 'user' | 'regional_officer' | 'master_admin';
  branch_id?: number;
  card_status?: 'none' | 'pending' | 'approved' | 'rejected';
  card_id?: string;
  card_issued_at?: string;
  card_expires_at?: string;
  card_full_name?: string;
  card_phone?: string;
  card_photo?: string;
  card_rejection_reason?: string;
  status: 'active' | 'suspended' | 'banned';
  location?: string;
}

export interface DonationApplication {
  id: number;
  branch_id: number;
  vulnerable_name: string;
  images: string; // JSON string
  active_phone: string;
  alt_phone: string;
  guardian_name: string;
  country: string;
  district: string;
  county: string;
  sub_county: string;
  parish: string;
  village: string;
  chairperson_name: string;
  chairperson_phone: string;
  recommendation_letter: string;
  status: string;
  officer_reply?: string;
  date: string;
}

export interface Account {
  user_id: number;
  balance: number;
  auto_pay_asmin: number;
}

export interface Donation {
  id: number;
  donor_name: string;
  amount: number;
  date: string;
  message: string;
}

export interface Branch {
  id: number;
  region: string;
  location: string;
  is_head_office: number;
  officer_name: string;
  officer_bio: string;
  officer_photo?: string;
  officer_photos?: string; // JSON string
  activities?: Activity[];
  resources?: Resource[];
}

export interface Activity {
  id: number;
  branch_id: number;
  title: string;
  description: string;
  date: string;
  status?: 'active' | 'paused';
}

export interface Resource {
  id: number;
  branch_id: number;
  name: string;
  type: 'document' | 'tool' | 'fund';
  description: string;
  url?: string;
  date?: string;
}

export interface Transaction {
  id: number;
  user_id: number;
  type: 'deposit' | 'asmin_collection';
  amount: number;
  date: string;
}

export interface Event {
  id: number;
  branch_id: number;
  branch_name: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  rsvp_count: number;
  created_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  related_id?: number;
  read: number;
  timestamp: string;
}
