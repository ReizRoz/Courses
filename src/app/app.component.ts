// src/app/app.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, Event, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { AuthService } from './service/auth.service';
import { UserService } from './service/user.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <router-outlet></router-outlet>
  `,
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  private routerSubscription: Subscription | undefined;
  // אין צורך ב-usersSubscription כמשתנה מחלקה אם הקריאה מנוהלת בפייפ subscribe
  // private usersSubscription!: Subscription; 

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    // הרשמה לאירועי ניווט של הראוטר
    this.routerSubscription = this.router.events.pipe(
      filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      console.log('AppComponent: Navigation ended:', event.urlAfterRedirects);
    });

    // **השינוי המרכזי כאן:**
    // קודם ננסה לאתחל את פרטי המשתמש מ-AuthService.
    // רק לאחר שפעולה זו הסתיימה בהצלחה (או נכשלה עם ניתוק),
    // ננסה לטעון את כל המשתמשים.
    this.authService.initializeUserDetails().subscribe({
      next: (userDetails) => {
        if (userDetails) {
          console.log('AppComponent: User details initialized on app start (if logged in).');
          // אם המשתמש מחובר ויש לו הרשאה, טען את כל המשתמשים
          // לדוגמה: אם רק מנהל יכול לראות את כל המשתמשים
          if (this.authService.isAuthenticated() && this.authService.currentUserRole() === 'admin') {
            this.userService.loadAllUsers().subscribe({
              next: (users) => {
                console.log('AppComponent: Users loaded on init (for admin):', users);
              },
              error: (err) => {
                console.error('AppComponent: Error loading users on init (possibly permissions):', err);
                // שגיאת 500 כאן עדיין מצביעה על בעיה בשרת, כפי שצוין קודם.
                // נתק את המשתמש רק אם זו שגיאת 401 לא מטופלת מהשרת
                // (ה-AuthInterceptor כבר אמור לטפל ב-401).
              }
            });
          } else if (this.authService.isAuthenticated()) {
            console.log('AppComponent: User is logged in but not an admin, skipping loadAllUsers.');
          }
        } else {
          console.log('AppComponent: User not logged in, skipping initial user details fetch and loadAllUsers.');
        }
      },
      error: (err) => {
        console.error('AppComponent: Error initializing user details on app start:', err);
        // ה-AuthService.initializeUserDetails() כבר מטפל ב-logout אם הטוקן לא תקף (401)
        // או אם יש בעיית תלות מעגלית.
      }
    });
  }

  ngOnDestroy(): void {
    // ודא ביטול הרשמה לכל ה-Subscriptions כדי למנוע דליפות זיכרון
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    // אם היית משתמש ב-usersSubscription כמשתנה מחלקה
    // if (this.usersSubscription) {
    //   this.usersSubscription.unsubscribe();
    // }
  }
}