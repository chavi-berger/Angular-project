import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateProjectDto, Project, UpdateProjectDto } from '../models/project.interface';

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
  getProjects(teamId?: number): Observable<Project[]> {
    let params = new HttpParams();
    if(teamId) 
      params = params.set('teamId', teamId.toString());
    return this.http.get<Project[]>(this.apiUrl,{params});
  }

  getProject(projectId: number): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${projectId}`);
  }

  createProject(projectData: CreateProjectDto): Observable<Project> {
    return this.http.post<Project>(this.apiUrl,projectData).pipe(
      tap((newProject)=>{
        const currentProjects = this.projectsSubject.value;
        this.projectsSubject.next([...currentProjects, newProject]);
      })
    );
  }

  updateProject(projectId: number, updates: UpdateProjectDto): Observable<Project> {
    return this.http.patch<Project>(`${this.apiUrl}/${projectId}`, updates);
  }

  deleteProject(projectId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${projectId}`);
  }
}
