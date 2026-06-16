// electron/ipc/applications.ipc.ts

import { handle } from './ipc.helper';
import { ApplicationRepository } from '../../src/database/repositories/application.repository';
import type { CreateApplicationInput, UpdateApplicationInput } from '../../src/types/application.types';

export function registerApplicationHandlers(): void {
  handle('applications:getAll', () => ApplicationRepository.findAll());

  handle('applications:getById', (id: unknown) =>
    ApplicationRepository.findById(id as number)
  );

  handle('applications:search', (query: unknown) =>
    ApplicationRepository.search(query as string)
  );

  handle('applications:create', (data: unknown) =>
    ApplicationRepository.create(data as CreateApplicationInput)
  );

  handle('applications:update', (data: unknown) =>
    ApplicationRepository.update(data as UpdateApplicationInput & { id: number })
  );

  handle('applications:delete', (id: unknown) =>
    ApplicationRepository.delete(id as number)
  );

  handle('applications:toggleFavorite', (id: unknown) =>
    ApplicationRepository.toggleFavorite(id as number)
  );
}
