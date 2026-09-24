export type UserRole = 'teacher' | 'class_president' | 'student';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half_day';

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
  studentNumber: string; // e.g. "2026-001"
  name: string;
  gender: 'Male' | 'Female';
  officerRole?: string; // e.g. "President", "Vice President", "Secretary", etc.
  gradeSection: string;
  email?: string;
  guardianPhone?: string;
}

export interface StudentAttendanceItem {
  studentId: string;
  studentName: string;
  studentNumber: string;
  gender: 'Male' | 'Female';
  officerRole?: string;
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
  lateCount: number;
  halfDayCount: number;
  attendanceRate: number; // percentage e.g. 92
  notes: string;
  submittedAtTime?: string; // e.g. "7:15 AM"
  statusApproval?: 'pending' | 'verified_by_adviser';
  createdAt: string;
  updatedAt: string;
}

export interface StudentAttendanceSummary {
  studentId: string;
  studentNumber: string;
  name: string;
  gender: 'Male' | 'Female';
  officerRole?: string;
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  halfDayCount: number;
  attendanceRate: number; // percentage
  lastStatus?: AttendanceStatus;
}

export interface AdviserNotification {
  id: string;
  sessionId: string;
  date: string;
  time: string;
  presidentName: string;
  gradeSection: string;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  halfDayCount: number;
  totalStudents: number;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface ClassroomConfig {
  schoolName: string;
  gradeSection: string;
  adviserName: string;
  schoolYear: string;
  timeLockEnabled: boolean;
  timeLockStart: string; // e.g. "07:00"
  timeLockEnd: string; // e.g. "08:00"
}
