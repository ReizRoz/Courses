import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { EditProfileComponent } from './auth/edit-profile/edit-profile.component'; // ודא ייבוא נכון

import { teacherGuard } from './auth/guards/teacher.guard'; // ודא ייבוא נכון
import { authGuard } from './auth/guards/auth.guard';       // ודא ייבוא נכון (כמו שהצענו בתשובה קודמת)

import { LessonFormComponent } from './courses/lesson-form/lesson-form.component';


export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  {
    path: 'profile/edit',
    component: EditProfileComponent,
    canActivate: [authGuard] // נדרש אימות כדי לערוך פרופיל
  },

  {
    path: 'courses',
    loadComponent: () => import('./courses/courses-list/courses-list.component').then(m => m.CoursesListComponent),
    // לרוב, כדאי להוסיף כאן גם canActivate: [authGuard] אם רשימת הקורסים דורשת התחברות
  },

  {
    path: 'courses/create',
    loadComponent: () => import('./courses/course-form/course-form.component').then(m => m.CourseFormComponent),
    canActivate: [teacherGuard]
  },
  {
    path: 'courses/edit/:id',
    loadComponent: () => import('./courses/course-form/course-form.component').then(m => m.CourseFormComponent),
    canActivate: [teacherGuard]
  },
  {
    path: 'courses/:id',
    loadComponent: () => import('./courses/course-details/course-details.component').then(m => m.CourseDetailsComponent),
    // לרוב, כדאי להוסיף כאן גם canActivate: [authGuard] אם פרטי קורס דורשים התחברות
  },

  {
    path: 'courses/:courseId/add-lesson',
    component: LessonFormComponent,
    canActivate: [teacherGuard]
  },
  {
    path: 'courses/:courseId/edit-lesson/:lessonId',
    component: LessonFormComponent,
    canActivate: [teacherGuard]
  },

  { path: '**', redirectTo: '/courses' }
];