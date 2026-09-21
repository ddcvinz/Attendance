import {
  AttendanceStatus,
  ClassAttendanceSession,
  Student,
  StudentAttendanceItem,
  StudentAttendanceSummary,
  User,
  UserRecord,
  UserRole,
} from './types';

const USERS_KEY = 'class_attendance_users_v2';
const SESSION_KEY = 'class_attendance_session_v2';
const STUDENTS_KEY = 'class_attendance_students_v2';
const ATTENDANCE_SESSIONS_KEY = 'class_attendance_records_v2';

export const DEFAULT_SECTION = 'Grade 10 - Diamond';

// Default Student Roster
const INITIAL_STUDENTS: Student[] = [
  { id: 'std_01', studentNumber: '2026-001', name: 'Althea Reyes', gender: 'Female', gradeSection: DEFAULT_SECTION, email: 'althea@school.edu' },
  { id: 'std_02', studentNumber: '2026-002', name: 'Benjamin Cruz', gender: 'Male', gradeSection: DEFAULT_SECTION, email: 'benjamin@school.edu' },
  { id: 'std_03', studentNumber: '2026-003', name: 'Chloe Mendoza', gender: 'Female', gradeSection: DEFAULT_SECTION, email: 'chloe@school.edu' },
  { id: 'std_04', studentNumber: '2026-004', name: 'Daniel Bautista', gender: 'Male', gradeSection: DEFAULT_SECTION, email: 'daniel@school.edu' },
  { id: 'std_05', studentNumber: '2026-005', name: 'Elijah Garcia', gender: 'Male', gradeSection: DEFAULT_SECTION, email: 'elijah@school.edu' },
  { id: 'std_06', studentNumber: '2026-006', name: 'Fatima Santos', gender: 'Female', gradeSection: DEFAULT_SECTION, email: 'fatima@school.edu' },
  { id: 'std_07', studentNumber: '2026-007', name: 'Gabriel Tan', gender: 'Male', gradeSection: DEFAULT_SECTION, email: 'gabriel@school.edu' },
  { id: 'std_08', studentNumber: '2026-008', name: 'Hannah Ramos', gender: 'Female', gradeSection: DEFAULT_SECTION, email: 'hannah@school.edu' },
  { id: 'std_09', studentNumber: '2026-009', name: 'Isaac Morales', gender: 'Male', gradeSection: DEFAULT_SECTION, email: 'isaac@school.edu' },
  { id: 'std_10', studentNumber: '2026-010', name: 'Jasmine Navarro', gender: 'Female', gradeSection: DEFAULT_SECTION, email: 'jasmine@school.edu' },
  { id: 'std_11', studentNumber: '2026-011', name: 'Kyle Dela Cruz', gender: 'Male', gradeSection: DEFAULT_SECTION, email: 'kyle@school.edu' },
  { id: 'std_12', studentNumber: '2026-012', name: 'Liam Santos', gender: 'Male', gradeSection: DEFAULT_SECTION, email: 'liam@school.edu' },
  { id: 'std_13', studentNumber: '2026-013', name: 'Mia Fernandez', gender: 'Female', gradeSection: DEFAULT_SECTION, email: 'mia@school.edu' },
  { id: 'std_14', studentNumber: '2026-014', name: 'Noah Villanueva', gender: 'Male', gradeSection: DEFAULT_SECTION, email: 'noah@school.edu' },
  { id: 'std_15', studentNumber: '2026-015', name: 'Olivia Perez', gender: 'Female', gradeSection: DEFAULT_SECTION, email: 'olivia@school.edu' },
];

// Initial Users
const INITIAL_USERS: UserRecord[] = [
  {
    id: 'usr_president_01',
    name: 'Jovin Anunciado',
    email: 'jovinanunciado@gmail.com',
    studentId: 'PRES-2026-01',
    role: 'class_president',
    gradeSection: DEFAULT_SECTION,
    avatarColor: 'bg-emerald-600',
    createdAt: '2026-09-01T08:00:00.000Z',
    passwordHash: 'password123',
  },
  {
    id: 'usr_student_01',
    name: 'Liam Santos',
    email: 'liam@school.edu',
    studentId: '2026-012',
    role: 'student',
    gradeSection: DEFAULT_SECTION,
    avatarColor: 'bg-blue-600',
    createdAt: '2026-09-02T08:00:00.000Z',
    passwordHash: 'student123',
  },
];

