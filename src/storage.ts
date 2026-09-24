import {
  AttendanceStatus,
  ClassAttendanceSession,
  ClassroomConfig,
  Student,
  StudentAttendanceItem,
  StudentAttendanceSummary,
  User,
  UserRecord,
  AdviserNotification,
} from './types';

const STORAGE_PREFIX = 'snmms_attendance_v3_';
const USERS_KEY = STORAGE_PREFIX + 'users';
const SESSION_KEY = STORAGE_PREFIX + 'current_session';
const STUDENTS_KEY = STORAGE_PREFIX + 'students';
const SESSIONS_KEY = STORAGE_PREFIX + 'attendance_records';
const NOTIFICATIONS_KEY = STORAGE_PREFIX + 'adviser_notifications';
const CONFIG_KEY = STORAGE_PREFIX + 'classroom_config';

export const DEFAULT_CONFIG: ClassroomConfig = {
  schoolName: 'Sto. Niño Mactan Montessori School',
  gradeSection: 'Grade 10 - St. Francis',
  adviserName: 'Mrs. Maria Santos',
  schoolYear: 'S.Y. 2026 - 2027',
  timeLockEnabled: false,
  timeLockStart: '07:00',
  timeLockEnd: '08:00',
};

// Default Student Roster with Officers
const INITIAL_STUDENTS: Student[] = [
  { id: 'std_01', studentNumber: '2026-001', name: 'Tom Martorillas', gender: 'Male', officerRole: 'President', gradeSection: DEFAULT_CONFIG.gradeSection },
  { id: 'std_02', studentNumber: '2026-002', name: 'Jovin Anunciado', gender: 'Male', officerRole: 'Vice President', gradeSection: DEFAULT_CONFIG.gradeSection },
  { id: 'std_03', studentNumber: '2026-003', name: 'Chloe Mendoza', gender: 'Female', officerRole: 'Secretary', gradeSection: DEFAULT_CONFIG.gradeSection },
  { id: 'std_04', studentNumber: '2026-004', name: 'Benjamin Cruz', gender: 'Male', officerRole: 'Treasurer', gradeSection: DEFAULT_CONFIG.gradeSection },
  { id: 'std_05', studentNumber: '2026-005', name: 'Fatima Santos', gender: 'Female', officerRole: 'Auditor', gradeSection: DEFAULT_CONFIG.gradeSection },
  { id: 'std_06', studentNumber: '2026-006', name: 'Daniel Bautista', gender: 'Male', officerRole: 'P.I.O.', gradeSection: DEFAULT_CONFIG.gradeSection },
  { id: 'std_07', studentNumber: '2026-007', name: 'Althea Reyes', gender: 'Female', officerRole: 'Peace Officer', gradeSection: DEFAULT_CONFIG.gradeSection },
  { id: 'std_08', studentNumber: '2026-008', name: 'Elijah Garcia', gender: 'Male', gradeSection: DEFAULT_CONFIG.gradeSection },
  { id: 'std_09', studentNumber: '2026-009', name: 'Gabriel Tan', gender: 'Male', gradeSection: DEFAULT_CONFIG.gradeSection },
  { id: 'std_10', studentNumber: '2026-010', name: 'Hannah Ramos', gender: 'Female', gradeSection: DEFAULT_CONFIG.gradeSection },
  { id: 'std_11', studentNumber: '2026-011', name: 'Isaac Morales', gender: 'Male', gradeSection: DEFAULT_CONFIG.gradeSection },
  { id: 'std_12', studentNumber: '2026-012', name: 'Jasmine Navarro', gender: 'Female', gradeSection: DEFAULT_CONFIG.gradeSection },
  { id: 'std_13', studentNumber: '2026-013', name: 'Kyle Dela Cruz', gender: 'Male', gradeSection: DEFAULT_CONFIG.gradeSection },
  { id: 'std_14', studentNumber: '2026-014', name: 'Liam Santos', gender: 'Male', gradeSection: DEFAULT_CONFIG.gradeSection },
  { id: 'std_15', studentNumber: '2026-015', name: 'Mia Fernandez', gender: 'Female', gradeSection: DEFAULT_CONFIG.gradeSection },
  { id: 'std_16', studentNumber: '2026-016', name: 'Noah Villanueva', gender: 'Male', gradeSection: DEFAULT_CONFIG.gradeSection },
  { id: 'std_17', studentNumber: '2026-017', name: 'Olivia Perez', gender: 'Female', gradeSection: DEFAULT_CONFIG.gradeSection },
];

