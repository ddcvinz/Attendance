import React, { useState, useEffect, useCallback } from 'react';
import {
  getCurrentSession,
  setCurrentSession,
  logoutUser,
  getAllStudents,
  getAllAttendanceSessions,
  getAllUsers,
  getClassroomConfig,
  getAdviserNotifications,
  markAllNotificationsAsRead,
  createStudentViewerSession,
} from './storage';
import { User, Student, ClassAttendanceSession, AdviserNotification, ClassroomConfig } from './types';
import { ThemeProvider, useTheme } from './ThemeContext';
import { Navbar } from './components/Navbar';
import { RollCallView } from './components/RollCallView';
import { HistoryView } from './components/HistoryView';
import { RosterView } from './components/RosterView';
import { AuthView } from './components/AuthView';
import {
  CheckCircle2,
  AlertCircle,
  Crown,
  GraduationCap,
  Eye,
  ShieldAlert,
  ArrowRightLeft,
  Bell,
  X,
  Check,
  Calendar,
} from 'lucide-react';

function ClassroomAttendanceApp() {
  const { theme } = useTheme();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'rollcall' | 'history' | 'roster'>('rollcall');

  // Classroom Config
  const [config, setConfig] = useState<ClassroomConfig>(getClassroomConfig());

  // Data states
  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<ClassAttendanceSession[]>([]);
  const [editingSession, setEditingSession] = useState<ClassAttendanceSession | null>(null);
  const [notifications, setNotifications] = useState<AdviserNotification[]>([]);

  // Modals
  const [isRoleSwitchModalOpen, setIsRoleSwitchModalOpen] = useState(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(
    null
  );

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Refresh all state
  const loadData = useCallback(() => {
    setConfig(getClassroomConfig());
    setStudents(getAllStudents());
    setSessions(getAllAttendanceSessions());
    setNotifications(getAdviserNotifications());
  }, []);

  // Load session on mount
  useEffect(() => {
    const session = getCurrentSession();
    if (session) {
      setCurrentUser(session);
    }
    loadData();
  }, [loadData]);

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setEditingSession(null);
    showToast('Signed out of the system.', 'info');
  };

  const handleAuthSuccess = () => {
    const session = getCurrentSession();
    setCurrentUser(session);
    loadData();
    if (session?.role === 'student') {
      showToast(`Viewing as ${session.name} (View-Only Mode)`, 'info');
    } else {
      showToast(`Welcome back, ${session?.name}!`, 'success');
    }
  };

  // Switch role directly
  const handleSwitchAccount = (targetRole: 'teacher' | 'class_president' | 'student') => {
    if (targetRole === 'student') {
      const viewer = createStudentViewerSession();
      setCurrentUser(viewer);
      setIsRoleSwitchModalOpen(false);
      setEditingSession(null);
      showToast('Switched to Student Public View (Read-Only)', 'info');
      return;
    }

    const users = getAllUsers();
    const target = users.find((u) => u.role === targetRole);
    if (target) {
      const { passwordHash, ...safe } = target;
      setCurrentSession(safe);
      setCurrentUser(safe);
      setIsRoleSwitchModalOpen(false);
      setEditingSession(null);
      showToast(
        `Switched to ${safe.role === 'teacher' ? 'Teacher Adviser' : 'Class President'} (${safe.name})`,
        'success'
      );
    }
  };

  // Edit session from history
  const handleEditSessionFromHistory = (session: ClassAttendanceSession) => {
    setEditingSession(session);
    setActiveTab('rollcall');
  };

  // Clear or mark all notifications as read
  const handleMarkNotifsRead = () => {
    markAllNotificationsAsRead();
    setNotifications(getAdviserNotifications());
  };

  return (
    <div className={`min-h-screen ${theme.appBg} ${theme.textPrimary} flex flex-col transition-colors duration-200`}>
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        gradeSection={config.gradeSection}
        activeTab={activeTab}
        notifications={notifications}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'rollcall') {
            setEditingSession(null);
          }
        }}
        onLogout={handleLogout}
        onSwitchRole={() => setIsRoleSwitchModalOpen(true)}
        onOpenNotifications={() => setIsNotifModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {!currentUser ? (
          <AuthView onSuccess={handleAuthSuccess} />
        ) : (
          <div>
            {activeTab === 'rollcall' && (
              <RollCallView
                currentUser={currentUser}
                students={students}
                allSessions={sessions}
                editingSession={editingSession}
                onSessionSaved={() => {
                  loadData();
                  setEditingSession(null);
                  showToast('Attendance record saved & logged successfully!', 'success');
                }}
                onCancelEdit={() => setEditingSession(null)}
                onSwitchRole={() => setIsRoleSwitchModalOpen(true)}
              />
            )}

            {activeTab === 'history' && (
              <HistoryView
                currentUser={currentUser}
                sessions={sessions}
                onEditSession={handleEditSessionFromHistory}
                onSessionDeleted={() => {
                  loadData();
                  showToast('Attendance record deleted by Adviser.', 'info');
                }}
              />
            )}

            {activeTab === 'roster' && (
              <RosterView
                currentUser={currentUser}
                students={students}
                sessions={sessions}
                onRosterChanged={() => {
                  loadData();
                  showToast('Classroom roster updated.', 'success');
                }}
                onConfigChanged={() => {
                  loadData();
                  showToast('Grade & Section updated.', 'success');
                }}
              />
            )}
          </div>
        )}
      </main>

      {/* ADVISER NOTIFICATIONS MODAL */}
      {isNotifModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-stone-200 overflow-hidden">
            <div className="p-4 bg-red-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-yellow-300" />
                <h3 className="text-base font-extrabold text-white">
                  Adviser Attendance Alerts
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNotifModalOpen(false)}
                className="p-1 text-red-200 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-xs font-semibold text-stone-600">
              <span>Automatic alerts triggered when President submits attendance</span>
              {notifications.some((n) => !n.read) && (
                <button
                  type="button"
                  onClick={handleMarkNotifsRead}
                  className="text-red-700 hover:text-red-900 font-bold flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            <div className="p-4 max-h-80 overflow-y-auto divide-y divide-stone-100 space-y-2">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-stone-400">
                  No attendance notifications recorded yet.
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`pt-2 pb-3 px-3 rounded-xl border transition-colors ${
                      notif.read ? 'bg-white border-stone-100' : 'bg-yellow-50/70 border-yellow-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                        <Crown className="w-3.5 h-3.5 text-amber-600" />
                        <span>{notif.presidentName} (President)</span>
                      </span>
                      <span className="text-[10px] font-mono text-stone-500">
                        {notif.date} • {notif.time}
                      </span>
                    </div>

                    <p className="text-xs text-stone-700 leading-relaxed">
                      {notif.message}
                    </p>

                    <div className="mt-2 flex items-center gap-3 text-[11px] font-bold">
                      <span className="text-emerald-800">Present: {notif.presentCount}</span>
                      <span className="text-red-800">Absent: {notif.absentCount}</span>
                      <span className="text-yellow-800">Late: {notif.lateCount}</span>
                      <span className="text-orange-800">Half Day: {notif.halfDayCount}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-stone-50 border-t border-stone-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsNotifModalOpen(false)}
                className="px-4 py-1.5 text-xs font-bold bg-stone-900 hover:bg-stone-800 text-white rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ROLE SWITCHER MODAL (FRONT PAGE ROLES: TEACHER | PRESIDENT | STUDENT) */}
      {isRoleSwitchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl border border-stone-200">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-red-800 text-yellow-300 flex items-center justify-center">
                <ArrowRightLeft className="w-4 h-4" />
              </div>
              <h3 className="text-base font-extrabold text-stone-900">Switch Role</h3>
            </div>
            <p className="text-xs text-stone-600 mb-5">
              Select one of the 3 roles for Sto. Niño Mactan Montessori School:
            </p>

            <div className="space-y-3">
              {/* 1. TEACHER ADVISER */}
              <button
                type="button"
                onClick={() => handleSwitchAccount('teacher')}
                className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                  currentUser?.role === 'teacher'
                    ? 'border-red-600 bg-red-50/70 ring-1 ring-red-600'
                    : 'border-stone-200 hover:border-red-400 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-800 text-yellow-300 flex items-center justify-center font-bold">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-stone-900">Mrs. Maria Santos</span>
                      <span className="text-[10px] font-bold bg-red-100 text-red-900 px-1.5 py-0.2 rounded border border-red-200">
                        Teacher Adviser
                      </span>
                    </div>
                    <span className="text-xs text-stone-600 block">
                      Admin: Configures Grade & Section, manages roster, receives alerts
                    </span>
                  </div>
                </div>
                {currentUser?.role === 'teacher' && (
                  <span className="text-xs font-bold text-red-700">Active</span>
                )}
              </button>

              {/* 2. CLASS PRESIDENT */}
              <button
                type="button"
                onClick={() => handleSwitchAccount('class_president')}
                className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                  currentUser?.role === 'class_president'
                    ? 'border-amber-500 bg-amber-50/70 ring-1 ring-amber-500'
                    : 'border-stone-200 hover:border-amber-400 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-stone-900">Tom Martorillas</span>
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded border border-amber-200">
                        Class President
                      </span>
                    </div>
                    <span className="text-xs text-stone-600 block">
                      Encoder: Marks Present, Absent, Late, Half Day
                    </span>
                  </div>
                </div>
                {currentUser?.role === 'class_president' && (
                  <span className="text-xs font-bold text-amber-700">Active</span>
                )}
              </button>

              {/* 3. STUDENT VIEW ONLY */}
              <button
                type="button"
                onClick={() => handleSwitchAccount('student')}
                className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                  currentUser?.role === 'student'
                    ? 'border-stone-600 bg-stone-100 ring-1 ring-stone-600'
                    : 'border-stone-200 hover:border-stone-400 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-stone-800 text-white flex items-center justify-center font-bold">
                    <Eye className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-stone-900">Student Public View</span>
                      <span className="text-[10px] font-bold bg-stone-200 text-stone-800 px-1.5 py-0.2 rounded">
                        No Login
                      </span>
                    </div>
                    <span className="text-xs text-stone-600 block">
                      Read-only "Who is absent today?" classroom TV display
                    </span>
                  </div>
                </div>
                {currentUser?.role === 'student' && (
                  <span className="text-xs font-bold text-stone-700">Active</span>
                )}
              </button>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setIsRoleSwitchModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium bg-white border-stone-200 text-stone-800 animate-in fade-in slide-in-from-bottom-2">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : toast.type === 'error' ? (
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ClassroomAttendanceApp />
    </ThemeProvider>
  );
}
