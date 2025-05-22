// src/app/service/user.service.ts
import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // **ודא ש-HttpHeaders מיובא**
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { User } from '../models/user.model'; // ודא שיש לך מודל User

@Injectable({
  providedIn: 'root'
})
export class UserService { // או AuthService אם זה השם שבחרת
  private apiUrl = 'http://localhost:3000/api';
  public allUsers = signal<User[]>([]);

  constructor(private http: HttpClient) { }

  loadAllUsers(): Observable<User[]> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders(); // **אתחל כ-HttpHeaders**

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`); // **הוסף את ה-token ל-HttpHeaders**
    }

    // **הוסף את טיפוס התגובה ל-get<User[]>()**
    return this.http.get<User[]>(`${this.apiUrl}/users`, { headers: headers }).pipe(
      tap(users => {
        this.allUsers.set(users);
        console.log('All users loaded:', users);
      })
    );
  }

  getTeacherNameById(teacherId: number): string {
    const user = this.allUsers().find(u => u.id === teacherId && u.role === 'teacher');
    return user ? user.name : 'מורה לא ידוע';
  }
}