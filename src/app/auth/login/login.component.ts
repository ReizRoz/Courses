import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../service/auth.service' // ייבוא השירות 
import { HttpClientModule } from '@angular/common/http';  

@Component({
selector: 'app-login',
standalone: true,
imports: [CommonModule, RouterLink, ReactiveFormsModule,HttpClientModule],
templateUrl: './login.component.html',
styleUrl: './login.component.scss'
})
export class LoginComponent {
loginForm: FormGroup;
errorMessage=signal<string>('')  
isSubmitting = signal<boolean>(false);

constructor(
private router: Router,
private authService: AuthService // הזרקת השירות
) {
this.loginForm = new FormGroup({
email: new FormControl('', [Validators.required, Validators.email]),
password: new FormControl('', Validators.required)
});
}   

onSubmitLogin():void {
if (this.loginForm.valid) {
  this.isSubmitting.set(true);
this.authService.login(this.loginForm.value).subscribe({//תאזין למה שחוזר מהסרביס ששלחתי לו את הפרטים של הטופס?
next: (response) => {//מה זה נNEXT המהרה על משתנה או מילה שמורה
  this.isSubmitting.set(false);
console.log('התחברות הצליחה:', response);
localStorage.setItem('token', response.token);
localStorage.setItem('userId', response.userId.toString());
localStorage.setItem('role', response.role);
this.router.navigate(['/courses']);
},
error: (error) => {
  this.isSubmitting.set(false);
console.error('שגיאה בהתחברות:', error);
this.errorMessage.set('שם המשתמש או הסיסמה שגויים.') // הצג הודעת שגיאה
}
});
} else {
this.errorMessage.set('אנא מלא את כל השדות כנדרש.');
}
}
}