// Initial 2 Core Roles (Teacher Adviser + Class President)
const INITIAL_USERS: UserRecord[] = [
  {
    id: 'usr_teacher_01',
    name: 'Mrs. Maria Santos',
    email: 'adviser@snmms.edu',
    studentId: 'adviser.santos',
    role: 'teacher',
    gradeSection: DEFAULT_CONFIG.gradeSection,
    avatarColor: 'bg-red-800',
    createdAt: '2026-09-01T08:00:00.000Z',
    passwordHash: 'password',
  },
  {
    id: 'usr_president_01',
    name: 'Tom Martorillas',
    email: 'president.santos@snmms.edu',
    studentId: 'president.santos',
    role: 'class_president',
    gradeSection: DEFAULT_CONFIG.gradeSection,
    avatarColor: 'bg-amber-500',
    createdAt: '2026-09-01T08:00:00.000Z',
    passwordHash: 'password',
  },
];

// Initial Attendance Records
const INITIAL_SESSIONS: ClassAttendanceSession[] = [
  {
    id: 'session_demo_today',
    date: '2026-09-23',
    gradeSection: DEFAULT_CONFIG.gradeSection,
    sessionType: 'Morning Roll Call',
    presidentId: 'usr_president_01',
    presidentName: 'Tom Martorillas (Class President)',
    totalStudents: 17,
    presentCount: 14,
    absentCount: 1,
    lateCount: 1,
    halfDayCount: 1,
    attendanceRate: 88,
    notes: 'Gabriel Tan absent (medical note sent). Hannah Ramos late (traffic). Noah Villanueva attended half-day morning only.',
    submittedAtTime: '7:42 AM',
    statusApproval: 'verified_by_adviser',
    createdAt: '2026-09-23T07:42:00.000Z',
    updatedAt: '2026-09-23T07:42:00.000Z',
    records: [
      { studentId: 'std_01', studentNumber: '2026-001', studentName: 'Tom Martorillas', gender: 'Male', officerRole: 'President', status: 'present' },
      { studentId: 'std_02', studentNumber: '2026-002', studentName: 'Jovin Anunciado', gender: 'Male', officerRole: 'Vice President', status: 'present' },
      { studentId: 'std_03', studentNumber: '2026-003', studentName: 'Chloe Mendoza', gender: 'Female', officerRole: 'Secretary', status: 'present' },
      { studentId: 'std_04', studentNumber: '2026-004', studentName: 'Benjamin Cruz', gender: 'Male', officerRole: 'Treasurer', status: 'present' },
      { studentId: 'std_05', studentNumber: '2026-005', studentName: 'Fatima Santos', gender: 'Female', officerRole: 'Auditor', status: 'present' },
      { studentId: 'std_06', studentNumber: '2026-006', studentName: 'Daniel Bautista', gender: 'Male', officerRole: 'P.I.O.', status: 'present' },
      { studentId: 'std_07', studentNumber: '2026-007', studentName: 'Althea Reyes', gender: 'Female', officerRole: 'Peace Officer', status: 'present' },
      { studentId: 'std_08', studentNumber: '2026-008', studentName: 'Elijah Garcia', gender: 'Male', status: 'present' },
      { studentId: 'std_09', studentNumber: '2026-009', studentName: 'Gabriel Tan', gender: 'Male', status: 'absent', remarks: 'Medical excuse letter submitted' },
      { studentId: 'std_10', studentNumber: '2026-010', studentName: 'Hannah Ramos', gender: 'Female', status: 'late', remarks: 'Arrived 7:35 AM' },
      { studentId: 'std_11', studentNumber: '2026-011', studentName: 'Isaac Morales', gender: 'Male', status: 'present' },
      { studentId: 'std_12', studentNumber: '2026-012', studentName: 'Jasmine Navarro', gender: 'Female', status: 'present' },
      { studentId: 'std_13', studentNumber: '2026-013', studentName: 'Kyle Dela Cruz', gender: 'Male', status: 'present' },
      { studentId: 'std_14', studentNumber: '2026-014', studentName: 'Liam Santos', gender: 'Male', status: 'present' },
      { studentId: 'std_15', studentNumber: '2026-015', studentName: 'Mia Fernandez', gender: 'Female', status: 'present' },
      { studentId: 'std_16', studentNumber: '2026-016', studentName: 'Noah Villanueva', gender: 'Male', status: 'half_day', remarks: 'Half day nisud (dentist appointment)' },
      { studentId: 'std_17', studentNumber: '2026-017', studentName: 'Olivia Perez', gender: 'Female', status: 'present' },
    ],
  },
];

