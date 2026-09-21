import React, { useState, useEffect, useMemo } from 'react';
import {
  Student,
  User,
  AttendanceStatus,
  StudentAttendanceItem,
  ClassAttendanceSession,
} from '../types';
import { useTheme } from '../ThemeContext';
import {
  saveOrUpdateAttendanceSession,
  getTodayDateString,
  getAttendanceSessionByDate,
} from '../storage';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  CheckCheck,
  Search,
  Calendar,
  Clock,
  Crown,
  Save,
  RotateCcw,
  Sparkles,
  Info,
  ArrowRightLeft,
  School,
} from 'lucide-react';

interface RollCallViewProps {
  currentUser: User;
  students: Student[];
  allSessions: ClassAttendanceSession[];
  editingSession: ClassAttendanceSession | null;
  onSessionSaved: () => void;
  onCancelEdit?: () => void;
  onSwitchRole: () => void;
}

export const RollCallView: React.FC<RollCallViewProps> = ({
  currentUser,
  students,
  allSessions,
  editingSession,
  onSessionSaved,
  onCancelEdit,
  onSwitchRole,
}) => {
  const { theme } = useTheme();
  const isPresident = currentUser.role === 'class_president';

  const [date, setDate] = useState<string>(editingSession ? editingSession.date : getTodayDateString());
  const [sessionType, setSessionType] = useState<
    'Morning Roll Call' | 'Afternoon Roll Call' | 'Daily Attendance' | 'Subject Period'
  >(editingSession ? editingSession.sessionType : 'Morning Roll Call');
  const [notes, setNotes] = useState<string>(editingSession ? editingSession.notes : '');

  // Local state of each student's attendance for the active session
  const [records, setRecords] = useState<Record<string, { status: AttendanceStatus; remarks: string }>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'absent'>('all');
  const [genderFilter, setGenderFilter] = useState<'all' | 'Male' | 'Female'>('all');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Initialize records when date or editingSession changes
  useEffect(() => {
    const existing = editingSession || getAttendanceSessionByDate(date);
    const initialMap: Record<string, { status: AttendanceStatus; remarks: string }> = {};

    students.forEach((student) => {
      const match = existing?.records.find((r) => r.studentId === student.id);
      if (match) {
        initialMap[student.id] = {
          status: match.status,
          remarks: match.remarks || '',
        };
      } else {
        // Default to present for quick roll calls
        initialMap[student.id] = {
          status: 'present',
          remarks: '',
        };
      }
    });

    setRecords(initialMap);
    if (existing && !editingSession) {
      setNotes(existing.notes || '');
      setSessionType(existing.sessionType);
    }
  }, [date, editingSession, students]);

  // Compute live statistics
  const stats = useMemo(() => {
    let presentCount = 0;
    let absentCount = 0;

    students.forEach((s) => {
      const rec = records[s.id];
      if (rec?.status === 'present') {
        presentCount++;
      } else if (rec?.status === 'absent') {
        absentCount++;
      }
    });

    const total = students.length;
    const rate = total > 0 ? Math.round((presentCount / total) * 100) : 0;

    return { total, presentCount, absentCount, rate };
  }, [students, records]);

  // Filtered student list
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchQuery =
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.studentNumber.toLowerCase().includes(searchQuery.toLowerCase());

      const status = records[student.id]?.status || 'present';
      const matchStatus = statusFilter === 'all' || status === statusFilter;
      const matchGender = genderFilter === 'all' || student.gender === genderFilter;

      return matchQuery && matchStatus && matchGender;
    });
  }, [students, searchQuery, statusFilter, genderFilter, records]);

  // Handle single student toggle
  const handleToggleStatus = (studentId: string, newStatus: AttendanceStatus) => {
    if (!isPresident) return;
    setRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status: newStatus,
      },
    }));
  };

  const handleRemarkChange = (studentId: string, remarks: string) => {
    if (!isPresident) return;
    setRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks,
      },
    }));
  };

  // Mass actions
  const handleMarkAll = (targetStatus: AttendanceStatus) => {
    if (!isPresident) return;
    setRecords((prev) => {
      const next = { ...prev };
      students.forEach((s) => {
        next[s.id] = {
          ...next[s.id],
          status: targetStatus,
        };
      });
      return next;
    });
  };

  // Submit Roll Call
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPresident) {
      setNotification({
        type: 'error',
        message: 'Permission denied. Only the Class President can record attendance.',
      });
      return;
    }

    setIsSubmitting(true);
    setNotification(null);

    const attendanceItems: StudentAttendanceItem[] = students.map((s) => ({
      studentId: s.id,
      studentName: s.name,
      studentNumber: s.studentNumber,
      gender: s.gender,
      status: records[s.id]?.status || 'present',
      remarks: records[s.id]?.remarks || '',
    }));

    const result = saveOrUpdateAttendanceSession(currentUser, {
      id: editingSession ? editingSession.id : undefined,
      date,
      sessionType,
      gradeSection: currentUser.gradeSection,
      records: attendanceItems,
      notes,
    });

    setIsSubmitting(false);

    if (result.success) {
      setNotification({
        type: 'success',
        message: `Attendance recorded! Present: ${stats.presentCount} | Absent: ${stats.absentCount} (${stats.rate}%)`,
      });
      onSessionSaved();
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    } else {
      setNotification({
        type: 'error',
        message: result.message,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* ROLE AUTHORIZATION BANNER */}
      {!isPresident ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-amber-900">
                  Class President Authorization Required
                </h3>
                <p className="text-sm text-amber-700 mt-0.5">
                  Only the <strong>Class President</strong> is authorized to take classroom attendance and mark students as Present or Absent.
                  You are currently signed in as a student (<strong>{currentUser.name}</strong>) in read-only mode.
                </p>
              </div>
            </div>
            <button
              id="btn-switch-to-president"
              type="button"
              onClick={onSwitchRole}
              className={`px-4 py-2 ${theme.primaryBtn} text-sm font-semibold rounded-xl transition-colors shrink-0 flex items-center gap-2`}
            >
              <Crown className="w-4 h-4" />
              <span>Switch to Class President</span>
            </button>
          </div>
        </div>
      ) : (
        <div className={`${theme.primaryLightBg} border ${theme.primaryLightBorder} rounded-2xl p-4 shadow-xs`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${theme.brandIconBg} ${theme.brandIconText} flex items-center justify-center shrink-0`}>
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className={`text-sm font-bold ${theme.primaryText}`}>
                    Class President Access Verified
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${theme.accentBadgeBg} ${theme.accentBadgeText} border ${theme.accentBadgeBorder}`}>
                    Official Roll Call Officer
                  </span>
                </div>
                <p className={`text-xs ${theme.textSecondary}`}>
                  Welcome, <strong>{currentUser.name}</strong>. You have full access to conduct roll call and mark students Present or Absent.
                </p>
              </div>
            </div>

            {editingSession && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-lg border border-amber-300">
                  Editing Past Session ({editingSession.date})
                </span>
                {onCancelEdit && (
                  <button
                    type="button"
                    onClick={onCancelEdit}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-4 rounded-xl text-sm font-medium border flex items-center gap-3 ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Roll Call Form Card */}
      <form onSubmit={handleSubmit} className={`${theme.cardBg} rounded-2xl border ${theme.cardBorder} ${theme.cardShadow} overflow-hidden`}>
        {/* Session Meta Header */}
        <div className={`p-5 sm:p-6 border-b ${theme.cardBorder} bg-black/5`}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Date Picker */}
            <div>
              <label htmlFor="rollcall-date" className={`block text-xs font-bold ${theme.textSecondary} uppercase tracking-wider mb-1.5 flex items-center gap-1.5`}>
                <Calendar className={`w-3.5 h-3.5 ${theme.primaryText}`} />
                <span>Attendance Date</span>
              </label>
              <input
                id="rollcall-date"
                type="date"
                value={date}
                disabled={!isPresident}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden ${theme.ringColor} focus:ring-2 disabled:bg-slate-100 disabled:cursor-not-allowed transition-all`}
                required
              />
            </div>

            {/* Session Type */}
            <div>
              <label htmlFor="rollcall-type" className={`block text-xs font-bold ${theme.textSecondary} uppercase tracking-wider mb-1.5 flex items-center gap-1.5`}>
                <Clock className={`w-3.5 h-3.5 ${theme.primaryText}`} />
                <span>Session Type</span>
              </label>
              <select
                id="rollcall-type"
                value={sessionType}
                disabled={!isPresident}
                onChange={(e) =>
                  setSessionType(
                    e.target.value as 'Morning Roll Call' | 'Afternoon Roll Call' | 'Daily Attendance' | 'Subject Period'
                  )
                }
                className={`w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden ${theme.ringColor} focus:ring-2 disabled:bg-slate-100 disabled:cursor-not-allowed transition-all`}
              >
                <option value="Morning Roll Call">Morning Roll Call</option>
                <option value="Afternoon Roll Call">Afternoon Roll Call</option>
                <option value="Daily Attendance">Daily Attendance</option>
                <option value="Subject Period">Subject Period</option>
              </select>
            </div>

            {/* Class Section */}
            <div>
              <label className={`block text-xs font-bold ${theme.textSecondary} uppercase tracking-wider mb-1.5 flex items-center gap-1.5`}>
                <School className={`w-3.5 h-3.5 ${theme.primaryText}`} />
                <span>Classroom Section</span>
              </label>
              <div className="px-3.5 py-2.5 bg-white/70 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 flex items-center justify-between">
                <span>{currentUser.gradeSection || 'Grade 10 - Diamond'}</span>
                <span className="text-[10px] uppercase font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">SY 2026</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Attendance Stats Counter */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <span className="text-xs font-medium text-slate-500 block">Total Students</span>
              <span className="text-2xl font-bold text-slate-900">{stats.total}</span>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-emerald-700">Present</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-2xl font-bold text-emerald-700">{stats.presentCount}</span>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-rose-700">Absent</span>
                <XCircle className="w-4 h-4 text-rose-600" />
              </div>
              <span className="text-2xl font-bold text-rose-700">{stats.absentCount}</span>
            </div>

            <div className={`${theme.primaryLightBg} border ${theme.primaryLightBorder} rounded-xl p-3.5`}>
              <span className={`text-xs font-medium ${theme.primaryText} block`}>Attendance Rate</span>
              <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-bold ${theme.primaryText}`}>{stats.rate}%</span>
                <span className={`text-xs ${theme.primaryText} opacity-80`}>turnout</span>
              </div>
            </div>
          </div>

          {/* Quick Mass Actions & Search Filters */}
          <div className="mt-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Mass actions (President only) */}
            {isPresident && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  id="btn-mark-all-present"
                  type="button"
                  onClick={() => handleMarkAll('present')}
                  className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-300 transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>Mark All Present</span>
                </button>

                <button
                  id="btn-mark-all-absent"
                  type="button"
                  onClick={() => handleMarkAll('absent')}
                  className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold rounded-lg border border-rose-300 transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Mark All Absent</span>
                </button>
              </div>
            )}

            {/* Filter by Status & Gender & Search */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 sm:w-48">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'present' | 'absent')}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
              >
                <option value="all">All Status</option>
                <option value="present">Present Only ({stats.presentCount})</option>
                <option value="absent">Absent Only ({stats.absentCount})</option>
              </select>

              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value as 'all' | 'Male' | 'Female')}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
              >
                <option value="all">All Genders</option>
                <option value="Male">Boys (Male)</option>
                <option value="Female">Girls (Female)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Student Roll Call List */}
        <div className="divide-y divide-slate-100 max-h-[560px] overflow-y-auto">
          {filteredStudents.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Info className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p className="font-semibold text-sm">No students match your filter criteria.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setGenderFilter('all');
                }}
                className="mt-2 text-xs text-emerald-600 font-medium hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            filteredStudents.map((student, idx) => {
              const currentStatus = records[student.id]?.status || 'present';
              const currentRemarks = records[student.id]?.remarks || '';

              return (
                <div
                  key={student.id}
                  className={`p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                    currentStatus === 'absent' ? 'bg-rose-50/40' : 'hover:bg-slate-50/80'
                  }`}
                >
                  {/* Student Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono text-slate-400 w-6 text-right shrink-0">
                      {idx + 1}.
                    </span>

                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        student.gender === 'Female'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-sky-100 text-sky-700'
                      }`}
                    >
                      {student.name.charAt(0)}
                    </div>

                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900 truncate">
                          {student.name}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            student.gender === 'Female'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-sky-50 text-sky-700 border border-sky-200'
                          }`}
                        >
                          {student.gender}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-slate-500">
                        ID: {student.studentNumber}
                      </span>
                    </div>
                  </div>

                  {/* Attendance Toggle & Remarks */}
                  <div className="flex flex-wrap items-center gap-3 sm:shrink-0">
                    {/* Optional remarks (e.g. excused, sick, tardy) */}
                    {isPresident && (
                      <input
                        type="text"
                        placeholder="Remarks / Reason..."
                        value={currentRemarks}
                        onChange={(e) => handleRemarkChange(student.id, e.target.value)}
                        className="text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg w-36 sm:w-44 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                      />
                    )}

                    {!isPresident && currentRemarks && (
                      <span className="text-xs text-slate-500 italic">
                        Note: {currentRemarks}
                      </span>
                    )}

                    {/* PRESENT / ABSENT Buttons */}
                    <div className="flex items-center rounded-xl p-1 bg-slate-100 border border-slate-200">
                      {/* PRESENT BUTTON */}
                      <button
                        id={`btn-present-${student.id}`}
                        type="button"
                        disabled={!isPresident}
                        onClick={() => handleToggleStatus(student.id, 'present')}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          currentStatus === 'present'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 disabled:hover:text-slate-600'
                        } ${!isPresident ? 'cursor-default' : 'cursor-pointer'}`}
                      >
                        <CheckCircle2 className={`w-4 h-4 ${currentStatus === 'present' ? 'text-white' : 'text-emerald-600'}`} />
                        <span>PRESENT</span>
                      </button>

                      {/* ABSENT BUTTON */}
                      <button
                        id={`btn-absent-${student.id}`}
                        type="button"
                        disabled={!isPresident}
                        onClick={() => handleToggleStatus(student.id, 'absent')}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          currentStatus === 'absent'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 disabled:hover:text-slate-600'
                        } ${!isPresident ? 'cursor-default' : 'cursor-pointer'}`}
                      >
                        <XCircle className={`w-4 h-4 ${currentStatus === 'absent' ? 'text-white' : 'text-rose-600'}`} />
                        <span>ABSENT</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Notes & Submit Bar */}
        <div className="p-5 sm:p-6 bg-slate-50 border-t border-slate-100">
          <div className="space-y-4">
            <div>
              <label htmlFor="session-notes" className={`block text-xs font-bold ${theme.textSecondary} uppercase tracking-wider mb-1.5`}>
                Class President's Daily Remarks & Adviser Notes (Optional)
              </label>
              <textarea
                id="session-notes"
                rows={2}
                disabled={!isPresident}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  isPresident
                    ? "Add any notes (e.g., student excuses, school activities, letters submitted)..."
                    : "Only Class President can add notes."
                }
                className={`w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden ${theme.ringColor} focus:ring-2 disabled:bg-slate-100 disabled:cursor-not-allowed`}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className={`text-xs ${theme.textMuted} flex items-center gap-1.5`}>
                <ShieldCheck className={`w-4 h-4 ${theme.primaryText} shrink-0`} />
                <span>
                  Recorded by Class President: <strong>{currentUser.name}</strong> • Section: {currentUser.gradeSection}
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {isPresident ? (
                  <button
                    id="btn-submit-rollcall"
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full sm:w-auto px-6 py-2.5 ${theme.primaryBtn} text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2`}
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingSession ? 'Update Attendance Session' : 'Save & Submit Roll Call'}</span>
                  </button>
                ) : (
                  <div className="text-xs text-amber-700 font-semibold bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                    Read-Only: Attendance submission is restricted to the Class President.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
