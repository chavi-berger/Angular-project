export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done'
}

export enum TaskPriority {
    LOW = 'low',
    NORMAL = 'normal',
    HIGH = 'high'
}

export interface Task {
  id: number;
  project_id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id?: number | null;
  due_date?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskDto {
  title: string;
  project_id: number;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  assignee_id?: number;
  due_date?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee_id?: number;
  due_date?: string;
}

export interface TaskComment {
  id: number;
  taskId: number;
  user_id: number;
  body: string;
  created_at: string;
  user?: string;
  userName?: string;
  user_name?: string;
  email?: string;
  user_email?: string;
}

export interface CreateCommentDto {
  taskId: number;
  body: string;
}

export interface TaskColumn{
    status: TaskStatus;
    title: string;
    tasks: Task[];
}

export interface CreateCommentDto {
  taskId: number;
  body: string;
}