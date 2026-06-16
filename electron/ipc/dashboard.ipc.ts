// electron/ipc/dashboard.ipc.ts

import { handle } from './ipc.helper';
import { WebsiteRepository } from '../../src/database/repositories/website.repository';
import { ApplicationRepository } from '../../src/database/repositories/application.repository';
import { LinkRepository } from '../../src/database/repositories/link.repository';
import { NoteRepository } from '../../src/database/repositories/note.repository';
import { TaskRepository } from '../../src/database/repositories/task.repository';
import type { DashboardStats } from '../../src/types/electron.types';

export function registerDashboardHandlers(): void {
  handle('dashboard:getStats', (): DashboardStats => {
    return {
      totalWebsites: WebsiteRepository.count(),
      totalApplications: ApplicationRepository.count(),
      totalLinks: LinkRepository.count(),
      totalNotes: NoteRepository.count(),
      totalTasks: TaskRepository.count(),
      pendingTasks: TaskRepository.countPending(),
      recentWebsites: WebsiteRepository.getRecent(5),
      recentApplications: ApplicationRepository.getRecent(5),
      recentNotes: NoteRepository.getRecent(5),
      recentLinks: LinkRepository.getRecent(5),
      favoritesWebsites: WebsiteRepository.findFavorites(),
      favoritesLinks: LinkRepository.findFavorites(),
    };
  });
}
