// src/app/shared/header/header.component.ts
import { Component, computed, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';

// ייבוא מודולים של Angular Material אם אתה משתמש בהם לאייקון/כפתור
import { MatButtonModule } from '@angular/material/button'; 
import { MatIconModule } from '@angular/material/icon'; 
import { MatMenuModule } from '@angular/material/menu'; // נדרש אם אתה רוצה תפריט התנתקות כמו שהצעתי קודם

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule, // הוסף אם לא היה
    MatIconModule,   // הוסף אם לא היה
    MatMenuModule    // הוסף אם אתה רוצה תפריט
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  @Input() title?: string;

  // הסיגנלים של ה-AuthService זמינים ישירות (או דרך מאפיינים מוגדרים בקונסטרוקטור)
  // כיוון ש-authService מוזרק כ-public, ניתן לגשת ישירות לסיגנלים שלו
  // אבל הדרך המומלצת יותר, במיוחד אם authService היה private, היא להגדיר אותם כך:
  isAuthenticated = computed(() => this.authService.isAuthenticated());
  userNameFirstLetter = computed(() => this.authService.getUserNameFirstLetter());


  constructor(
    public authService: AuthService, // וודא שזה public כדי לגשת ב-HTML ישירות ל-authService.isAuthenticated וכו'
    private router: Router
  ) {
    // אם authService היה private, היית צריך להגדיר את הסיגנלים כאן כמו בתשובה הקודמת:
    // this.isAuthenticated = this.authService.isAuthenticated;
    // this.userNameFirstLetter = this.authService.getUserNameFirstLetter;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}