// src/app/service/course.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Course, Lesson } from '../models/course.modul';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  // **תיקון קריטי כאן:** ה-apiUrl חייב לכלול /courses בסופו
  // כדי להתאים לניתוב השרת שבו הראוטר של הקורסים מוגדר תחת '/api/courses'
  private apiUrl = 'http://localhost:3000/api/courses';

  constructor(private http: HttpClient) {}

  getAllCourses(): Observable<Course[]> {
    // URL יהיה: http://localhost:3000/api/courses
    return this.http.get<Course[]>(`${this.apiUrl}`).pipe(
      tap(courses => console.log('Fetched courses', courses)),
      catchError(this.handleError)
    );
  }

  getCourseById(id: number): Observable<Course> {
    // URL יהיה: http://localhost:3000/api/courses/:id
    return this.http.get<Course>(`${this.apiUrl}/${id}`).pipe(
      tap(course => console.log('Fetched course by ID:', course)),
      catchError(this.handleError)
    );
  }

  createCourse(courseData: { title: string, description: string, teacherId: number }): Observable<any> {
    // URL יהיה: http://localhost:3000/api/courses
    return this.http.post<any>(`${this.apiUrl}`, courseData).pipe(
      tap(response => console.log('Course created:', response)),
      catchError(this.handleError)
    );
  }

  updateCourse(id: number, courseData: { title?: string, description?: string, teacherId?: number }): Observable<any> {
    // URL יהיה: http://localhost:3000/api/courses/:id
    return this.http.put<any>(`${this.apiUrl}/${id}`, courseData).pipe(
      tap(response => console.log('Course updated:', response)),
      catchError(this.handleError)
    );
  }

  deleteCourse(id: number): Observable<any> {
    // URL יהיה: http://localhost:3000/api/courses/:id
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      tap(response => console.log('Course deleted:', response)),
      catchError(this.handleError)
    );
  }

  // --- Enrollment related methods ---
  enrollInCourse(courseId: number, userId: number): Observable<any> {
    // URL יהיה: http://localhost:3000/api/courses/:courseId/enroll
    return this.http.post(`${this.apiUrl}/${courseId}/enroll`, { userId });
  }

  unenrollFromCourse(courseId: number, userId: number): Observable<any> {
    // URL יהיה: http://localhost:3000/api/courses/:courseId/unenroll
    return this.http.delete(`${this.apiUrl}/${courseId}/unenroll`, { body: { userId: userId } });
  }

  // --- Lesson related methods ---
  getLessonsByCourseId(courseId: number): Observable<Lesson[]> {
    // URL יהיה: http://localhost:3000/api/courses/:courseId/lessons
    return this.http.get<Lesson[]>(`${this.apiUrl}/${courseId}/lessons`).pipe(
      tap(lessons => console.log(`Fetched lessons for course ${courseId}:`, lessons)),
      catchError(this.handleError)
    );
  }

  getLessonById(courseId: number, lessonId: number): Observable<Lesson> {
    // URL יהיה: http://localhost:3000/api/courses/:courseId/lessons/:lessonId
    return this.http.get<Lesson>(`${this.apiUrl}/${courseId}/lessons/${lessonId}`).pipe(
      tap(lesson => console.log(`Fetched lesson ${lessonId} for course ${courseId}:`, lesson)),
      catchError(this.handleError)
    );
  }

  createLesson(courseId: number, lessonData: { title: string, content: string }): Observable<any> {
    // URL יהיה: http://localhost:3000/api/courses/:courseId/lessons
    return this.http.post<any>(`${this.apiUrl}/${courseId}/lessons`, lessonData).pipe(
      tap(response => console.log('Lesson created:', response)),
      catchError(this.handleError)
    );
  }

  updateLesson(courseId: number, lessonId: number, lessonData: { title?: string, content?: string }): Observable<any> {
    // URL יהיה: http://localhost:3000/api/courses/:courseId/lessons/:lessonId
    return this.http.put<any>(`${this.apiUrl}/${courseId}/lessons/${lessonId}`, lessonData).pipe(
      tap(response => console.log('Lesson updated:', response)),
      catchError(this.handleError)
    );
  }

  deleteLesson(courseId: number, lessonId: number): Observable<any> {
    // URL יהיה: http://localhost:3000/api/courses/:courseId/lessons/:lessonId
    return this.http.delete<any>(`${this.apiUrl}/${courseId}/lessons/${lessonId}`).pipe(
      tap(response => console.log('Lesson deleted:', response)),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}