// src/app/auth/auth.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../service/auth.service'; // וודא שהנתיב נכון לשירות שלך

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // השתמש בפונקציה getAuthHeaders מה-AuthService שלך
    const authHeaders = this.authService.getAuthHeaders();

    // שכפל את הבקשה והוסף את הכותרות שקיבלת מה-AuthService
    // פונקציית clone של request מאפשרת להחליף חלקים מהבקשה (כמו כותרות)
    const authReq = request.clone({
      headers: authHeaders
    });

    // העבר את הבקשה המשוכפלת (עם הכותרות החדשות) לשלב הבא בשרשרת ה-Interceptors
    return next.handle(authReq);
  }
}