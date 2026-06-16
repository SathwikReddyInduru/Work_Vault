// src/types/link.types.ts

export type LinkCategory =
  | 'General'
  | 'Portal'
  | 'Documentation'
  | 'Dashboard'
  | 'Team'
  | 'Tool'
  | 'Reference'
  | 'Other';

export interface QuickLink {
  id: number;
  title: string;
  url: string;
  category: string;
  description: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateLinkInput {
  title: string;
  url: string;
  category?: string;
  description?: string;
  is_favorite?: boolean;
}

export interface UpdateLinkInput extends Partial<CreateLinkInput> {
  id: number;
}
