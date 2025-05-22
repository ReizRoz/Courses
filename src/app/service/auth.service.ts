// src/app/service/auth.service.ts
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, signal, computed } from "@angular/core";
import { Observable, throwError, of } from "rxjs"; // הוסף of
import { tap, catchError, switchMap, map } from 'rxjs/operators'; // הוסף map
import { Router } from '@angular/router';

// ממשקים לתגובות השרת
interface AuthResponse {
  token: string;
  userId: number;
  role: string;
}

// ממשק לפרטי משתמש מלאים
interface UserDetailsResponse {
  _id: string; // ID של המשתמש, ייתכן שזה אותו userId
  name: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private usersApiUrl = 'http://localhost:3000/api/users';
  private readonly TOKEN_KEY = 'authToken';
  private readonly USER_ID_KEY = 'currentUserId';
  private readonly USER_ROLE_KEY = 'currentUserRole';
  private readonly USER_NAME_KEY = 'currentUserName';

  private _token = signal<string | null>(null);
  private _userId = signal<number | null>(null);
  private _userRole = signal<string | null>(null);
  private _userName = signal<string | null>(null);

  isAuthenticated = computed(() => !!this._token());
  currentUserId = computed(() => this._userId());
  currentUserRole = computed(() => this._userRole());
  currentUserName = computed(() => this._userName());

  constructor(private http: HttpClient, private router: Router) {
    this.loadAuthInfoFromSessionStorage();
  }

  private saveAuthInfo(response: AuthResponse): void {
    if (response.token && response.userId && response.role) {
      sessionStorage.setItem(this.TOKEN_KEY, response.token);
      sessionStorage.setItem(this.USER_ID_KEY, response.userId.toString());
      sessionStorage.setItem(this.USER_ROLE_KEY, response.role);
      
      this._token.set(response.token);
      this._userId.set(response.userId);
      this._userRole.set(response.role);
      
      console.log('Initial auth info saved (token, userId, role).');
    } else {
      console.error("Auth response missing token, userId, or role!");
      this.logout();
    }
  }

  private fetchUserName(userId: number): Observable<UserDetailsResponse> {
    const headers = this.getAuthHeaders();
    return this.http.get<UserDetailsResponse>(`${this.usersApiUrl}/${userId}`, { headers }).pipe(
      tap(userDetails => {
        if (userDetails.name) {
          sessionStorage.setItem(this.USER_NAME_KEY, userDetails.name);
          this._userName.set(userDetails.name);
          console.log('User name fetched and updated:', userDetails.name);
        } else {
          console.warn('User name not found in user details response.');
          sessionStorage.removeItem(this.USER_NAME_KEY);
          this._userName.set(null);
        }
      }),
      catchError(error => {
        console.error('Failed to fetch user name:', error);
        sessionStorage.removeItem(this.USER_NAME_KEY);
        this._userName.set(null);
        return throwError(() => new Error('Failed to fetch user name'));
      })
    );
  }

  private loadAuthInfoFromSessionStorage(): void {
    const storedToken = sessionStorage.getItem(this.TOKEN_KEY);
    const storedUserId = sessionStorage.getItem(this.USER_ID_KEY);
    const storedUserRole = sessionStorage.getItem(this.USER_ROLE_KEY);
    const storedUserName = sessionStorage.getItem(this.USER_NAME_KEY); 

    if (storedToken && storedUserId && storedUserRole) {
      this._token.set(storedToken);
      this._userId.set(parseInt(storedUserId, 10));
      this._userRole.set(storedUserRole);
      this._userName.set(storedUserName);
      console.log('User info loaded from sessionStorage on init.');
      
      // אופציונלי: ודא שהשם עדכני על ידי שליפה מהשרת
      // אם השם לא נטען (למשל, כי sessionStorage היה ריק ממנו), ננסה לשלוף
      // if (!this._userName() && this._userId()) {
      //   this.fetchUserName(this._userId()!).subscribe();
      // }

    } else {
      this.logout();
    }
  }

  register(userData: any): Observable<AuthResponse> { // נשאר AuthResponse
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap(response => {
        this.saveAuthInfo(response);
      }),
      switchMap(response => {
        if (response.userId) {
          // מבצע את fetchUserName, ואז משנה את התגובה חזרה ל-AuthResponse
          return this.fetchUserName(response.userId).pipe(
            map(() => response) // מחזיר את ה-AuthResponse המקורי לאחר שליפת השם
          );
        }
        return throwError(() => new Error('Registration successful but missing userId for name fetch.'));
      }),
      catchError(error => {
        console.error('Registration process failed:', error);
        this.logout();
        return throwError(() => new Error('Registration failed'));
      })
    );
  }

  login(credentials: any): Observable<AuthResponse> { // נשאר AuthResponse
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.saveAuthInfo(response);
      }),
      switchMap(response => {
        if (response.userId) {
          // מבצע את fetchUserName, ואז משנה את התגובה חזרה ל-AuthResponse
          return this.fetchUserName(response.userId).pipe(
            map(() => response) // מחזיר את ה-AuthResponse המקורי לאחר שליפת השם
          );
        }
        return throwError(() => new Error('Login successful but missing userId for name fetch.'));
      }),
      catchError(error => {
        console.error('Login process failed:', error);
        this.logout();
        return throwError(() => new Error('Login failed'));
      })
    );
  }

  logout(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_ID_KEY);
    sessionStorage.removeItem(this.USER_ROLE_KEY);
    sessionStorage.removeItem(this.USER_NAME_KEY);

    this._token.set(null);
    this._userId.set(null);
    this._userRole.set(null);
    this._userName.set(null);

    console.log('User logged out. All info cleared.');
    this.router.navigate(['/']);
  }

  getAuthHeaders(): HttpHeaders {
    const token = this._token();
    if (token) {
      return new HttpHeaders().set('Authorization', `Bearer ${token}`);
    }
    return new HttpHeaders();
  }

  getUserNameFirstLetter(): string | null {
    const name = this.currentUserName();
    return name ? name.charAt(0).toUpperCase() : null;
  }
}