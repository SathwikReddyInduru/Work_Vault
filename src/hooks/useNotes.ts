import { useState, useEffect, useCallback } from 'react';
import type { Note, CreateNoteInput, UpdateNoteInput } from '@/types/note.types';
import { useToast } from './useToast';

const api = () => (window as any).electronAPI;

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api().getNotes();
      if (res.success) setNotes(res.data ?? []);
    } catch { } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async (data: CreateNoteInput) => {
    const res = await api().createNote(data);
    if (res.success) { toast.success('Note created'); await load(); return true; }
    toast.error('Failed to create', res.error); return false;
  };

  const update = async (data: UpdateNoteInput) => {
    const res = await api().updateNote(data);
    if (res.success) { toast.success('Note saved'); await load(); return true; }
    toast.error('Failed to save', res.error); return false;
  };

  const remove = async (id: number) => {
    const res = await api().deleteNote(id);
    if (res.success) { toast.success('Note deleted'); await load(); return true; }
    toast.error('Failed to delete', res.error); return false;
  };

  const togglePin = async (id: number) => {
    await api().toggleNotePin(id); await load();
  };

  return { notes, loading, create, update, remove, togglePin, reload: load };
};
