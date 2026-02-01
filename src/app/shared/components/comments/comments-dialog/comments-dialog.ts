import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { Task } from '../../../../core/models/task.interface';
import { CommentsList } from '../comments-list/comments-list';

@Component({
  selector: 'app-comments-dialog',
  standalone: true,
  imports: [CommonModule, CommentsList],
  templateUrl: './comments-dialog.html',
  styleUrl: './comments-dialog.css',
})
export class CommentsDialog {
  task = input.required<Task>();
  
   close = output<void>();

  onClose(): void {
    this.close.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('dialog-overlay')) {
      this.onClose();
    }
  }
}