const INITIAL_NOTIFICATIONS: AdviserNotification[] = [
  {
    id: 'notif_01',
    sessionId: 'session_demo_today',
    date: '2026-09-23',
    time: '7:42 AM',
    presidentName: 'Tom Martorillas',
    gradeSection: DEFAULT_CONFIG.gradeSection,
    presentCount: 14,
    absentCount: 1,
    lateCount: 1,
    halfDayCount: 1,
    totalStudents: 17,
    message: 'President Tom Martorillas completed and submitted the morning roll call. 1 absent, 1 late, 1 half-day.',
    read: false,
    createdAt: '2026-09-23T07:42:00.000Z',
  },
];

export function initializeStorage(): void {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(STUDENTS_KEY)) {
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(INITIAL_STUDENTS));
  }
  if (!localStorage.getItem(SESSIONS_KEY)) {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(INITIAL_SESSIONS));
  }
  if (!localStorage.getItem(CONFIG_KEY)) {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(DEFAULT_CONFIG));
  }
  if (!localStorage.getItem(NOTIFICATIONS_KEY)) {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
  }
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
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
}

// Classroom Config (Grade & Section, School Name, Adviser)
export function getClassroomConfig(): ClassroomConfig {
  initializeStorage();
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    return raw ? { ...DEFAULT_CONFIG, ...JSON.parse(raw) } : DEFAULT_CONFIG;
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveClassroomConfig(config: ClassroomConfig): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  // Keep users and students synced with grade & section
  const students = getAllStudents();
  const updatedStudents = students.map((s) => ({ ...s, gradeSection: config.gradeSection }));
  saveAllStudents(updatedStudents);

  const users = getAllUsers();
  const updatedUsers = users.map((u) => ({ ...u, gradeSection: config.gradeSection }));
  saveAllUsers(updatedUsers);
}

// User & Auth Handlers (Teacher & Class President only)
export function getAllUsers(): UserRecord[] {
  initializeStorage();
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : INITIAL_USERS;
  } catch {
    return INITIAL_USERS;
  }
}

