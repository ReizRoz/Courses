// src/app/routes.ts
import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';

import { teacherGuard } from './auth/guards/teacher.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // נתיבים לרשימת קורסים ופרטי קורס
  // חשוב: נתיב עם ה-ID קודם כדי למנוע התנגשות

  {
    path: 'courses',
    loadComponent: () => import('./courses/courses-list/courses-list.component').then(m => m.CoursesListComponent)
  },

  // נתיבים ליצירה ועריכה - מפנים לקומפוננטה המאוחדת CourseFormComponent
  {
    path: 'courses/create', // נתיב ליצירת קורס חדש
    loadComponent: () => import('./courses/course-form/course-form.component').then(m => m.CourseFormComponent),
    canActivate: [teacherGuard] // נתיב מוגן למורים בלבד
  },
  {
    path: 'courses/edit/:id', // נתיב לעריכת קורס קיים, עם פרמטר ID
    loadComponent: () => import('./courses/course-form/course-form.component').then(m => m.CourseFormComponent),
    canActivate: [teacherGuard] // נתיב מוגן למורים בלב
  },
  {
    path: 'courses/:id',
    loadComponent: () => import('./courses/course-details/course-details.component').then(m => m.CourseDetailsComponent)
  },
  // נתיב ה-wildcard חייב להיות האחרון
  { path: '**', redirectTo: '/courses' }
];

console.log('Routes loaded', routes);