import React, { useState, useEffect, useCallback } from 'react';
import {
  getCurrentSession,
  setCurrentSession,
  logoutUser,
  getAllStudents,
  getAllAttendanceSessions,
  getAllUsers,
} from './storage';
import { User, Student, ClassAttendanceSession } from './types';
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
  User as UserIcon,
  ShieldAlert,
  ArrowRightLeft,
} from 'lucide-react';

function ClassroomAttendanceApp() {
  const { theme } = useTheme();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'rollcall' | 'history' | 'roster'>('rollcall');

  // Data states
  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<ClassAttendanceSession[]>([]);
  const [editingSession, setEditingSession] = useState<ClassAttendanceSession | null>(null);

  // Switch role modal
  const [isRoleSwitchModalOpen, setIsRoleSwitchModalOpen] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(
    null
  );

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Load active session on mount
  useEffect(() => {
    const session = getCurrentSession();
    if (session) {
      setCurrentUser(session);
    }
  }, []);

  // Refresh all state
  const loadData = useCallback(() => {
    setStudents(getAllStudents());
    setSessions(getAllAttendanceSessions());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setEditingSession(null);
    showToast('You have signed out.', 'info');
  };

  const handleAuthSuccess = () => {
    const session = getCurrentSession();
    setCurrentUser(session);
    loadData();
    showToast(`Welcome back, ${session?.name}!`, 'success');
  };

  // Switch to another account/role
  const handleSwitchAccount = (targetRole: 'class_president' | 'student') => {
    const users = getAllUsers();
    const target = users.find((u) => u.role === targetRole);
    if (target) {
      const { passwordHash, ...safe } = target;
      setCurrentSession(safe);
      setCurrentUser(safe);
      setIsRoleSwitchModalOpen(false);
      setEditingSession(null);
      showToast(
        `Switched to ${safe.role === 'class_president' ? 'Class President' : 'Student'} (${safe.name})`,
        'success'
      );
    }
  };

  // When president clicks edit on a history card
  const handleEditSessionFromHistory = (session: ClassAttendanceSession) => {
    setEditingSession(session);
    setActiveTab('rollcall');
  };

  return (
    <div className={`min-h-screen ${theme.appBg} ${theme.textPrimary} flex flex-col transition-colors duration-200`}>
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'rollcall') {
            setEditingSession(null);
          }
        }}
        onLogout={handleLogout}
        onSwitchRole={() => setIsRoleSwitchModalOpen(true)}
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
                  showToast('Classroom attendance saved successfully!', 'success');
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
                  showToast('Attendance record deleted.', 'info');
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
                  showToast('Classroom student roster updated.', 'success');
                }}
              />
            )}
          </div>
        )}
      </main>

      {/* ROLE SWITCHER MODAL */}
      {isRoleSwitchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className={`${theme.cardBg} w-full max-w-md rounded-2xl p-6 shadow-xl border ${theme.cardBorder}`}>
            <div className="flex items-center gap-2.5 mb-2">
              <div className={`w-8 h-8 rounded-lg ${theme.primaryLightBg} ${theme.primaryText} flex items-center justify-center`}>
                <ArrowRightLeft className="w-4 h-4" />
              </div>
              <h3 className={`text-base font-bold ${theme.textPrimary}`}>Switch User Account / Role</h3>
            </div>
            <p className={`text-xs ${theme.textMuted} mb-5`}>
              Test how the application enforces role permissions between the authorized <strong>Class President</strong> and regular <strong>Students</strong>.
            </p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleSwitchAccount('class_president')}
                className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                  currentUser?.role === 'class_president'
                    ? 'border-amber-500 bg-amber-50/70 ring-1 ring-amber-500'
                    : `border-slate-200 hover:border-amber-300 hover:bg-slate-50`
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-slate-900">Jovin Anunciado</span>
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded border border-amber-200">
                        Class President
                      </span>
                    </div>
                    <span className="text-xs text-amber-700 block">
                      ✓ Can take roll call & mark Present/Absent
                    </span>
                  </div>
                </div>
                {currentUser?.role === 'class_president' && (
                  <span className="text-xs font-bold text-amber-700">Active</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleSwitchAccount('student')}
                className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                  currentUser?.role === 'student'
                    ? 'border-blue-500 bg-blue-50/70 ring-1 ring-blue-500'
                    : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-slate-900">Liam Santos</span>
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded">
                        Student
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 block">
                      Read-only personal attendance access
                    </span>
                  </div>
                </div>
                {currentUser?.role === 'student' && (
                  <span className="text-xs font-bold text-blue-700">Active</span>
                )}
              </button>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setIsRoleSwitchModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium bg-white border-slate-200 text-slate-800 animate-in fade-in slide-in-from-bottom-2">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : toast.type === 'error' ? (
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
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
