// src/app/courses/create-course/create-course.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CourseService } from '../../service/course.service';
import { AuthService } from '../../service/auth.service';
import { HeaderComponent } from '../../shared/header/header.component';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-create-course',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './create-course.component.html',
  styleUrls: ['./create-course.component.scss']
})
export class CreateCourseComponent implements OnInit {
  courseForm!: FormGroup;
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  isLoading = signal<boolean>(false);

// ...
constructor(
  private fb: FormBuilder,
  private courseService: CourseService,
  private authService: AuthService,
  public router: Router // שנה ל-public
) {}
//

  ngOnInit(): void {
    if (!this.authService.isAuthenticated() || this.authService.currentUserRole() !== 'teacher') {
      this.router.navigate(['/login']);
      return;
    }

    this.courseForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  onSubmit(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.isLoading.set(true);

    if (this.courseForm.invalid) {
      this.errorMessage.set('נא למלא את כל שדות החובה.');
      this.isLoading.set(false);
      return;
    }

    const userId = this.authService.currentUserId();
    if (userId === null) {
      this.errorMessage.set('שגיאת אימות: מזהה משתמש חסר.');
      this.isLoading.set(false);
      return;
    }

    // וודא ש-title ו-description הם string גם אם הם ריקים מהטופס
    const newCourse = {
      title: this.courseForm.value.title as string,
      description: this.courseForm.value.description as string,
      teacherId: userId
    };

    this.courseService.createCourse(newCourse).subscribe({
      next: (response) => {
        this.successMessage.set('הקורס נוצר בהצלחה: ' + response.message);
        console.log('Course created successfully:', response);
        this.isLoading.set(false);
        this.courseForm.reset();
        // אולי נווט למסך אחר או רענן את רשימת הקורסים
      },
      error: (error) => {
        console.error('Error creating course:', error);
        this.errorMessage.set(error.error?.message || 'אירעה שגיאה ביצירת הקורס.');
        this.isLoading.set(false);
      }
    });
  }
}