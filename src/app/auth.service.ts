import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

interface RegistrationResponse {
  message: string;
  userId: number;
  token: string;
}

interface LoginResponse {
  token: string;
  userId: number;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth'; // כתובת ה-API של השרת

  constructor(private http: HttpClient) { }

  register(userData: any): Observable<RegistrationResponse> {
    return this.http.post<RegistrationResponse>(`${this.apiUrl}/register`, userData);
  }

  login(credentials: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials);
  }
}/*
```

**הסבר:**

  * **`@Injectable({ providedIn: 'root' })`:** זה אומר שהשירות יהיה זמין בכל האפליקציה כסינגלטון.
  * **`HttpClient`:** אנחנו מייבאים את `HttpClient` כדי לבצע בקשות HTTP לשרת ומזריקים אותו לקונסטרקטור. כדי להשתמש ב-`HttpClient`, עליך לוודא שייבאת את `HttpClientModule` לקומפוננטות שלך (באופן עצמאי, זה אומר לייבא אותו ישירות לקומפוננטות שמשתמשות בשירות).
  * **`apiUrl`:** כאן אנחנו מגדירים את כתובת הבסיס של ה-API של השרת. ודא שכתובת זו תואמת את הכתובת שבה השרת שלך פועל.
  * **`register(userData: any): Observable<RegistrationResponse>`:** פונקציה זו מקבלת את נתוני המשתמש החדש ושולחת בקשת POST לנקודת הקצה `/api/auth/register` של השרת. היא מחזירה `Observable` של סוג `RegistrationResponse`, שמייצג את התגובה מהשרת.
  * **`login(credentials: any): Observable<LoginResponse>`:** פונקציה זו מקבלת את פרטי ההתחברות ושולחת בקשת POST לנקודת הקצה `/api/auth/login` של השרת. היא מחזירה `Observable` של סוג `LoginResponse`.
  * **`RegistrationResponse` ו-`LoginResponse` Interfaces:** אלה הם ממשקים פשוטים שמגדירים את מבנה הנתונים שאנחנו מצפים לקבל מהשרת עבור פעולות הרשמה והתחברות.*/