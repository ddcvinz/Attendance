import React, { useState, useMemo } from 'react';
import { Student, User, ClassAttendanceSession, StudentAttendanceSummary } from '../types';
import { useTheme } from '../ThemeContext';
import {
  computeStudentSummaries,
  addStudent,
  updateStudent,
  deleteStudent,
  DEFAULT_SECTION,
} from '../storage';
import {
  Users,
  UserPlus,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Crown,
  X,
  User as UserIcon,
  Sparkles,
} from 'lucide-react';

interface RosterViewProps {
  currentUser: User;
  students: Student[];
  sessions: ClassAttendanceSession[];
  onRosterChanged: () => void;
}

export const RosterView: React.FC<RosterViewProps> = ({
  currentUser,
  students,
  sessions,
  onRosterChanged,
}) => {
  const { theme } = useTheme();
  const isPresident = currentUser.role === 'class_president';

  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'Male' | 'Female'>('all');

  // Add / Edit student state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentForm, setStudentForm] = useState({
    studentNumber: '',
    name: '',
    gender: 'Male' as 'Male' | 'Female',
    email: '',
    guardianPhone: '',
  });

  // Delete confirmation
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Student Drilldown modal
  const [drilldownStudent, setDrilldownStudent] = useState<StudentAttendanceSummary | null>(null);

  const summaries = useMemo(() => {
    return computeStudentSummaries(students, sessions);
  }, [students, sessions]);

  const filteredSummaries = useMemo(() => {
    return summaries.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studentNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchGender = genderFilter === 'all' || s.gender === genderFilter;
      return matchSearch && matchGender;
    });
  }, [summaries, searchQuery, genderFilter]);

  const handleOpenAdd = () => {
    setEditingStudent(null);
    const nextNum = String(students.length + 1).padStart(3, '0');
    setStudentForm({
      studentNumber: `2026-${nextNum}`,
      name: '',
      gender: 'Male',
      email: '',
      guardianPhone: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setStudentForm({
      studentNumber: student.studentNumber,
      name: student.name,
      gender: student.gender,
      email: student.email || '',
      guardianPhone: student.guardianPhone || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPresident) return;

    if (editingStudent) {
      updateStudent(editingStudent.id, {
        studentNumber: studentForm.studentNumber.trim(),
        name: studentForm.name.trim(),
        gender: studentForm.gender,
        email: studentForm.email.trim(),
        guardianPhone: studentForm.guardianPhone.trim(),
      });
    } else {
      addStudent({
        studentNumber: studentForm.studentNumber.trim(),
        name: studentForm.name.trim(),
        gender: studentForm.gender,
        gradeSection: currentUser.gradeSection || DEFAULT_SECTION,
        email: studentForm.email.trim(),
        guardianPhone: studentForm.guardianPhone.trim(),
      });
    }

    setIsModalOpen(false);
    onRosterChanged();
  };

  const handleDeleteConfirm = () => {
    if (!studentToDelete || !isPresident) return;
    deleteStudent(studentToDelete.id);
    setStudentToDelete(null);
    onRosterChanged();
  };

  // Find drilldown sessions for specific student
  const studentSessionHistory = useMemo(() => {
    if (!drilldownStudent) return [];
    return sessions.map((s) => {
      const rec = s.records.find((r) => r.studentId === drilldownStudent.studentId);
      return {
        date: s.date,
        sessionType: s.sessionType,
        status: rec?.status || 'unrecorded',
        remarks: rec?.remarks || '',
      };
    });
  }, [drilldownStudent, sessions]);

  return (
    <div className="space-y-6">
      {/* Roster Header */}
      <div className={`${theme.cardBg} rounded-2xl border ${theme.cardBorder} p-5 ${theme.cardShadow} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
        <div>
          <div className="flex items-center gap-2">
            <h2 className={`text-base font-bold ${theme.textPrimary}`}>Classroom Student Roster</h2>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${theme.accentBadgeBg} ${theme.accentBadgeText} border ${theme.accentBadgeBorder}`}>
              {students.length} Students
            </span>
          </div>
          <p className={`text-xs ${theme.textMuted} mt-0.5`}>
            Class list and historical attendance track records for {currentUser.gradeSection}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search student..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 ${theme.ringColor}`}
            />
          </div>

          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value as 'all' | 'Male' | 'Female')}
            className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 font-medium"
          >
            <option value="all">All Genders</option>
            <option value="Male">Boys (Male)</option>
            <option value="Female">Girls (Female)</option>
          </select>

          {isPresident && (
            <button
              id="btn-add-student"
              type="button"
              onClick={handleOpenAdd}
              className={`px-3.5 py-2 ${theme.primaryBtn} text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Student</span>
            </button>
          )}
        </div>
      </div>

      {/* Roster Cards / Table */}
      <div className={`${theme.cardBg} rounded-2xl border ${theme.cardBorder} ${theme.cardShadow} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 pl-6 pr-3">Student Name</th>
                <th className="py-3.5 px-3">Gender</th>
                <th className="py-3.5 px-3">Times Present</th>
                <th className="py-3.5 px-3">Times Absent</th>
                <th className="py-3.5 px-3">Attendance Rate</th>
                <th className="py-3.5 pl-3 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredSummaries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                    No students found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredSummaries.map((s) => {
                  const studentObj = students.find((std) => std.id === s.studentId);
                  return (
                    <tr key={s.studentId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 pl-6 pr-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              s.gender === 'Female'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-sky-100 text-sky-700'
                            }`}
                          >
                            {s.name.charAt(0)}
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() => setDrilldownStudent(s)}
                              className="font-bold text-slate-900 hover:text-emerald-600 text-left cursor-pointer"
                            >
                              {s.name}
                            </button>
                            <span className="block text-xs font-mono text-slate-400">
                              {s.studentNumber}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded ${
                            s.gender === 'Female'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-sky-50 text-sky-700 border border-sky-200'
                          }`}
                        >
                          {s.gender}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-xs">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {s.presentCount}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md text-xs ${
                            s.absentCount > 0
                              ? 'text-rose-700 bg-rose-50'
                              : 'text-slate-500 bg-slate-50'
                          }`}
                        >
                          <XCircle className="w-3 h-3" />
                          {s.absentCount}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                s.attendanceRate >= 90
                                  ? 'bg-emerald-500'
                                  : s.attendanceRate >= 75
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${s.attendanceRate}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-700">
                            {s.attendanceRate}%
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 pl-3 pr-6 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setDrilldownStudent(s)}
                            title="View Student Attendance Record"
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <Clock className="w-4 h-4" />
                          </button>

                          {isPresident && studentObj && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(studentObj)}
                                title="Edit Student Info"
                                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => setStudentToDelete(studentObj)}
                                title="Remove from Roster"
                                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT STUDENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingStudent ? 'Edit Student Details' : 'Add New Student to Class'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Student ID / LRN Number
                </label>
                <input
                  type="text"
                  required
                  value={studentForm.studentNumber}
                  onChange={(e) => setStudentForm({ ...studentForm, studentNumber: e.target.value })}
                  placeholder="e.g. 2026-016"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                  placeholder="e.g. Sophia Castillo"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Gender
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs font-bold transition-all ${
                      studentForm.gender === 'Male'
                        ? 'bg-sky-50 border-sky-300 text-sky-800'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="gender"
                      value="Male"
                      checked={studentForm.gender === 'Male'}
                      onChange={() => setStudentForm({ ...studentForm, gender: 'Male' })}
                      className="sr-only"
                    />
                    <span>Male (Boy)</span>
                  </label>

                  <label
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs font-bold transition-all ${
                      studentForm.gender === 'Female'
                        ? 'bg-purple-50 border-purple-300 text-purple-800'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="gender"
                      value="Female"
                      checked={studentForm.gender === 'Female'}
                      onChange={() => setStudentForm({ ...studentForm, gender: 'Female' })}
                      className="sr-only"
                    />
                    <span>Female (Girl)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={studentForm.email}
                  onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                  placeholder="e.g. sophia@school.edu"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-xs font-bold ${theme.primaryBtn} rounded-xl`}
                >
                  {editingStudent ? 'Update Student' : 'Add to Roster'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STUDENT DRILLDOWN ATTENDANCE HISTORY MODAL */}
      {drilldownStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono font-bold text-slate-500">
                  {drilldownStudent.studentNumber}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {drilldownStudent.name}'s Attendance History
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDrilldownStudent(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-100/60 border-b border-slate-200 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block">Attendance Rate</span>
                <span className="text-base font-bold text-slate-900">
                  {drilldownStudent.attendanceRate}%
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-emerald-600 block">Present</span>
                <span className="text-base font-bold text-emerald-700">
                  {drilldownStudent.presentCount}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-rose-600 block">Absent</span>
                <span className="text-base font-bold text-rose-700">
                  {drilldownStudent.absentCount}
                </span>
              </div>
            </div>

            <div className="p-4 overflow-y-auto flex-1 divide-y divide-slate-100 space-y-1">
              {studentSessionHistory.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No attendance sessions on file yet.
                </div>
              ) : (
                studentSessionHistory.map((item, i) => (
                  <div key={i} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-slate-800">{item.date}</span>
                      <span className="text-slate-400 text-[11px] block">{item.sessionType}</span>
                      {item.remarks && (
                        <span className="text-[11px] text-slate-500 italic block">
                          Reason: {item.remarks}
                        </span>
                      )}
                    </div>

                    <div>
                      {item.status === 'present' ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          PRESENT
                        </span>
                      ) : item.status === 'absent' ? (
                        <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                          <XCircle className="w-3.5 h-3.5" />
                          ABSENT
                        </span>
                      ) : (
                        <span className="text-slate-400">Unrecorded</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setDrilldownStudent(null)}
                className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE STUDENT CONFIRMATION */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Remove Student from Roster?</h3>
            <p className="text-xs text-slate-600 mt-2">
              Are you sure you want to remove <strong>{studentToDelete.name}</strong> ({studentToDelete.studentNumber}) from the classroom roster?
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
