import { Injectable } from '@angular/core';
import {HttpRequest,HttpHandler,HttpEvent,HttpInterceptor} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../service/auth.service'; // וודא/י שהנתיב נכון

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authToken = this.authService.getToken(); // קבל/י את הטוקן משירות האימות שלך

    // אם קיים טוקן, שכפל/י את הבקשה והוסף/הוסיפי את כותרת ה-Authorization
    if (authToken) {
      // שכפול הבקשה והוספת הכותרת
      const clonedRequest = request.clone({
        headers: request.headers.set('Authorization', 'Bearer ' + authToken)
      });
      return next.handle(clonedRequest);
    }

    // אם אין טוקן, המשך/המשיכי עם הבקשה המקורית
    return next.handle(request);
  }
}