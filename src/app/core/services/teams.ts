import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AddMemberDto, CreateTeamDto, Team, TeamMember } from '../models/team.interface';

@Injectable({
  providedIn: 'root',
})
export class Teams {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/teams`;

  getTeams():Observable<Team[]> {
    return this.http.get<Team[]>(this.apiUrl);
  }

  createTeam(teamData: CreateTeamDto): Observable<Team> {
    return this.http.post<Team>(this.apiUrl,teamData);
  }

  deleteTeam(teamId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${teamId}`);
  }

  getTeamMembers(teamId: number): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>(`${this.apiUrl}/${teamId}/members`);
  }

  addMember(teamId: number, memberData: { userId: number; role?: string }): Observable<TeamMember> {
    return this.http.post<TeamMember>(`${this.apiUrl}/${teamId}/members`, memberData);
  }

  removeMember(teamId: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${teamId}/members/${userId}`);
  }
}
