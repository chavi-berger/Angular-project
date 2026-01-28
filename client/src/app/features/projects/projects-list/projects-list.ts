import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Projects } from '../../../core/services/projects';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-projects-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './projects-list.html',
  styleUrl: './projects-list.css',
})
export class ProjectsList {
  private route = inject(ActivatedRoute);
  private projectsService = inject(Projects);
  private fb = inject(FormBuilder);
  private allProjects = toSignal(this.projectsService.getProjects(), { initialValue: [] })
  private params = toSignal(this.route.paramMap);

  projectNameControl = this.fb.control('', Validators.required);

  teamProjects = computed(() => {
    const params = this.params();
    const projects = this.allProjects();
    const currentTeamId = params?.get('teamId');

    if (!currentTeamId || !projects) return [];
    return projects.filter(p => p.teamId == currentTeamId);
  });
  
  currentTeamId = computed(() => this.params()?.get('teamId'));

  createProject() {
    const teamId = this.currentTeamId();
    if (this.projectNameControl.valid && teamId) {
      this.projectsService.createProject(teamId, this.projectNameControl.value!).subscribe(()=>{
        alert('Project created successfully');
        this.projectNameControl.reset();
        //window.location.reload();
      });
    }
  }
}