// Initial Attendance Records
const INITIAL_SESSIONS: ClassAttendanceSession[] = [
  {
    id: 'session_20260918',
    date: '2026-09-18',
    gradeSection: DEFAULT_SECTION,
    sessionType: 'Morning Roll Call',
    presidentId: 'usr_president_01',
    presidentName: 'Jovin Anunciado (Class President)',
    totalStudents: 15,
    presentCount: 14,
    absentCount: 1,
    attendanceRate: 93,
    notes: 'Benjamin Cruz absent due to flu with medical note submitted to adviser.',
    createdAt: '2026-09-18T08:15:00.000Z',
    updatedAt: '2026-09-18T08:15:00.000Z',
    records: [
      { studentId: 'std_01', studentNumber: '2026-001', studentName: 'Althea Reyes', gender: 'Female', status: 'present' },
      { studentId: 'std_02', studentNumber: '2026-002', studentName: 'Benjamin Cruz', gender: 'Male', status: 'absent', remarks: 'Sick leave' },
      { studentId: 'std_03', studentNumber: '2026-003', studentName: 'Chloe Mendoza', gender: 'Female', status: 'present' },
      { studentId: 'std_04', studentNumber: '2026-004', studentName: 'Daniel Bautista', gender: 'Male', status: 'present' },
      { studentId: 'std_05', studentNumber: '2026-005', studentName: 'Elijah Garcia', gender: 'Male', status: 'present' },
      { studentId: 'std_06', studentNumber: '2026-006', studentName: 'Fatima Santos', gender: 'Female', status: 'present' },
      { studentId: 'std_07', studentNumber: '2026-007', studentName: 'Gabriel Tan', gender: 'Male', status: 'present' },
      { studentId: 'std_08', studentNumber: '2026-008', studentName: 'Hannah Ramos', gender: 'Female', status: 'present' },
      { studentId: 'std_09', studentNumber: '2026-009', studentName: 'Isaac Morales', gender: 'Male', status: 'present' },
      { studentId: 'std_10', studentNumber: '2026-010', studentName: 'Jasmine Navarro', gender: 'Female', status: 'present' },
      { studentId: 'std_11', studentNumber: '2026-011', studentName: 'Kyle Dela Cruz', gender: 'Male', status: 'present' },
      { studentId: 'std_12', studentNumber: '2026-012', studentName: 'Liam Santos', gender: 'Male', status: 'present' },
      { studentId: 'std_13', studentNumber: '2026-013', studentName: 'Mia Fernandez', gender: 'Female', status: 'present' },
      { studentId: 'std_14', studentNumber: '2026-014', studentName: 'Noah Villanueva', gender: 'Male', status: 'present' },
      { studentId: 'std_15', studentNumber: '2026-015', studentName: 'Olivia Perez', gender: 'Female', status: 'present' },
    ],
  },
  {
    id: 'session_20260919',
    date: '2026-09-19',
    gradeSection: DEFAULT_SECTION,
    sessionType: 'Morning Roll Call',
    presidentId: 'usr_president_01',
    presidentName: 'Jovin Anunciado (Class President)',
    totalStudents: 15,
    presentCount: 13,
    absentCount: 2,
    attendanceRate: 87,
    notes: 'Gabriel Tan and Noah Villanueva absent.',
    createdAt: '2026-09-19T08:12:00.000Z',
    updatedAt: '2026-09-19T08:12:00.000Z',
    records: [
      { studentId: 'std_01', studentNumber: '2026-001', studentName: 'Althea Reyes', gender: 'Female', status: 'present' },
      { studentId: 'std_02', studentNumber: '2026-002', studentName: 'Benjamin Cruz', gender: 'Male', status: 'present' },
      { studentId: 'std_03', studentNumber: '2026-003', studentName: 'Chloe Mendoza', gender: 'Female', status: 'present' },
      { studentId: 'std_04', studentNumber: '2026-004', studentName: 'Daniel Bautista', gender: 'Male', status: 'present' },
      { studentId: 'std_05', studentNumber: '2026-005', studentName: 'Elijah Garcia', gender: 'Male', status: 'present' },
      { studentId: 'std_06', studentNumber: '2026-006', studentName: 'Fatima Santos', gender: 'Female', status: 'present' },
      { studentId: 'std_07', studentNumber: '2026-007', studentName: 'Gabriel Tan', gender: 'Male', status: 'absent', remarks: 'Unexcused' },
      { studentId: 'std_08', studentNumber: '2026-008', studentName: 'Hannah Ramos', gender: 'Female', status: 'present' },
      { studentId: 'std_09', studentNumber: '2026-009', studentName: 'Isaac Morales', gender: 'Male', status: 'present' },
      { studentId: 'std_10', studentNumber: '2026-010', studentName: 'Jasmine Navarro', gender: 'Female', status: 'present' },
      { studentId: 'std_11', studentNumber: '2026-011', studentName: 'Kyle Dela Cruz', gender: 'Male', status: 'present' },
      { studentId: 'std_12', studentNumber: '2026-012', studentName: 'Liam Santos', gender: 'Male', status: 'present' },
      { studentId: 'std_13', studentNumber: '2026-013', studentName: 'Mia Fernandez', gender: 'Female', status: 'present' },
      { studentId: 'std_14', studentNumber: '2026-014', studentName: 'Noah Villanueva', gender: 'Male', status: 'absent', remarks: 'Family emergency' },
      { studentId: 'std_15', studentNumber: '2026-015', studentName: 'Olivia Perez', gender: 'Female', status: 'present' },
    ],
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
  if (!localStorage.getItem(ATTENDANCE_SESSIONS_KEY)) {
    localStorage.setItem(ATTENDANCE_SESSIONS_KEY, JSON.stringify(INITIAL_SESSIONS));
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
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// User & Auth Handlers
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

export function registerUser(input: {
  name: string;
  email: string;
  studentId: string;
  role: UserRole;
  gradeSection: string;
  password: string;
}): { success: boolean; message: string; user?: User } {
  const users = getAllUsers();
  const cleanEmail = input.email.trim().toLowerCase();
  const cleanStudentId = input.studentId.trim().toUpperCase();

  if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
    return { success: false, message: 'An account with this email already exists.' };
  }

  if (users.some((u) => u.studentId.toUpperCase() === cleanStudentId)) {
    return { success: false, message: 'This Student/President ID is already registered.' };
  }

  const avatarColor =
    input.role === 'class_president' ? 'bg-emerald-600' : 'bg-blue-600';

  const newUserRecord: UserRecord = {
    id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    name: input.name.trim(),
    email: cleanEmail,
    studentId: cleanStudentId,
    role: input.role,
    gradeSection: input.gradeSection.trim() || DEFAULT_SECTION,
    avatarColor,
    createdAt: new Date().toISOString(),
    passwordHash: input.password,
  };

  users.push(newUserRecord);
  saveAllUsers(users);

  const { passwordHash, ...safeUser } = newUserRecord;
  return {
    success: true,
    message: `Account created successfully as ${
      input.role === 'class_president' ? 'Class President' : 'Student'
    }! Please log in.`,
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
    (u) => u.email.toLowerCase() === cleanId || u.studentId.toLowerCase() === cleanId
  );

  if (!found) {
    return { success: false, message: 'Account not found. Please check your Email or ID.' };
  }

  if (found.passwordHash !== password) {
    return { success: false, message: 'Incorrect password. Please try again.' };
  }

  const { passwordHash, ...safeUser } = found;
  setCurrentSession(safeUser);
  return { success: true, message: 'Signed in successfully!', user: safeUser };
}

export function logoutUser(): void {
  setCurrentSession(null);
}

// Student Roster CRUD
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
  // Sort alphabetically by name
  students.sort((a, b) => a.name.localeCompare(b.name));
  saveAllStudents(students);
  return newStudent;
}

export function updateStudent(id: string, updates: Partial<Omit<Student, 'id'>>): Student | null {
  const students = getAllStudents();
  const index = students.findIndex((s) => s.id === id);
  if (index === -1) return null;

  students[index] = { ...students[index], ...updates };
  students.sort((a, b) => a.name.localeCompare(b.name));
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
    const raw = localStorage.getItem(ATTENDANCE_SESSIONS_KEY);
    const list: ClassAttendanceSession[] = raw ? JSON.parse(raw) : INITIAL_SESSIONS;
    return list.sort((a, b) => b.date.localeCompare(a.date));
  } catch {
    return INITIAL_SESSIONS;
  }
}

