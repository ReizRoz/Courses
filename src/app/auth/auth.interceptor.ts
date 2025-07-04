// src/app/auth/auth.interceptor.ts
import { Injectable, Injector } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse // ייבוא HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators'; // ייבוא catchError
import { AuthService } from '../service/auth.service'; // וודא שהנתיב נכון לשירות שלך (זהו הנתיב המקורי שלך)

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  // שינוי הקונסטרוקטור: הזריק Injector במקום AuthService ישירות
  // זה נחוץ כדי למנוע "תלות מעגלית" במקרים מסוימים שבהם ה-AuthService
  // עצמו משתמש ב-HttpClient (וזהו המצב שלך).
  constructor(private injector: Injector) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // השתמש ב-Injector כדי לקבל את המופע של AuthService רק כאשר הוא נדרש
    const authService = this.injector.get(AuthService);
    const authToken = authService.getToken(); // קבל את הטוקן הגולמי מה-AuthService

    // שכפל את הבקשה והוסף את כותרת ה-Authorization אם קיים טוקן
    let authReq = request; // התחל עם הבקשה המקורית
    if (authToken) {
      authReq = request.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}` // בניית כותרת ה-Authorization
        }
      });
    }

    // העבר את הבקשה המטופלת (עם הטוקן או בלעדיו) לשלב הבא בשרשרת ה-Interceptors
    // הוספת טיפול בשגיאות 401 (Unauthorized)
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // אם השרת החזיר 401, זה יכול להעיד על טוקן לא תקף/פג תוקף/חסר.
        // במצב כזה, ננתק את המשתמש.
        if (error.status === 401) {
          console.warn('AuthInterceptor: Unauthorized request (401). Logging out...');
          authService.logout(); // קריאה לפונקציית ה-logout ב-AuthService
          // אופציונלי: הצג הודעה למשתמש
        }
        // זרוק את השגיאה הלאה כדי שרכיבים אחרים יוכלו לטפל בה
        return throwError(() => error);
      })
    );
  }
}