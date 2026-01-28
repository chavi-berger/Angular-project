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
    _id: number;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    projectId: string;
    assigneeId?: string;
    dueDate?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTaskDto {
    title: string;
    projectId: string;
    description?: string;
    priority?: TaskPriority;
    status?: TaskStatus;
    assigneeId?: string;
    dueDate?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedTo?: string;
  dueDate?: string;
}

export interface Comment{
    id: number;
    taskId: number;
    userId: number;
    content: string;
    createdAt: string;
    userName?: string;
}

export interface CreateCommentDto{
    taskId: number;
    content: string;
}

export interface TaskColumn{
    status: TaskStatus;
    title: string;
    tasks: Task[];
}