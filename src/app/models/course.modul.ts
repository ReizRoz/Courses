// src/app/models/course.modul.ts
export interface Course {
  id: number;
  title: string;
  description: string;
  teacherId: number;
  enrolledStudents: number[]; // וודא ששדה זה קיים ומסוג Array of numbers (IDs)
  // הוסף כאן שדות נוספים אם קיימים ב-Backend, כמו lessons, אם הם חלק מאובייקט הקורס המלא
}

export interface Lesson {
  id: number;
  title: string;
  content: string;
  courseId: number;
}