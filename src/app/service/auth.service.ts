
import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, of } from 'rxjs'; import { catchError, tap, switchMap, map } from 'rxjs/operators';


interface AuthResponse {
  token: string;
  userId: number;
  role: string;
}

export interface UserDetailsResponse {
  id: number;
  name: string;
  email: string;
  role: string;
  password?: string; }

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private usersApiUrl = 'http://localhost:3000/api/users';
  private readonly TOKEN_KEY = 'authToken';
  private readonly USER_ID_KEY = 'currentUserId';
  private readonly USER_ROLE_KEY = 'currentUserRole';
  private readonly USER_DETAILS_KEY = 'currentUserDetails';

  private _token = signal<string | null>(null);
  private _userId = signal<number | null>(null);
  private _userRole = signal<string | null>(null);
  private _currentUserDetails = signal<UserDetailsResponse | null>(null);

  isAuthenticated = computed(() => !!this._token());
  currentUserId = computed(() => this._userId());
  currentUserRole = computed(() => this._userRole());
  currentUserDetails = computed(() => this._currentUserDetails());

  constructor(private http: HttpClient, private router: Router) {
    this.loadAuthInfoFromLocalStorage();


  }



  public getToken(): string | null {
    return this._token();
  }







  private clearAuthStorage(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_ID_KEY);
    localStorage.removeItem(this.USER_ROLE_KEY);
    localStorage.removeItem(this.USER_DETAILS_KEY);
  }

  private clearAuthSignals(): void {
    this._token.set(null);
    this._userId.set(null);
    this._userRole.set(null);
    this._currentUserDetails.set(null);
  }

  private clearUserDetailsLocally(): void {
    localStorage.removeItem(this.USER_DETAILS_KEY);
    this._currentUserDetails.set(null);
  }


  private loadAuthInfoFromLocalStorage(): void {
    const storedToken = localStorage.getItem(this.TOKEN_KEY);
    const storedUserId = localStorage.getItem(this.USER_ID_KEY);
    const storedUserRole = localStorage.getItem(this.USER_ROLE_KEY);
    const storedUserDetails = localStorage.getItem(this.USER_DETAILS_KEY);

    if (storedToken && storedUserId && storedUserRole) {
      this._token.set(storedToken);
      const userIdNum = parseInt(storedUserId, 10);
      this._userId.set(userIdNum);
      this._userRole.set(storedUserRole);

      if (storedUserDetails) {
        try {
          const userDetails: UserDetailsResponse = JSON.parse(storedUserDetails);
          this._currentUserDetails.set(userDetails);
        } catch (e) {
          console.error('AuthService: Error parsing stored user details:', e);
          this.clearUserDetailsLocally();
        }
      } else {
      }
    } else {
      this.clearAuthSignals();
      this.clearAuthStorage();
    }
  }


  public initializeUserDetails(): Observable<UserDetailsResponse | null> {
    const userId = this._userId();
    if (userId) {
      return this.fetchUserDetails(userId).pipe(
        tap(details => {
        }),
        catchError(err => {
          console.error('AuthService: Failed to fetch user details during initialization:', err);
          this.logout(); 
          return throwError(() => new Error('Failed to fetch user details during initialization'));
        })
      );
    } else {
      this.clearUserDetailsLocally();       return of(null);     }
  }



    private saveAuthInfo(response: AuthResponse): void {
    if (response && response.token && response.userId && response.role) {
      localStorage.setItem(this.TOKEN_KEY, response.token);
      localStorage.setItem(this.USER_ID_KEY, response.userId.toString());
      localStorage.setItem(this.USER_ROLE_KEY, response.role);

      this._token.set(response.token);
      this._userId.set(response.userId);
      this._userRole.set(response.role);


      this.fetchUserDetails(response.userId).subscribe({
        next: (details) => {
          this._currentUserDetails.set(details);         },
        error: (err) => {
          console.error('AuthService: Failed to fetch user details after saveAuthInfo:', err);
          this.clearUserDetailsLocally();
        }
      });
    } else {
      console.error('AuthService: Auth response (after 2xx) missing critical details or response is null. NOT logging out automatically from saveAuthInfo.');
    }
  }

    public fetchUserDetails(userId: number): Observable<UserDetailsResponse> {
    return this.http.get<UserDetailsResponse>(`${this.usersApiUrl}/${userId}`).pipe(
      tap(userDetails => {
        if (userDetails && userDetails.id) {
          localStorage.setItem(this.USER_DETAILS_KEY, JSON.stringify(userDetails));
          this._currentUserDetails.set(userDetails);         } else {
          console.warn('AuthService: User details not found or incomplete in response from backend. Clearing local user details.');
          this.clearUserDetailsLocally();
        }
      }),
      catchError(error => {
        console.error('AuthService: Failed to fetch user details from API:', error);
        this.clearUserDetailsLocally();
        if (error instanceof HttpErrorResponse && error.status === 401) {
            console.warn('AuthService: Received 401 fetching user details, logging out.');
            this.logout();
        }
        return throwError(() => new Error('Failed to fetch user details'));
      })
    );
  }

    public getUserNameFirstLetter(): string {
    const user = this.currentUserDetails();
    if (user && user.name) {
      return user.name.charAt(0).toUpperCase();
    }
    return '';
  }



  register(userData: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap(response => {
        this.saveAuthInfo(response);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('AuthService: Registration HTTP request failed:', error);
        let errorMessage = 'שגיאה בעת ההרשמה. נסה שוב מאוחר יותר.';
        if (error.status === 409) {           errorMessage = 'כתובת האימייל כבר רשומה במערכת.';
        } else if (error.error && error.error.message) {
          errorMessage = error.error.message;
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  login(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.saveAuthInfo(response);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('AuthService: Login HTTP request failed:', error);
        let errorMessage = 'אירעה שגיאה. נסה שוב מאוחר יותר.';
        

        if (error.status === 401 || error.status === 400 || error.status === 404) {
          errorMessage = 'אחד או יותר מהפרטים שהוזנו אינם נכונים.';
        } else if (error.error && error.error.message) {
          errorMessage = error.error.message;
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  logout(): void {
    this.clearAuthStorage();
    this.clearAuthSignals();
    this.router.navigate(['/']);
  }

  updateUser(userIdToUpdateWithApi: string, userData: Partial<UserDetailsResponse>): Observable<any> {
    return this.http.put<any>(`${this.usersApiUrl}/${userIdToUpdateWithApi}`, userData).pipe(
      tap(() => {
        const numericUserId = this._userId();
        if (numericUserId) {
          this.fetchUserDetails(numericUserId).subscribe({
            next: () => console.log('AuthService: User details refreshed after update.'),
            error: (err) => console.error('AuthService: Failed to refresh user details after update:', err)
          });
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('AuthService: Update user HTTP request failed:', error);
        let errorMessage = 'שגיאה בעת עדכון המשתמש.';
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}