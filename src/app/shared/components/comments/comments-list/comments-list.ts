import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Comments } from '../../../../core/services/comments';
import { TaskComment } from '../../../../core/models/task.interface';
import { AuthService } from '../../../../core/services/auth';
import { User } from '../../../../core/models/team.interface';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-comments-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './comments-list.html',
  styleUrl: './comments-list.css',
})
export class CommentsList implements OnInit {
  authService = inject(AuthService);
  private commentsService = inject(Comments);
  private http = inject(HttpClient);

  taskId = input.required<number>();
  allUsersI = input<User[]>([]);
  commentsI = input<TaskComment[]>([]);

  allUsers = signal<User[]>([]);
  comments = signal<TaskComment[]>([]);
  isLoading = signal(false);
  isSubmitting = signal(false);
  error = signal<string | null>(null);
  localComments = signal<TaskComment[]>([]);
  currentUserId = signal<number | null>(null);

  commentControl = new FormControl('', [Validators.required, Validators.minLength(1)]);

  constructor() {
    effect(() => {
      const incomingUsers = this.allUsersI();
      this.allUsers.set(incomingUsers);
    }, { allowSignalWrites: true });

    effect(() => {
      if (this.commentsI().length > 0) {
        this.comments.set(this.commentsI());
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    if (this.allUsers().length === 0) {
      this.loadTeamMembers();
    }

    if (this.comments().length === 0) {
      this.loadComments();
    }

    this.authService.getCurrentUser().subscribe(user => {
    if (user && user.id) {
      this.currentUserId.set(Number(user.id));
    }
  });
  }

  loadTeamMembers(): void {
    const apiUrl = `${environment.apiUrl}/api/users`;

    this.http.get<User[]>(apiUrl).subscribe({
      next: (users) => {
        this.allUsers.set(users);
      },
      error: (err) => {
        console.error('לא הצלחתי למשוך את רשימת הצוות:', err);
      }
    });
  }

  loadComments(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.commentsService.getComments(this.taskId()).subscribe({
      next: (comments) => {
        this.comments.set(comments);
        this.isLoading.set(false);
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (error) => {
        this.error.set('שגיאה בטעינת התגובות');
        this.isLoading.set(false);
      }
    });
  }

  onSubmitComment(): void {
    if (this.commentControl.invalid || this.isSubmitting()) return;

    const content = this.commentControl.value?.trim();
    if (!content) return;

    this.isSubmitting.set(true);

    this.commentsService.createComment({
      taskId: this.taskId(),
      body: content
    }).subscribe({
      next: (newComment) => {
        this.comments.update(comments => [...comments, newComment]);
        this.commentControl.reset();
        this.isSubmitting.set(false);
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (error) => {
        alert('שגיאה בהוספת התגובה');
        this.isSubmitting.set(false);
      }
    });
  }

  isOwnComment(commentUserId: any): boolean {
  const currentId = this.currentUserId();
  if (!currentId) return false;
  return Number(commentUserId) === currentId;
}

  private scrollToBottom(): void {
    const container = document.querySelector('.comments-list-scroll');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('he-IL', {
      day: '2-digit', month: '2-digit', year: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.ctrlKey && event.key === 'Enter') {
      this.onSubmitComment();
    }
  }

  getAuthorName(userId: number): string {
    const users = this.allUsers();
    const user = users.find(u => Number(u.id) === Number(userId));

    if (user) {
      return user.name || user.email || 'משתמש ללא שם';
    }
    return `משתמש ${userId}`;
  }

  getLocalDate(dateString: string): Date {
    const date = new Date(dateString);
    if (!dateString.includes('Z') && !dateString.includes('+')) {
      return new Date(dateString + 'Z');
    }
    return date;
  }
}