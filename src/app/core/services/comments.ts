import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { CreateCommentDto, TaskComment } from '../models/task.interface';

@Injectable({
  providedIn: 'root',
})
export class Comments {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/comments`;

  getComments(taskId: number): Observable<TaskComment[]> {
    const params = new HttpParams().set('taskId', taskId.toString());
    return this.http.get<TaskComment[]>(this.apiUrl, { params });
  }

  createComment(commentData: CreateCommentDto): Observable<TaskComment> {
    return this.http.post<TaskComment>(this.apiUrl, commentData);
  }

  deleteComment(commentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${commentId}`);
  }
}
