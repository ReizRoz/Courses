// src/app/courses/courses-list/courses-list.component.ts
import { Component, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseService } from '../../service/course.service';
import { AuthService } from '../../service/auth.service';
import { Course } from '../../models/course.modul';
import { HeaderComponent } from '../../shared/header/header.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-courses-list',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './courses-list.component.html',
  styleUrls: ['./courses-list.component.scss']
})
export class CoursesListComponent implements OnInit, OnDestroy {
  courses = signal<Course[]>([]);
  errorMessage = signal<string | null>(null);
  isLoading = signal<boolean>(true);

  private courseSubscription: Subscription | undefined;

  constructor(
    private courseService: CourseService,
    public authService: AuthService, // נשאר public לגישה מה-HTML
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    // נטען את כל הקורסים. פונקציונליות "קורסים רשומים" ספציפית
    // תטופל ב-CourseDetailsComponent על בסיס נתוני ה-enrolledStudents בקורס עצמו.
    this.loadCourses();
  }

  ngOnDestroy(): void {
    this.courseSubscription?.unsubscribe();
  }

  loadCourses(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.courseService.getAllCourses().subscribe({
      next: (data: Course[]) => {
        this.courses.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error fetching courses:', error);
        this.errorMessage.set(error.message || 'אירעה שגיאה בטעינת הקורסים.');
        this.isLoading.set(false);
      }
    });
  }

  viewCourseDetails(courseId: number): void {
    // שנה מ-'/course-details' ל-'/course'
    this.router.navigate(['/course', courseId]);
  }

  // מתודות לעריכה ומחיקה של קורסים (למורים)
  editCourse(courseId: number): void {
    this.router.navigate(['/edit-course', courseId]);
  }

  deleteCourse(courseId: number): void {
    if (confirm('האם אתה בטוח שברצונך למחוק קורס זה?')) {
      this.courseService.deleteCourse(courseId).subscribe({
        next: () => {
          this.errorMessage.set(null); // נקה שגיאות קודמות
          // רענן את רשימת הקורסים לאחר המחיקה
          this.loadCourses();
        },
        error: (error) => {
          console.error('Error deleting course:', error);
          this.errorMessage.set(error.error?.message || 'אירעה שגיאה במחיקת הקורס.');
        }
      });
    }
  }

  createNewCourse(): void {
    this.router.navigate(['/create-course']);
  }
}