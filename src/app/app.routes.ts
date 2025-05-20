import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component'
import { CoursesListComponent } from './courses/courses-list/courses-list.component';
import { CourseDetailsComponent } from './courses/course-details/course-details.component';
import { CreateCourseComponent } from './create-course/create-course.component';
import { teacherGuard } from './auth/guards/teacher.guard';
import { EditCourseComponent } from './edit-course/edit-course.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'courses', component: CoursesListComponent },
    { path: 'course/:id', component: CourseDetailsComponent },
    { path: 'courses', loadComponent: () => import('./courses/courses-list/courses-list.component').then(m => m.CoursesListComponent) }, // נוסיף בשלב הבא
    { path: 'course/:id', loadComponent: () => import('./courses/course-details/course-details.component').then(m => m.CourseDetailsComponent) }, // נוסיף בשלב הבא
    { path: '**', redirectTo: '' },
    {
        path: 'create-course',
        component: CreateCourseComponent,
        canActivate: [teacherGuard] // נתיב מוגן למורים בלבד
      },
{
    path: 'edit-course/:id',
    component: EditCourseComponent,
    canActivate: [teacherGuard] // נתיב מוגן למורים בלבד
  }
];
console.log('Routes loaded', routes)
