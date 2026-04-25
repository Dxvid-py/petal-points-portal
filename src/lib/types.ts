import type { AppRole } from "@/contexts/AuthContext";

export type { AppRole };

export interface ProfileRow {
  id: string;
  full_name: string;
  nit_id: string | null;
  phone: string | null;
  email: string | null;
  parroquia_code: string | null;
  points_balance: number;
  created_at?: string;
}

export interface PointsTransaction {
  id: string;
  profile_id: string;
  amount: number;
  type: string;
  reason: string | null;
  created_at: string;
}

export interface Reward {
  id: string;
  title: string;
  description: string | null;
  points_cost: number;
  image_url: string | null;
  category: string | null;
  active: boolean;
}

export interface GalleryItem {
  id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
}

export interface UserRoleRow {
  id: string;
  user_id: string;
  role: AppRole;
  created_at?: string;
}
