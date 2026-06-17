// src/types/dbconnection.types.ts

export type DbConnectionType = 'direct' | 'tns' | 'ldap';

export interface DbConnection {
  id: number;
  name: string;
  type: DbConnectionType;
  user_schema: string;
  password: string | null;
  host: string | null;
  port: number | null;
  service_name: string | null;
  tns_alias: string | null;
  notes: string | null;
  is_favorite: number;
  created_at: string;
  updated_at: string;
}

export interface CreateDbConnectionInput {
  name: string;
  type: DbConnectionType;
  user_schema: string;
  password?: string;
  host?: string;
  port?: number;
  service_name?: string;
  tns_alias?: string;
  notes?: string;
  is_favorite?: boolean;
}

export interface UpdateDbConnectionInput extends Partial<CreateDbConnectionInput> {
  id: number;
}