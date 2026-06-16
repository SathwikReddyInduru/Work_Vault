// src/types/note.types.ts

export type NoteCategory =
  | 'General'
  | 'Technical'
  | 'Meeting'
  | 'Commands'
  | 'Troubleshooting'
  | 'Reference'
  | 'Ideas'
  | 'Other';

export interface Note {
  id: number;
  title: string;
  content: string;
  category: string;
  tags: string[];
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateNoteInput {
  title: string;
  content?: string;
  category?: string;
  tags?: string[];
  is_pinned?: boolean;
}

export interface UpdateNoteInput extends Partial<CreateNoteInput> {
  id: number;
}
