import { Component, OnInit, signal } from '@angular/core';
import { CourseService } from '../service/course.service';
import { Course } from '../models/course.modul'

@Component({
  selector: 'app-courses-list',
  templateUrl: './courses-list.component.html', // קישור לקובץ ה-HTML הנפרד
  styleUrls: ['./courses-list.component.scss']
})
export class CoursesListComponent implements OnInit {
  courses: Course[] | null = null;
  errorMessage = signal<string | null>(null);

  constructor(private courseService: CourseService) { }

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.courses = null;
    this.errorMessage.set(null);
    this.courseService.getCourses().subscribe(
      (data: Course[]) => {
        this.courses = data;
      },
      (error:any) => {
        console.error('שגיאה בטעינת הקורסים:', error);
        this.errorMessage.set(error.message || 'אירעה שגיאה לא ידועה בטעינת הקורסים.');
        this.courses = [];
      }
    );
  }
}