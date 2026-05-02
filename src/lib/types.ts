import type { AppRole } from "@/contexts/AuthContext";

export type { AppRole };

export type AccountType = "parroquia" | "persona";

export interface ProfileRow {
  id: string;
  full_name: string;
  display_name: string | null;
  account_type: AccountType;
  avatar_url: string | null;
  nit_id: string | null;
  phone: string | null;
  address: string | null;
  email: string | null;
  parroquia_code: string | null;
  points_balance: number;
  created_at?: string;
}

export interface Advance {
  id: string;
  employee_name: string;
  amount: number;
  advance_date: string;
  note: string | null;
  paid: boolean;
  paid_at: string | null;
  created_at: string;
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

export interface SiteContentRow {
  key: string;
  value_text: string | null;
  value_url: string | null;
  updated_at: string;
}

/** Claves conocidas en site_content para evitar typos */
export const SITE_KEYS = {
  heroTitle: "hero_title",
  heroSubtitle: "hero_subtitle",
  heroCta: "hero_cta",
  heroVideoUrl: "hero_video_url",
  heroPosterUrl: "hero_poster_url",
} as const;
