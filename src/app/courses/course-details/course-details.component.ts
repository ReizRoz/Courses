// src/app/courses/course-details/course-details.component.ts
import { Component, OnInit, signal, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CourseService } from '../../service/course.service';
import { Course, Lesson } from '../../models/course.modul';
import { AuthService } from '../../service/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { HeaderComponent } from '../../shared/header/header.component';
// **הסר את ייבוא LessonFormComponent מכיוון שהוא לא נטען כעת כפופאפ בתוך הקומפוננטה הזו.**
// import { LessonFormComponent } from '../lesson-form/lesson-form.component';
import { Subscription } from 'rxjs';
import { UserService } from '../../service/user.service';
import { MaterialModule } from '../../shared/material/material.module';

@Component({
  selector: 'app-course-details',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    MaterialModule,
    // **הסר את LessonFormComponent מה-imports כאן, הוא נטען דרך ה-router.**
    // LessonFormComponent,
    RouterModule // נשאר כי אתה משתמש ב-routerLink ב-HTML
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
  isLoading = signal<boolean>(true);

  // **משתני Signal לשליטה בפופאפ - אין בהם צורך אם עוברים לדף חדש. ניתן להסירם.**
  // showLessonForm = signal<boolean>(false);
  // selectedLesson = signal<Lesson | undefined>(undefined);

  private routeSubscription: Subscription | undefined;

  constructor(
    private activatedRoute: ActivatedRoute,
    private courseService: CourseService,
    public authService: AuthService,
    public userService: UserService,
    public router: Router
  ) {
    effect(() => {
      this.checkEnrollmentStatus();
    });
  }

  ngOnInit(): void {
    this.routeSubscription = this.activatedRoute.paramMap.subscribe((params: any) => {
      const courseId = Number(params.get('id'));
      if (courseId) {
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
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.courseService.getCourseById(courseId).subscribe({
      next: (data: Course) => {
        this.course.set(data);
        this.checkEnrollmentStatus();
        this.loadLessons(courseId);
        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        console.error('שגיאה בטעינת פרטי הקורס:', error);
        this.errorMessage.set(error.error?.message || 'אירעה שגיאה בטעינת פרטי הקורס.');
        this.course.set(null);
        this.isLoading.set(false);
      }
    });
  }

  loadLessons(courseId: number): void {
    this.courseService.getLessonsByCourseId(courseId).subscribe({
      next: (data: Lesson[]) => {
        this.lessons.set(data);
      },
      error: (error: HttpErrorResponse) => {
        console.error('שגיאה בטעינת שיעורים:', error);
        this.errorMessage.set(error.error?.message || 'אירעה שגיאה בטעינת השיעורים.');
        this.lessons.set([]);
      }
    });
  }

  checkEnrollmentStatus(): void {
    const currentCourse = this.course();
    const currentUserId = this.authService.currentUserId();

    if (currentCourse && currentUserId !== null && currentCourse.enrolledStudents && Array.isArray(currentCourse.enrolledStudents)) {
      this.isEnrolled.set(currentCourse.enrolledStudents.includes(currentUserId));
    } else {
      this.isEnrolled.set(false);
    }
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

    if (this.isEnrolled()) {
      // ביטול הרשמה
      this.courseService.unenrollFromCourse(courseId, currentUserId).subscribe({
        next: () => {
          this.successMessage.set('ההרשמה בוטלה בהצלחה!');
          this.errorMessage.set(null);
          this.course.update(course => {
            if (course) {
              const updatedEnrolledStudents = course.enrolledStudents.filter((id: number) => id !== currentUserId);
              return { ...course, enrolledStudents: updatedEnrolledStudents };
            }
            return null;
          });
        },
        error: (error: HttpErrorResponse) => {
          console.error('שגיאה בביטול הרשמה:', error);
          this.errorMessage.set(error.error?.message || 'שגיאה בביטול ההרשמה לקורס.');
          this.successMessage.set(null);
        }
      });
    } else {
      // הרשמה
      this.courseService.enrollInCourse(courseId, currentUserId).subscribe({
        next: () => {
          this.successMessage.set('נרשמת לקורס בהצלחה!');
          this.errorMessage.set(null);
          this.course.update(course => {
            if (course) {
              const currentEnrolledStudents = [...course.enrolledStudents];
              if (!currentEnrolledStudents.includes(currentUserId)) {
                currentEnrolledStudents.push(currentUserId);
              }
              return { ...course, enrolledStudents: currentEnrolledStudents };
            }
            return null;
          });
        },
        error: (error: HttpErrorResponse) => {
          console.error('שגיאה בהרשמה:', error);
          this.errorMessage.set(error.error?.message || 'שגיאה בהרשמה לקורס.');
          this.successMessage.set(null);
        }
      });
    }
  }

  // **המתודות האלה (openLessonForm, closeLessonForm, onLessonSaved) אינן נחוצות יותר**
  // **אם הטופס נפתח בעמוד נפרד באמצעות הראוטר. ניתן להסיר אותן.**
  // openLessonForm(lesson?: Lesson): void {
  //   const currentCourse = this.course();
  //   if (!currentCourse || this.authService.currentUserRole() !== 'teacher' || currentCourse.teacherId !== this.authService.currentUserId()) {
  //     this.errorMessage.set('אין לך הרשאה לבצע פעולה זו.');
  //     return;
  //   }
  //   this.selectedLesson.set(lesson);
  //   this.showLessonForm.set(true);
  // }

  // closeLessonForm(): void {
  //   this.showLessonForm.set(false);
  //   this.selectedLesson.set(undefined);
  // }

  // onLessonSaved(): void {
  //   this.successMessage.set('השיעור נשמר בהצלחה!');
  //   this.errorMessage.set(null);
  //   this.closeLessonForm();
  //   const currentCourse = this.course();
  //   if (currentCourse) {
  //     this.loadLessons(currentCourse.id); // רענן את רשימת השיעורים לאחר שמירה
  //   }
  // }

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
          this.router.navigate(['/courses']);
        },
        error: (error: HttpErrorResponse) => {
          console.error('שגיאה במחיקת קורס:', error);
          this.errorMessage.set(error.error?.message || 'שגיאה במחיקת הקורס.');
          this.successMessage.set(null);
        }
      });
    }
  }
}