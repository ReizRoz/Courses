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
        passwordControl?.updateValueAndValidity(); // עדכון לאחר הסרת ולידטורים
        roleControl?.disable();
      } else {
        passwordControl?.setValidators(Validators.required);
        passwordControl?.updateValueAndValidity(); // עדכון לאחר הוספת ולידטורים
        roleControl?.enable();
      }
      // אין צורך לקרוא ל-updateValueAndValidity על roleControl כאן כי enable/disable עושים זאת.
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['mode'] === 'edit') {
        this.isEditMode.set(true);
        this.loadUserDetailsForEdit();
      } else {
        this.isEditMode.set(false);
        this.registerForm.reset({ role: '' }); // מאפס את הטופס כולל תפקיד
        // ולידטורים יוחזרו על ידי ה-effect
      }
    });
  }

  loadUserDetailsForEdit(): void {
    console.log('RegisterComponent: Attempting to load user details for edit.');
    const currentUser = this.authService.currentUserDetails();
    console.log('RegisterComponent: currentUserDetails signal value:', currentUser);
  
    // שנה את הלוג כדי שיציג את currentUser.id
    if (currentUser) {
      console.log('RegisterComponent: currentUser.id value:', currentUser.id, 'Type:', typeof currentUser.id); // <--- שינוי כאן
    } else {
      console.warn('RegisterComponent: currentUserDetails is null or undefined.');
    }
  
    if (currentUser && currentUser.id) { // <--- שינוי כאן: מ-_id ל-id
      console.log('RegisterComponent: User details found. Populating form.');
      this.currentUserIdForEdit = currentUser.id; // <--- שינוי כאן: מ-_id ל-id
      this.registerForm.patchValue({
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
      this.registerForm.markAllAsTouched(); // סמן את כל השדות כדי להציג שגיאות ולידציה
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(''); 

    const formData = this.registerForm.getRawValue();
    
    // במצב עריכה, אם הסיסמה ריקה, אל תשלח אותה לשרת
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
      // אין צורך לשלוח את התפקיד בעריכה אם הוא מושבת
      delete updateData.role; 

      // נמיר את ה-ID למחרוזת לפני השליחה למתודת updateUser
this.authService.updateUser(String(this.currentUserIdForEdit), updateData).subscribe({
              next: () => {
          this.isSubmitting.set(false);
          // השאר את ה-SnackBar להודעת הצלחה, זה הגיוני
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
          this.errorMessage.set(specificMessage); // הצג את השגיאה בתוך הקומפוננטה
          // הסר את שורת ה-SnackBar כאן, כדי למנוע כפילות.
          // this.snackBar.open(specificMessage, 'סגור', { duration: 5000 }); // שורה זו תוסר
          console.error('RegisterComponent: Error updating profile:', err);
        }
      });
    } else { // מצב הרשמה
      this.authService.register(formData).subscribe({
        next: (response) => {
          console.log('RegisterComponent: Registration successful response:', response);
          this.isSubmitting.set(false);
          // השאר את ה-SnackBar להודעת הצלחה, זה הגיוני
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
  
          this.errorMessage.set(specificMessage); // הצג את השגיאה בתוך הקומפוננטה
          // הסר את שורת ה-SnackBar כאן, כדי למנוע כפילות.
          // this.snackBar.open(specificMessage, 'סגור', { duration: 7000, panelClass: ['error-snackbar'] }); // שורה זו תוסר
          console.log('RegisterComponent: Error message signal set to:', this.errorMessage());
          console.log('RegisterComponent: Staying on registration page due to error.');
        }
      });
    }
  }
}