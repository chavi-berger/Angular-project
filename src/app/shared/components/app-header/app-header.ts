import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './app-header.html',
  styleUrl: './app-header.css',
})
export class AppHeader implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  userName = signal<string>('');
  isLoggingIn = signal(false);

  ngOnInit() {
    this.authService.isLoggedIn$.subscribe(loggedIn => {
      this.isLoggingIn.set(loggedIn);
      if (loggedIn) {
        const savedName = localStorage.getItem('userName');
        this.userName.set(savedName || 'User');
      }
    });
    
    if (isPlatformBrowser(this.platformId)) {
      const token = this.authService.getToken();
      this.isLoggingIn.set(!!token);

      const savedUserName = localStorage.getItem('userName');
      if (savedUserName) {
        this.userName.set(savedUserName);
      } else {
        this.userName.set('User');
      }
    }
  }
  onLogout() { 
      this.authService.logout();
      this.isLoggingIn.set(false);
      this.router.navigate(['/login']);   
  }
}
