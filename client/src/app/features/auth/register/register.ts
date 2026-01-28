import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private router = inject(Router);

  registerForm = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(){
    if (this.registerForm.invalid) {
      return;
    }
    const { name, email, password } = this.registerForm.value;
    if(!name || !email || !password) return;
    this.auth.register({ name, email, password }).subscribe({
      next: () => {
        console.log('Registration successful');
        this.router.navigate(['/teams']);
      },
      error: (err) => {
        console.error('error:', err);
        alert('Registration failed. Please try again.');
      }
    });
  }
}
