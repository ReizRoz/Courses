
import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'; import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { User } from '../models/user.model'; 
@Injectable({
  providedIn: 'root'
})
export class UserService {   private apiUrl = 'http://localhost:3000/api';
  public allUsers = signal<User[]>([]);

  constructor(private http: HttpClient) { }

  loadAllUsers(): Observable<User[]> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders(); 
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);     }


    return this.http.get<User[]>(`${this.apiUrl}/users`, { headers: headers }).pipe(
      tap(users => {
        this.allUsers.set(users);
      })
    );
  }

  getTeacherNameById(teacherId: number): string {
    const user = this.allUsers().find(u => u.id === teacherId && u.role === 'teacher');
    return user ? user.name : 'מורה לא ידוע';
  }
}