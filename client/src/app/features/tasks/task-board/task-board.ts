import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { TaskService } from '../../../core/services/task';
import { ActivatedRoute } from '@angular/router';
import { Task, TaskColumn, TaskStatus } from '../../../core/models/task.interface';
import { TaskCard } from '../../../shared/components/task-card/task-card';

@Component({
  selector: 'app-task-board',
  standalone: true,
  imports: [CommonModule, DragDropModule,TaskCard],
  templateUrl: './task-board.html',
  styleUrl: './task-board.css',
})
export class TaskBoard implements OnInit {
  private taskService = inject(TaskService)
  private route = inject(ActivatedRoute)

  projectId = signal<string | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  columns = signal<TaskColumn[]>([
    { status: TaskStatus.TODO, title: 'תור המשימות', tasks: [] },
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
    const movedTask = event.container.data[event.currentIndex];
    const newStatus = this.getColumnStatus(event.container.data);

    if (newStatus && movedTask.status !== newStatus) {
      this.updateTaskStatus(movedTask._id, newStatus);
    };
  }

  private getColumnStatus(tasks: Task[]): TaskStatus | null {
    const column=this.columns().find(col => col.tasks === tasks);
    return column ? column.status : null;
  }

  private updateTaskStatus(taskId: number, newStatus: TaskStatus): void {
    this.taskService.updateTask(taskId, {status: newStatus}).subscribe({
      next: () => {
        console.log('Task status updated successfully.');
      },
      error: (error) => {
        console.error('Error updating task status:', error);
        this.loadTasks();
      }
    });
  }

  onDeleteTask(taskId: number): void {
    if(!confirm('Are you sure you want to delete this task?')) return;
    this.taskService.deleteTask(taskId).subscribe({
      next: () => {
        console.log('Task deleted successfully.');
        this.loadTasks();
      },
      error: (error) => {
        console.error('Error deleting task:', error);
        alert('Failed to delete task. Please try again.');
      }
    });
  }

  onEditTask(task: Task):void {
    console.log('Edit task:', task);
  }

  onAddTask(): void {
    console.log('Add task');
  }
}