export function saveAllAttendanceSessions(sessions: ClassAttendanceSession[]): void {
  localStorage.setItem(ATTENDANCE_SESSIONS_KEY, JSON.stringify(sessions));
}

export function getAttendanceSessionById(id: string): ClassAttendanceSession | null {
  const sessions = getAllAttendanceSessions();
  return sessions.find((s) => s.id === id) || null;
}

export function getAttendanceSessionByDate(date: string): ClassAttendanceSession | null {
  const sessions = getAllAttendanceSessions();
  return sessions.find((s) => s.date === date) || null;
}

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
  // CRITICAL SECURITY CHECK: Only the Class President can submit/edit attendance!
  if (currentUser.role !== 'class_president') {
    return {
      success: false,
      message: 'Access Denied: Only the Class President has authorization to record or update attendance.',
    };
  }

  const sessions = getAllAttendanceSessions();
  const total = sessionData.records.length;
  const presentCount = sessionData.records.filter((r) => r.status === 'present').length;
  const absentCount = sessionData.records.filter((r) => r.status === 'absent').length;
  const attendanceRate = total > 0 ? Math.round((presentCount / total) * 100) : 0;
  const now = new Date().toISOString();

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
        attendanceRate,
        notes: sessionData.notes || '',
        updatedAt: now,
      };
      saveAllAttendanceSessions(sessions);
      return { success: true, message: 'Classroom attendance updated successfully!', session: sessions[index] };
    }
  }

  // CREATE new session (check if date already has a session of this type)
  const existingSameDate = sessions.find(
    (s) => s.date === sessionData.date && s.sessionType === sessionData.sessionType
  );
  if (existingSameDate) {
    // Update the existing session instead of duplicating
    existingSameDate.records = sessionData.records;
    existingSameDate.totalStudents = total;
    existingSameDate.presentCount = presentCount;
    existingSameDate.absentCount = absentCount;
    existingSameDate.attendanceRate = attendanceRate;
    existingSameDate.notes = sessionData.notes || '';
    existingSameDate.updatedAt = now;
    saveAllAttendanceSessions(sessions);
    return {
      success: true,
      message: `Updated existing attendance sheet for ${sessionData.date}.`,
      session: existingSameDate,
    };
  }

  const newSession: ClassAttendanceSession = {
    id: 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    date: sessionData.date,
    gradeSection: sessionData.gradeSection || currentUser.gradeSection || DEFAULT_SECTION,
    sessionType: sessionData.sessionType,
    presidentId: currentUser.id,
    presidentName: `${currentUser.name} (Class President)`,
    records: sessionData.records,
    totalStudents: total,
    presentCount,
    absentCount,
    attendanceRate,
    notes: sessionData.notes || '',
    createdAt: now,
    updatedAt: now,
  };

  sessions.unshift(newSession);
  saveAllAttendanceSessions(sessions);
  return {
    success: true,
    message: 'Attendance submitted successfully by Class President!',
    session: newSession,
  };
}

