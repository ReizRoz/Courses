import { HttpClient } from "@angular/common/http";
import { Injectable, signal } from "@angular/core";
import { Observable, of, throwError } from "rxjs";
import { tap, catchError } from 'rxjs/operators';
// אין צורך ב-jwtDecode יותר אם לא נשתמש בו
// import { jwtDecode } from 'jwt-decode';

interface RegistrationResponse {
  message: string;
  userId: number; // או string, תלוי איך השרת מחזיר את ה-ID
  token: string;
  role: string; // ודא שהשרת מחזיר role בהרשמה
  username?: string;
}

// נעדכן את הממשק כדי שיתאים בדיוק לתגובת השרת שקיבלת
interface LoginResponse {
  token: string;
  userId: number;
  role: string;
  // נניח שגם ה-name מוחזר ישירות בתגובה (כפי שזה נראה לרוב ב-Postman)
  name?: string; // הוספתי ? כי לא בטוח אם השרת מחזיר name או username, תלוי במימוש השרת
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private readonly TOKEN_KEY = 'authToken';
  private readonly USER_ID_KEY = 'currentUserId';
  private readonly USER_ROLE_KEY = 'currentUserRole';
  private readonly USER_NAME_KEY = 'currentUserName'; // מפתח חדש לשם

  currentUserId=signal<number | null>(null);
  currentUserRole=signal<string | null>(null);
  currentUserName=signal<string | null>(null);

  constructor(private http: HttpClient) {
    // טען את פרטי המשתמש מ-sessionStorage בעת אתחול השירות
    this.loadUserInfoFromSessionStorage();
  }

  register(userData: any): Observable<RegistrationResponse> {
    return this.http.post<RegistrationResponse>(`${this.apiUrl}/register`, userData);
  }

  login(credentials: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.token) {
          // שמירת הטוקן ופרטי המשתמש ב-sessionStorage
          sessionStorage.setItem(this.TOKEN_KEY, response.token);
          sessionStorage.setItem(this.USER_ID_KEY, response.userId.toString());
          sessionStorage.setItem(this.USER_ROLE_KEY, response.role);
          if (response.name) { // אם השדה name קיים בתגובה, שמור אותו
            sessionStorage.setItem(this.USER_NAME_KEY, response.name);
          }
          // עדכון המשתנים בזיכרון ה-Service
          this.currentUserId.set(response.userId);
          this.currentUserRole.set(response.role);
          this.currentUserName.set(response.name||null); // ודא שאתה מקבל את השם אם הוא קיים
        } else {
            console.error("Login response missing token!");
            this.logout();
        }
        console.log('Login successful! Token and user info saved in sessionStorage.');
      }),
      catchError(error => {
        console.error('Login failed:', error);
        this.logout();
        return throwError(() => new Error('Login failed'));
      })
    );
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  getUserId(): number | null {
    // המידע זמין ישירות מה-Service או מ-sessionStorage
    return this.currentUserId() || (sessionStorage.getItem(this.USER_ID_KEY) ? parseInt(sessionStorage.getItem(this.USER_ID_KEY)!, 10) : null);
  }

  getUserRole(): string | null {
    // המידע זמין ישירות מה-Service או מ-sessionStorage
    return this.currentUserRole() || sessionStorage.getItem(this.USER_ROLE_KEY);
  }

  getUserName(): string | null {
    // המידע זמין ישירות מה-Service או מ-sessionStorage
    return this.currentUserName() || sessionStorage.getItem(this.USER_NAME_KEY);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    // פה נניח שהטוקן תקין אם הוא קיים (כי אין לנו את שדה ה-exp מהטוקן המפוענח)
    // אם היית יכול לוודא שהטוקן מכיל שדה 'exp', היית יכול לבדוק תוקף כאן
    // אם השרת שלך מבצע אימות טוקן על כל בקשה מוצפנת, אז מספיק שהטוקן קיים
    return true;
  }

  logout(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_ID_KEY);
    sessionStorage.removeItem(this.USER_ROLE_KEY);
    sessionStorage.removeItem(this.USER_NAME_KEY);
    this.currentUserId.set(null);
    this.currentUserRole.set(null);
    this.currentUserName.set(null);
    console.log('User logged out. Token and user info cleared.');
  }

  // פונקציה לטעינת פרטי משתמש מ-sessionStorage בעת אתחול השירות
  private loadUserInfoFromSessionStorage(): void {
    const storedUserId = sessionStorage.getItem(this.USER_ID_KEY);
    const storedUserRole = sessionStorage.getItem(this.USER_ROLE_KEY);
    const storedUserName = sessionStorage.getItem(this.USER_NAME_KEY); // טעינת שם
    const storedToken = sessionStorage.getItem(this.TOKEN_KEY);

    // נוודא שקיים טוקן וגם פרטי משתמש. אם אחד מהם חסר, זה מצב לא תקין.
    if (storedToken && storedUserId && storedUserRole) {
      this.currentUserId.set(parseInt(storedUserId, 10));
      this.currentUserRole.set(storedUserRole);
      this.currentUserName.set(storedUserName); // הקצאת השם
      console.log('User info loaded from sessionStorage:', { userId: this.currentUserId, role: this.currentUserRole, name: this.currentUserName });
    } else {
      this.logout(); // אם משהו חסר, נתנתק כדי למנוע מצב לא עקבי
    }
  }
}