// src/types/application.types.ts

export type AppEnvironment = 'production' | 'staging' | 'development' | 'testing' | 'local';

export interface Application {
  id: number;
  name: string;
  url: string | null;
  username: string | null;
  password: string | null;
  network_name: string | null;
  environment: AppEnvironment;
  notes: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateApplicationInput {
  name: string;
  url?: string;
  username?: string;
  password?: string;
  network_name?: string;
  environment?: AppEnvironment;
  notes?: string;
  is_favorite?: boolean;
}

export interface UpdateApplicationInput extends Partial<CreateApplicationInput> {
  id: number;
}
