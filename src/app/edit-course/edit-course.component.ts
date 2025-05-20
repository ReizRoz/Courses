// src/app/courses/edit-course/edit-course.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // לייבוא עבור NgModel
import { CourseService } from '../service/course.service';
import { Course } from '../models/course.modul';
import { HeaderComponent } from '../shared/header/header.component'; // ייבוא ה-Header
import { HttpErrorResponse } from '@angular/common/http'; // לייבוא לטיפול בשגיאות HTTP

@Component({
  selector: 'app-edit-course',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent], // וודא ש-FormsModule ו-HeaderComponent מיובאים
  templateUrl: './edit-course.component.html',
  styleUrls: ['./edit-course.component.scss']
})
export class EditCourseComponent implements OnInit {
  courseId = signal<number | null>(null);
  courseTitle = signal<string>('');
  courseDescription = signal<string>('');
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    public router: Router, // public כדי שיהיה נגיש מה-HTML
    private courseService: CourseService
  ) { }

  ngOnInit(): void {
    // קבל את ה-ID של הקורס מפרמטרי הניתוב
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.courseId.set(id);
        this.loadCourse(id); // טען את פרטי הקורס
      } else {
        this.errorMessage.set('מזהה קורס לא חוקי לעריכה.');
      }
    });
  }

  private loadCourse(id: number): void {
    this.courseService.getCourseById(id).subscribe({
      next: (course: Course) => {
        this.courseTitle.set(course.title);
        this.courseDescription.set(course.description);
        this.errorMessage.set(null); // נקה הודעות שגיאה קודמות
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error loading course for edit:', error);
        this.errorMessage.set('שגיאה בטעינת פרטי הקורס לעריכה.');
      }
    });
  }

  updateCourse(): void {
    const id = this.courseId();
    if (id === null) {
      this.errorMessage.set('שגיאה: מזהה קורס חסר לעדכון.');
      return;
    }

    if (!this.courseTitle() || !this.courseDescription()) {
      this.errorMessage.set('נא למלא את כל השדות.');
      return;
    }

    const updatedCourse: Partial<Course> = {
      title: this.courseTitle(),
      description: this.courseDescription()
    };

    // קרא לשירות לעדכון הקורס
    this.courseService.updateCourse(id, updatedCourse).subscribe({
      next: (course:Course) => {
        console.log('Course updated successfully:', course);
        this.successMessage.set('הקורס עודכן בהצלחה!');
        this.errorMessage.set(null);
        // נווט בחזרה לעמוד פרטי הקורס או רשימת הקורסים
        this.router.navigate(['/course', id]);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error updating course:', err);
        this.errorMessage.set('שגיאה בעדכון הקורס. אנא נסה שוב.');
        this.successMessage.set(null);
      }
    });
  }
}