import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Projects } from '../../../core/services/projects';
import { toSignal } from '@angular/core/rxjs-interop';
import { CreateProjectDto, Project } from '../../../core/models/project.interface';

@Component({
  selector: 'app-projects-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './projects-list.html',
  styleUrl: './projects-list.css',
})
export class ProjectsList implements OnInit {
  private route = inject(ActivatedRoute);
  private projectsService = inject(Projects);
  private fb = inject(FormBuilder);
  private allProjects = toSignal(this.projectsService.projects$, { initialValue: [] })
  private params = toSignal(this.route.paramMap);

  showEditDialog = signal(false);
  editingProject = signal<Project | null>(null);
  showDeleteConfirm = signal(false);
  projectIdToDelete = signal<number | null>(null);

  projectNameControl = this.fb.control('', Validators.required);
  ngOnInit() {
    this.projectsService.loadProjects();
  }

  teamProjects = computed(() => {
    const params = this.params();
    const projects = this.allProjects();
    const currentTeamId = params?.get('teamId');

    if (!currentTeamId || !projects) return [];
    return projects.filter(p => String(p.team_id) === String(currentTeamId));
  });

  currentTeamId = computed(() => this.params()?.get('teamId'));

  createProject() {
    const teamId = this.currentTeamId();
    if (this.projectNameControl.valid && teamId) {
      const newProjectData: CreateProjectDto = {
        name: this.projectNameControl.value!,
        teamId: Number(teamId)
      };
      this.projectsService.createProject(newProjectData).subscribe({
        next: () => {
          this.projectNameControl.reset();
          this.projectsService.loadProjects();
        },
        error: (err) => console.error(err)
      });
    }
  }

  onEditProject(project: Project): void {
    this.editingProject.set(project);
    this.showEditDialog.set(true);
  }

  onSaveProject(projectData: any): void {
    const projectId = this.editingProject()?.id;
    if (!projectId) return;

    this.projectsService.updateProject(projectId, projectData).subscribe({
      next: () => {

        this.showEditDialog.set(false);
        this.editingProject.set(null);
        this.projectsService.loadProjects();
      },
      error: (error) => {
        console.error('Error updating project:', error);
        alert('שגיאה בעדכון הפרויקט');
      }
    });
  }

  onDeleteProject(projectId: number): void {
  this.projectIdToDelete.set(projectId);
  this.showDeleteConfirm.set(true);
}

onConfirmDelete(): void {
  const projectId = this.projectIdToDelete();
  if (!projectId) return;

  this.projectsService.deleteProject(projectId).subscribe({
    next: () => {
      this.projectsService.loadProjects();
      this.onCancelDelete(); // סגירת המודאל ואיפוס ה-ID
    },
    error: (error) => {
      console.error('Error deleting project:', error);
      this.onCancelDelete();
    }
  });
}

onCancelDelete(): void {
  this.showDeleteConfirm.set(false);
  this.projectIdToDelete.set(null);
}

  onCancelEdit(): void {
    this.showEditDialog.set(false);
    this.editingProject.set(null);
  }
}

