// src/services/export.service.ts
// JSON export and import of all WorkVault data

import { WebsiteRepository } from '../database/repositories/website.repository';
import { ApplicationRepository } from '../database/repositories/application.repository';
import { LinkRepository } from '../database/repositories/link.repository';
import { NoteRepository } from '../database/repositories/note.repository';
import { TaskRepository } from '../database/repositories/task.repository';

export interface ExportData {
  version: string;
  exported_at: string;
  websites: ReturnType<typeof WebsiteRepository.findAll>;
  applications: ReturnType<typeof ApplicationRepository.findAll>;
  links: ReturnType<typeof LinkRepository.findAll>;
  notes: ReturnType<typeof NoteRepository.findAll>;
  tasks: ReturnType<typeof TaskRepository.findAll>;
}

export const ExportService = {
  exportAll(): ExportData {
    return {
      version: '1.0.0',
      exported_at: new Date().toISOString(),
      websites: WebsiteRepository.findAll(),
      applications: ApplicationRepository.findAll(),
      links: LinkRepository.findAll(),
      notes: NoteRepository.findAll(),
      tasks: TaskRepository.findAll(),
    };
  },

  importAll(data: ExportData): { imported: Record<string, number>; errors: string[] } {
    const counts: Record<string, number> = {
      websites: 0,
      applications: 0,
      links: 0,
      notes: 0,
      tasks: 0,
    };
    const errors: string[] = [];

    // Import websites
    if (Array.isArray(data.websites)) {
      for (const item of data.websites) {
        try {
          WebsiteRepository.create({
            name: item.name,
            url: item.url,
            username: item.username ?? undefined,
            email: item.email ?? undefined,
            password: item.password ?? undefined,
            notes: item.notes ?? undefined,
            tags: item.tags ?? [],
            is_favorite: item.is_favorite,
          });
          counts.websites++;
        } catch (e) {
          errors.push(`Website "${item.name}": ${(e as Error).message}`);
        }
      }
    }

    // Import applications
    if (Array.isArray(data.applications)) {
      for (const item of data.applications) {
        try {
          ApplicationRepository.create({
            name: item.name,
            url: item.url ?? undefined,
            username: item.username ?? undefined,
            password: item.password ?? undefined,
            environment: item.environment,
            notes: item.notes ?? undefined,
            is_favorite: item.is_favorite,
          });
          counts.applications++;
        } catch (e) {
          errors.push(`Application "${item.name}": ${(e as Error).message}`);
        }
      }
    }

    // Import links
    if (Array.isArray(data.links)) {
      for (const item of data.links) {
        try {
          LinkRepository.create({
            title: item.title,
            url: item.url,
            category: item.category,
            description: item.description ?? undefined,
            is_favorite: item.is_favorite,
          });
          counts.links++;
        } catch (e) {
          errors.push(`Link "${item.title}": ${(e as Error).message}`);
        }
      }
    }

    // Import notes
    if (Array.isArray(data.notes)) {
      for (const item of data.notes) {
        try {
          NoteRepository.create({
            title: item.title,
            content: item.content,
            category: item.category,
            tags: item.tags ?? [],
            is_pinned: item.is_pinned,
          });
          counts.notes++;
        } catch (e) {
          errors.push(`Note "${item.title}": ${(e as Error).message}`);
        }
      }
    }

    // Import tasks
    if (Array.isArray(data.tasks)) {
      for (const item of data.tasks) {
        try {
          TaskRepository.create({
            name: item.name,
            description: item.description ?? undefined,
            priority: item.priority,
            due_date: item.due_date ?? undefined,
            status: item.status,
          });
          counts.tasks++;
        } catch (e) {
          errors.push(`Task "${item.name}": ${(e as Error).message}`);
        }
      }
    }

    console.log('[ExportService] Import complete:', counts);
    if (errors.length > 0) {
      console.warn('[ExportService] Import errors:', errors);
    }

    return { imported: counts, errors };
  },
};
