// src/app/service/course.service.ts

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Course, Lesson } from '../models/course.modul'; // וודא שהנתיב נכון

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = 'http://localhost:3000/api'; // וודא שה-URL הבסיסי נכון

  constructor(private http: HttpClient) { }

  getAllCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/courses`).pipe(
      tap(courses => console.log('Fetched courses', courses)),
      catchError(error => {
        console.error('Error fetching courses:', error);
        return throwError(() => new Error('Failed to fetch courses.'));
      })
    );
  }

  getCourseById(courseId: number): Observable<Course> {
    return this.http.get<Course>(`${this.apiUrl}/courses/${courseId}`).pipe(
      tap(course => console.log('Fetched course by ID', course)),
      catchError(error => {
        console.error(`Error fetching course with ID ${courseId}:`, error);
        return throwError(() => new Error(`Failed to fetch course with ID ${courseId}.`));
      })
    );
  }

  // **** פונקציה חדשה לטעינת שיעורים לפי ID קורס ****
  getLessonsByCourseId(courseId: number): Observable<Lesson[]> {
    return this.http.get<Lesson[]>(`${this.apiUrl}/courses/${courseId}/lessons`).pipe(
      tap(lessons => console.log(`Workspaceed lessons for course ${courseId}:`, lessons)),
      catchError(error => {
        console.error(`Error fetching lessons for course with ID ${courseId}:`, error);
        return throwError(() => new Error(`Failed to fetch lessons for course with ID ${courseId}.`));
      })
    );
  }

  // כאן תוכל להוסיף פונקציות נוספות כמו createCourse, updateCourse, deleteCourse וכו'
  // Create Course (POST /api/courses) - דוגמה, אם תרצה להוסיף
  createCourse(courseData: Partial<Course>): Observable<Course> {
    return this.http.post<Course>(`${this.apiUrl}/courses`, courseData).pipe(
      tap(newCourse => console.log('Course created:', newCourse)),
      catchError(error => {
        console.error('Error creating course:', error);
        return throwError(() => new Error('Failed to create course.'));
      })
    );
  }

  // Enroll in Course (POST /api/courses/:courseId/enroll) - דוגמה, נטפל בזה בהמשך
  enrollInCourse(courseId: number, userId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/courses/${courseId}/enroll`, { userId }).pipe(
      tap(() => console.log(`User ${userId} enrolled in course ${courseId}`)),
      catchError(error => {
        console.error(`Error enrolling user ${userId} in course ${courseId}:`, error);
        return throwError(() => new Error(`Failed to enroll in course ${courseId}.`));
      })
    );
  }

  // Unenroll from Course (DELETE /api/courses/:courseId/unenroll) - דוגמה
  unenrollFromCourse(courseId: number, userId: number): Observable<any> {
    // שימו לב: בחלק מהשרתים, DELETE עם body יכול להיות בעייתי.
    // אם השרת שלך מצפה ל-userId כפרמטר ב-URL (לדוגמה: /unenroll/:userId), שנה בהתאם.
    // אחרת, זהו הפתרון הסטנדרטי.
    return this.http.request('DELETE', `${this.apiUrl}/courses/${courseId}/unenroll`, { body: { userId } }).pipe(
      tap(() => console.log(`User ${userId} unenrolled from course ${courseId}`)),
      catchError(error => {
        console.error(`Error unenrolling user ${userId} from course ${courseId}:`, error);
        return throwError(() => new Error(`Failed to unenroll from course ${courseId}.`));
      })
    );
  }

  // **** פונקציה חדשה לעדכון קורס ****
  updateCourse(courseId: number, courseData: Partial<Course>): Observable<Course> {
    return this.http.put<Course>(`<span class="math-inline">\{this\.apiUrl\}/courses/</span>{courseId}`, courseData).pipe(
      tap(updatedCourse => console.log(`Course ${courseId} updated:`, updatedCourse)),
      catchError(error => {
        console.error(`Error updating course ${courseId}:`, error);
        return throwError(() => new Error(`Failed to update course ${courseId}.`));
      })
    );
    }

  deleteCourse(courseId: number): Observable<any> {
    return this.http.delete<any>(`<span class="math-inline">\{this\.apiUrl\}/courses/</span>{courseId}`).pipe(
      tap(() => console.log(`Course ${courseId} deleted successfully.`)),
      catchError(error => {
        console.error(`Error deleting course ${courseId}:`, error);
        return throwError(() => new Error(`Failed to delete course ${courseId}.`));
      })
    );
  }}