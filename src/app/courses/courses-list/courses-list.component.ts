import { Component, OnInit, signal } from '@angular/core';
import { CourseService } from '../../service/course.service';
import { Course } from '../../models/course.modul';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../shared/header/header.component'; // ייבוא קומפוננטת ה-Header
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-courses-list',
  imports: [CommonModule, HeaderComponent], // הוסף את HeaderComponent לייבוא
  templateUrl: './courses-list.component.html',
  styleUrls: ['./courses-list.component.scss']
})
export class CoursesListComponent implements OnInit {
  courses: Course[] | null = null;
  errorMessage = signal<string | null>(null);
  userRole = signal<string | null>(null); // קבלת תפקיד המשתמש
  enrolledCourses = signal<number[]>([]); // מערך מזהי הקורסים שהמשתמש רשום אליהם

  constructor(
    private courseService: CourseService,
    private router: Router,
    private authService: AuthService
  ) { this.userRole.set(this.authService.getUserRole())}

  ngOnInit(): void {
    this.loadCourses();
    this.loadEnrolledCourses(); // טעינת רשימת הקורסים שהמשתמש רשום אליהם
  }

  loadCourses(): void {
    this.courses = null;
    this.errorMessage.set(null);
    this.courseService.getAllCourses().subscribe(
      (data: Course[]) => {
        this.courses = data;
      },
      (error: any) => {
        console.error('שגיאה בטעינת הקורסים:', error);
        this.errorMessage.set(error.message || 'אירעה שגיאה לא ידועה בטעינת הקורסים.');
        this.courses = [];
      }
    );
  }

  loadEnrolledCourses(): void {
    // כאן תצטרכי לקרוא ל-API של השרת כדי לקבל את רשימת הקורסים שהמשתמש הנוכחי רשום אליהם
    // לדוגמה:
    // const userId = this.authService.getUserId();
    // if (userId) {
    //   this.courseService.getEnrolledCoursesForUser(userId).subscribe(
    //     (enrolledCourseIds: number[]) => {
    //       this.enrolledCourses.set(enrolledCourseIds);
    //     },
    //     (error) => {
    //       console.error('שגיאה בטעינת קורסים רשומים:', error);
    //     }
    //   );
    // }
    // **לצורך הדוגמה, נניח שהמשתמש רשום לקורס עם ID 1:**
    this.enrolledCourses.set([1]);
  }

  isEnrolled(course: Course): boolean {
    return this.enrolledCourses().includes(course.id);
  }

  enrollOrUnenroll(course: Course): void {
    const userId = this.authService.getUserId();
    if (userId) {
      const isCurrentlyEnrolled = this.isEnrolled(course);
      if (isCurrentlyEnrolled) {
        // קרא לשירות לבטל הרשמה
        // this.courseService.unenrollStudent(course.id, userId).subscribe( ... )
        console.log(`ביטול הרשמה לקורס ${course.title}`);
        this.enrolledCourses.update(ids => ids.filter(id => id !== course.id));
      } else {
        // קרא לשירות להירשם לקורס
        // this.courseService.enrollStudent(course.id, userId).subscribe( ... )
        console.log(`הרשמה לקורס ${course.title}`);
        this.enrolledCourses.update(ids => [...ids, course.id]);
      }
    } else {
      this.router.navigate(['/login']); // אם אין משתמש מחובר, נווט להתחברות
    }
  }

  viewCourseDetails(courseId: number): void {
    this.router.navigate(['/course', courseId]); // ניווט לעמוד פרטי הקורס
  }
}