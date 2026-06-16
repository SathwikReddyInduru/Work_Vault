// src/database/repositories/task.repository.ts

import { getDatabase } from '../connection';

export interface TaskRow {
  id: number;
  name: string;
  description: string | null;
  priority: string;
  due_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskDTO {
  name: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
  status?: 'todo' | 'in_progress' | 'done';
}

export interface UpdateTaskDTO extends Partial<CreateTaskDTO> {
  id: number;
}

function rowToTask(row: TaskRow) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    priority: row.priority as 'low' | 'medium' | 'high',
    due_date: row.due_date,
    status: row.status as 'todo' | 'in_progress' | 'done',
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export const TaskRepository = {
  findAll() {
    const db = getDatabase();
    const rows = db
      .prepare(
        `SELECT * FROM tasks
         ORDER BY
           CASE status WHEN 'done' THEN 1 ELSE 0 END ASC,
           CASE priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END ASC,
           due_date ASC NULLS LAST`
      )
      .all() as TaskRow[];
    return rows.map(rowToTask);
  },

  findById(id: number) {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as TaskRow | undefined;
    if (!row) return null;
    return rowToTask(row);
  },

  search(query: string) {
    const db = getDatabase();
    const like = `%${query}%`;
    const rows = db
      .prepare(
        `SELECT * FROM tasks
         WHERE name LIKE ? OR description LIKE ?
         ORDER BY created_at DESC`
      )
      .all(like, like) as TaskRow[];
    return rows.map(rowToTask);
  },

  findByStatus(status: string) {
    const db = getDatabase();
    const rows = db
      .prepare('SELECT * FROM tasks WHERE status = ? ORDER BY created_at DESC')
      .all(status) as TaskRow[];
    return rows.map(rowToTask);
  },

  findByPriority(priority: string) {
    const db = getDatabase();
    const rows = db
      .prepare('SELECT * FROM tasks WHERE priority = ? ORDER BY due_date ASC NULLS LAST')
      .all(priority) as TaskRow[];
    return rows.map(rowToTask);
  },

  findPending() {
    const db = getDatabase();
    const rows = db
      .prepare(
        `SELECT * FROM tasks WHERE status != 'done'
         ORDER BY CASE priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END ASC`
      )
      .all() as TaskRow[];
    return rows.map(rowToTask);
  },

  create(data: CreateTaskDTO) {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO tasks (name, description, priority, due_date, status)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      data.name,
      data.description ?? null,
      data.priority ?? 'medium',
      data.due_date ?? null,
      data.status ?? 'todo'
    );
    return this.findById(result.lastInsertRowid as number);
  },

  update(data: UpdateTaskDTO) {
    const db = getDatabase();
    const existing = db
      .prepare('SELECT * FROM tasks WHERE id = ?')
      .get(data.id) as TaskRow | undefined;
    if (!existing) throw new Error(`Task with id ${data.id} not found`);

    const stmt = db.prepare(`
      UPDATE tasks SET name = ?, description = ?, priority = ?, due_date = ?, status = ?
      WHERE id = ?
    `);

    stmt.run(
      data.name ?? existing.name,
      data.description !== undefined ? data.description : existing.description,
      data.priority ?? existing.priority,
      data.due_date !== undefined ? data.due_date : existing.due_date,
      data.status ?? existing.status,
      data.id
    );

    return this.findById(data.id);
  },

  updateStatus(id: number, status: 'todo' | 'in_progress' | 'done') {
    const db = getDatabase();
    db.prepare('UPDATE tasks SET status = ? WHERE id = ?').run(status, id);
    return this.findById(id);
  },

  delete(id: number) {
    const db = getDatabase();
    const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
    return result.changes > 0;
  },

  count() {
    const db = getDatabase();
    const row = db.prepare('SELECT COUNT(*) as count FROM tasks').get() as { count: number };
    return row.count;
  },

  countPending() {
    const db = getDatabase();
    const row = db
      .prepare("SELECT COUNT(*) as count FROM tasks WHERE status != 'done'")
      .get() as { count: number };
    return row.count;
  },

  getStatusCounts() {
    const db = getDatabase();
    const rows = db
      .prepare('SELECT status, COUNT(*) as count FROM tasks GROUP BY status')
      .all() as { status: string; count: number }[];
    const counts: Record<string, number> = { todo: 0, in_progress: 0, done: 0 };
    rows.forEach((r) => {
      counts[r.status] = r.count;
    });
    return counts;
  },

  getRecent(limit = 5) {
    const db = getDatabase();
    const rows = db
      .prepare('SELECT * FROM tasks ORDER BY created_at DESC LIMIT ?')
      .all(limit) as TaskRow[];
    return rows.map(rowToTask);
  },
};
