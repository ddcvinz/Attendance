export type AttendanceStatus = 'present' | 'late' | 'remote' | 'half_day' | 'on_leave';

export type WorkLocation = 'office' | 'remote' | 'client' | 'field';

export type ShiftType = 'morning' | 'evening' | 'flexible';

export interface User {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  department: string;
  role: string;
  avatarColor: string;
  createdAt: string;
}

export interface UserRecord extends User {
  passwordHash: string; // stored in local store for demo auth
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  timeIn: string; // HH:MM
  timeOut: string | null; // HH:MM or null
  status: AttendanceStatus;
  workLocation: WorkLocation;
  shift: ShiftType;
  notes: string;
  totalHours: number | null; // e.g. 8.5
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceFormData {
  date: string;
  timeIn: string;
  timeOut: string;
  status: AttendanceStatus;
  workLocation: WorkLocation;
  shift: ShiftType;
  notes: string;
}

export interface AttendanceStats {
  totalDays: number;
  presentCount: number;
  lateCount: number;
  remoteCount: number;
  halfDayCount: number;
  onTimeRate: number; // percentage
  totalHours: number;
  averageHoursPerDay: number;
}
