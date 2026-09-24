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
  AlertTriangle,
  Clock,
  Search,
  Calendar,
  Crown,
  Save,
  RotateCcw,
  Sparkles,
  Info,
  CheckCheck,
  GraduationCap,
  Eye,
  UserX,
  BellRing,
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
  const isTeacher = currentUser.role === 'teacher';
  const isPresident = currentUser.role === 'class_president';
  const isStudent = currentUser.role === 'student';
  const canEdit = isTeacher || isPresident;

  const [date, setDate] = useState<string>(editingSession ? editingSession.date : getTodayDateString());
  const [sessionType, setSessionType] = useState<
    'Morning Roll Call' | 'Afternoon Roll Call' | 'Daily Attendance' | 'Subject Period'
  >(editingSession ? editingSession.sessionType : 'Morning Roll Call');
  const [notes, setNotes] = useState<string>(editingSession ? editingSession.notes : '');

  // Local state of each student's attendance for active roll call
  const [records, setRecords] = useState<Record<string, { status: AttendanceStatus; remarks: string }>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AttendanceStatus>('all');
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
        // Default to present for quick roll call
        initialMap[student.id] = {
          status: 'present',
          remarks: '',
        };
      }
    });

    setRecords(initialMap);
    if (existing) {
      setNotes(existing.notes || '');
      setSessionType(existing.sessionType);
    }
  }, [date, editingSession, students]);

  // Handle status toggle
  const handleStatusChange = (studentId: string, newStatus: AttendanceStatus) => {
    if (!canEdit) return;
    setRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status: newStatus,
      },
    }));
  };

  // Handle remarks change
  const handleRemarksChange = (studentId: string, remarks: string) => {
    if (!canEdit) return;
    setRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks,
      },
    }));
  };

  // Bulk actions (mark all present)
  const handleMarkAll = (status: AttendanceStatus) => {
    if (!canEdit) return;
    const updated: Record<string, { status: AttendanceStatus; remarks: string }> = {};
    students.forEach((s) => {
      updated[s.id] = {
        status,
        remarks: records[s.id]?.remarks || '',
      };
    });
    setRecords(updated);
  };

  // Stats calculation
  const stats = useMemo(() => {
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;
    let halfDayCount = 0;

    Object.values(records).forEach((r) => {
      if (r.status === 'present') presentCount++;
      else if (r.status === 'absent') absentCount++;
      else if (r.status === 'late') lateCount++;
      else if (r.status === 'half_day') halfDayCount++;
    });

    const total = students.length;
    const attended = presentCount + lateCount + halfDayCount;
    const rate = total > 0 ? Math.round((attended / total) * 100) : 0;

    return { total, presentCount, absentCount, lateCount, halfDayCount, rate };
  }, [records, students]);

  // List of students who are absent or half-day today for the "Who is absent today?" highlight
  const absentStudentsList = useMemo(() => {
    return students.filter((s) => records[s.id]?.status === 'absent');
  }, [students, records]);

  const lateOrHalfDayList = useMemo(() => {
    return students.filter(
      (s) => records[s.id]?.status === 'late' || records[s.id]?.status === 'half_day'
    );
  }, [students, records]);

  // Filtered student list
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchSearch =
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.studentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.officerRole && student.officerRole.toLowerCase().includes(searchQuery.toLowerCase()));

      const currentStatus = records[student.id]?.status || 'present';
      const matchStatus = statusFilter === 'all' || currentStatus === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [students, searchQuery, statusFilter, records]);

  // Submit roll call
  const handleSubmitSession = () => {
    if (!canEdit) {
      setNotification({
        type: 'error',
        message: 'View-Only Mode: You are signed in as Student. No permission to edit.',
      });
      return;
    }

    setIsSubmitting(true);
    setNotification(null);

    const items: StudentAttendanceItem[] = students.map((s) => ({
      studentId: s.id,
      studentName: s.name,
      studentNumber: s.studentNumber,
      gender: s.gender,
      officerRole: s.officerRole,
      status: records[s.id]?.status || 'present',
      remarks: records[s.id]?.remarks || '',
    }));

    const result = saveOrUpdateAttendanceSession(currentUser, {
      id: editingSession?.id,
      date,
      sessionType,
      gradeSection: currentUser.gradeSection,
      records: items,
      notes,
    });

    setIsSubmitting(false);

    if (result.success) {
      setNotification({ type: 'success', message: result.message });
      onSessionSaved();
      setTimeout(() => setNotification(null), 5000);
    } else {
      setNotification({ type: 'error', message: result.message });
    }
  };

  return (
    <div className="space-y-6">
      {/* ROLE BANNER & PUBLIC NOTICE */}
      {isStudent && (
        <div className="bg-amber-50 border-2 border-yellow-400/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-900 text-yellow-300 flex items-center justify-center shrink-0 mt-0.5">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-stone-900">
                  Student Live View (Read-Only)
                </span>
                <span className="text-[10px] font-bold uppercase bg-stone-900 text-yellow-300 px-2 py-0.5 rounded-full">
                  Public Board
                </span>
              </div>
              <p className="text-xs text-stone-700 mt-0.5">
                Attendance is recorded exclusively by the authorized <strong>Class President</strong> and verified by the <strong>Adviser</strong> to guarantee honesty.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onSwitchRole}
            className="text-xs font-bold text-red-700 hover:text-red-900 bg-yellow-200/70 hover:bg-yellow-200 px-3 py-1.5 rounded-xl border border-yellow-300 transition-colors shrink-0"
          >
            Encoder / Adviser Login →
          </button>
        </div>
      )}

      {isPresident && (
        <div className="bg-red-800 text-white rounded-2xl p-4 sm:p-5 shadow-md border-2 border-yellow-400/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400 text-red-950 flex items-center justify-center shrink-0 font-black">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black tracking-wide text-yellow-300 uppercase">
                  Authorized Encoder: Class President
                </span>
              </div>
              <p className="text-xs text-red-100 mt-0.5">
                Mark each student accurately. When you save, your <strong>Teacher Adviser will receive an instant notification</strong> with the audit log.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-yellow-400 text-red-950 shadow-xs">
              <BellRing className="w-3.5 h-3.5" />
              <span>Adviser Auto-Alert Active</span>
            </span>
          </div>
        </div>
      )}

      {isTeacher && (
        <div className="bg-stone-900 text-white rounded-2xl p-4 sm:p-5 shadow-md border-2 border-yellow-400/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400 text-stone-950 flex items-center justify-center shrink-0 font-bold">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-yellow-300">
                  Adviser Master Control Panel
                </span>
                <span className="text-[10px] font-bold bg-yellow-400 text-stone-950 px-2 py-0.5 rounded-full">
                  Admin
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-0.5">
                You receive instant alerts when the President checks attendance. You have master authorization to edit or verify.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* "WHO IS ABSENT TODAY?" - CLASSROOM TV HIGHLIGHT BANNER */}
      <div className="bg-white rounded-2xl border-2 border-amber-200/90 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
              <UserX className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-stone-900">
                Who is absent today?
              </h2>
              <span className="text-xs text-stone-500">
                Date: {date} • {sessionType}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-600">
              Absentees: <strong className="text-red-700">{absentStudentsList.length}</strong>
            </span>
          </div>
        </div>

        <div className="pt-3">
          {absentStudentsList.length === 0 ? (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Perfect Attendance! No students are marked absent today.</span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {absentStudentsList.map((std, idx) => (
                <div
                  key={std.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs font-bold"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0" />
                  <span>
                    {idx + 1}. {std.name}
                    {std.officerRole && ` (${std.officerRole})`}
                  </span>
                  {records[std.id]?.remarks && (
                    <span className="text-[10px] text-red-600 font-normal italic">
                      — {records[std.id].remarks}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {lateOrHalfDayList.length > 0 && (
            <div className="mt-3 pt-3 border-t border-stone-100 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-stone-700">Late / Half Day:</span>
              {lateOrHalfDayList.map((std) => (
                <span
                  key={std.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-semibold"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      records[std.id]?.status === 'late' ? 'bg-yellow-500' : 'bg-orange-500'
                    }`}
                  />
                  <span>
                    {std.name}
                    {records[std.id]?.status === 'late' ? ' (Late)' : ' (Half Day)'}
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SESSION CONTROLS & STATS BAR */}
      <div className={`${theme.cardBg} rounded-2xl border-2 ${theme.cardBorder} p-5 ${theme.cardShadow}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-stone-100">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  disabled={!canEdit}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs font-semibold bg-white border border-stone-300 rounded-xl text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-red-600 disabled:bg-stone-100"
                />
                <Calendar className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                Session Type
              </label>
              <select
                disabled={!canEdit}
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value as any)}
                className="px-3 py-1.5 text-xs font-semibold bg-white border border-stone-300 rounded-xl text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-red-600 disabled:bg-stone-100"
              >
                <option value="Morning Roll Call">Morning Roll Call (7:00 AM)</option>
                <option value="Afternoon Roll Call">Afternoon Roll Call (1:00 PM)</option>
                <option value="Daily Attendance">Daily Attendance</option>
                <option value="Subject Period">Subject Period Roll Call</option>
              </select>
            </div>

            {canEdit && (
              <div className="self-end pt-4">
                <button
                  id="btn-mark-all-present"
                  type="button"
                  onClick={() => handleMarkAll('present')}
                  className="px-3 py-1.5 text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 rounded-xl transition-colors flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark All Present</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick stats pills */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>Present</span>
              </div>
              <span className="text-base sm:text-lg font-black text-emerald-800">{stats.presentCount}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200">
              <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-red-800">
                <span className="w-2 h-2 rounded-full bg-red-600" />
                <span>Absent</span>
              </div>
              <span className="text-base sm:text-lg font-black text-red-800">{stats.absentCount}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-yellow-50 border border-yellow-200">
              <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-yellow-800">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                <span>Late</span>
              </div>
              <span className="text-base sm:text-lg font-black text-yellow-800">{stats.lateCount}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-200">
              <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-orange-800">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                <span>Half Day</span>
              </div>
              <span className="text-base sm:text-lg font-black text-orange-800">{stats.halfDayCount}</span>
            </div>
          </div>
        </div>

        {/* SEARCH & STATUS FILTER */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search student or officer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-red-600"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mr-1">Filter:</span>
            {(['all', 'present', 'absent', 'late', 'half_day'] as const).map((filterOption) => (
              <button
                key={filterOption}
                type="button"
                onClick={() => setStatusFilter(filterOption)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all capitalize ${
                  statusFilter === filterOption
                    ? 'bg-red-800 text-yellow-300 shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {filterOption === 'all'
                  ? 'All'
                  : filterOption === 'half_day'
                  ? 'Half Day'
                  : filterOption}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* NOTIFICATION FEEDBACK */}
      {notification && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs font-semibold ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-stone-400 hover:text-stone-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* STUDENT ATTENDANCE LIST (WITH CIRCLE SHAPES & OFFICER INDICATORS) */}
      <div className="bg-white rounded-2xl border-2 border-amber-200/90 shadow-xs overflow-hidden">
        <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs sm:text-sm font-black text-stone-900 uppercase tracking-wider">
              Student Attendance Sheet
            </h3>
            <span className="text-xs font-bold bg-yellow-100 text-yellow-900 border border-yellow-300 px-2 py-0.5 rounded-full">
              {filteredStudents.length} Students
            </span>
          </div>

          {/* Circle Shape Legend requested by user */}
          <div className="hidden sm:flex items-center gap-3 text-[11px] font-bold text-stone-600">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-emerald-600" /> Present
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-600" /> Absent
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-yellow-500" /> Late
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-orange-500" /> Half Day
            </span>
          </div>
        </div>

        <div className="divide-y divide-stone-100">
          {filteredStudents.length === 0 ? (
            <div className="p-8 text-center text-xs text-stone-500">
              No students found matching your search.
            </div>
          ) : (
            filteredStudents.map((student, index) => {
              const currentStatus = records[student.id]?.status || 'present';
              const currentRemarks = records[student.id]?.remarks || '';

              return (
                <div
                  key={student.id}
                  className={`p-3.5 sm:p-4 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    currentStatus === 'absent'
                      ? 'bg-red-50/40'
                      : currentStatus === 'late'
                      ? 'bg-yellow-50/40'
                      : currentStatus === 'half_day'
                      ? 'bg-orange-50/40'
                      : 'hover:bg-stone-50/70'
                  }`}
                >
                  {/* Student full name + officer role */}
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 text-xs font-mono font-bold text-stone-400 text-right">
                      {index + 1}.
                    </span>

                    {/* Status Circle Shape */}
                    <div
                      title={
                        currentStatus === 'present'
                          ? 'Present'
                          : currentStatus === 'absent'
                          ? 'Absent'
                          : currentStatus === 'late'
                          ? 'Late'
                          : 'Half Day (nisud)'
                      }
                      className={`w-4 h-4 rounded-full shrink-0 shadow-xs ring-2 ring-white ${
                        currentStatus === 'present'
                          ? 'bg-emerald-600'
                          : currentStatus === 'absent'
                          ? 'bg-red-600'
                          : currentStatus === 'late'
                          ? 'bg-yellow-500'
                          : 'bg-orange-500'
                      }`}
                    />

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* FULL NAME */}
                        <span className="text-sm font-bold text-stone-900">
                          {student.name}
                        </span>

                        {/* OFFICER ROLE INDICATOR (e.g. - President) */}
                        {student.officerRole ? (
                          <span className="text-xs font-black text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Crown className="w-3 h-3 text-amber-600" />
                            <span>— {student.officerRole}</span>
                          </span>
                        ) : null}
                      </div>

                      <span className="text-[11px] text-stone-500 block">
                        ID: {student.studentNumber} • {student.gender}
                      </span>
                    </div>
                  </div>

                  {/* Status buttons or read-only indicator */}
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-end sm:self-center">
                    {canEdit ? (
                      /* 4-STATUS TOGGLES FOR PRESIDENT & ADVISER */
                      <div className="flex items-center bg-stone-100 p-1 rounded-xl gap-1 border border-stone-200">
                        {/* PRESENT (Green Circle) */}
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'present')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                            currentStatus === 'present'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200'
                          }`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full bg-current" />
                          <span>Present</span>
                        </button>

                        {/* ABSENT (Red Circle) */}
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'absent')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                            currentStatus === 'absent'
                              ? 'bg-red-600 text-white shadow-xs'
                              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200'
                          }`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full bg-current" />
                          <span>Absent</span>
                        </button>

                        {/* LATE (Yellow Circle) */}
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'late')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                            currentStatus === 'late'
                              ? 'bg-yellow-500 text-stone-950 shadow-xs'
                              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200'
                          }`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full bg-current" />
                          <span>Late</span>
                        </button>

                        {/* HALF DAY (Orange Circle) */}
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'half_day')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                            currentStatus === 'half_day'
                              ? 'bg-orange-500 text-white shadow-xs'
                              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200'
                          }`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full bg-current" />
                          <span>Half Day</span>
                        </button>
                      </div>
                    ) : (
                      /* READ-ONLY STATUS BADGE FOR STUDENT VIEW */
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold ${
                            currentStatus === 'present'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : currentStatus === 'absent'
                              ? 'bg-red-100 text-red-900 border border-red-300'
                              : currentStatus === 'late'
                              ? 'bg-yellow-100 text-yellow-900 border border-yellow-300'
                              : 'bg-orange-100 text-orange-900 border border-orange-300'
                          }`}
                        >
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              currentStatus === 'present'
                                ? 'bg-emerald-600'
                                : currentStatus === 'absent'
                                ? 'bg-red-600'
                                : currentStatus === 'late'
                                ? 'bg-yellow-500'
                                : 'bg-orange-500'
                            }`}
                          />
                          {currentStatus === 'present' && 'Present'}
                          {currentStatus === 'absent' && 'Absent'}
                          {currentStatus === 'late' && 'Late'}
                          {currentStatus === 'half_day' && 'Half Day nisud'}
                        </span>
                      </div>
                    )}

                    {/* Remarks input for reason */}
                    {canEdit ? (
                      <input
                        type="text"
                        placeholder="Reason/remarks..."
                        value={currentRemarks}
                        onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                        className="w-32 sm:w-44 px-2.5 py-1 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-800 placeholder:text-stone-400 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-red-600"
                      />
                    ) : currentRemarks ? (
                      <span className="text-[11px] text-stone-500 italic max-w-xs truncate">
                        "{currentRemarks}"
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* SUBMIT ACTION BAR FOR PRESIDENT & ADVISER */}
        {canEdit && (
          <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-stone-600">
              <BellRing className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                {isPresident
                  ? 'Submitting will automatically send an attendance alert to Adviser Mrs. Santos.'
                  : 'You are signed in as Adviser. Changes will update the official master ledger.'}
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {onCancelEdit && (
                <button
                  type="button"
                  onClick={onCancelEdit}
                  className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              )}

              <button
                id="btn-submit-rollcall"
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmitSession}
                className="w-full sm:w-auto px-6 py-2.5 bg-red-700 hover:bg-red-800 text-yellow-200 text-xs sm:text-sm font-extrabold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? 'Saving & Notifying...'
                    : isPresident
                    ? 'Submit Attendance & Notify Adviser'
                    : 'Save Official Attendance'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
