import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { TaskService } from '../../../core/services/task';
import { ActivatedRoute } from '@angular/router';
import { Task, TaskColumn, TaskStatus } from '../../../core/models/task.interface';
import { TaskCard } from '../../../shared/components/task-card/task-card';
import { TaskDialog } from '../task-dialog/task-dialog';
import { CommentsDialog } from '../../../shared/components/comments/comments-dialog/comments-dialog';

@Component({
  selector: 'app-task-board',
  standalone: true,
  imports: [CommonModule, DragDropModule, TaskCard, TaskDialog, CommentsDialog],
  templateUrl: './task-board.html',
  styleUrl: './task-board.css',
})
export class TaskBoard implements OnInit {
  private taskService = inject(TaskService);
  private route = inject(ActivatedRoute);

  projectId = signal<string | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  showDialog = signal(false);
  showCommentsDialog = signal(false);
  selectedTaskForComments = signal<Task | null>(null);
  editingTask = signal<Task | null>(null);
  showDeleteConfirm = signal(false);
  taskIdToDelete = signal<number | null>(null);

  columns = signal<TaskColumn[]>([
    { status: TaskStatus.TODO, title: 'מחכה לביצוע', tasks: [] },
    { status: TaskStatus.IN_PROGRESS, title: 'בתהליך', tasks: [] },
    { status: TaskStatus.DONE, title: 'הושלם', tasks: [] },
  ]);

  ngOnInit(): void {
    const projectIdFromRoute = this.route.snapshot.paramMap.get('projectId');
    if (projectIdFromRoute) {
      this.projectId.set(projectIdFromRoute);
      this.loadTasks();
    } else {
      this.error.set('Project ID not found in route params.');
    }
  }

  loadTasks(): void {
    const projectId = this.projectId();
    if (!projectId) return;
    this.isLoading.set(true);
    this.error.set(null);
    this.taskService.getTasks(projectId).subscribe({
      next: (tasks: Task[]) => {
        this.organizeTasks(tasks);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('error in loadin tasks:', error);
        this.error.set('Failed to load tasks. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  private organizeTasks(tasks: Task[]): void {
    const currentColumns = this.columns();
    const newColumns: TaskColumn[] = currentColumns.map((col) => ({
      ...col, tasks: []
    }));
    tasks.forEach(task => {
      const column = newColumns.find(col => col.status === task.status);
      if (column) {
        column.tasks.push(task);
      }
    });
    this.columns.set(newColumns);
  }

  onTaskDrop(event: CdkDragDrop<Task[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    const newStatus = event.container.id as TaskStatus;
    const movedTask = event.container.data[event.currentIndex];

    if (newStatus && movedTask.status !== newStatus) {
      this.updateTaskStatus(movedTask.id, newStatus);
    };
  }

  // private getColumnStatus(tasks: Task[]): TaskStatus | null {
  //   const column = this.columns().find(col => col.tasks === tasks);
  //   return column ? column.status : null;
  // }

  private updateTaskStatus(taskId: number, newStatus: TaskStatus): void {
    this.taskService.updateTask(taskId, { status: newStatus }).subscribe({
      next: () => {

      },
      error: (error) => {
        console.error('Error updating task status:', error);
        this.loadTasks();
      }
    });
  }

  onDeleteTask(taskId: number): void {
  this.taskIdToDelete.set(taskId);
  this.showDeleteConfirm.set(true);
}

onConfirmDeleteTask(): void {
  const taskId = this.taskIdToDelete();
  if (!taskId) return;

  this.taskService.deleteTask(taskId).subscribe({
    next: () => {
      this.loadTasks();
      this.onCancelDeleteTask();
    },
    error: (error) => {
      console.error('Error deleting task:', error);
      this.onCancelDeleteTask();
    }
  });
}

onCancelDeleteTask(): void {
  this.showDeleteConfirm.set(false);
  this.taskIdToDelete.set(null);
}

  onEditTask(task: Task): void {
    this.editingTask.set(task);
    this.showDialog.set(true);
  }

  onAddTask(): void {
    this.editingTask.set(null);
    this.showDialog.set(true);
  }

  onSaveTask(taskData: any): void {
    const projectId = this.projectId();
    if (!projectId) return;
    const editingTask = this.editingTask();
    if (editingTask) {
      const taskId = editingTask.id;

      this.taskService.updateTask(taskId, taskData).subscribe({
        next: () => {

          this.showDialog.set(false);
          this.editingTask.set(null);
          this.loadTasks();
        },
        error: (error) => {
          console.error('Error updating task:', error);
          alert('Failed to update task. Please try again.');
        }
      });
    } else {
      const serverTaskData = { ...taskData, project_id: Number(projectId) };
      this.taskService.createTask(taskData).subscribe({
        next: () => {

          this.showDialog.set(false);
          this.loadTasks();
        },
        error: (error) => {
          console.error('Error creating task:', error);
          alert('Failed to create task. Please try again.');
        }
      });
    }
  }

  onCancelDialog(): void {
    this.showDialog.set(false);
    this.editingTask.set(null);
  }

  onViewComments(task: Task): void {

    this.selectedTaskForComments.set(task);
    this.showCommentsDialog.set(true);
  }

  onCloseCommentsDialog(): void {
    this.showCommentsDialog.set(false);
    this.selectedTaskForComments.set(null);
  }
}