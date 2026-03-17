export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done';
export type TaskPriority = 'low' | 'normal' | 'high';

export interface Label {
  id: string;
  name: string;
  color: string;
  user_id: string;
  created_at: string;
}

export interface TeamMember {
  id: string;
  name: string;
  avatar_color: string;
  user_id: string;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  user_id: string;
  created_at: string;
  assignees?: TeamMember[];
  labels?: Label[];
  comments_count?: number;
}

export interface Comment {
  id: string;
  task_id: string;
  content: string;
  user_id: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  task_id: string;
  user_id: string;
  action: string;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
}

export interface BoardColumn {
  id: TaskStatus;
  title: string;
  color: string;
  dotColor: string;
}

export const BOARD_COLUMNS: BoardColumn[] = [
  { id: 'todo', title: 'To Do', color: 'var(--col-todo)', dotColor: '#94a3b8' },
  { id: 'in_progress', title: 'In Progress', color: 'var(--col-progress)', dotColor: '#f59e0b' },
  { id: 'in_review', title: 'In Review', color: 'var(--col-review)', dotColor: '#8b5cf6' },
  { id: 'done', title: 'Done', color: 'var(--col-done)', dotColor: '#10b981' },
];

export const PRIORITY_CONFIG = {
  low: { label: 'Low', color: '#64748b' },
  normal: { label: 'Normal', color: '#3b82f6' },
  high: { label: 'High', color: '#ef4444' },
};

export const LABEL_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6',
  '#a855f7', '#ec4899', '#f43f5e',
];
