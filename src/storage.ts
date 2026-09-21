import { AttendanceFormData, AttendanceRecord, AttendanceStats, ShiftType, User, UserRecord, WorkLocation } from './types';

const USERS_STORAGE_KEY = 'attendance_app_users_v1';
const SESSION_STORAGE_KEY = 'attendance_app_current_session_v1';
const RECORDS_STORAGE_KEY = 'attendance_app_records_v1';

export function calculateHours(timeIn: string, timeOut: string | null): number | null {
  if (!timeIn || !timeOut) return null;
  const [inH, inM] = timeIn.split(':').map(Number);
  const [outH, outM] = timeOut.split(':').map(Number);
  if (isNaN(inH) || isNaN(inM) || isNaN(outH) || isNaN(outM)) return null;

  let startMinutes = inH * 60 + inM;
  let endMinutes = outH * 60 + outM;

  // Handle overnight shift if any
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }

  const diffMinutes = endMinutes - startMinutes;
  const hours = diffMinutes / 60;
  return Math.round(hours * 10) / 10;
}

export function formatTime12h(time24: string | null): string {
  if (!time24) return '--:--';
  const [hStr, mStr] = time24.split(':');
  const h = parseInt(hStr, 10);
  if (isNaN(h)) return time24;
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${mStr} ${period}`;
}

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentTimeString(): string {
  const d = new Date();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

// Initial Seed Data
const INITIAL_DEMO_USER: UserRecord = {
  id: 'usr_demo_01',
  name: 'Jovin Anunciado',
  email: 'jovinanunciado@gmail.com',
  employeeId: 'EMP-7824',
  department: 'Software Engineering',
  role: 'Senior Developer',
  avatarColor: 'bg-emerald-600',
  createdAt: '2026-08-01T08:00:00.000Z',
  passwordHash: 'password123',
};

const INITIAL_RECORDS: AttendanceRecord[] = [
  {
    id: 'att_01',
    userId: 'usr_demo_01',
    date: '2026-09-15',
    timeIn: '08:55',
    timeOut: '17:30',
    status: 'present',
    workLocation: 'office',
    shift: 'morning',
    notes: 'Sprint planning and reviewed code merges.',
    totalHours: 8.6,
    createdAt: '2026-09-15T08:55:00.000Z',
    updatedAt: '2026-09-15T17:30:00.000Z',
  },
  {
    id: 'att_02',
    userId: 'usr_demo_01',
    date: '2026-09-16',
    timeIn: '09:02',
    timeOut: '18:10',
    status: 'present',
    workLocation: 'remote',
    shift: 'morning',
    notes: 'Remote day: Worked on API authentication handlers and bugfixes.',
    totalHours: 9.1,
    createdAt: '2026-09-16T09:02:00.000Z',
    updatedAt: '2026-09-16T18:10:00.000Z',
  },
  {
    id: 'att_03',
    userId: 'usr_demo_01',
    date: '2026-09-17',
    timeIn: '09:42',
    timeOut: '18:00',
    status: 'late',
    workLocation: 'office',
    shift: 'morning',
    notes: 'Traffic delay on transit. Morning standup attended virtually.',
    totalHours: 8.3,
    createdAt: '2026-09-17T09:42:00.000Z',
    updatedAt: '2026-09-17T18:00:00.000Z',
  },
  {
    id: 'att_04',
    userId: 'usr_demo_01',
    date: '2026-09-18',
    timeIn: '08:48',
    timeOut: '17:45',
    status: 'present',
    workLocation: 'office',
    shift: 'morning',
    notes: 'Database schema update review and automated test suites.',
    totalHours: 8.9,
    createdAt: '2026-09-18T08:48:00.000Z',
    updatedAt: '2026-09-18T17:45:00.000Z',
  },
  {
    id: 'att_05',
    userId: 'usr_demo_01',
    date: '2026-09-19',
    timeIn: '09:10',
    timeOut: '14:00',
    status: 'half_day',
    workLocation: 'office',
    shift: 'morning',
    notes: 'Doctor appointment in the afternoon. Completed urgent PR reviews.',
    totalHours: 4.8,
    createdAt: '2026-09-19T09:10:00.000Z',
    updatedAt: '2026-09-19T14:00:00.000Z',
  },
];

export function initializeStorage(): void {
  if (typeof window === 'undefined') return;

  const existingUsers = localStorage.getItem(USERS_STORAGE_KEY);
  if (!existingUsers) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([INITIAL_DEMO_USER]));
  }

  const existingRecords = localStorage.getItem(RECORDS_STORAGE_KEY);
  if (!existingRecords) {
    localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(INITIAL_RECORDS));
  }
}

export function getAllUsers(): UserRecord[] {
  initializeStorage();
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [INITIAL_DEMO_USER];
  } catch {
    return [INITIAL_DEMO_USER];
  }
}

export function saveAllUsers(users: UserRecord[]): void {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

export function getCurrentSession(): User | null {
  initializeStorage();
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCurrentSession(user: User | null): void {
  if (!user) {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } else {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
  }
}

export function registerUser(input: {
  name: string;
  email: string;
  employeeId: string;
  department: string;
  role: string;
  password: string;
  avatarColor?: string;
}): { success: boolean; message: string; user?: User } {
  const users = getAllUsers();

  const cleanEmail = input.email.trim().toLowerCase();
  const cleanEmpId = input.employeeId.trim().toUpperCase();

  // Check email collision
  if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
    return { success: false, message: 'An account with this email already exists.' };
  }

  // Check Employee ID collision
  if (users.some((u) => u.employeeId.toUpperCase() === cleanEmpId)) {
    return { success: false, message: 'This Employee / Student ID is already registered.' };
  }

  const avatarColors = [
    'bg-emerald-600',
    'bg-blue-600',
    'bg-indigo-600',
    'bg-teal-600',
    'bg-violet-600',
    'bg-rose-600',
  ];
  const color = input.avatarColor || avatarColors[Math.floor(Math.random() * avatarColors.length)];

  const newUserRecord: UserRecord = {
    id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    name: input.name.trim(),
    email: cleanEmail,
    employeeId: cleanEmpId,
    department: input.department.trim() || 'General',
    role: input.role.trim() || 'Staff Member',
    avatarColor: color,
    createdAt: new Date().toISOString(),
    passwordHash: input.password,
  };

  users.push(newUserRecord);
  saveAllUsers(users);

  // Strip password hash for user object
  const { passwordHash, ...safeUser } = newUserRecord;
  return {
    success: true,
    message: 'Account registered successfully! You can now log in.',
    user: safeUser,
  };
}

export function loginUser(
  identifier: string,
  password: string
): { success: boolean; message: string; user?: User } {
  const users = getAllUsers();
  const cleanId = identifier.trim().toLowerCase();

  const found = users.find(
    (u) => u.email.toLowerCase() === cleanId || u.employeeId.toLowerCase() === cleanId
  );

  if (!found) {
    return { success: false, message: 'No account found with this email or ID.' };
  }

  if (found.passwordHash !== password) {
    return { success: false, message: 'Incorrect password. Please try again.' };
  }

  const { passwordHash, ...safeUser } = found;
  setCurrentSession(safeUser);
  return { success: true, message: 'Logged in successfully!', user: safeUser };
}

export function logoutUser(): void {
  setCurrentSession(null);
}

export function updateUserProfile(
  userId: string,
  updates: Partial<Omit<User, 'id' | 'createdAt'>> & { newPassword?: string }
): { success: boolean; message: string; user?: User } {
  const users = getAllUsers();
  const index = users.findIndex((u) => u.id === userId);

  if (index === -1) {
    return { success: false, message: 'User not found.' };
  }

  // Check email conflict if changing
  if (updates.email) {
    const cleanEmail = updates.email.trim().toLowerCase();
    const conflict = users.find((u) => u.id !== userId && u.email.toLowerCase() === cleanEmail);
    if (conflict) {
      return { success: false, message: 'Email address is already in use by another account.' };
    }
    users[index].email = cleanEmail;
  }

  // Check employee ID conflict
  if (updates.employeeId) {
    const cleanId = updates.employeeId.trim().toUpperCase();
    const conflict = users.find(
      (u) => u.id !== userId && u.employeeId.toUpperCase() === cleanId
    );
    if (conflict) {
      return { success: false, message: 'Employee/Student ID is already in use.' };
    }
    users[index].employeeId = cleanId;
  }

  if (updates.name) users[index].name = updates.name.trim();
  if (updates.department) users[index].department = updates.department.trim();
  if (updates.role) users[index].role = updates.role.trim();
  if (updates.avatarColor) users[index].avatarColor = updates.avatarColor;
  if (updates.newPassword && updates.newPassword.trim().length >= 6) {
    users[index].passwordHash = updates.newPassword.trim();
  }

  saveAllUsers(users);

  const { passwordHash, ...safeUser } = users[index];
  // Update session if it's the current user
  const session = getCurrentSession();
  if (session && session.id === userId) {
    setCurrentSession(safeUser);
  }

  return { success: true, message: 'Profile updated successfully!', user: safeUser };
}

export function deleteUserAccount(userId: string): { success: boolean; message: string } {
  let users = getAllUsers();
  const userExists = users.some((u) => u.id === userId);
  if (!userExists) {
    return { success: false, message: 'User not found.' };
  }

  // Remove user
  users = users.filter((u) => u.id !== userId);
  saveAllUsers(users);

  // Remove user's attendance records
  let records = getAllAttendanceRecords();
  records = records.filter((r) => r.userId !== userId);
  saveAllAttendanceRecords(records);

  // Clear session if current
  const session = getCurrentSession();
  if (session && session.id === userId) {
    setCurrentSession(null);
  }

  return { success: true, message: 'Account and all associated records deleted.' };
}

// Attendance CRUD
export function getAllAttendanceRecords(): AttendanceRecord[] {
  initializeStorage();
  try {
    const raw = localStorage.getItem(RECORDS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : INITIAL_RECORDS;
  } catch {
    return INITIAL_RECORDS;
  }
}

export function saveAllAttendanceRecords(records: AttendanceRecord[]): void {
  localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records));
}

export function getUserAttendanceRecords(userId: string): AttendanceRecord[] {
  const records = getAllAttendanceRecords();
  return records
    .filter((r) => r.userId === userId)
    .sort((a, b) => {
      // Sort newest date and time first
      if (b.date !== a.date) {
        return b.date.localeCompare(a.date);
      }
      return b.timeIn.localeCompare(a.timeIn);
    });
}

export function createAttendanceRecord(
  userId: string,
  formData: AttendanceFormData
): AttendanceRecord {
  const records = getAllAttendanceRecords();
  const now = new Date().toISOString();
  const hours = calculateHours(formData.timeIn, formData.timeOut || null);

  const newRecord: AttendanceRecord = {
    id: 'att_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    userId,
    date: formData.date,
    timeIn: formData.timeIn,
    timeOut: formData.timeOut || null,
    status: formData.status,
    workLocation: formData.workLocation,
    shift: formData.shift,
    notes: formData.notes.trim(),
    totalHours: hours,
    createdAt: now,
    updatedAt: now,
  };

  records.unshift(newRecord);
  saveAllAttendanceRecords(records);
  return newRecord;
}

export function updateAttendanceRecord(
  recordId: string,
  formData: AttendanceFormData
): AttendanceRecord | null {
  const records = getAllAttendanceRecords();
  const index = records.findIndex((r) => r.id === recordId);
  if (index === -1) return null;

  const hours = calculateHours(formData.timeIn, formData.timeOut || null);

  records[index] = {
    ...records[index],
    date: formData.date,
    timeIn: formData.timeIn,
    timeOut: formData.timeOut || null,
    status: formData.status,
    workLocation: formData.workLocation,
    shift: formData.shift,
    notes: formData.notes.trim(),
    totalHours: hours,
    updatedAt: new Date().toISOString(),
  };

  saveAllAttendanceRecords(records);
  return records[index];
}

export function deleteAttendanceRecord(recordId: string): boolean {
  let records = getAllAttendanceRecords();
  const initialLength = records.length;
  records = records.filter((r) => r.id !== recordId);
  if (records.length !== initialLength) {
    saveAllAttendanceRecords(records);
    return true;
  }
  return false;
}

export function getTodayRecord(userId: string): AttendanceRecord | null {
  const today = getTodayDateString();
  const records = getUserAttendanceRecords(userId);
  return records.find((r) => r.date === today) || null;
}

export function punchIn(
  userId: string,
  workLocation: WorkLocation = 'office',
  shift: ShiftType = 'morning',
  notes: string = ''
): AttendanceRecord {
  const today = getTodayDateString();
  const nowTime = getCurrentTimeString();

  // Determine status (if after 09:15, mark as late)
  const [h, m] = nowTime.split(':').map(Number);
  const minutesOfDay = h * 60 + m;
  const isLate = minutesOfDay > 9 * 60 + 15; // standard 9:15 AM threshold

  return createAttendanceRecord(userId, {
    date: today,
    timeIn: nowTime,
    timeOut: '',
    status: isLate ? 'late' : workLocation === 'remote' ? 'remote' : 'present',
    workLocation,
    shift,
    notes: notes || `Punched in at ${formatTime12h(nowTime)}`,
  });
}

export function punchOut(recordId: string, notes?: string): AttendanceRecord | null {
  const records = getAllAttendanceRecords();
  const index = records.findIndex((r) => r.id === recordId);
  if (index === -1) return null;

  const nowTime = getCurrentTimeString();
  const timeIn = records[index].timeIn;
  const hours = calculateHours(timeIn, nowTime);

  records[index] = {
    ...records[index],
    timeOut: nowTime,
    totalHours: hours,
    notes: notes
      ? `${records[index].notes ? records[index].notes + ' | ' : ''}${notes}`
      : records[index].notes,
    updatedAt: new Date().toISOString(),
  };

  saveAllAttendanceRecords(records);
  return records[index];
}

export function calculateAttendanceStats(records: AttendanceRecord[]): AttendanceStats {
  const totalDays = records.length;
  if (totalDays === 0) {
    return {
      totalDays: 0,
      presentCount: 0,
      lateCount: 0,
      remoteCount: 0,
      halfDayCount: 0,
      onTimeRate: 0,
      totalHours: 0,
      averageHoursPerDay: 0,
    };
  }

  let presentCount = 0;
  let lateCount = 0;
  let remoteCount = 0;
  let halfDayCount = 0;
  let totalHours = 0;
  let daysWithHours = 0;

  for (const rec of records) {
    if (rec.status === 'present') presentCount++;
    if (rec.status === 'late') lateCount++;
    if (rec.status === 'remote') remoteCount++;
    if (rec.status === 'half_day') halfDayCount++;

    if (rec.totalHours && rec.totalHours > 0) {
      totalHours += rec.totalHours;
      daysWithHours++;
    }
  }

  const onTimeCount = presentCount + remoteCount;
  const onTimeRate = Math.round((onTimeCount / totalDays) * 100);
  const averageHoursPerDay =
    daysWithHours > 0 ? Math.round((totalHours / daysWithHours) * 10) / 10 : 0;

  return {
    totalDays,
    presentCount,
    lateCount,
    remoteCount,
    halfDayCount,
    onTimeRate,
    totalHours: Math.round(totalHours * 10) / 10,
    averageHoursPerDay,
  };
}
