// src/app/courses/edit-course/edit-course.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // **ייבוא ReactiveFormsModule ו-FormBuilder**
import { CourseService } from '../../service/course.service';
import { Course } from '../../models/course.modul';
import { HeaderComponent } from '../../shared/header/header.component';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../service/auth.service';
import { MaterialModule } from '../../shared/material/material.module'; // **ייבוא MaterialModule**

@Component({
  selector: 'app-edit-course',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, // **החלפנו FormsModule ב-ReactiveFormsModule**
    HeaderComponent,
    MaterialModule // **ודא ש-MaterialModule מיובא**
  ],
  templateUrl: './edit-course.component.html',
  styleUrls: ['./edit-course.component.scss']
})
export class EditCourseComponent implements OnInit {
  courseId = signal<number | null>(null);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  isLoading = signal<boolean>(false);

  // **הגדרת FormGroup עבור הטופס**
  editCourseForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private courseService: CourseService,
    private authService: AuthService,
    private fb: FormBuilder // **הזרקת FormBuilder**
  ) {
    // **אתחול ה-FormGroup בבנאי**
    this.editCourseForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.courseId.set(id);
        this.loadCourse(id);
      } else {
        this.errorMessage.set('מזהה קורס לא חוקי לעריכה.');
      }
    });
  }

  private loadCourse(id: number): void {
    this.isLoading.set(true);
    this.courseService.getCourseById(id).subscribe({
      next: (course: Course) => {
        // **עדכון ערכי הטופס באמצעות patchValue**
        this.editCourseForm.patchValue({
          title: course.title,
          description: course.description
        });
        this.errorMessage.set(null);
        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error loading course for edit:', error);
        this.errorMessage.set(error.error?.message || 'שגיאה בטעינת פרטי הקורס לעריכה.');
        this.isLoading.set(false);
      }
    });
  }

  updateCourse(): void {
    const id = this.courseId();
    if (id === null) {
      this.errorMessage.set('שגיאה: מזהה קורס חסר לעדכון.');
      return;
    }

    // **בדיקת ולידציה של הטופס לפני שליחה**
    if (this.editCourseForm.invalid) {
      this.errorMessage.set('נא למלא את כל השדות הנדרשים.');
      this.editCourseForm.markAllAsTouched(); // סמן את כל השדות כ-touched כדי להציג שגיאות
      return;
    }

    const currentTeacherId = this.authService.currentUserId();

    if (currentTeacherId === null || currentTeacherId === undefined) {
      this.errorMessage.set('שגיאה: מזהה מורה חסר. וודא שאתה מחובר כמורה.');
      return;
    }

    // **קבלת הערכים מה-FormGroup**
    const updatedCourse: Partial<Course> = {
      title: this.editCourseForm.value.title,
      description: this.editCourseForm.value.description,
      teacherId: currentTeacherId
    };

    this.isLoading.set(true);

    this.courseService.updateCourse(id, updatedCourse).subscribe({
      next: (course: Course) => {
        console.log('Course updated successfully:', course);
        this.successMessage.set('הקורס עודכן בהצלחה!');
        this.errorMessage.set(null);
        this.isLoading.set(false);
        this.router.navigate(['/courses']);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error updating course:', err);
        this.errorMessage.set(err.error?.message || 'שגיאה בעדכון הקורס. אנא נסה שוב.');
        this.successMessage.set(null);
        this.isLoading.set(false);
      }
    });
  }
}