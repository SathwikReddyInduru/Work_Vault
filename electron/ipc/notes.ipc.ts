// electron/ipc/notes.ipc.ts

import { handle } from './ipc.helper';
import { NoteRepository } from '../../src/database/repositories/note.repository';
import type { CreateNoteInput, UpdateNoteInput } from '../../src/types/note.types';

export function registerNoteHandlers(): void {
  handle('notes:getAll', () => NoteRepository.findAll());

  handle('notes:getById', (id: unknown) =>
    NoteRepository.findById(id as number)
  );

  handle('notes:search', (query: unknown) =>
    NoteRepository.search(query as string)
  );

  handle('notes:create', (data: unknown) =>
    NoteRepository.create(data as CreateNoteInput)
  );

  handle('notes:update', (data: unknown) =>
    NoteRepository.update(data as UpdateNoteInput & { id: number })
  );

  handle('notes:delete', (id: unknown) =>
    NoteRepository.delete(id as number)
  );

  handle('notes:togglePin', (id: unknown) =>
    NoteRepository.togglePin(id as number)
  );
}
