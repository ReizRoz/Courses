// src/app/courses/course-details/course-details.component.ts

import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { CourseService } from '../../service/course.service';
import { AuthService } from '../../service/auth.service';
import { Course, Lesson } from '../../models/course.modul';
import { HeaderComponent } from '../../shared/header/header.component';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-course-details',
  standalone: true,
  imports: [CommonModule, HeaderComponent, NgIf, NgFor],
  templateUrl: './course-details.component.html',
  styleUrls: ['./course-details.component.scss']
})
export class CourseDetailsComponent implements OnInit {
  course = signal<Course | null>(null);
  lessons = signal<Lesson[] | null>(null);
  errorMessage = signal<string | null>(null);
  isEnrolled = signal<boolean>(false);
  userRole = signal<string | null>(null);
  userId = signal<number | null>(null);
  userName = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private courseService: CourseService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.userRole.set(this.authService.getUserRole());
    this.userId.set(this.authService.getUserId());
    this.userName.set(this.authService.getUserName());

    this.route.paramMap.subscribe(params => {
      const courseId = Number(params.get('id'));
      if (courseId) {
        this.loadCourseDetails(courseId);
        this.loadLessonsForCourse(courseId);
      } else {
        this.errorMessage.set('מזהה קורס לא חוקי.');
      }
    });
  }

  private loadCourseDetails(courseId: number): void {
    this.courseService.getCourseById(courseId).subscribe({
      next: (course) => {
        this.course.set(course);
        const userId = this.authService.getUserId();
        // וודא ש-enrolledStudents קיים ובדוק אם userId כלול
        if (userId !== null && course.enrolledStudents && course.enrolledStudents.includes(userId)) {
          this.isEnrolled.set(true);
        } else {
          this.isEnrolled.set(false); // ודא שהסטטוס מתאפס אם לא רשום
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error loading course details:', error);
        this.errorMessage.set('שגיאה בטעינת פרטי הקורס.');
      }
    });
  }

  private loadLessonsForCourse(courseId: number): void {
    this.courseService.getLessonsByCourseId(courseId).subscribe({
      next: (lessons) => {
        this.lessons.set(lessons);
        console.log('Lessons loaded:', lessons);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error loading lessons for course:', error);
        this.errorMessage.set('שגיאה בטעינת השיעורים עבור קורס זה.');
      }
    });
  }

  toggleEnrollment(): void {
    const userId = this.authService.getUserId();
    // השתמש ב-course()!.id במקום course()!._id
    const courseId = this.course() ? this.course()!.id : null; 
  
    if (userId === null || courseId === null) {
      this.errorMessage.set('שגיאה: חסר מזהה משתמש או מזהה קורס.');
      return;
    }

    if (this.isEnrolled()) {
      // ביטול הרשמה
      this.courseService.unenrollFromCourse(courseId, userId).subscribe({
        next: () => {
          this.isEnrolled.set(false);
          this.errorMessage.set(null);
          console.log('Unenrolled successfully.');
          const currentCourse = this.course();
          if (currentCourse && currentCourse.enrolledStudents) {
            // הוסף (id: number) ל-filter
            currentCourse.enrolledStudents = currentCourse.enrolledStudents.filter((id: number) => id !== userId);
            this.course.set(currentCourse);
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error unenrolling:', error);
          this.errorMessage.set('שגיאה בביטול ההרשמה לקורס.');
        }
      });
    } else {
      // הרשמה
      this.courseService.enrollInCourse(courseId, userId).subscribe({
        next: () => {
          this.isEnrolled.set(true);
          this.errorMessage.set(null);
          console.log('Enrolled successfully.');
          const currentCourse = this.course();
          if (currentCourse && !currentCourse.enrolledStudents) {
            currentCourse.enrolledStudents = [];
          }
          if (currentCourse && userId) { // ודא ש-currentCourse ו-userId קיימים
            if (!currentCourse.enrolledStudents) {
              // אם enrolledStudents אינו קיים (undefined), צור מערך ריק
              currentCourse.enrolledStudents = [];
            }
            // עכשיו בטוח ש-enrolledStudents קיים וניתן לבצע push
            currentCourse.enrolledStudents.push(userId);
            this.course.set(currentCourse);
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error enrolling:', error);
          this.errorMessage.set('שגיאה בהרשמה לקורס.');
        }
      });
    }
  }

  // פונקציות editCourse ו-deleteCourse יצטרכו להיות ממומשות
  // בהתאם לנקודות הקצה של ה-API שלך
  editCourse(): void {
    const courseId = this.course()?.id; // השתמש ב-course()?.id
    if (courseId) {
      this.router.navigate(['/edit-course', courseId]); // נניח שיש לך ראוט לעריכת קורס
    } else {
      console.error('Cannot edit course: Course ID is missing.');
    }
  }

  deleteCourse(): void {
    const courseId = this.course()?.id; // השתמש ב-course()?.id
    if (courseId && confirm('האם אתה בטוח שברצונך למחוק קורס זה?')) {
      // אם יש לך נקודת קצה למחיקת קורס ב-CourseService
      // this.courseService.deleteCourse(courseId).subscribe({
      //   next: () => {
      //     console.log('Course deleted successfully.');
      //     this.router.navigate(['/courses']); // חזור לרשימת הקורסים
      //   },
      //   error: (error: HttpErrorResponse) => {
      //     console.error('Error deleting course:', error);
      //     this.errorMessage.set('שגיאה במחיקת הקורס.');
      //   }
      // });
      console.log(`Deleting course with ID: ${courseId}`);
      // כאן תוסיף את קריאת ה-service בפועל למחיקה
    } else if (!courseId) {
      console.error('Cannot delete course: Course ID is missing.');
    }
  }
}