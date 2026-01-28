import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { authGuard } from './core/guards/auth-guard';
import { TeamsList } from './features/teams/teams-list/teams-list';


export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: Login },
    { path: 'register', component: Register },
    {
        path: 'teams', canActivate: [authGuard], children: [
            { path: '', loadComponent: () => import('./features/teams/teams-list/teams-list').then(m => m.TeamsList) },
            { path: ':teamId/projects', loadComponent: () => import('./features/projects/projects-list/projects-list').then(m => m.ProjectsList) },
        ]
    },
    { path: 'projects/:projectId/tasks', canActivate: [authGuard], loadComponent: () => import('./features/tasks/task-board/task-board').then(m => m.TaskBoard) },
    { path: '**', redirectTo: '/login' }
];
