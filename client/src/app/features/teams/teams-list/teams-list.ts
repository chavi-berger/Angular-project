import { Component, inject } from '@angular/core';
import { Teams } from '../../../core/services/teams';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-teams-list',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule, RouterLink],
  templateUrl: './teams-list.html',
  styleUrl: './teams-list.css',
})
export class TeamsList {
  private teamsService = inject(Teams);
  private fb = inject(FormBuilder);

  teamsSignal = toSignal(this.teamsService.getTeams(), { initialValue: [] });
  teamNameControl = this.fb.control('', Validators.required);

  createTeam() {
    if (this.teamNameControl.valid) {
      const name = this.teamNameControl.value;
      if (!name) return;
      this.teamsService.createTeam(name).subscribe({
        next: () => {
          alert('Team created successfully');
          this.teamNameControl.reset();
          window.location.reload();
        },
        error: (err) => {
          console.error('error:', err);
          alert('Team creation failed. Please try again.');
        }
      });
    }
  }
}
