import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  loggedInUserName = signal<string | null>(null);
  userRole = signal<string | null>(null);
  private authSubscription?: Subscription;
  showLogoutMenu = signal<boolean>(false);

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    const userId = this.authService.getUserId();
    this.userRole.set(this.authService.getUserRole());
    // כאן תצטרכי לקרוא לשירות המשתמשים שלך כדי לקבל את שם המשתמש לפי ה-ID
    // לדוגמה:
    // if (userId) {
    //   this.userService.getUser(userId).subscribe(user => {
    //     this.loggedInUserName.set(user.name.charAt(0).toUpperCase()); // רק האות הראשונה
    //   });
    // } else {
    //   this.loggedInUserName.set(null);
    // }
    // **לבינתיים, לצורך הדוגמה, נשתמש באות הראשונה של התפקיד:**
    this.loggedInUserName.set(this.userRole()?.charAt(0).toUpperCase() || null);
  }

  toggleLogoutMenu(): void {
    this.showLogoutMenu.update(value => !value);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']); // חזרה לעמוד הבית
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}