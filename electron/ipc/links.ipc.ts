// electron/ipc/links.ipc.ts

import { handle } from './ipc.helper';
import { LinkRepository } from '../../src/database/repositories/link.repository';
import type { CreateLinkInput, UpdateLinkInput } from '../../src/types/link.types';

export function registerLinkHandlers(): void {
  handle('links:getAll', () => LinkRepository.findAll());

  handle('links:getById', (id: unknown) =>
    LinkRepository.findById(id as number)
  );

  handle('links:search', (query: unknown) =>
    LinkRepository.search(query as string)
  );

  handle('links:create', (data: unknown) =>
    LinkRepository.create(data as CreateLinkInput)
  );

  handle('links:update', (data: unknown) =>
    LinkRepository.update(data as UpdateLinkInput & { id: number })
  );

  handle('links:delete', (id: unknown) =>
    LinkRepository.delete(id as number)
  );

  handle('links:toggleFavorite', (id: unknown) =>
    LinkRepository.toggleFavorite(id as number)
  );
}
