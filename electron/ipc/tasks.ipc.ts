// electron/ipc/tasks.ipc.ts

import { handle } from './ipc.helper';
import { TaskRepository } from '../../src/database/repositories/task.repository';
import type { CreateTaskInput, UpdateTaskInput, TaskStatus } from '../../src/types/task.types';

export function registerTaskHandlers(): void {
  handle('tasks:getAll', () => TaskRepository.findAll());

  handle('tasks:getById', (id: unknown) =>
    TaskRepository.findById(id as number)
  );

  handle('tasks:search', (query: unknown) =>
    TaskRepository.search(query as string)
  );

  handle('tasks:create', (data: unknown) =>
    TaskRepository.create(data as CreateTaskInput)
  );

  handle('tasks:update', (data: unknown) =>
    TaskRepository.update(data as UpdateTaskInput & { id: number })
  );

  handle('tasks:delete', (id: unknown) =>
    TaskRepository.delete(id as number)
  );

  handle('tasks:updateStatus', (id: unknown, status: unknown) =>
    TaskRepository.updateStatus(id as number, status as TaskStatus)
  );
}
