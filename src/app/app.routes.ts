import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
// לא מייבאים כאן ישירות קומפוננטות אם משתמשים ב-loadComponent
// import { CoursesListComponent } from './courses/courses-list/courses-list.component';
// import { CourseDetailsComponent } from './courses/course-details/course-details.component';
// import { CreateCourseComponent } from './courses/create-course/create-course.component'; // הנתיב הנכון
// import { EditCourseComponent } from './courses/edit-course/edit-course.component'; // הנתיב הנכון

import { teacherGuard } from './auth/guards/teacher.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // טעינה עצלה (Lazy Loading) עדיפה לביצועים
  { path: 'courses', loadComponent: () => import('./courses/courses-list/courses-list.component').then(m => m.CoursesListComponent) },
  { path: 'course/:id', loadComponent: () => import('./courses/course-details/course-details.component').then(m => m.CourseDetailsComponent) },

  {
    path: 'create-course',
    loadComponent: () => import('./courses/create-course/create-course.component').then(m => m.CreateCourseComponent), // נתיב תקין
    canActivate: [teacherGuard] // נתיב מוגן למורים בלבד
  },
  {
    path: 'edit-course/:id',
    loadComponent: () => import('./courses/edit-course/edit-course.component').then(m => m.EditCourseComponent), // נתיב תקין
    canActivate: [teacherGuard] // נתיב מוגן למורים בלבד
  },
  // נתיב ה-wildcard חייב להיות האחרון
  { path: '**', redirectTo: '' }
];
console.log('Routes loaded', routes);