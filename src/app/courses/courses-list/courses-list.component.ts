// src/app/courses/courses-list/courses-list.component.ts
import { Component, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseService } from '../../service/course.service';
import { AuthService } from '../../service/auth.service';
import { UserService } from '../../service/user.service'; // ייבוא UserService - אם הוא בשימוש בקומפוננטה זו
import { Course } from '../../models/course.modul'; // וודא שהמודל Course קיים ונגיש
import { HeaderComponent } from '../../shared/header/header.component';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs'; // לייבא Subscription
import { MaterialModule } from '../../shared/material/material.module'; // וודא ש-MaterialModule מיובא

@Component({
  selector: 'app-courses-list',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    MaterialModule // וודא ש-MaterialModule מיובא ב-imports
  ],
  templateUrl: './courses-list.component.html',
  styleUrls: ['./courses-list.component.scss']
})
export class CoursesListComponent implements OnInit, OnDestroy {
  // Signals לניהול מצב הקומפוננטה ונתוני הקורסים
  courses = signal<Course[]>([]);
  errorMessage = signal<string | null>(null);
  isLoading = signal<boolean>(true); // מצב טעינה של רשימת הקורסים

  // Subscription לניהול מנויים, למניעת זליגת זיכרון
  private courseSubscription: Subscription | undefined;

  constructor(
    public courseService: CourseService, // סרוויס לטיפול ב-API של קורסים
    public authService: AuthService, // סרוויס לאימות משתמש (נותר public כדי לגשת מה-HTML)
    private router: Router, // לניווט בין מסכים
    private userService: UserService // UserService מוזרק כאן, אם יש בו צורך בקומפוננטה
  ) {}

  // Lifecycle hook: נקרא בעת אתחול הקומפוננטה
  ngOnInit(): void {
    // בדיקת אימות משתמש. אם לא מחובר, נווט לדף ההתחברות.
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadCourses(); // טען את רשימת הקורסים
  }

  // Lifecycle hook: נקרא כאשר הקומפוננטה נהרסת
  ngOnDestroy(): void {
    // בטל את המנוי כדי למנוע זליגת זיכרון
    this.courseSubscription?.unsubscribe();
  }

  // פונקציה לטעינת כל הקורסים מהשרת
  loadCourses(): void {
    this.isLoading.set(true); // הפעל ספינר טעינה
    this.errorMessage.set(null); // נקה הודעות שגיאה קודמות

    this.courseSubscription = this.courseService.getAllCourses().subscribe({
      next: (data: Course[]) => {
        this.courses.set(data); // עדכן את רשימת הקורסים
        this.isLoading.set(false); // כבה ספינר טעינה
      },
      error: (error) => {
        console.error('Error fetching courses:', error);
        // הצג הודעת שגיאה למשתמש
        this.errorMessage.set(error.message || 'אירעה שגיאה בטעינת הקורסים.');
        this.isLoading.set(false); // כבה ספינר טעינה גם במקרה של שגיאה
      }
    });
  }

  // פונקציה לניווט לדף פרטי קורס ספציפי
  viewCourseDetails(courseId: number): void {
    this.router.navigate(['/courses', courseId]);
  }

  // פונקציה לניווט לדף עריכת קורס.
  // משתמשת בנתיב החדש המפנה ל-CourseFormComponent עם ה-ID.
  editCourse(courseId: number): void {
    this.router.navigate(['/courses/edit', courseId]);
  }

  // פונקציה למחיקת קורס
  deleteCourse(courseId: number): void {
    // בקש אישור מהמשתמש לפני המחיקה
    if (confirm('האם אתה בטוח שברצונך למחוק קורס זה?')) {
      this.courseService.deleteCourse(courseId).subscribe({
        next: () => {
          console.log(`Course ${courseId} deleted successfully.`);
          this.errorMessage.set(null); // נקה הודעות שגיאה אם המחיקה הצליחה
          this.loadCourses(); // רענן את רשימת הקורסים לאחר המחיקה
        },
        error: (error) => {
          console.error('Error deleting course:', error);
          // הצג הודעת שגיאה למשתמש
          this.errorMessage.set(error.error?.message || 'אירעה שגיאה במחיקת הקורס.');
        }
      });
    }
  }

  // פונקציה לניווט לדף יצירת קורס חדש.
  // משתמשת בנתיב החדש המפנה ל-CourseFormComponent ללא ID.
  createNewCourse(): void {
    this.router.navigate(['/courses/create']);
  }
}