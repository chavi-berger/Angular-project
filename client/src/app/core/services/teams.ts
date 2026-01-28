import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Team } from '../models/user.interface';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Teams {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/teams`;

  getTeams():Observable<Team[]> {
    return this.http.get<Team[]>(this.apiUrl);
  }

  createTeam(name: string): Observable<Team> {
    return this.http.post<Team>(this.apiUrl, { name });
  }
}
