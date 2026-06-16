// src/types/task.types.ts

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface Task {
  id: number;
  name: string;
  description: string | null;
  priority: TaskPriority;
  due_date: string | null;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskInput {
  name: string;
  description?: string;
  priority?: TaskPriority;
  due_date?: string;
  status?: TaskStatus;
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  id: number;
}

export interface TaskStatusCounts {
  todo: number;
  in_progress: number;
  done: number;
}
