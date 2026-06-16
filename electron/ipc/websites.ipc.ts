// electron/ipc/websites.ipc.ts

import { handle } from './ipc.helper';
import { WebsiteRepository } from '../../src/database/repositories/website.repository';
import type { CreateWebsiteInput, UpdateWebsiteInput } from '../../src/types/website.types';

export function registerWebsiteHandlers(): void {
  handle('websites:getAll', () => WebsiteRepository.findAll());

  handle('websites:getById', (id: unknown) =>
    WebsiteRepository.findById(id as number)
  );

  handle('websites:search', (query: unknown) =>
    WebsiteRepository.search(query as string)
  );

  handle('websites:create', (data: unknown) =>
    WebsiteRepository.create(data as CreateWebsiteInput)
  );

  handle('websites:update', (data: unknown) =>
    WebsiteRepository.update(data as UpdateWebsiteInput & { id: number })
  );

  handle('websites:delete', (id: unknown) =>
    WebsiteRepository.delete(id as number)
  );

  handle('websites:toggleFavorite', (id: unknown) =>
    WebsiteRepository.toggleFavorite(id as number)
  );
}
