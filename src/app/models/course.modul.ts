
export interface Course {
  id: number;
  title: string;
  description: string;
  teacherId: number;
  enrolledStudents: number[]; 
}

export interface Lesson {
  id: number;
  title: string;
  content: string;
  courseId: number;
}