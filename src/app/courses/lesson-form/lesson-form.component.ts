// src/app/courses/lesson-form/lesson-form.component.ts
import { Component, OnInit, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CourseService } from '../../service/course.service';
import { Lesson } from '../../models/course.modul';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon'; // **ייבוא חדש**

@Component({
  selector: 'app-lesson-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule // **הוספה לרשימת ה-imports**
  ],
  templateUrl: './lesson-form.component.html',
  styleUrls: ['./lesson-form.component.scss']
})
export class LessonFormComponent implements OnInit {
  @Input() courseId!: number;
  @Input() lesson: Lesson | undefined; // השיעור אם מדובר בעריכה
  @Output() lessonSaved = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  lessonForm!: FormGroup;
  isEditMode = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  isLoading = signal<boolean>(false);

  constructor(
    private fb: FormBuilder,
    private courseService: CourseService
  ) {}

  ngOnInit(): void {
    this.isEditMode.set(!!this.lesson); // קבע אם זה מצב עריכה
    this.lessonForm = this.fb.group({
      title: [this.lesson?.title || '', Validators.required],
      content: [this.lesson?.content || '', Validators.required]
    });
  }

  // שים לב: שיניתי את השם ל-onSubmit כדי להתאים ל-HTML
  onSubmit(): void {
    this.errorMessage.set(null);
    this.isLoading.set(true);

    if (this.lessonForm.invalid) {
      this.errorMessage.set('נא למלא את כל שדות השיעור.');
      this.isLoading.set(false);
      return;
    }

// לדוגמה, אם ה-courseId זמין לך כ-courseId: number
const lessonData = {
  title: this.lessonForm.value.title as string,
  content: this.lessonForm.value.content as string,
  courseId: this.courseId // או איך שלא תקבל את ה-courseId
};

    if (this.isEditMode() && this.lesson) {
      this.courseService.updateLesson(this.courseId, this.lesson.id, lessonData).subscribe({
        next: () => {
          this.lessonSaved.emit();
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error updating lesson:', error);
          this.errorMessage.set(error.error?.message || 'שגיאה בעדכון השיעור.');
          this.isLoading.set(false);
        }
      });
    } else {
      this.courseService.createLesson(this.courseId, lessonData).subscribe({
        next: () => {
          this.lessonSaved.emit();
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error creating lesson:', error);
          this.errorMessage.set(error.error?.message || 'שגיאה ביצירת השיעור.');
          this.isLoading.set(false);
        }
      });
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}