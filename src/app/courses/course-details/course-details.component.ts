import { Component, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CourseService } from '../../service/course.service';
import { Course, Lesson } from '../../models/course.modul'; import { AuthService } from '../../service/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { HeaderComponent } from '../../shared/header/header.component';
import { Subscription, forkJoin, of } from 'rxjs'; import { UserService } from '../../service/user.service';
import { MaterialModule } from '../../shared/material/material.module';

@Component({
  selector: 'app-course-details',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    MaterialModule,
    RouterModule
  ],
  templateUrl: './course-details.component.html',
  styleUrls: ['./course-details.component.scss']
})
export class CourseDetailsComponent implements OnInit, OnDestroy {
  course = signal<Course | null>(null);
  lessons = signal<Lesson[] | null>(null);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  isEnrolled = signal<boolean>(false);
  isLoading = signal<boolean>(false);

  private routeSubscription: Subscription | undefined;

  constructor(
    private activatedRoute: ActivatedRoute,
    private courseService: CourseService,
    public authService: AuthService,
    public userService: UserService,     public router: Router
  ) {}

  ngOnInit(): void {
    this.routeSubscription = this.activatedRoute.paramMap.subscribe((params: any) => {
      const courseId = Number(params.get('id'));
      if (courseId) {
        this.isLoading.set(true);
        this.loadCourseDetails(courseId);
      } else {
        this.errorMessage.set('מזהה קורס לא חוקי.');
        this.isLoading.set(false);
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }

  loadCourseDetails(courseId: number): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.isEnrolled.set(false); 
    const currentUserId = this.authService.currentUserId();
    const currentUserRole = this.authService.currentUserRole();

        const courseDetails$ = this.courseService.getCourseById(courseId);
    const lessons$ = this.courseService.getLessonsByCourseId(courseId);

        const studentCourses$ = (currentUserRole === 'student' && currentUserId !== null)
      ? this.courseService.getStudentCourses(currentUserId)
      : of([]); 
    forkJoin({
      course: courseDetails$,
      lessons: lessons$,
      studentCourses: studentCourses$
    }).subscribe({
      next: ({ course, lessons, studentCourses }) => {
        this.course.set(course);
        this.lessons.set(lessons);

                if (currentUserRole === 'student' && currentUserId !== null && course) {
                    this.isEnrolled.set(studentCourses.some(c => c.id === course.id));
        }

        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        console.error('שגיאה בטעינת פרטי הקורס או שיעורים:', error);
        this.errorMessage.set(error.error?.message || 'אירעה שגיאה בטעינת פרטי הקורס.');
        this.course.set(null);
        this.lessons.set(null);
        this.isLoading.set(false);
      }
    });
  }

  toggleEnrollment(): void {
    const currentUserId = this.authService.currentUserId();
    const currentCourse = this.course();

    if (currentUserId === null) {
            this.router.navigate(['/login']);
      return;
    }

    if (!currentCourse) {
      this.errorMessage.set('שגיאה: פרטי קורס אינם זמינים.');
      return;
    }

    const courseId = currentCourse.id;

    if (this.isLoading()) {
      return;     }

    this.isLoading.set(true);
    this.errorMessage.set(null);     this.successMessage.set(null); 
    if (this.isEnrolled()) {
            this.courseService.unenrollFromCourse(courseId, currentUserId).subscribe({
        next: () => {
          this.successMessage.set('ההרשמה בוטלה בהצלחה!');
          this.isEnrolled.set(false);           this.isLoading.set(false);
        },
        error: (error: HttpErrorResponse) => {
          console.error('שגיאה בביטול הרשמה:', error);
          this.errorMessage.set(error.error?.message || 'שגיאה בביטול ההרשמה לקורס.');
          this.isLoading.set(false);
        }
      });
    } else {
            this.courseService.enrollInCourse(courseId, currentUserId).subscribe({
        next: () => {
          this.successMessage.set('נרשמת לקורס בהצלחה!');
          this.isEnrolled.set(true);           this.isLoading.set(false);
        },
        error: (error: HttpErrorResponse) => {
          console.error('שגיאה בהרשמה:', error);
          this.errorMessage.set(error.error?.message || 'שגיאה בהרשמה לקורס.');
          this.isLoading.set(false);
        }
      });
    }
  }

  deleteLesson(lessonId: number): void {
    const currentCourse = this.course();
        if (!currentCourse || this.authService.currentUserRole() !== 'teacher' || currentCourse.teacherId !== this.authService.currentUserId()) {
      this.errorMessage.set('אין לך הרשאה לבצע פעולה זו.');
      return;
    }

    if (confirm(`האם אתה בטוח שברצונך למחוק את השיעור?`)) {
      this.courseService.deleteLesson(currentCourse.id, lessonId).subscribe({
        next: () => {
          this.successMessage.set('השיעור נמחק בהצלחה!');
          this.errorMessage.set(null);
                    this.lessons.update(lessons => lessons ? lessons.filter(l => l.id !== lessonId) : null);
        },
        error: (error: HttpErrorResponse) => {
          console.error('שגיאה במחיקת שיעור:', error);
          this.errorMessage.set(error.error?.message || 'שגיאה במחיקת השיעור.');
          this.successMessage.set(null);
        }
      });
    }
  }

  editCourse(): void {
    const currentCourse = this.course();
    if (currentCourse) {
      this.router.navigate(['/courses/edit', currentCourse.id]);
    } else {
      this.errorMessage.set('לא ניתן לערוך קורס שאינו נטען.');
    }
  }

  deleteCourse(): void {
    const currentCourse = this.course();
    if (!currentCourse) {
      this.errorMessage.set('שגיאה: לא נבחר קורס למחיקה.');
      return;
    }

    if (confirm(`האם אתה בטוח שברצונך למחוק את הקורס "${currentCourse.title}"?`)) {
      this.courseService.deleteCourse(currentCourse.id).subscribe({
        next: () => {
          this.successMessage.set('הקורס נמחק בהצלחה!');
          this.errorMessage.set(null);
          this.router.navigate(['/courses']);         },
        error: (error: HttpErrorResponse) => {
          console.error('שגיאה במחיקת קורס:', error);
          this.errorMessage.set(error.error?.message || 'שגיאה במחיקת הקורס.');
          this.successMessage.set(null);
        }
      });
    }
  }
}