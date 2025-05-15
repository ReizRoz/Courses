import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Course } from '../models/course.modul'; // נתיב מעודכן
import { AuthService } from './auth.service'

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = 'http://localhost:3000/api/courses ';
  private authTokenKey = 'authToken';
  constructor(private http: HttpClient, private authService: AuthService) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem(this.authTokenKey);
    if (token) {
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
    }
    return new HttpHeaders();
  }

  // קבלת כל הקורסים
  getCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  // קבלת קורס לפי ID
  getCourse(id: number): Observable<Course> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Course>(url, { headers: this.getAuthHeaders() });
  }

  // יצירת קורס חדש (דורש הרשאת מורה)
  createCourse(course: { title: string, description: string, teacherId: number }): Observable<{ message: string, courseId: number }> {
    return this.http.post<{ message: string, courseId: number }>(this.apiUrl, course, { headers: this.getAuthHeaders() });
  }

  // עדכון קורס קיים (דורש הרשאת מורה)
  updateCourse(id: number, course: { title: string, description: string, teacherId: number }): Observable<{ message: string }> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<{ message: string }>(url, course, { headers: this.getAuthHeaders() });
  }

  // מחיקת קורס לפי ID (דורש הרשאת מורה)
  deleteCourse(id: number): Observable<{ message: string }> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<{ message: string }>(url, { headers: this.getAuthHeaders() });
  }

  // הוספת תלמיד לקורס
  enrollStudent(courseId: number, userId: number): Observable<{ message: string }> {
    const url = `${this.apiUrl}/${courseId}/enroll`;
    return this.http.post<{ message: string }>(url, { userId }, { headers: this.getAuthHeaders() });
  }

  // קבלת רשימת שיעורים בקורס
  getLessonsForCourse(courseId: number): Observable<any[]> { // החלף any[] במודל מתאים אם יש לך
    const url = `${this.apiUrl}/${courseId}/lessons`;
    return this.http.get<any[]>(url, { headers: this.getAuthHeaders() });
  }
}
