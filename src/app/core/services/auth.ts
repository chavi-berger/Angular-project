import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.interface';

interface LoginResponse {
  token: string;
  user?: {
    id: number;
    email: string;
    name?: string;
  };
}

interface RegisterResponse {
  token: string;
  user?: {
    id: number;
    email: string;
    name?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = `${environment.apiUrl}/api/auth`;
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private hasToken(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return !!localStorage.getItem('token');
    }
    return false;
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('userName', response.user?.name || '');
        this.isLoggedInSubject.next(true);
        if (response.token) {
          this.saveToken(response.token);
          if (response.user?.name) {
            this.saveUserName(response.user.name);
          } else if (response.user?.email) {
            this.saveUserName(response.user.email);
          }
        }
        
      })
    );
  }

  register(userData: { email: string; password: string; name?: string }): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap((response) => {
        if (response.token) {
          this.saveToken(response.token);
          if (response.user?.name) {
            this.saveUserName(response.user.name);
          } else if (response.user?.email) {
            this.saveUserName(response.user.email);
          }
        }
      })
    );
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`);
  }
  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      this.isLoggedInSubject.next(false);
    }
  }

  private saveToken(token: string): void {
    if (this.isBrowser()) {
      localStorage.setItem('token', token);
    }
  }

  getToken(): string | null {
    if (this.isBrowser()) {
      return localStorage.getItem('token');
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private saveUserName(name: string): void {
    if (this.isBrowser()) {
      localStorage.setItem('userName', name);
    }
  }

  getUserName(): string | null {
    if (this.isBrowser()) {
      return localStorage.getItem('userName');
    }
    return null;
  }

  setSession(token: string, userName: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('userName', userName);
    this.isLoggedInSubject.next(true);
  }
}

export type {User, LoginResponse, RegisterResponse };