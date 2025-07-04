// src/app/auth/login/login.component.ts
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
  templateUrl: './login.component.html', // ודא שנתיב ה-HTML נכון
  styleUrl: './login.component.scss'    // ודא שנתיב ה-SCSS נכון
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage = signal<string>(''); // ודא שזה מוגדר כסיגנל עם ערך התחלתי ריק
  isSubmitting = signal<boolean>(false);

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
    // *** חשוב לאפס את הודעת השגיאה לפני כל ניסיון שליחה חדש ***
    this.errorMessage.set('');
    this.isSubmitting.set(true); // סמן כטוען בתחילת התהליך

    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          console.log('התחברות הצליחה:', response);
          this.router.navigate(['/courses']);
        },
        error: (err: Error) => { // ודא שאתה מקבל err: Error כאן
          this.isSubmitting.set(false); // הפסק לטעון גם בשגיאה
          console.error('שגיאה בהתחברות בקומפוננטה:', err.message); // זה מודפס אצלך לקונסולה, מעולה!
          // *** ודא ששורה זו קיימת ומציבה את ההודעה לסיגנל ***
          this.errorMessage.set(err.message); 
          console.log('Current error message signal:', this.errorMessage()); // הוסף כדי לוודא שהסיגנל מתעדכן
        }
      });
    } else {
      this.isSubmitting.set(false); // אם הטופס לא ולידי, הפסק לטעון
      this.errorMessage.set('אנא מלא את כל השדות כנדרש.');
      this.loginForm.markAllAsTouched(); // סמן שדות כ-touched להצגת שגיאות ולידציה מקומית
      console.log('Current error message signal (form invalid):', this.errorMessage());
    }
  }
}