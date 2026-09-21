import React, { useState, useMemo } from 'react';
import { ClassAttendanceSession, User } from '../types';
import { deleteAttendanceSession } from '../storage';
import { useTheme } from '../ThemeContext';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Search,
  Download,
  Printer,
  Edit,
  Trash2,
  Eye,
  FileSpreadsheet,
  Clock,
  Crown,
  ChevronRight,
  ShieldCheck,
  X,
} from 'lucide-react';

interface HistoryViewProps {
  currentUser: User;
  sessions: ClassAttendanceSession[];
  onEditSession: (session: ClassAttendanceSession) => void;
  onSessionDeleted: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  currentUser,
  sessions,
  onEditSession,
  onSessionDeleted,
}) => {
  const { theme } = useTheme();
  const isPresident = currentUser.role === 'class_president';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSession, setSelectedSession] = useState<ClassAttendanceSession | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<ClassAttendanceSession | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const matchSearch =
        s.date.includes(searchQuery) ||
        s.sessionType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.notes.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSearch;
    });
  }, [sessions, searchQuery]);

  // Handle Export CSV
  const handleExportCSV = (session: ClassAttendanceSession) => {
    const headers = ['Student ID', 'Student Name', 'Gender', 'Status', 'Remarks'];
    const rows = session.records.map((r) => [
      `"${r.studentNumber}"`,
      `"${r.studentName}"`,
      `"${r.gender}"`,
      `"${r.status.toUpperCase()}"`,
      `"${r.remarks || ''}"`,
    ]);

    const meta = [
      `"Class Attendance Sheet - ${session.gradeSection}"`,
      `"Date: ${session.date} | Session: ${session.sessionType}"`,
      `"Class President: ${session.presidentName}"`,
      `"Present: ${session.presentCount}/${session.totalStudents} (${session.attendanceRate}%) | Absent: ${session.absentCount}"`,
      '',
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      meta.join('\n') +
      headers.join(',') +
      '\n' +
      rows.map((e) => e.join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Classroom_Attendance_${session.date}_${session.sessionType.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Delete
  const confirmDelete = () => {
    if (!sessionToDelete) return;
    const res = deleteAttendanceSession(currentUser, sessionToDelete.id);
    if (res.success) {
      setSessionToDelete(null);
      if (selectedSession?.id === sessionToDelete.id) {
        setSelectedSession(null);
      }
      onSessionDeleted();
    } else {
      setDeleteError(res.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className={`${theme.cardBg} rounded-2xl border ${theme.cardBorder} p-5 ${theme.cardShadow} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
        <div>
          <h2 className={`text-base font-bold ${theme.textPrimary}`}>Attendance History & Records</h2>
          <p className={`text-xs ${theme.textMuted} mt-0.5`}>
            Past roll call records logged by the Class President.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search date or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 ${theme.ringColor}`}
          />
        </div>
      </div>

      {/* Sessions List */}
      {filteredSessions.length === 0 ? (
        <div className={`${theme.cardBg} rounded-2xl border ${theme.cardBorder} p-12 text-center text-slate-500`}>
          <Calendar className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <h3 className={`text-sm font-bold ${theme.textPrimary}`}>No attendance sessions found</h3>
          <p className={`text-xs ${theme.textMuted} mt-1`}>
            {searchQuery ? 'Try changing your search keywords.' : 'The Class President has not submitted any roll calls yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              className={`${theme.cardBg} rounded-2xl border ${theme.cardBorder} hover:border-slate-300 p-5 ${theme.cardShadow} flex flex-col justify-between transition-all`}
            >
              <div>
                {/* Session Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className={`flex items-center gap-1.5 text-xs font-bold ${theme.primaryText}`}>
                      <Clock className="w-3.5 h-3.5" />
                      <span>{session.sessionType}</span>
                    </div>
                    <h3 className={`text-base font-bold ${theme.textPrimary} mt-0.5`}>{session.date}</h3>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      session.attendanceRate >= 90
                        ? 'bg-emerald-100 text-emerald-800'
                        : session.attendanceRate >= 75
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {session.attendanceRate}% Rate
                  </span>
                </div>

                {/* President Tag */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
                  <Crown className="w-3.5 h-3.5 text-amber-500" />
                  <span className="truncate">President: {session.presidentName}</span>
                </div>

                {/* Metrics Pill Grid */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-4 text-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total</span>
                    <span className="text-sm font-bold text-slate-800">{session.totalStudents}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-600 block">Present</span>
                    <span className="text-sm font-bold text-emerald-700">{session.presentCount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-rose-600 block">Absent</span>
                    <span className="text-sm font-bold text-rose-700">{session.absentCount}</span>
                  </div>
                </div>

                {session.notes && (
                  <p className="text-xs text-slate-600 bg-slate-50/70 p-2 rounded-lg border border-slate-100 line-clamp-2 mb-4 italic">
                    "{session.notes}"
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className={`border-t ${theme.cardBorder} pt-3 flex items-center justify-between gap-2`}>
                <button
                  id={`btn-view-sheet-${session.id}`}
                  type="button"
                  onClick={() => setSelectedSession(session)}
                  className={`flex items-center gap-1 text-xs font-bold ${theme.primaryText} ${theme.primaryLightBg} hover:opacity-90 px-2.5 py-1.5 rounded-lg transition-colors`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Sheet</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleExportCSV(session)}
                    title="Export CSV Roll Sheet"
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  {/* President Edit & Delete Actions */}
                  {isPresident && (
                    <>
                      <button
                        type="button"
                        onClick={() => onEditSession(session)}
                        title="Edit Attendance"
                        className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setSessionToDelete(session)}
                        title="Delete Session"
                        className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DETAIL MODAL: VIEW FULL ATTENDANCE SHEET */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-0.5 ${theme.accentBadgeBg} ${theme.accentBadgeText} rounded-md border ${theme.accentBadgeBorder}`}>
                    {selectedSession.sessionType}
                  </span>
                  <span className="text-xs text-slate-500">•</span>
                  <span className="text-xs font-bold text-slate-700">{selectedSession.date}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  Roll Call Sheet: {selectedSession.gradeSection}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSession(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Attendance Meta Summary */}
            <div className="px-6 py-3 bg-slate-100/60 border-b border-slate-200 flex flex-wrap items-center justify-between text-xs gap-3">
              <div className="flex items-center gap-1.5 text-slate-600">
                <Crown className="w-4 h-4 text-amber-500" />
                <span>President: <strong>{selectedSession.presidentName}</strong></span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-emerald-700 font-bold">
                  Present: {selectedSession.presentCount}
                </span>
                <span className="text-rose-700 font-bold">
                  Absent: {selectedSession.absentCount}
                </span>
                <span className="text-slate-800 font-bold">
                  Rate: {selectedSession.attendanceRate}%
                </span>
              </div>
            </div>

            {/* Students List in this session */}
            <div className="p-6 overflow-y-auto flex-1 divide-y divide-slate-100">
              {selectedSession.records.map((student, idx) => (
                <div key={student.studentId} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 font-mono w-5 text-right">
                      {idx + 1}.
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">
                          {student.studentName}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          ({student.studentNumber})
                        </span>
                      </div>
                      {student.remarks && (
                        <p className="text-xs text-slate-500 italic mt-0.5">
                          Remark: {student.remarks}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    {student.status === 'present' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>PRESENT</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>ABSENT</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleExportCSV(selectedSession)}
                className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 shadow-2xs flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedSession(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {sessionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl border border-slate-200">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Delete Attendance Session?</h3>
            <p className="text-xs text-slate-600 mt-1">
              Are you sure you want to delete the attendance roll sheet for{' '}
              <strong>{sessionToDelete.date}</strong> ({sessionToDelete.sessionType})? This action cannot be undone.
            </p>

            {deleteError && (
              <p className="text-xs text-rose-600 font-semibold mt-2">{deleteError}</p>
            )}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSessionToDelete(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
