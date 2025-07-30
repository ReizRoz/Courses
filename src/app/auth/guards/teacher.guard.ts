import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../service/auth.service'; 
export const teacherGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const userRole = authService.currentUserRole(); 
  if (userRole === 'teacher') {
    return true;   } else {
    console.warn('Access denied. User role:', userRole);     router.navigate(['/']);     return false;
  }
};