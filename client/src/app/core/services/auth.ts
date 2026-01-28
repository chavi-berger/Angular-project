import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../models/user.interface';
import { LoginRequest, LoginResponse, RegisterRequest } from '../models/auth.interface';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);
  private router = inject(Router);

  private apiUrl = `${environment.apiUrl}/api/auth`;

  currentUser = signal<User | null>(null);
  login(credentials: LoginRequest) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        localStorage.setItem('token', response.token);
        if (response.user) {
          this.currentUser.set(response.user);
        }
      })
    )
  }
  logout() {
    localStorage.removeItem('token');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }
  register(userData: RegisterRequest) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap((response) => {
        localStorage.setItem('token', response.token);
        if (response.user) {
          this.currentUser.set(response.user);
        }
      })
    )
  }
}
