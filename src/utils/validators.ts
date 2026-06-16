// src/utils/validators.ts
// Zod validation schemas for all forms in WorkVault

import { z } from 'zod';

// ── Shared helpers ────────────────────────────────────────────────────────────

const urlSchema = z
  .string()
  .min(1, 'URL is required')
  .refine(
    (val) => {
      try {
        new URL(val);
        return true;
      } catch {
        // Allow partial URLs like "localhost:3000"
        return val.startsWith('http') || val.startsWith('localhost') || val.includes('://');
      }
    },
    { message: 'Please enter a valid URL (e.g. https://example.com)' }
  );

const optionalUrl = z
  .string()
  .optional()
  .refine(
    (val) => {
      if (!val || val.trim() === '') return true;
      try {
        new URL(val);
        return true;
      } catch {
        return val.startsWith('http') || val.startsWith('localhost');
      }
    },
    { message: 'Please enter a valid URL' }
  );

const tagsSchema = z.array(z.string().min(1).max(30)).max(10).optional().default([]);

// ── Website schema ────────────────────────────────────────────────────────────

export const websiteSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  url: urlSchema,
  username: z.string().max(200).optional().or(z.literal('')),
  email: z
    .string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),
  password: z.string().max(500).optional().or(z.literal('')),
  notes: z.string().max(5000).optional().or(z.literal('')),
  tags: tagsSchema,
  is_favorite: z.boolean().optional().default(false),
});

export type WebsiteFormValues = z.infer<typeof websiteSchema>;

// ── Application schema ────────────────────────────────────────────────────────

export const applicationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  url: optionalUrl,
  username: z.string().max(200).optional().or(z.literal('')),
  password: z.string().max(500).optional().or(z.literal('')),
  environment: z
    .enum(['production', 'staging', 'development', 'testing', 'local'])
    .default('production'),
  notes: z.string().max(5000).optional().or(z.literal('')),
  is_favorite: z.boolean().optional().default(false),
});

export type ApplicationFormValues = z.infer<typeof applicationSchema>;

// ── Link schema ───────────────────────────────────────────────────────────────

export const linkSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  url: urlSchema,
  category: z.string().min(1, 'Category is required').max(50).default('General'),
  description: z.string().max(500).optional().or(z.literal('')),
  is_favorite: z.boolean().optional().default(false),
});

export type LinkFormValues = z.infer<typeof linkSchema>;

// ── Note schema ───────────────────────────────────────────────────────────────

export const noteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().max(100000).optional().default(''),
  category: z.string().min(1, 'Category is required').max(50).default('General'),
  tags: tagsSchema,
  is_pinned: z.boolean().optional().default(false),
});

export type NoteFormValues = z.infer<typeof noteSchema>;

// ── Task schema ───────────────────────────────────────────────────────────────

export const taskSchema = z.object({
  name: z.string().min(1, 'Task name is required').max(200, 'Name too long'),
  description: z.string().max(2000).optional().or(z.literal('')),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  due_date: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => {
        if (!val || val === '') return true;
        const d = new Date(val);
        return !isNaN(d.getTime());
      },
      { message: 'Invalid date' }
    ),
  status: z.enum(['todo', 'in_progress', 'done']).default('todo'),
});

export type TaskFormValues = z.infer<typeof taskSchema>;

// ── Password generator schema ─────────────────────────────────────────────────

export const passwordGeneratorSchema = z.object({
  length: z.number().min(8, 'Minimum 8').max(128, 'Maximum 128').default(16),
  uppercase: z.boolean().default(true),
  lowercase: z.boolean().default(true),
  numbers: z.boolean().default(true),
  symbols: z.boolean().default(false),
});

export type PasswordGeneratorValues = z.infer<typeof passwordGeneratorSchema>;

// ── Utility: safe parse with default ─────────────────────────────────────────

export function safeParseWithDefault<T>(
  schema: z.ZodType<T>,
  data: unknown,
  fallback: T
): T {
  const result = schema.safeParse(data);
  return result.success ? result.data : fallback;
}

// ── Utility: validate URL quickly ────────────────────────────────────────────

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// ── Utility: validate JSON string ────────────────────────────────────────────

export function isValidJSON(text: string): boolean {
  if (!text || text.trim() === '') return false;
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
}
