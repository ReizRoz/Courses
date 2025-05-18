export interface Lesson {
  id: number; // שונה מ-_id ל-id**
  title: string;
  content: string;
  courseId: number;
  // **הסר את השדה durationMinutes אם ה-API שלך לא מחזיר אותו**
  // durationMinutes?: number;
  // הוסף כאן שדות נוספים אם יש לך ב-API של השרת
}

export interface Course {
  id: number; // שונה מ-_id ל-id**
  title: string;
  description: string;
  teacherId: number; // או string, תלוי איך השרת שלך מחזיר את ה-ID
  enrolledStudents?: number[]; // מערך של ID-ים של סטודנטים רשומים. זה עדיין רלוונטי מה-toggleEnrollment
  lessons?: Lesson[]; // יכול להיות שלא תמיד תטען את השיעורים עם הקורס
  // הוסף כאן שדות נוספים אם יש לך ב-API של השרת
}
