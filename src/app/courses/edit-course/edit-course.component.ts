// src/app/courses/edit-course/edit-course.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseService } from '../../service/course.service';
import { Course } from '../../models/course.modul';
import { HeaderComponent } from '../../shared/header/header.component';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-edit-course',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './edit-course.component.html',
  styleUrls: ['./edit-course.component.scss']
})
export class EditCourseComponent implements OnInit {
  courseId = signal<number | null>(null);
  courseTitle = signal<string>('');
  courseDescription = signal<string>('');
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  isLoading = signal<boolean>(false); // **חשוב: הוספנו את ה-Signal הזה**

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private courseService: CourseService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
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
    this.isLoading.set(true); // התחל טעינה
    this.courseService.getCourseById(id).subscribe({
      next: (course: Course) => {
        this.courseTitle.set(course.title);
        this.courseDescription.set(course.description);
        this.errorMessage.set(null);
        this.isLoading.set(false); // סיים טעינה
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error loading course for edit:', error);
        this.errorMessage.set('שגיאה בטעינת פרטי הקורס לעריכה.');
        this.isLoading.set(false); // סיים טעינה במקרה של שגיאה
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

    const currentTeacherId = this.authService.currentUserId();

    if (currentTeacherId === null || currentTeacherId === undefined) {
      this.errorMessage.set('שגיאה: מזהה מורה חסר. וודא שאתה מחובר כמורה.');
      return;
    }

    const updatedCourse: Partial<Course> = {
      title: this.courseTitle(),
      description: this.courseDescription(),
      teacherId: currentTeacherId
    };

    this.isLoading.set(true); // **התחל טעינה לפני קריאת ה-API**

    this.courseService.updateCourse(id, updatedCourse).subscribe({
      next: (course: Course) => {
        console.log('Course updated successfully:', course);
        this.successMessage.set('הקורס עודכן בהצלחה!');
        this.errorMessage.set(null);
        this.isLoading.set(false); // **סיים טעינה בהצלחה**
        // נווט בחזרה לעמוד פרטי הקורס או רשימת הקורסים
        this.router.navigate(['/course', id]); // או היכן שמתאים
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error updating course:', err);
        this.errorMessage.set('שגיאה בעדכון הקורס. אנא נסה שוב.');
        this.successMessage.set(null);
        this.isLoading.set(false); // **סיים טעינה בשגיאה**
      }
    });
  }
}