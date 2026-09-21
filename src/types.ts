export type UserRole = 'class_president' | 'student';

export type AttendanceStatus = 'present' | 'absent';

export interface User {
  id: string;
  name: string;
  email: string;
  studentId: string;
  role: UserRole;
  gradeSection: string;
  avatarColor: string;
  createdAt: string;
}

export interface UserRecord extends User {
  passwordHash: string;
}

export interface Student {
  id: string;
  studentNumber: string; // e.g., "STD-2026-001"
  name: string;
  gender: 'Male' | 'Female';
  gradeSection: string;
  email?: string;
  guardianPhone?: string;
}

export interface StudentAttendanceItem {
  studentId: string;
  studentName: string;
  studentNumber: string;
  gender: 'Male' | 'Female';
  status: AttendanceStatus;
  remarks?: string;
}

export interface ClassAttendanceSession {
  id: string;
  date: string; // YYYY-MM-DD
  gradeSection: string;
  sessionType: 'Morning Roll Call' | 'Afternoon Roll Call' | 'Daily Attendance' | 'Subject Period';
  presidentId: string;
  presidentName: string;
  records: StudentAttendanceItem[];
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  attendanceRate: number; // percentage e.g. 92
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentAttendanceSummary {
  studentId: string;
  studentNumber: string;
  name: string;
  gender: 'Male' | 'Female';
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  attendanceRate: number; // percentage
  lastStatus?: AttendanceStatus;
}
