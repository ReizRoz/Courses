
import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service'; // ייבוא השירות   
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule,HttpClientModule],
        templateUrl: './register.component.html',
styleUrl: './register.component.scss'
})
export class RegisterComponent {
registerForm: FormGroup;
errorMessage=signal<string>('');  
isSubmitting = signal<boolean>(false); 

      constructor(
        private router: Router,
        private authService: AuthService // הזרקת השירות
      ) {
        this.registerForm = new FormGroup({
          name: new FormControl('', Validators.required),
          email: new FormControl('', [Validators.required, Validators.email]),
          password: new FormControl('', Validators.required),
          role: new FormControl('student', Validators.required)
        });
      }

      onSubmitRegister() {
        if (this.registerForm.valid) {
          this.isSubmitting.set(true); 
          this.authService.register(this.registerForm.value).subscribe({
            next: (response) => {
              this.isSubmitting.set(false);
              console.log('הרשמה הצליחה:', response);
              // שמור את הטוקן, userId בסטורג' (ייתכן שתרצה גם לנווט אוטומטית או להציג הודעה)
              localStorage.setItem('token', response.token);
              localStorage.setItem('userId', response.userId.toString());
              this.router.navigate(['/courses']); // נניח שמפנים להתחברות אחרי הרשמה
            },
            error: (error) => {
              this.isSubmitting.set(false); 
              console.error('שגיאה בהרשמה:', error);
              this.errorMessage.set('שגיאה בהרשמה. אנא נסה שוב.'); // הצג הודעת שגיאה כללית
              if (error?.error?.message) {
                this.errorMessage.update( error.error.message)  // נסה להציג הודעה ספציפית מהשרת
              }
            }
          });
        } else {
          this.errorMessage.set('אנא מלא את כל השדות כנדרש.');
        }
      }
    }
/*

**הסבר לשינויים בקומפוננטות:**

  * ייבאנו את `AuthService`.
  * הזרקנו את `AuthService` לקונסטרקטור.
  * בפונקציות `onSubmitLogin()` ו-`onSubmitRegister()`, אנחנו קוראים לפונקציות המתאימות בשירות `AuthService` (`login` ו-`register`) עם נתוני הטופס.
  * אנחנו משתמשים ב-`subscribe` כדי לטפל בתגובה האסינכרונית מהשרת.
  * במקרה של הצלחה (`next`), אנחנו מדפיסים את התגובה לקונסול, שומרים את הטוקן ופרטי המשתמש ב-`localStorage` ומנווטים לעמוד הקורסים (עבור התחברות) או לעמוד ההתחברות (עבור הרשמה).
  * במקרה של שגיאה (`error`), אנחנו מדפיסים את השגיאה לקונסול ומציגים הודעת שגיאה למשתמש.*/