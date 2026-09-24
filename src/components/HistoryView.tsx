import React, { useState, useMemo } from 'react';
import { ClassAttendanceSession, User } from '../types';
import { deleteAttendanceSession } from '../storage';
import { useTheme } from '../ThemeContext';
import {
  Calendar,
  CheckCircle2,
  Search,
  Download,
  Edit,
  Trash2,
  Eye,
  Crown,
  X,
  School,
  GraduationCap,
  Clock,
  UserCheck,
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
  const isTeacher = currentUser.role === 'teacher';
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
        s.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.presidentName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSearch;
    });
  }, [sessions, searchQuery]);

  // Handle Export CSV
  const handleExportCSV = (session: ClassAttendanceSession) => {
    const headers = ['#', 'Student Full Name', 'Officer Role', 'Gender', 'Student ID', 'Status', 'Remarks'];
    const rows = session.records.map((r, idx) => [
      idx + 1,
      `"${r.studentName}"`,
      `"${r.officerRole || 'Student'}"`,
      `"${r.gender}"`,
      `"${r.studentNumber}"`,
      `"${r.status.toUpperCase()}"`,
      `"${r.remarks || ''}"`,
    ]);

    const meta = [
      `"Sto. Niño Mactan Montessori School - Classroom Attendance Sheet"`,
      `"Grade & Section: ${session.gradeSection}"`,
      `"Date: ${session.date} | Session: ${session.sessionType}"`,
      `"Class President Encoder: ${session.presidentName}"`,
      `"Present: ${session.presentCount} | Absent: ${session.absentCount} | Late: ${session.lateCount || 0} | Half Day: ${session.halfDayCount || 0} | Rate: ${session.attendanceRate}%"`,
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
    link.setAttribute('download', `SNMMS_Attendance_${session.gradeSection.replace(/\s+/g, '_')}_${session.date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Delete (Teacher only)
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
      <div className={`${theme.cardBg} rounded-2xl border-2 ${theme.cardBorder} p-5 ${theme.cardShadow} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
        <div>
          <h2 className="text-base font-extrabold text-stone-900">
            Attendance History & Records
          </h2>
          <p className="text-xs text-stone-600 mt-0.5">
            Archived roll call sessions for {currentUser.gradeSection}.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search date or remarks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-300 rounded-xl text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-red-600"
          />
        </div>
      </div>

      {/* Sessions Cards */}
      {filteredSessions.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-amber-200/90 p-12 text-center text-stone-500">
          <Calendar className="w-10 h-10 mx-auto text-stone-300 mb-2" />
          <h3 className="text-sm font-bold text-stone-800">No attendance sessions found</h3>
          <p className="text-xs text-stone-500 mt-1">
            {searchQuery ? 'Try changing your search keywords.' : 'No roll calls logged yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              className="bg-white rounded-2xl border-2 border-amber-200/90 p-5 shadow-xs hover:border-amber-400 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-yellow-100 text-yellow-900 border border-yellow-300 inline-block mb-1">
                      {session.sessionType}
                    </span>
                    <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-red-700" />
                      <span>{session.date}</span>
                    </h3>
                  </div>

                  <span className="text-xs font-black bg-stone-100 text-stone-800 px-2 py-1 rounded-lg">
                    {session.attendanceRate}% Rate
                  </span>
                </div>

                <div className="text-[11px] text-stone-600 mb-3 flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-amber-600" />
                  <span>Marked by: <strong>{session.presidentName}</strong></span>
                </div>

                {/* 4 Status Breakdown with circle shapes */}
                <div className="grid grid-cols-4 gap-2 text-center p-2.5 bg-stone-50 rounded-xl border border-stone-200 mb-3 text-xs">
                  <div>
                    <span className="flex items-center justify-center gap-1 text-[10px] font-bold text-emerald-800">
                      <span className="w-2 h-2 rounded-full bg-emerald-600" /> Pres.
                    </span>
                    <span className="font-extrabold text-stone-900">{session.presentCount}</span>
                  </div>
                  <div>
                    <span className="flex items-center justify-center gap-1 text-[10px] font-bold text-red-800">
                      <span className="w-2 h-2 rounded-full bg-red-600" /> Abs.
                    </span>
                    <span className="font-extrabold text-stone-900">{session.absentCount}</span>
                  </div>
                  <div>
                    <span className="flex items-center justify-center gap-1 text-[10px] font-bold text-yellow-800">
                      <span className="w-2 h-2 rounded-full bg-yellow-500" /> Late
                    </span>
                    <span className="font-extrabold text-stone-900">{session.lateCount || 0}</span>
                  </div>
                  <div>
                    <span className="flex items-center justify-center gap-1 text-[10px] font-bold text-orange-800">
                      <span className="w-2 h-2 rounded-full bg-orange-500" /> Half
                    </span>
                    <span className="font-extrabold text-stone-900">{session.halfDayCount || 0}</span>
                  </div>
                </div>

                {session.notes && (
                  <p className="text-xs text-stone-600 bg-amber-50/50 p-2 rounded-lg border border-amber-100 line-clamp-2 mb-3 italic">
                    "{session.notes}"
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="border-t border-stone-100 pt-3 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSession(session)}
                  className="flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Sheet</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleExportCSV(session)}
                    title="Export CSV / Excel"
                    className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  {(isPresident || isTeacher) && (
                    <button
                      type="button"
                      onClick={() => onEditSession(session)}
                      title="Edit Session"
                      className="p-1.5 text-stone-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}

                  {/* ONLY TEACHER CAN DELETE TO PREVENT CHEATING */}
                  {isTeacher && (
                    <button
                      type="button"
                      onClick={() => setSessionToDelete(session)}
                      title="Delete Record (Adviser Admin)"
                      className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DETAIL MODAL: FULL ATTENDANCE SHEET */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl border border-stone-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-stone-200 bg-red-900 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold px-2 py-0.5 bg-yellow-400 text-red-950 rounded-md">
                    {selectedSession.sessionType}
                  </span>
                  <span className="text-xs text-yellow-200">•</span>
                  <span className="text-xs font-bold text-yellow-100">{selectedSession.date}</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white mt-1">
                  Sto. Niño Mactan Montessori School — {selectedSession.gradeSection}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSession(null)}
                className="p-1.5 text-red-200 hover:text-white rounded-lg hover:bg-red-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Meta bar */}
            <div className="px-6 py-3 bg-stone-100 border-b border-stone-200 flex flex-wrap items-center justify-between text-xs gap-3 font-semibold text-stone-700">
              <div className="flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-600" />
                <span>Encoder: <strong>{selectedSession.presidentName}</strong></span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-emerald-800">Present: {selectedSession.presentCount}</span>
                <span className="text-red-800">Absent: {selectedSession.absentCount}</span>
                <span className="text-yellow-800">Late: {selectedSession.lateCount || 0}</span>
                <span className="text-orange-800">Half Day: {selectedSession.halfDayCount || 0}</span>
              </div>
            </div>

            {/* Students list */}
            <div className="p-6 overflow-y-auto flex-1 divide-y divide-stone-100">
              {selectedSession.records.map((student, idx) => (
                <div key={student.studentId} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-stone-400 font-mono w-5 text-right font-bold">
                      {idx + 1}.
                    </span>

                    {/* Circle shape requested by user */}
                    <span
                      className={`w-3.5 h-3.5 rounded-full shrink-0 ${
                        student.status === 'present'
                          ? 'bg-emerald-600'
                          : student.status === 'absent'
                          ? 'bg-red-600'
                          : student.status === 'late'
                          ? 'bg-yellow-500'
                          : 'bg-orange-500'
                      }`}
                    />

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-stone-900">
                          {student.studentName}
                        </span>
                        {student.officerRole && (
                          <span className="text-xs font-black text-amber-900 bg-amber-100 border border-amber-300 px-1.5 py-0.2 rounded">
                            — {student.officerRole}
                          </span>
                        )}
                      </div>
                      {student.remarks && (
                        <p className="text-[11px] text-stone-500 italic mt-0.5">
                          "{student.remarks}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                        student.status === 'present'
                          ? 'bg-emerald-100 text-emerald-900'
                          : student.status === 'absent'
                          ? 'bg-red-100 text-red-900'
                          : student.status === 'late'
                          ? 'bg-yellow-100 text-yellow-900'
                          : 'bg-orange-100 text-orange-900'
                      }`}
                    >
                      {student.status === 'present' && 'Present'}
                      {student.status === 'absent' && 'Absent'}
                      {student.status === 'late' && 'Late'}
                      {student.status === 'half_day' && 'Half Day nisud'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleExportCSV(selectedSession)}
                className="px-4 py-2 text-xs font-bold bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedSession(null)}
                className="px-4 py-2 text-xs font-bold bg-stone-900 hover:bg-stone-800 text-white rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL (ADVISER ONLY) */}
      {sessionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl border border-stone-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-extrabold text-stone-900">Delete Record?</h4>
            <p className="text-xs text-stone-600 mt-1">
              Delete the attendance sheet for <strong>{sessionToDelete.date}</strong> ({sessionToDelete.sessionType})?
            </p>
            {deleteError && (
              <p className="text-xs text-red-600 font-bold mt-2">{deleteError}</p>
            )}
            <div className="mt-5 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSessionToDelete(null);
                  setDeleteError(null);
                }}
                className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-5 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
