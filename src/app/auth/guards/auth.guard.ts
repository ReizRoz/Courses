// src/app/auth/guards/auth.guard.ts

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../service/auth.service'; // ודא שהנתיב ל-AuthService נכון

// *** חשוב לוודא שמילת המפתח 'export' נמצאת כאן ***
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true; // המשתמש מחובר, אפשר גישה
  } else {
    console.warn('Access denied. User is not authenticated. Redirecting to login.');
    router.navigate(['/login']); // המשתמש לא מחובר, נווט לדף ההתחברות
    return false; // מונע גישה לנתיב
  }
};