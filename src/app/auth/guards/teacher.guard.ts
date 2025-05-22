// src/app/auth/guards/teacher.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../service/auth.service'; // וודא שהנתיב נכון

export const teacherGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // גישה ל-signal הציבורי currentUserRole (שם לב לשימוש ב-())
  const userRole = authService.currentUserRole(); 

  // במידה ותרצה/י לאפשר גם לאדמין גישה לנתיבי מורים, שנה/שני את התנאי:
  // if (userRole === 'teacher' || userRole === 'admin') {
  if (userRole === 'teacher') {
    return true; // למורה מותר לגשת
  } else {
    // אם לא מורה, נווט לדף הבית או דף שגיאה/אין הרשאה
    console.warn('Access denied. User role:', userRole); // לצרכי דיבוג
    router.navigate(['/']); // ניווט לדף הבית או ל-/unauthorized
    return false;
  }
};