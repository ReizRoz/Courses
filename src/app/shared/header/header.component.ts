// src/app/shared/header/header.component.ts
import { Component, OnInit, computed, signal } from '@angular/core'; // הוספת computed
import { CommonModule, NgIf } from '@angular/common'; // הוספת NgIf
import { RouterLink, Router } from '@angular/router'; // הוספת RouterLink
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  // ודא ש-RouterLink ו-NgIf מיובאים
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  // אין צורך ב-loggedInUserName או userRole כ-signals נפרדים שצריך לעדכן ידנית.
  // אנחנו נשתמש ב-computed signals או ניגש ישירות ל-AuthService.signals().

  // computed signal לשם המשתמש (אות ראשונה)
  userNameFirstLetter = computed(() => {
    const name = this.authService.currentUserName();
    return name ? name.charAt(0).toUpperCase() : null;
  });

  // computed signal לבדיקת מצב ההתחברות
  // למרות ש-authService.isAuthenticated() כבר קיים, זו דוגמה ל-computed signal פשוט
  isLoggedIn = computed(() => this.authService.isAuthenticated());

  // signal לשליטה בתפריט ההתנתקות
  showLogoutMenu = signal<boolean>(false);

  constructor(
    // הזרק את AuthService כ-public כדי שיהיה נגיש ב-template
    public authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // עם Angular Signals, אין צורך ב-ngOnInit כדי להאזין לשינויים ב-AuthService
    // אם ה-AuthService משתמש ב-signals כמו שצריך, הקומפוננטה תגיב לשינויים באופן אוטומטי
    // ו-computed signals יחושבו מחדש.
    // לכן, אין צורך ב-loadUserData() או ב-authSubscription כאן.
  }

  toggleLogoutMenu(): void {
    this.showLogoutMenu.update(value => !value);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']); // ניווט לדף ההתחברות לאחר יציאה
  }

  // אין צורך ב-ngOnDestroy או ב-authSubscription כשמשתמשים ב-Signals
  // Angular מנהל את ה-lifecycle של Signals באופן אוטומטי.
}