
import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';

import { teacherGuard } from './auth/guards/teacher.guard';

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
    canActivate: [teacherGuard]   },
  {
    path: 'courses/edit/:id',
    loadComponent: () => import('./courses/course-form/course-form.component').then(m => m.CourseFormComponent),
    canActivate: [teacherGuard]   },
  {
    path: 'courses/:id',     loadComponent: () => import('./courses/course-details/course-details.component').then(m => m.CourseDetailsComponent)
  },

  

  {
    path: 'courses/:courseId/add-lesson',     component: LessonFormComponent,     canActivate: [teacherGuard]   },
  {
    path: 'courses/:courseId/edit-lesson/:lessonId',     component: LessonFormComponent,     canActivate: [teacherGuard]   },


  { path: '**', redirectTo: '/courses' }
];
