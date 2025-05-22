// src/app/app.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, Event, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { AuthService } from './service/auth.service';
import { UserService } from './service/user.service'; // Added UserService import

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
  private usersSubscription!: Subscription; // Added usersSubscription

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService // Added UserService injection
  ) {}

  ngOnInit(): void {
    // קוד קיים לניווט
    this.routerSubscription = this.router.events.pipe(
      filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      console.log('Navigation ended:', event.urlAfterRedirects);
    });

    // Attempt to load all users - this might be restricted
    this.usersSubscription = this.userService.loadAllUsers().subscribe({
      next: (users) => {
        console.log('AppComponent: Users loaded on init (if allowed):', users);
      },
      error: (err) => {
        console.error('AppComponent: Error loading users on init:', err);
        // It's important to handle this error, perhaps by redirecting
        // or showing a message, depending on application requirements.
        // For now, we just log it.
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.usersSubscription) {
      this.usersSubscription.unsubscribe();
    }
  }
}