// src/app/register/register.component.ts
import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../service/auth.service';
import { HttpClientModule } from '@angular/common/http';
import { MaterialModule } from '../../shared/material/material.module';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, HttpClientModule, MaterialModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage = signal<string>('');
  isSubmitting = signal<boolean>(false);

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.registerForm = new FormGroup({
      name: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required),
      role: new FormControl('', Validators.required)
    });
  }

  onSubmitRegister() {
    if (this.registerForm.valid) {
      this.isSubmitting.set(true);
      // ה-AuthService מטפל כעת גם בשליפת השם לאחר הרישום
      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          // התגובה כאן היא מ-fetchUserName (או AuthResponse אם fetchUserName נכשל)
          // אך ה-signals כבר עודכנו ב-AuthService
          console.log('הרשמה הצליחה, פרטים נשמרו בסרביס.');
          this.router.navigate(['/courses']); // ניווט לדף הקורסים
        },
        error: (error) => {
          this.isSubmitting.set(false);
          console.error('שגיאה בהרשמה:', error);
          this.errorMessage.set('שגיאה בהרשמה. אנא נסה שוב.');
          if (error?.error?.message) {
            this.errorMessage.update( error.error.message);
          }
        }
      });
    } else {
      this.errorMessage.set('אנא מלא את כל השדות כנדרש.');
    }
  }
}