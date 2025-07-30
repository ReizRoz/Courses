
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../../service/course.service';
import { AuthService } from '../../service/auth.service';
import { HeaderComponent } from '../../shared/header/header.component';
import { MaterialModule } from '../../shared/material/material.module';
import { Course } from '../../models/course.modul';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs'; 
@Component({
  selector: 'app-course-form',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    ReactiveFormsModule,
    MaterialModule
  ],
  templateUrl: './course-form.component.html',
  styleUrls: ['./course-form.component.scss']
})
export class CourseFormComponent implements OnInit {
  courseForm!: FormGroup;
  isEditMode = signal<boolean>(false);
  courseId = signal<number | null>(null);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  isLoading = signal<boolean>(false);   isSubmitting = signal<boolean>(false); 
  private routeSubscription: Subscription | undefined;

  constructor(
    private fb: FormBuilder,
    private courseService: CourseService,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated() || this.authService.currentUserRole() !== 'teacher') {
      this.router.navigate(['/login']);
      return;
    }

    this.initForm();

    this.routeSubscription = this.activatedRoute.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        const id = Number(idParam);
        this.courseId.set(id);
        this.isEditMode.set(true);
        this.loadCourseDetails(id);
      } else {
        this.isEditMode.set(false);
        this.isLoading.set(false);       }
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();   }

  initForm(): void {
    this.courseForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  loadCourseDetails(id: number): void {
    this.isLoading.set(true);
    this.courseService.getCourseById(id).subscribe({
      next: (course: Course) => {
        this.courseForm.patchValue({
          title: course.title,
          description: course.description
        });
        this.isLoading.set(false);
        this.errorMessage.set(null);       },
      error: (error: HttpErrorResponse) => {
        console.error('Error loading course details:', error);
        this.errorMessage.set(error.error?.message || 'שגיאה בטעינת פרטי הקורס.');
        this.isLoading.set(false);
      }
    });
  }

  onSubmit(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.isSubmitting.set(true); 
    if (this.courseForm.invalid) {
      this.errorMessage.set('נא למלא את כל שדות החובה.');
      this.courseForm.markAllAsTouched();
      this.isSubmitting.set(false);
      return;
    }

    const userId = this.authService.currentUserId();
    if (userId === null) {
      this.errorMessage.set('שגיאת אימות: מזהה משתמש חסר.');
      this.isSubmitting.set(false);
      return;
    }

    const courseData = {
      title: this.courseForm.value.title as string,
      description: this.courseForm.value.description as string,
      teacherId: userId
    };

    if (this.isEditMode() && this.courseId()) {

      this.courseService.updateCourse(this.courseId()!, courseData).subscribe({
        next: (response) => {
          this.successMessage.set('הקורס עודכן בהצלחה!');
          this.isSubmitting.set(false);
          this.router.navigate(['/courses']);         },
        error: (error: HttpErrorResponse) => {
          console.error('Error updating course:', error);
          this.errorMessage.set(error.error?.message || 'שגיאה בעדכון הקורס. אנא נסה שוב.');
          this.isSubmitting.set(false);
        }
      });
    } else {

      this.courseService.createCourse(courseData).subscribe({
        next: (response) => {
          this.successMessage.set('הקורס נוצר בהצלחה!');
          this.isSubmitting.set(false);
          this.courseForm.reset();           this.router.navigate(['/courses']);         },
        error: (error: HttpErrorResponse) => {
          console.error('Error creating course:', error);
          this.errorMessage.set(error.error?.message || 'אירעה שגיאה ביצירת הקורס.');
          this.isSubmitting.set(false);
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/courses']);   }
}