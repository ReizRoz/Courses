// src/app/courses/lesson-form/lesson-form.component.ts
import { Component, OnInit, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CourseService } from '../../service/course.service';
import { Lesson } from '../../models/course.modul'; // וודא שהמבנה כאן מעודכן
import { MaterialModule } from '../../shared/material/material.module';
import { HeaderComponent } from '../../shared/header/header.component'; // ייבוא HeaderComponent

@Component({
  selector: 'app-lesson-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    HeaderComponent // הוסף את HeaderComponent לרשימת הייבוא
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
    // קבע אם זה מצב עריכה
    this.isEditMode.set(!!this.lesson);

    // אתחול הטופס עם ערכים קיימים אם במצב עריכה
    this.lessonForm = this.fb.group({
      title: [this.lesson?.title || '', Validators.required],
      content: [this.lesson?.content || '', Validators.required]
    });
  }

  onSubmit(): void {
    this.errorMessage.set(null); // איפוס הודעת שגיאה
    this.isLoading.set(true); // הצג ספינר טעינה

    if (this.lessonForm.invalid) {
      this.errorMessage.set('נא למלא את כל שדות השיעור.');
      this.lessonForm.markAllAsTouched(); // סמן את כל השדות כ-touched כדי להציג שגיאות
      this.isLoading.set(false); // הפסק טעינה אם הטופס לא חוקי
      return;
    }

    // הנתונים שאותם נשלח לשרת - תואם את ה-API
    const lessonData = {
      title: this.lessonForm.value.title as string,
      content: this.lessonForm.value.content as string,
      courseId: this.courseId
    };

    if (this.isEditMode() && this.lesson) {
      // עדכון שיעור קיים
      this.courseService.updateLesson(this.courseId, this.lesson.id, lessonData).subscribe({
        next: () => {
          this.lessonSaved.emit(); // פולט אירוע שהשיעור נשמר
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error updating lesson:', error);
          this.errorMessage.set(error.error?.message || 'שגיאה בעדכון השיעור. אנא נסה שוב.');
          this.isLoading.set(false);
        }
      });
    } else {
      // יצירת שיעור חדש
      // אין צורך לשלוח ID, createdAt, updatedAt - השרת יטפל בהם
      this.courseService.createLesson(this.courseId, lessonData).subscribe({
        next: () => {
          this.lessonSaved.emit(); // פולט אירוע שהשיעור נוצר
          this.isLoading.set(false);
          this.lessonForm.reset(); // איפוס הטופס ליצירה חדשה
        },
        error: (error) => {
          console.error('Error creating lesson:', error);
          this.errorMessage.set(error.error?.message || 'שגיאה ביצירת השיעור. אנא נסה שוב.');
          this.isLoading.set(false);
        }
      });
    }
  }

  onCancel(): void {
    this.cancel.emit(); // פולט אירוע ביטול
  }
}