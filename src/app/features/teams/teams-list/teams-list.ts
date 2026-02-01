import { Component, inject, OnInit, signal } from '@angular/core';
import { Teams } from '../../../core/services/teams';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TeamMembersDialog } from '../team-members-dialog/team-members-dialog';
import { Team } from '../../../core/models/team.interface';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-teams-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TeamMembersDialog],
  templateUrl: './teams-list.html',
  styleUrl: './teams-list.css',
})
export class TeamsList implements OnInit {
  private teamsService = inject(Teams);
  private router = inject(Router);

  teams = signal<Team[]>([]);
  isLoading = signal(false);
  showMembersDialog = signal(false);
  selectedTeam = signal<Team | null>(null);

  // משתנים חדשים לדיאלוג המעוצב
  showDeleteConfirm = signal(false);
  teamToDelete = signal<{ id: number, name: string } | null>(null);

  teamNameControl = new FormControl('', Validators.required);

  ngOnInit() {
    this.loadTeams();
  }

  loadTeams() {
    this.isLoading.set(true);
    this.teamsService.getTeams().subscribe({
      next: (teams) => {
        this.teams.set(teams);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error(' שגיאה בטעינת צוותים:', error);
        this.isLoading.set(false);
      }
    });
  }

  createTeam() {
    const teamName = this.teamNameControl.value?.trim();
    if (!teamName) return;

    this.teamsService.createTeam({ name: teamName }).subscribe({
      next: () => {
        this.teamNameControl.reset();
        this.loadTeams();
      },
      error: (error) => {
        console.error(' שגיאה ביצירת צוות:', error);
        alert('שגיאה ביצירת הצוות: ' + (error.error?.message || 'נסה שוב'));
      }
    });
  }

  // שלב 1: במקום confirm של הדפדפן, פותחים את הדיאלוג המעוצב
  deleteTeam(teamId: number, teamName: string, event: Event) {
    event.stopPropagation();
    // שומרים את נתוני הצוות שרוצים למחוק ופותחים את הדיאלוג
    this.teamToDelete.set({ id: teamId, name: teamName });
    this.showDeleteConfirm.set(true);
  }

  // שלב 2: פונקציה שמבצעת את הלוגיקה המקורית שלך אחרי אישור המשתמש
  onConfirmDelete() {
    const team = this.teamToDelete();
    if (!team) return;

    this.teamsService.deleteTeam(team.id).subscribe({
      next: () => {
        // הלוגיקה המקורית שלך נשמרת כאן
        this.showDeleteConfirm.set(false);
        this.teamToDelete.set(null);
        this.loadTeams();
      },
      error: (error) => {
        console.error('שגיאה במחיקת צוות:', error);
        alert('שגיאה במחיקת הצוות: ' + (error.error?.message || 'נסה שוב'));
        this.showDeleteConfirm.set(false);
      }
    });
  }

  // ביטול המחיקה
  onCancelDelete() {
    this.showDeleteConfirm.set(false);
    this.teamToDelete.set(null);
  }

  manageMembers(team: Team, event: Event) {
    event.stopPropagation();
    this.selectedTeam.set(team);
    this.showMembersDialog.set(true);
  }

  closeMembersDialog() {
    this.showMembersDialog.set(false);
    this.selectedTeam.set(null);
    this.loadTeams();
  }

  viewProjects(teamId: number) {
    this.router.navigate(['/teams', teamId, 'projects']);
  }
}