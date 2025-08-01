import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common'; // *** ייבוא חדש: Location ***
import { AuthService } from '../../service/auth.service';
import { UserDetailsResponse } from '../../service/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { HeaderComponent } from '../../shared/header/header.component';
import { MaterialModule } from '../../shared/material/material.module';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HeaderComponent,
    MaterialModule
  ],
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit {
  editProfileForm!: FormGroup;
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  isLoading = signal<boolean>(false);
  currentUser: UserDetailsResponse | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    public router: Router,
    private location: Location // *** הזרקת Location service ***
  ) {
    this.editProfileForm = this.fb.group({
      name: ['', Validators.required],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      currentPassword: ['', Validators.required],
      newPassword: [''],
      confirmNewPassword: ['']
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserDetails();
    if (this.currentUser) {
      this.editProfileForm.patchValue({
        name: this.currentUser.name,
        email: this.currentUser.email
      });
    } else {
      this.errorMessage.set('לא ניתן לטעון פרטי משתמש. אנא התחבר מחדש.');
      this.router.navigate(['/login']);
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmNewPassword = form.get('confirmNewPassword')?.value;

    if (newPassword && confirmNewPassword && newPassword !== confirmNewPassword) {
      form.get('confirmNewPassword')?.setErrors({ passwordMismatch: true });
    } else {
      form.get('confirmNewPassword')?.setErrors(null);
    }
    return null;
  }

  onSubmit(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (this.editProfileForm.invalid) {
      this.errorMessage.set('אנא מלא את כל השדות הנדרשים כראוי, וודא שסיסמאות תואמות.');
      this.editProfileForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const { name, currentPassword, newPassword } = this.editProfileForm.getRawValue();

    this.authService.login({ email: this.currentUser?.email, password: currentPassword }).subscribe({
      next: (authResponse) => {
        console.log('Current password verified successfully.');

        const userIdToUpdate = String(this.authService.currentUserId());
        if (!userIdToUpdate) {
          this.errorMessage.set('מזהה משתמש לא נמצא. אנא התחבר מחדש.');
          this.isLoading.set(false);
          this.authService.logout();
          return;
        }

        const updates: Partial<UserDetailsResponse> = { name };
        if (newPassword) {
          updates.password = newPassword;
        }

        this.authService.updateUser(userIdToUpdate, updates).subscribe({
          next: (response) => {
            this.successMessage.set('הפרופיל עודכן בהצלחה!');
            this.isLoading.set(false);
            // ייתכן ותרצה לנקות את שדות הסיסמה לאחר עדכון מוצלח
            this.editProfileForm.get('currentPassword')?.reset();
            this.editProfileForm.get('newPassword')?.reset();
            this.editProfileForm.get('confirmNewPassword')?.reset();

            // *** ניווט חזרה לעמוד הקודם לאחר עדכון מוצלח ***
            setTimeout(() => { // ניתן להוסיף השהיה קצרה לפני הניווט
              this.location.back();
            }, 1500); // חכה 1.5 שניות כדי שהמשתמש יראה את הודעת ההצלחה
          },
          error: (error: HttpErrorResponse) => {
            console.error('Error updating profile:', error);
            this.errorMessage.set(error.error?.message || 'שגיאה בעת עדכון הפרופיל.');
            this.isLoading.set(false);
          }
        });
      },
      error: (error: HttpErrorResponse) => {
        console.error('Current password verification failed:', error);
        this.errorMessage.set('הסיסמה הנוכחית אינה נכונה.');
        this.isLoading.set(false);
      }
    });
  }

  // *** מתודה חדשה לביטול וחזרה לעמוד הקודם ***
  cancelEdit(): void {
    this.location.back();
  }
}