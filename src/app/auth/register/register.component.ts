import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../service/auth.service'; // ייבוא השירות   
import { HttpClientModule } from '@angular/common/http';
import { MaterialModule } from '../../shared/material/material.module';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule,HttpClientModule,MaterialModule],
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
          role: new FormControl('', Validators.required)
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
