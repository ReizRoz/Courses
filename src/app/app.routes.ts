// src/app/routes.ts
import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';

import { teacherGuard } from './auth/guards/teacher.guard';
// **ודא שייבאת את LessonFormComponent**
import { LessonFormComponent } from './courses/lesson-form/lesson-form.component';


export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  {
    path: 'courses',
    loadComponent: () => import('./courses/courses-list/courses-list.component').then(m => m.CoursesListComponent)
  },

  {
    path: 'courses/create',
    loadComponent: () => import('./courses/course-form/course-form.component').then(m => m.CourseFormComponent),
    canActivate: [teacherGuard] // נתיב מוגן למורים בלבד
  },
  {
    path: 'courses/edit/:id',
    loadComponent: () => import('./courses/course-form/course-form.component').then(m => m.CourseFormComponent),
    canActivate: [teacherGuard] // נתיב מוגן למורים בלבד
  },
  {
    path: 'courses/:id', // פרטי קורס
    loadComponent: () => import('./courses/course-details/course-details.component').then(m => m.CourseDetailsComponent)
  },

  
  // נתיבים עבור הוספת ועריכת שיעור בעמוד נפרד
  {
    path: 'courses/:courseId/add-lesson', // נתיב להוספת שיעור, עם ID של הקורס האב
    component: LessonFormComponent, // טען את LessonFormComponent עבור נתיב זה
    canActivate: [teacherGuard] // נתיב מוגן למורים בלבד
  },
  {
    path: 'courses/:courseId/edit-lesson/:lessonId', // נתיב לעריכת שיעור, עם ID קורס ו-ID שיעור
    component: LessonFormComponent, // טען את LessonFormComponent עבור נתיב זה
    canActivate: [teacherGuard] // נתיב מוגן למורים בלבד
  },

  // נתיב ה-wildcard חייב להיות האחרון
  { path: '**', redirectTo: '/courses' }
];

console.log('Routes loaded', routes);