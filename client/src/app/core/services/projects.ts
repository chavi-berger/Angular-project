import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Project } from '../models/user.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Projects {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/projects`;
  private projectsSubject = new BehaviorSubject<Project[]>([]);
  public projects$ = this.projectsSubject.asObservable();

  loadProjects(): void {
    this.http.get<Project[]>(this.apiUrl).subscribe( {
      next: (projects) => {
        this.projectsSubject.next(projects);
      },
      error: (error) => {
        console.error('Error loading projects:', error);
      }
    })
  }
  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiUrl);
  }

  createProject(teamId: string, name: string): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, { teamId, name }).pipe(
      tap(()=>{
        this.loadProjects();
      })
    );
  }
}
