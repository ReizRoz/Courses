
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CourseService } from '../../service/course.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Lesson } from '../../models/course.modul';
import { MaterialModule } from '../../shared/material/material.module';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderComponent } from '../../shared/header/header.component';

@Component({
  selector: 'app-lesson-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    HeaderComponent   ],
  templateUrl: './lesson-form.component.html',
  styleUrls: ['./lesson-form.component.scss']
})
export class LessonFormComponent implements OnInit {
  lessonForm!: FormGroup;
  isEditMode = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  courseId!: number;
  lessonId: number | undefined;
  currentLesson: Lesson | undefined;

  constructor(
    private fb: FormBuilder,
    private courseService: CourseService,
    private snackBar: MatSnackBar,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.lessonForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      this.courseId = Number(params.get('courseId'));
      const lessonIdParam = params.get('lessonId');
      if (lessonIdParam) {
        this.lessonId = Number(lessonIdParam);
        this.isEditMode.set(true);
        this.loadLessonDetails(this.courseId, this.lessonId);
      } else {
        this.isEditMode.set(false);
      }
    });
  }

  loadLessonDetails(courseId: number, lessonId: number): void {
    this.isLoading.set(true);
    this.courseService.getLessonById(courseId, lessonId).subscribe({
      next: (lesson: Lesson) => {
        this.currentLesson = lesson;
        this.lessonForm.patchValue(lesson);
        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        console.error('שגיאה בטעינת פרטי שיעור:', error);
        this.errorMessage.set('שגיאה בטעינת פרטי השיעור.');
        this.isLoading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.lessonForm.invalid) {
      this.lessonForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);


    const lessonData = this.lessonForm.value;




    const dataToSend = {
      ...lessonData,       courseId: this.courseId     };


    if (this.isEditMode() && this.lessonId) {

      this.courseService.updateLesson(this.courseId, this.lessonId, dataToSend).subscribe({
        next: () => {
          this.successMessage.set('השיעור עודכן בהצלחה!');
          this.snackBar.open('השיעור עודכן בהצלחה!', 'סגור', { duration: 3000 });
          this.isLoading.set(false);
          this.router.navigate(['/courses', this.courseId]);
        },
        error: (error: HttpErrorResponse) => {
          console.error('שגיאה בעת עדכון השיעור:', error);
          this.errorMessage.set(error.error?.message || 'שגיאה בעת עדכון השיעור. אנא נסה שוב.');
          this.isLoading.set(false);
        }
      });
    } else {

      this.courseService.createLesson(this.courseId, lessonData).subscribe({
        next: () => {
          this.successMessage.set('השיעור נוצר בהצלחה!');
          this.snackBar.open('השיעור נוצר בהצלחה!', 'סגור', { duration: 3000 });
          this.isLoading.set(false);
          this.router.navigate(['/courses', this.courseId]);
        },
        error: (error: HttpErrorResponse) => {
          console.error('שגיאה בעת יצירת השיעור:', error);
          this.errorMessage.set(error.error?.message || 'שגיאה בעת יצירת השיעור. אנא נסה שוב.');
          this.isLoading.set(false);
        }
      });
    }
  
}

  onCancel(): void {
    this.router.navigate(['/courses', this.courseId]);
  }
}