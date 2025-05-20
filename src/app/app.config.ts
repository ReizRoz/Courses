import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'; // ודא שיש withInterceptorsFromDi
import { AuthInterceptor } from './auth/auth.interceptor'; // ודא שהנתיב נכון

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()), // מאפשר שימוש ב-DI עבור Interceptors
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true } // הגדרת ה-Interceptor כקלאס
  ]
};