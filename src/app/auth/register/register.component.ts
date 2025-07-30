import { Component, OnInit, signal, computed, effect } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, UserDetailsResponse } from '../../service/auth.service';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { MaterialModule } from '../../shared/material/material.module';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, HttpClientModule, MaterialModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  errorMessage = signal<string>('');
  isSubmitting = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  pageTitle = computed(() => this.isEditMode() ? 'עריכת פרופיל' : 'הרשמה');
  submitButtonText = computed(() => this.isEditMode() ? 'שמור שינויים' : 'הרשמה');
  
  private currentUserIdForEdit: number | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = new FormGroup({
      name: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl(''), 
      role: new FormControl({ value: '', disabled: this.isEditMode() }, Validators.required)
    });

    effect(() => {
      const passwordControl = this.registerForm.get('password');
      const roleControl = this.registerForm.get('role');
      if (this.isEditMode()) {
        passwordControl?.clearValidators();
        passwordControl?.updateValueAndValidity();         roleControl?.disable();
      } else {
        passwordControl?.setValidators(Validators.required);
        passwordControl?.updateValueAndValidity();         roleControl?.enable();
      }

    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['mode'] === 'edit') {
        this.isEditMode.set(true);
        this.loadUserDetailsForEdit();
      } else {
        this.isEditMode.set(false);
        this.registerForm.reset({ role: '' }); 
      }
    });
  }

  loadUserDetailsForEdit(): void {
    const currentUser = this.authService.currentUserDetails();
  

    if (currentUser) {
    } else {
      console.warn('RegisterComponent: currentUserDetails is null or undefined.');
    }
  
    if (currentUser && currentUser.id) {       this.currentUserIdForEdit = currentUser.id;       this.registerForm.patchValue({
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role
      });
      this.registerForm.get('password')?.setValue('');
    } else {
      console.error('RegisterComponent: Failed to load user details for edit. currentUser or id is missing or invalid. Navigating to /courses.');
      this.errorMessage.set('לא ניתן לטעון את פרטי המשתמש לעריכה.');
      this.snackBar.open('שגיאה בטעינת פרטי המשתמש. נסה שוב.', 'סגור', { duration: 5000 });
      this.router.navigate(['/courses']);
    }
  }

  onSubmitForm() {
    if (this.registerForm.invalid) {
      this.errorMessage.set('אנא מלא את כל השדות הנדרשים כראוי.');
      this.registerForm.markAllAsTouched();       return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(''); 

    const formData = this.registerForm.getRawValue();
    

    if (this.isEditMode() && (!formData.password || formData.password.trim() === '')) {
      delete formData.password;
    }

    if (this.isEditMode()) {
      if (!this.currentUserIdForEdit) {
        this.errorMessage.set('שגיאה: מזהה משתמש לעריכה אינו זמין.');
        this.snackBar.open('שגיאה קריטית: לא ניתן לעדכן פרופיל ללא מזהה משתמש.', 'סגור', { duration: 5000 });
        this.isSubmitting.set(false);
        return;
      }
      const updateData = { ...formData };

      delete updateData.role; 


this.authService.updateUser(String(this.currentUserIdForEdit), updateData).subscribe({
              next: () => {
          this.isSubmitting.set(false);

          this.snackBar.open('הפרופיל עודכן בהצלחה!', 'סגור', { duration: 3000 });
          this.router.navigate(['/courses']);
        },
        error: (err: any) => {
          this.isSubmitting.set(false);
          let specificMessage = 'שגיאה בעדכון הפרופיל. אנא נסה שוב.';
          if (err instanceof HttpErrorResponse && err.error && typeof err.error.message === 'string') {
            specificMessage = err.error.message;
          } else if (typeof err.message === 'string') {
            specificMessage = err.message;
          }
          this.errorMessage.set(specificMessage); 

          console.error('RegisterComponent: Error updating profile:', err);
        }
      });
    } else {       this.authService.register(formData).subscribe({
        next: (response) => {
          this.isSubmitting.set(false);

          this.snackBar.open('ההרשמה הצליחה! ברוך הבא.', 'סגור', { duration: 3000 });
          this.router.navigate(['/courses']);
        },
        error: (err: any) => {
          this.isSubmitting.set(false);
          let specificMessage = 'אירעה שגיאה בתהליך ההרשמה. אנא נסה שוב מאוחר יותר.';
  
          if (err instanceof HttpErrorResponse) {
            console.error('RegisterComponent: Registration HTTP Error:', err);
            if (err.status === 500) {
              specificMessage = 'אירעה שגיאה בשרת. ייתכן שהאימייל או שם המשתמש כבר רשומים במערכת. אנא נסה פרטים אחרים או הכנס כמשתמש רשום.';
            } else if (err.error && typeof err.error.message === 'string') {
              specificMessage = err.error.message;
            } else if (typeof err.message === 'string') {
              specificMessage = err.message;
            }
          } else {
            console.error('RegisterComponent: Registration Non-HTTP Error:', err);
            if (typeof err.message === 'string') {
              specificMessage = err.message;
            }
          }
  
          this.errorMessage.set(specificMessage);         }
      });
    }
  }
}