export function saveAllUsers(users: UserRecord[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getCurrentSession(): User | null {
  initializeStorage();
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCurrentSession(user: User | null): void {
  if (!user) {
    localStorage.removeItem(SESSION_KEY);
  } else {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }
}

// Quick Student Public Viewer (No Login Needed)
export function createStudentViewerSession(): User {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const config = getClassroomConfig();
  const viewerUser: User = {
    id: `student_viewer_${randomNum}`,
    name: `Student #${randomNum}`,
    email: `student.${randomNum}@snmms.view`,
    studentId: `#${randomNum}`,
    role: 'student',
    gradeSection: config.gradeSection,
    avatarColor: 'bg-stone-600',
    createdAt: new Date().toISOString(),
  };
  setCurrentSession(viewerUser);
  return viewerUser;
}

export function loginUser(
  identifier: string,
  password: string
): { success: boolean; message: string; user?: User } {
  const users = getAllUsers();
  const cleanId = identifier.trim().toLowerCase();

  const found = users.find(
    (u) =>
      u.email.toLowerCase() === cleanId ||
      u.studentId.toLowerCase() === cleanId ||
      (cleanId === 'teacher' && u.role === 'teacher') ||
      (cleanId === 'president' && u.role === 'class_president')
  );

  if (!found) {
    return { success: false, message: 'Account not found. Please check your username or password.' };
  }

  if (found.passwordHash !== password) {
    return { success: false, message: 'Incorrect password. Please try again.' };
  }

  const { passwordHash, ...safeUser } = found;
  setCurrentSession(safeUser);
  return { success: true, message: `Signed in as ${safeUser.name}!`, user: safeUser };
}

export function resetPresidentPassword(newPassword: string): { success: boolean; message: string } {
  const users = getAllUsers();
  const pres = users.find((u) => u.role === 'class_president');
  if (!pres) return { success: false, message: 'President account not found.' };

  pres.passwordHash = newPassword;
  saveAllUsers(users);
  return { success: true, message: "Class President password has been reset successfully." };
}

export function logoutUser(): void {
  setCurrentSession(null);
}

// Student Roster CRUD (Managed by Adviser)
export function getAllStudents(): Student[] {
  initializeStorage();
  try {
    const raw = localStorage.getItem(STUDENTS_KEY);
    return raw ? JSON.parse(raw) : INITIAL_STUDENTS;
  } catch {
    return INITIAL_STUDENTS;
  }
}

export function saveAllStudents(students: Student[]): void {
  localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
}

export function addStudent(studentData: Omit<Student, 'id'>): Student {
  const students = getAllStudents();
  const newStudent: Student = {
    id: 'std_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    ...studentData,
  };
  students.push(newStudent);
  saveAllStudents(students);
  return newStudent;
}

export function updateStudent(id: string, updates: Partial<Omit<Student, 'id'>>): Student | null {
  const students = getAllStudents();
  const index = students.findIndex((s) => s.id === id);
  if (index === -1) return null;

  students[index] = { ...students[index], ...updates };
  saveAllStudents(students);
  return students[index];
}

export function deleteStudent(id: string): boolean {
  let students = getAllStudents();
  const initialCount = students.length;
  students = students.filter((s) => s.id !== id);
  if (students.length !== initialCount) {
    saveAllStudents(students);
    return true;
  }
  return false;
}

// Classroom Attendance Session CRUD
export function getAllAttendanceSessions(): ClassAttendanceSession[] {
  initializeStorage();
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    const list: ClassAttendanceSession[] = raw ? JSON.parse(raw) : INITIAL_SESSIONS;
    return list.sort((a, b) => b.date.localeCompare(a.date));
  } catch {
    return INITIAL_SESSIONS;
  }
}

export function saveAllAttendanceSessions(sessions: ClassAttendanceSession[]): void {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function getAttendanceSessionById(id: string): ClassAttendanceSession | null {
  const sessions = getAllAttendanceSessions();
  return sessions.find((s) => s.id === id) || null;
}

export function getAttendanceSessionByDate(date: string): ClassAttendanceSession | null {
  const sessions = getAllAttendanceSessions();
  return sessions.find((s) => s.date === date) || null;
}

// Submitting or Updating Attendance Session
export function saveOrUpdateAttendanceSession(
  currentUser: User,
  sessionData: {
    id?: string;
    date: string;
    sessionType: 'Morning Roll Call' | 'Afternoon Roll Call' | 'Daily Attendance' | 'Subject Period';
    gradeSection: string;
    records: StudentAttendanceItem[];
    notes?: string;
  }
): { success: boolean; message: string; session?: ClassAttendanceSession } {
  // SECURITY CHECK: Only Class President OR Teacher can save attendance!
  if (currentUser.role !== 'class_president' && currentUser.role !== 'teacher') {
    return {
      success: false,
      message: 'Access Denied: Only the Class President or Teacher can record attendance.',
    };
  }

  const sessions = getAllAttendanceSessions();
  const total = sessionData.records.length;
  const presentCount = sessionData.records.filter((r) => r.status === 'present').length;
  const absentCount = sessionData.records.filter((r) => r.status === 'absent').length;
  const lateCount = sessionData.records.filter((r) => r.status === 'late').length;
  const halfDayCount = sessionData.records.filter((r) => r.status === 'half_day').length;
  const attendanceRate = total > 0 ? Math.round(((presentCount + lateCount + halfDayCount) / total) * 100) : 0;
  const nowIso = new Date().toISOString();
  const timeNow = getCurrentTimeString();

  let savedSession: ClassAttendanceSession;

  if (sessionData.id) {
    // UPDATE existing session
    const index = sessions.findIndex((s) => s.id === sessionData.id);
    if (index !== -1) {
      sessions[index] = {
        ...sessions[index],
        date: sessionData.date,
        sessionType: sessionData.sessionType,
        gradeSection: sessionData.gradeSection,
        records: sessionData.records,
        totalStudents: total,
        presentCount,
        absentCount,
        lateCount,
        halfDayCount,
        attendanceRate,
        notes: sessionData.notes || '',
        updatedAt: nowIso,
      };
      savedSession = sessions[index];
    } else {
      savedSession = createSessionObj();
      sessions.unshift(savedSession);
    }
  } else {
    // Check if session on this date & sessionType already exists
    const existingIndex = sessions.findIndex(
      (s) => s.date === sessionData.date && s.sessionType === sessionData.sessionType
    );
    if (existingIndex !== -1) {
      sessions[existingIndex] = {
        ...sessions[existingIndex],
        records: sessionData.records,
        totalStudents: total,
        presentCount,
        absentCount,
        lateCount,
        halfDayCount,
        attendanceRate,
        notes: sessionData.notes || '',
        updatedAt: nowIso,
      };
      savedSession = sessions[existingIndex];
    } else {
      savedSession = createSessionObj();
      sessions.unshift(savedSession);
    }
  }

  function createSessionObj(): ClassAttendanceSession {
    return {
      id: 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      date: sessionData.date,
      gradeSection: sessionData.gradeSection,
      sessionType: sessionData.sessionType,
      presidentId: currentUser.id,
      presidentName: currentUser.name,
      records: sessionData.records,
      totalStudents: total,
      presentCount,
      absentCount,
      lateCount,
      halfDayCount,
      attendanceRate,
      notes: sessionData.notes || '',
      submittedAtTime: timeNow,
      statusApproval: currentUser.role === 'teacher' ? 'verified_by_adviser' : 'pending',
      createdAt: nowIso,
      updatedAt: nowIso,
    };
  }

  saveAllAttendanceSessions(sessions);

  // NOTIFY ADVISER: When President checks/submits attendance, notify Adviser!
  if (currentUser.role === 'class_president') {
    createAdviserNotification({
      sessionId: savedSession.id,
      date: savedSession.date,
      time: timeNow,
      presidentName: currentUser.name,
      gradeSection: savedSession.gradeSection,
      presentCount,
      absentCount,
      lateCount,
      halfDayCount,
      totalStudents: total,
      message: `President ${currentUser.name} marked attendance for ${savedSession.date} at ${timeNow}: ${presentCount} Present, ${absentCount} Absent, ${lateCount} Late, ${halfDayCount} Half-day.`,
    });
  }

  return {
    success: true,
    message: currentUser.role === 'class_president'
      ? 'Roll call submitted! Your Adviser has been notified.'
      : 'Attendance sheet updated successfully by Teacher Adviser.',
    session: savedSession,
  };
}

export function deleteAttendanceSession(
  currentUser: User,
  sessionId: string
): { success: boolean; message: string } {
  // Only Teacher can delete records to prevent cheating
  if (currentUser.role !== 'teacher') {
    return {
      success: false,
      message: 'Access Denied: Only the Teacher / Adviser can delete historical attendance records.',
    };
  }

  let sessions = getAllAttendanceSessions();
  const initCount = sessions.length;
  sessions = sessions.filter((s) => s.id !== sessionId);

  if (sessions.length !== initCount) {
    saveAllAttendanceSessions(sessions);
    return { success: true, message: 'Attendance record deleted by Adviser.' };
  }

  return { success: false, message: 'Session not found.' };
}

// Adviser Notification System
export function getAdviserNotifications(): AdviserNotification[] {
  initializeStorage();
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    return raw ? JSON.parse(raw) : INITIAL_NOTIFICATIONS;
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
}

export function saveAdviserNotifications(notifs: AdviserNotification[]): void {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifs));
}

export function createAdviserNotification(data: Omit<AdviserNotification, 'id' | 'read' | 'createdAt'>): void {
  const notifs = getAdviserNotifications();
  const newNotif: AdviserNotification = {
    id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    ...data,
    read: false,
    createdAt: new Date().toISOString(),
  };
  notifs.unshift(newNotif);
  saveAdviserNotifications(notifs.slice(0, 30)); // retain last 30
}

export function markAllNotificationsAsRead(): void {
  const notifs = getAdviserNotifications();
  const updated = notifs.map((n) => ({ ...n, read: true }));
  saveAdviserNotifications(updated);
}

export function clearNotifications(): void {
  saveAdviserNotifications([]);
}

// Compute student summaries across sessions
export function computeStudentSummaries(
  students: Student[],
  sessions: ClassAttendanceSession[]
): StudentAttendanceSummary[] {
  return students.map((std) => {
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;
    let halfDayCount = 0;
    let lastStatus: AttendanceStatus | undefined = undefined;

    if (sessions.length > 0) {
      const matchInLatest = sessions[0].records.find((r) => r.studentId === std.id);
      if (matchInLatest) {
        lastStatus = matchInLatest.status;
      }
    }

    for (const s of sessions) {
      const record = s.records.find((r) => r.studentId === std.id);
      if (record) {
        if (record.status === 'present') presentCount++;
        else if (record.status === 'absent') absentCount++;
        else if (record.status === 'late') lateCount++;
        else if (record.status === 'half_day') halfDayCount++;
      }
    }

    const totalSessions = presentCount + absentCount + lateCount + halfDayCount;
    const rate = totalSessions > 0
      ? Math.round(((presentCount + lateCount + halfDayCount) / totalSessions) * 100)
      : 100;

    return {
      studentId: std.id,
      studentNumber: std.studentNumber,
      name: std.name,
      gender: std.gender,
      officerRole: std.officerRole,
      totalSessions,
      presentCount,
      absentCount,
      lateCount,
      halfDayCount,
      attendanceRate: rate,
      lastStatus,
    };
  });
}
