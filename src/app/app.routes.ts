import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';

import { teacherGuard } from './auth/guards/teacher.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // *** חשוב: נתיב עם ה-ID קודם! ושינוי מ-'course' ל-'courses' לעקביות ***
  { 
    path: 'courses/:id', 
    loadComponent: () => import('./courses/course-details/course-details.component').then(m => m.CourseDetailsComponent) 
  },
  // נתיב לרשימת הקורסים (לאחר הנתיב הספציפי)
  { 
    path: 'courses', 
    loadComponent: () => import('./courses/courses-list/courses-list.component').then(m => m.CoursesListComponent) 
  },

  {
    path: 'create-course',
    loadComponent: () => import('./courses/create-course/create-course.component').then(m => m.CreateCourseComponent),
    canActivate: [teacherGuard] // נתיב מוגן למורים בלבד
  },
  {
    path: 'edit-course/:id',
    loadComponent: () => import('./courses/edit-course/edit-course.component').then(m => m.EditCourseComponent),
    canActivate: [teacherGuard] // נתיב מוגן למורים בלבד
  },
  
  // נתיב ה-wildcard חייב להיות האחרון
  // מומלץ להפנות ל-/courses במקום לדף הבית במקרה של נתיב לא מוכר
  { path: '**', redirectTo: '/courses' } 
];

console.log('Routes loaded', routes);