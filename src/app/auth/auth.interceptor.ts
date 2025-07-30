
import { Injectable, Injector } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators'; import { AuthService } from '../service/auth.service'; 
@Injectable()
export class AuthInterceptor implements HttpInterceptor {




  constructor(private injector: Injector) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const authService = this.injector.get(AuthService);
    const authToken = authService.getToken(); 

    let authReq = request;     if (authToken) {
      authReq = request.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`         }
      });
    }



    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {


        if (error.status === 401) {
          console.warn('AuthInterceptor: Unauthorized request (401). Logging out...');
          authService.logout(); 
        }

        return throwError(() => error);
      })
    );
  }
}