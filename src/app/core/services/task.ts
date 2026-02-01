import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Task, CreateTaskDto, UpdateTaskDto, CreateCommentDto} from '../models/task.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TaskService{
  private http = inject(HttpClient);
  private taskUrl = `${environment.apiUrl}/api/tasks`;
  private commentsUrl = `${environment.apiUrl}/api/comments`;
  getTasks(projectId?: string): Observable<Task[]> {
    let params = new HttpParams();
    if (projectId) {
      params = params.set('projectId', projectId);
    }
    return this.http.get<Task[]>(this.taskUrl, { params });
  }

  createTask(taskData: CreateTaskDto): Observable<Task> {
    return this.http.post<Task>(this.taskUrl, taskData);
  }

  updateTask(taskId: number, updates: UpdateTaskDto): Observable<Task> {
    return this.http.patch<Task>(`${this.taskUrl}/${taskId}`, updates);
  }

  deleteTask(taskId: number): Observable<void> {
    return this.http.delete<void>(`${this.taskUrl}/${taskId}`);
  }

  getComments(taskId: number): Observable<Comment[]> {
    const params = new HttpParams().set('taskId', taskId);
    return this.http.get<Comment[]>(this.commentsUrl, { params });
  }

  createComment(commentData: CreateCommentDto): Observable<Comment> {
    return this.http.post<Comment>(this.commentsUrl, commentData);
  }
}