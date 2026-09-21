import React, { useState, useEffect, useCallback } from 'react';
import {
  getCurrentSession,
  getUserAttendanceRecords,
  createAttendanceRecord,
  updateAttendanceRecord,
  deleteAttendanceRecord,
  deleteUserAccount,
  punchIn,
  punchOut,
  calculateAttendanceStats,
  getTodayRecord,
  logoutUser,
} from './storage';
import { AttendanceFormData, AttendanceRecord, User, WorkLocation } from './types';
import { Navbar } from './components/Navbar';
import { AuthView } from './components/AuthView';
import { QuickPunchCard } from './components/QuickPunchCard';
import { AttendanceHistoryTable } from './components/AttendanceHistoryTable';
import { AttendanceFormModal } from './components/AttendanceFormModal';
import { ProfileModal } from './components/ProfileModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'record' | 'account';
    data?: AttendanceRecord;
  } | null>(null);

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(
    null
  );

  const showToast = useCallback(
    (message: string, type: 'success' | 'info' | 'error' = 'success') => {
      setToast({ message, type });
      setTimeout(() => {
        setToast(null);
      }, 3500);
    },
    []
  );

  // Check existing session on mount
  useEffect(() => {
    const session = getCurrentSession();
    if (session) {
      setCurrentUser(session);
    }
  }, []);

  // Refresh records when user changes
  const refreshRecords = useCallback((userId: string) => {
    const userRecords = getUserAttendanceRecords(userId);
    setRecords(userRecords);
  }, []);

  useEffect(() => {
    if (currentUser) {
      refreshRecords(currentUser.id);
    } else {
      setRecords([]);
    }
  }, [currentUser, refreshRecords]);

  // Auth Handlers
  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    refreshRecords(user.id);
    showToast(`Welcome back, ${user.name}!`);
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setRecords([]);
    setIsLogModalOpen(false);
    setIsProfileModalOpen(false);
    showToast('Logged out successfully.', 'info');
  };

  // Attendance CRUD Handlers
  const handlePunchIn = (location: WorkLocation, notes?: string) => {
    if (!currentUser) return;
    const newRecord = punchIn(currentUser.id, location, 'morning', notes);
    refreshRecords(currentUser.id);
    showToast(`Punched in successfully at ${newRecord.timeIn}!`);
  };

  const handlePunchOut = (recordId: string, notes?: string) => {
    if (!currentUser) return;
    const updated = punchOut(recordId, notes);
    refreshRecords(currentUser.id);
    if (updated) {
      showToast(`Punched out at ${updated.timeOut}. Total: ${updated.totalHours} hrs`);
    }
  };

  const handleSaveAttendance = (formData: AttendanceFormData) => {
    if (!currentUser) return;

    if (editingRecord) {
      // UPDATE Record
      const updated = updateAttendanceRecord(editingRecord.id, formData);
      if (updated) {
        showToast('Attendance record updated successfully.');
      }
    } else {
      // CREATE Record
      createAttendanceRecord(currentUser.id, formData);
      showToast('New attendance record created.');
    }

    refreshRecords(currentUser.id);
    setIsLogModalOpen(false);
    setEditingRecord(null);
  };

  const handleOpenEdit = (record: AttendanceRecord) => {
    setEditingRecord(record);
    setIsLogModalOpen(true);
  };

  const handlePromptDeleteRecord = (record: AttendanceRecord) => {
    setDeleteTarget({ type: 'record', data: record });
  };

  const handlePromptDeleteAccount = () => {
    setIsProfileModalOpen(false);
    setDeleteTarget({ type: 'account' });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget || !currentUser) return;

    if (deleteTarget.type === 'record' && deleteTarget.data) {
      // DELETE Attendance Record
      const success = deleteAttendanceRecord(deleteTarget.data.id);
      if (success) {
        showToast('Attendance record deleted.');
        refreshRecords(currentUser.id);
      }
    } else if (deleteTarget.type === 'account') {
      // DELETE User Account
      const res = deleteUserAccount(currentUser.id);
      if (res.success) {
        setCurrentUser(null);
        setRecords([]);
        showToast('Your account and all records have been deleted.', 'info');
      }
    }

    setDeleteTarget(null);
  };

  // Today's record for punch card
  const todayRecord = currentUser ? getTodayRecord(currentUser.id) : null;
  const stats = calculateAttendanceStats(records);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs sm:text-sm font-semibold ${
              toast.type === 'success'
                ? 'bg-slate-900 text-white border-slate-800'
                : toast.type === 'error'
                ? 'bg-rose-600 text-white border-rose-700'
                : 'bg-slate-800 text-slate-100 border-slate-700'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-200" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {!currentUser ? (
        /* Not logged in: Show Authentication View (Register & Login) */
        <main className="flex-1 flex flex-col justify-center">
          <AuthView onAuthSuccess={handleAuthSuccess} />
        </main>
      ) : (
        /* Logged in: Show Navbar, Quick Punch, and Attendance Dashboard */
        <div className="flex-1 flex flex-col">
          <Navbar
            user={currentUser}
            onLogout={handleLogout}
            onOpenProfile={() => setIsProfileModalOpen(true)}
            onOpenLogModal={() => {
              setEditingRecord(null);
              setIsLogModalOpen(true);
            }}
          />

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
            {/* Quick Attendance Login / Punch Card */}
            <QuickPunchCard
              todayRecord={todayRecord}
              onPunchIn={handlePunchIn}
              onPunchOut={handlePunchOut}
              onOpenDetailedForm={() => {
                setEditingRecord(null);
                setIsLogModalOpen(true);
              }}
              onEditTodayRecord={handleOpenEdit}
            />

            {/* Attendance History Dashboard & Records Table */}
            <AttendanceHistoryTable
              records={records}
              stats={stats}
              onEdit={handleOpenEdit}
              onDelete={handlePromptDeleteRecord}
              onOpenLogModal={() => {
                setEditingRecord(null);
                setIsLogModalOpen(true);
              }}
            />
          </main>
        </div>
      )}

      {/* Attendance Form Modal (Create / Update Record) */}
      <AttendanceFormModal
        isOpen={isLogModalOpen}
        editingRecord={editingRecord}
        onClose={() => {
          setIsLogModalOpen(false);
          setEditingRecord(null);
        }}
        onSubmit={handleSaveAttendance}
      />

      {/* User Profile & Account Settings Modal (Update User) */}
      {currentUser && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          user={currentUser}
          onClose={() => setIsProfileModalOpen(false)}
          onProfileUpdated={(updatedUser) => {
            setCurrentUser(updatedUser);
            showToast('Profile information updated.');
          }}
          onRequestDeleteAccount={handlePromptDeleteAccount}
        />
      )}

      {/* Delete Confirmation Modal (Delete Record / Delete Account) */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        title={
          deleteTarget?.type === 'account'
            ? 'Delete Your Account?'
            : 'Delete Attendance Record?'
        }
        description={
          deleteTarget?.type === 'account'
            ? 'This will permanently delete your user profile and all your attendance logs from the local database. This action cannot be undone.'
            : `Are you sure you want to delete the attendance log for ${
                deleteTarget?.data?.date
                  ? new Date(deleteTarget.data.date + 'T00:00:00').toLocaleDateString()
                  : 'this date'
              }? This cannot be restored.`
        }
        confirmButtonText={deleteTarget?.type === 'account' ? 'Delete Account' : 'Delete Record'}
        isDestructiveAccount={deleteTarget?.type === 'account'}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