export function deleteAttendanceSession(
  currentUser: User,
  sessionId: string
): { success: boolean; message: string } {
  if (currentUser.role !== 'class_president') {
    return {
      success: false,
      message: 'Access Denied: Only the Class President can delete attendance records.',
    };
  }

  let sessions = getAllAttendanceSessions();
  const initCount = sessions.length;
  sessions = sessions.filter((s) => s.id !== sessionId);

  if (sessions.length !== initCount) {
    saveAllAttendanceSessions(sessions);
    return { success: true, message: 'Attendance record deleted successfully.' };
  }

  return { success: false, message: 'Session not found.' };
}

// Student summaries across all sessions
export function computeStudentSummaries(
  students: Student[],
  sessions: ClassAttendanceSession[]
): StudentAttendanceSummary[] {
  return students.map((std) => {
    let presentCount = 0;
    let absentCount = 0;
    let lastStatus: AttendanceStatus | undefined = undefined;

    // Check latest session first
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
      }
    }

    const totalSessions = presentCount + absentCount;
    const rate = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 100;

    return {
      studentId: std.id,
      studentNumber: std.studentNumber,
      name: std.name,
      gender: std.gender,
      totalSessions,
      presentCount,
      absentCount,
      attendanceRate: rate,
      lastStatus,
    };
  });
}
