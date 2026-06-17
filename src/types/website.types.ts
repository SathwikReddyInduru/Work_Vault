// src/types/website.types.ts

export interface Website {
  id: number;
  name: string;
  url: string;
  username: string | null;
  network_name: string | null;
  password: string | null;
  notes: string | null;
  tags: string[];
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateWebsiteInput {
  name: string;
  url: string;
  username?: string;
  network_name?: string;
  password?: string;
  notes?: string;
  tags?: string[];
  is_favorite?: boolean;
}

export interface UpdateWebsiteInput extends Partial<CreateWebsiteInput> {
  id: number;
}