import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../service/auth.service';
import { HttpClientModule } from '@angular/common/http';
import { MaterialModule } from '../../shared/material/material.module';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, HttpClientModule, MaterialModule],
  templateUrl: './login.component.html',   styleUrl: './login.component.scss'    })
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage = signal<string>('');   isSubmitting = signal<boolean>(false);

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required)
    });
  }

  onSubmitLogin(): void {

    this.errorMessage.set('');
    this.isSubmitting.set(true); 
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          this.router.navigate(['/courses']);
        },
        error: (err: Error) => {        
             this.isSubmitting.set(false);  
                   console.error('שגיאה בהתחברות בקומפוננטה:', err.message); 
          this.errorMessage.set(err.message); 
        }
      });
    } else {
      this.isSubmitting.set(false);       this.errorMessage.set('אנא מלא את כל השדות כנדרש.');
      this.loginForm.markAllAsTouched();     }
  }
}