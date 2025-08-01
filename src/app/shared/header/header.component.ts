import { Component, computed, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';


import { MatButtonModule } from '@angular/material/button'; 
import { MatIconModule } from '@angular/material/icon'; 
import { MatMenuModule } from '@angular/material/menu'; 
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule, 
    MatIconModule, 
    MatMenuModule     
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  @Input() title?: string;

  isAuthenticated = computed(() => this.authService.isAuthenticated());
  userNameFirstLetter = computed(() => this.authService.getUserNameFirstLetter());

  constructor(
    public authService: AuthService, 
    private router: Router
  ) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

    editProfile(): void {
    this.router.navigate(['/profile/edit']); 
  }
}