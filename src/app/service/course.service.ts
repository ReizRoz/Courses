
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Course, Lesson } from '../models/course.modul';

@Injectable({
  providedIn: 'root'
})
export class CourseService {


  private apiUrl = 'http://localhost:3000/api/courses';

  constructor(private http: HttpClient) {}

  getAllCourses(): Observable<Course[]> {

    return this.http.get<Course[]>(`${this.apiUrl}`).pipe(
      tap(courses => console.log('Fetched courses', courses)),
      catchError(this.handleError)
    );
  }

  getCourseById(id: number): Observable<Course> {

    return this.http.get<Course>(`${this.apiUrl}/${id}`).pipe(
      tap(course => console.log('Fetched course by ID:', course)),
      catchError(this.handleError)
    );
  }

  createCourse(courseData: { title: string, description: string, teacherId: number }): Observable<any> {

    return this.http.post<any>(`${this.apiUrl}`, courseData).pipe(
      tap(response => console.log('Course created:', response)),
      catchError(this.handleError)
    );
  }

  updateCourse(id: number, courseData: { title?: string, description?: string, teacherId?: number }): Observable<any> {

    return this.http.put<any>(`${this.apiUrl}/${id}`, courseData).pipe(
      tap(response => console.log('Course updated:', response)),
      catchError(this.handleError)
    );
  }

  deleteCourse(id: number): Observable<any> {

    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      tap(response => console.log('Course deleted:', response)),
      catchError(this.handleError)
    );
  }


  enrollInCourse(courseId: number, userId: number): Observable<any> {

    return this.http.post(`${this.apiUrl}/${courseId}/enroll`, { userId });
  }

  unenrollFromCourse(courseId: number, userId: number): Observable<any> {

    return this.http.delete(`${this.apiUrl}/${courseId}/unenroll`, { body: { userId: userId } });
  }


  getLessonsByCourseId(courseId: number): Observable<Lesson[]> {

    return this.http.get<Lesson[]>(`${this.apiUrl}/${courseId}/lessons`).pipe(
      tap(lessons => console.log(`Fetched lessons for course ${courseId}:`, lessons)),
      catchError(this.handleError)
    );
  }

  getLessonById(courseId: number, lessonId: number): Observable<Lesson> {

    return this.http.get<Lesson>(`${this.apiUrl}/${courseId}/lessons/${lessonId}`).pipe(
      tap(lesson => console.log(`Fetched lesson ${lessonId} for course ${courseId}:`, lesson)),
      catchError(this.handleError)
    );
  }

  createLesson(courseId: number, lessonData: { title: string, content: string }): Observable<any> {

    return this.http.post<any>(`${this.apiUrl}/${courseId}/lessons`, lessonData).pipe(
      tap(response => console.log('Lesson created:', response)),
      catchError(this.handleError)
    );
  }

  updateLesson(courseId: number, lessonId: number, lessonData: { title?: string, content?: string }): Observable<any> {

    return this.http.put<any>(`${this.apiUrl}/${courseId}/lessons/${lessonId}`, lessonData).pipe(
      tap(response => console.log('Lesson updated:', response)),
      catchError(this.handleError)
    );
  }

  deleteLesson(courseId: number, lessonId: number): Observable<any> {

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