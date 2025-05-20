import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';

export const teacherGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const userRole = authService.getUserRole();

  if (userRole === 'teacher') {
    return true; // למורה מותר לגשת
  } else {
    // אם לא מורה, נווט לדף הבית או דף שגיאה
    router.navigate(['/']); // או ל-/unauthorized
    return false;
  }
};