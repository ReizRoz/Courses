
import { Component, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseService } from '../../service/course.service';
import { AuthService } from '../../service/auth.service';
import { UserService } from '../../service/user.service'; // Added UserService import - זה בסדר
import { Course } from '../../models/course.modul';
import { HeaderComponent } from '../../shared/header/header.component';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MaterialModule } from '../../shared/material/material.module';

@Component({
  selector: 'app-courses-list',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    MaterialModule
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
    public courseService: CourseService,
    public authService: AuthService,
    private router: Router,
    private userService: UserService // UserService מוזרק כאן
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

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
    this.router.navigate(['/course', courseId]);
  }

  editCourse(courseId: number): void {
    this.router.navigate(['/edit-course', courseId]);
  }

  deleteCourse(courseId: number): void {
    if (confirm('האם אתה בטוח שברצונך למחוק קורס זה?')) {
      this.courseService.deleteCourse(courseId).subscribe({
        next: () => {
          this.errorMessage.set(null);
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