// src/app/models/user.model.ts
export interface User {
  id: number;
  name: string;
  email: string;
  role: string; // 'student' or 'teacher'
  // ... שדות נוספים אם קיימים
}