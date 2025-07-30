
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



  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {

    this.routerSubscription = this.router.events.pipe(
      filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
    });





    this.authService.initializeUserDetails().subscribe({
      next: (userDetails) => {
        if (userDetails) {


          if (this.authService.isAuthenticated() && this.authService.currentUserRole() === 'admin') {
            this.userService.loadAllUsers().subscribe({
              next: (users) => {
              },
              error: (err) => {
                console.error('AppComponent: Error loading users on init (possibly permissions):', err);



              }
            });
          } else if (this.authService.isAuthenticated()) {
          }
        } else {
        }
      },
      error: (err) => {
        console.error('AppComponent: Error initializing user details on app start:', err);


      }
    });
  }

  ngOnDestroy(): void {

    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }




  }
}