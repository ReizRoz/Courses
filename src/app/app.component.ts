// src/app/app.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core'; // ודא שיש OnInit ו-OnDestroy אם אתה משתמש בהם
import { Router, NavigationEnd, Event, RouterOutlet } from '@angular/router'; // ייבא גם Event
import { filter } from 'rxjs/operators'; // ייבא את אופרטור filter
import { Subscription } from 'rxjs'; // ייבא Subscription

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <router-outlet></router-outlet>
    `,
  styleUrl: './app.component.scss' // אם קיים
})
export class AppComponent implements OnInit, OnDestroy {
  private routerSubscription: Subscription | undefined;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.routerSubscription = this.router.events.pipe(
      // סנן רק אירועים מסוג NavigationEnd
      filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // כאן תוכל לבצע פעולות כלשהן לאחר ניווט מוצלח
      console.log('Navigation ended:', event.urlAfterRedirects);
    });
  }

  ngOnDestroy(): void {
    // ודא שאתה מבטל את הרישום כשקומפוננטת השורש נהרסת
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}