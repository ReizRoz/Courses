// src/app/courses/create-course/create-course.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // לייבוא עבור NgModel
import { CourseService } from '../service/course.service';
import { Router } from '@angular/router';
import { Course } from '../models/course.modul';
import { AuthService } from '../service/auth.service';
import { HeaderComponent } from '../shared/header/header.component'; // ייבוא ה-Header

@Component({
  selector: 'app-create-course',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent], // הוסף FormsModule ו-HeaderComponent
  templateUrl: './create-course.component.html',
  styleUrls: ['./create-course.component.scss']
})
export class CreateCourseComponent implements OnInit {
  courseTitle = signal<string>('');
  courseDescription = signal<string>('');
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  constructor(
    private courseService: CourseService,
    private authService: AuthService, // נשתמש ב-AuthService כדי לקבל את ID המורה
    public router: Router
  ) { }

  ngOnInit(): void {
    // אין צורך בלוגיקה מיוחדת ב-OnInit כרגע
  }

  createCourse(): void {
    const teacherId = this.authService.getUserId(); // קבל את ID המורה המחובר
    if (teacherId === null) {
      this.errorMessage.set('שגיאה: מזהה מורה חסר. אנא התחבר כמורה.');
      return;
    }

    if (!this.courseTitle() || !this.courseDescription()) {
      this.errorMessage.set('נא למלא את כל השדות.');
      return;
    }

    const newCourse: Partial<Course> = {
      title: this.courseTitle(),
      description: this.courseDescription(),
      teacherId: teacherId // שיוך הקורס למורה המחובר
      // enrolledStudents יוגדר כריק ב-backend
    };

    this.courseService.createCourse(newCourse).subscribe({
      next: (course:Course) => {
        console.log('Course created successfully:', course);
        this.successMessage.set('הקורס נוצר בהצלחה!');
        this.errorMessage.set(null);
        // נקה טופס לאחר הצלחה או נווט
        this.courseTitle.set('');
        this.courseDescription.set('');
        this.router.navigate(['/courses']); // נווט לרשימת הקורסים
      },
      error: (error:any) => {
        console.error('Error creating course:', error);
        this.errorMessage.set('שגיאה ביצירת הקורס. אנא נסה שוב.');
        this.successMessage.set(null);
      }
    });
  }
}