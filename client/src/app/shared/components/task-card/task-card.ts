import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, } from '@angular/core';
import { Task, TaskPriority, TaskStatus } from '../../../core/models/task.interface';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-card.html',
  styleUrl: './task-card.css',
})
export class TaskCard {
  @Input({ required: true }) task!: Task;
  @Output() edit = new EventEmitter<Task>();
  @Output() delete = new EventEmitter<number>();

  getPriorityClass(): string {
    switch (this.task.priority) {
      case TaskPriority.HIGH:
        return 'priority-high';
      case TaskPriority.NORMAL:
        return 'priority-normal';
      case TaskPriority.LOW:
        return 'priority-low';
      default:
        return 'priority-low';
    }
  }

  getPriorityText(): string {
    switch (this.task.priority) {
      case TaskPriority.HIGH:
        return 'דחוף';
      case TaskPriority.NORMAL:
        return 'בינוני';
      case TaskPriority.LOW:
        return 'נמוך';
      default:
        return 'בינוני';
    }
  }

  onEdit() {
    this.edit.emit(this.task);
  }

  onDelete(): void {
    this.delete.emit(this.task._id);
  }

  hasDueDate(): boolean {
    return !!this.task.dueDate;
  }

  getFormattedDueDate(): string {
    if (!this.task.dueDate) return '';
    const date = new Date(this.task.dueDate);
    return date.toLocaleDateString('he-IL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  isOverdue(): boolean {
    if (!this.task.dueDate) return false;
    const dueDate = new Date(this.task.dueDate);
    const now = new Date();
    return dueDate < now && this.task.status !== TaskStatus.DONE;
  }
}
