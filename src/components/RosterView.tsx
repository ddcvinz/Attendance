import React, { useState, useMemo } from 'react';
import { Student, User, ClassAttendanceSession, StudentAttendanceSummary } from '../types';
import { useTheme } from '../ThemeContext';
import {
  computeStudentSummaries,
  addStudent,
  updateStudent,
  deleteStudent,
  getClassroomConfig,
  saveClassroomConfig,
  resetPresidentPassword,
} from '../storage';
import {
  Users,
  UserPlus,
  Search,
  Edit,
  Trash2,
  Crown,
  X,
  GraduationCap,
  Save,
  KeyRound,
  CheckCircle2,
  ShieldAlert,
  School,
} from 'lucide-react';

interface RosterViewProps {
  currentUser: User;
  students: Student[];
  sessions: ClassAttendanceSession[];
  onRosterChanged: () => void;
  onConfigChanged?: () => void;
}

export const RosterView: React.FC<RosterViewProps> = ({
  currentUser,
  students,
  sessions,
  onRosterChanged,
  onConfigChanged,
}) => {
  const { theme } = useTheme();
  const isTeacher = currentUser.role === 'teacher';

  // Classroom Config state (Grade & Section)
  const currentConfig = getClassroomConfig();
  const [gradeSectionInput, setGradeSectionInput] = useState(currentConfig.gradeSection);
  const [adviserNameInput, setAdviserNameInput] = useState(currentConfig.adviserName);
  const [configSavedNotice, setConfigSavedNotice] = useState(false);

  // Search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'Male' | 'Female'>('all');

  // Add / Edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentForm, setStudentForm] = useState({
    studentNumber: '',
    name: '',
    gender: 'Male' as 'Male' | 'Female',
    officerRole: '',
  });

  // Reset President Password Modal (Adviser feature)
  const [isResetPwdModalOpen, setIsResetPwdModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('password123');
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  // Delete confirmation
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Summaries
  const summaries = useMemo(
    () => computeStudentSummaries(students, sessions),
    [students, sessions]
  );

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchQuery =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.officerRole && s.officerRole.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchGender = genderFilter === 'all' || s.gender === genderFilter;
      return matchQuery && matchGender;
    });
  }, [students, searchQuery, genderFilter]);

  // Handle Save Grade & Section config
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isTeacher) return;
    saveClassroomConfig({
      ...currentConfig,
      gradeSection: gradeSectionInput.trim(),
      adviserName: adviserNameInput.trim(),
    });
    setConfigSavedNotice(true);
    if (onConfigChanged) onConfigChanged();
    onRosterChanged();
    setTimeout(() => setConfigSavedNotice(false), 3000);
  };

  const handleOpenAdd = () => {
    setEditingStudent(null);
    const nextNum = String(students.length + 1).padStart(3, '0');
    setStudentForm({
      studentNumber: `2026-${nextNum}`,
      name: '',
      gender: 'Male',
      officerRole: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setStudentForm({
      studentNumber: student.studentNumber,
      name: student.name,
      gender: student.gender,
      officerRole: student.officerRole || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isTeacher) return;

    if (!studentForm.name.trim()) return;

    if (editingStudent) {
      updateStudent(editingStudent.id, {
        studentNumber: studentForm.studentNumber.trim(),
        name: studentForm.name.trim(),
        gender: studentForm.gender,
        officerRole: studentForm.officerRole.trim() || undefined,
      });
    } else {
      addStudent({
        studentNumber: studentForm.studentNumber.trim(),
        name: studentForm.name.trim(),
        gender: studentForm.gender,
        officerRole: studentForm.officerRole.trim() || undefined,
        gradeSection: gradeSectionInput,
      });
    }

    setIsModalOpen(false);
    onRosterChanged();
  };

  const handleDeleteStudent = () => {
    if (!isTeacher || !studentToDelete) return;
    deleteStudent(studentToDelete.id);
    setStudentToDelete(null);
    onRosterChanged();
  };

  const handleResetPresidentPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isTeacher) return;
    const res = resetPresidentPassword(newPassword);
    setResetSuccess(res.message);
    setTimeout(() => {
      setResetSuccess(null);
      setIsResetPwdModalOpen(false);
    }, 2500);
  };

  return (
    <div className="space-y-6">
      {/* 1. ADVISER SETUP: GRADE & SECTION (Prompt requirement: "kung ang adviser mo sign in siya mag input sa grade and section followed by the list of students and officers") */}
      {isTeacher && (
        <div className="bg-white rounded-2xl border-2 border-amber-200/90 p-5 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-800 flex items-center justify-center">
              <School className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-stone-900">
                Adviser Classroom Setup
              </h2>
              <p className="text-xs text-stone-500">
                Configure your Grade & Section and classroom details. Changes reflect across all screens immediately.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveConfig} className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Grade & Section
              </label>
              <input
                type="text"
                required
                value={gradeSectionInput}
                onChange={(e) => setGradeSectionInput(e.target.value)}
                placeholder="e.g. Grade 10 - St. Francis"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:bg-white focus:ring-2 focus:ring-red-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Adviser Full Name
              </label>
              <input
                type="text"
                required
                value={adviserNameInput}
                onChange={(e) => setAdviserNameInput(e.target.value)}
                placeholder="e.g. Mrs. Maria Santos"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:bg-white focus:ring-2 focus:ring-red-600 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="w-full py-2 px-4 bg-red-700 hover:bg-red-800 text-yellow-200 text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Save Grade & Section</span>
              </button>

              <button
                type="button"
                onClick={() => setIsResetPwdModalOpen(true)}
                title="Reset Class President password"
                className="py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl border border-stone-300 transition-colors flex items-center gap-1 shrink-0"
              >
                <KeyRound className="w-3.5 h-3.5 text-stone-600" />
                <span className="hidden sm:inline">Reset Pres. Pwd</span>
              </button>
            </div>
          </form>

          {configSavedNotice && (
            <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Grade & Section updated successfully!</span>
            </div>
          )}
        </div>
      )}

      {/* 2. LIST OF STUDENTS AND OFFICERS */}
      <div className={`${theme.cardBg} rounded-2xl border-2 ${theme.cardBorder} p-5 ${theme.cardShadow} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-stone-900">
              Classroom Roster & Officers
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-yellow-100 text-yellow-900 border border-yellow-300">
              {students.length} Students
            </span>
          </div>
          <p className="text-xs text-stone-600 mt-0.5">
            Official class master list with student officer designations for <strong>{gradeSectionInput}</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <input
              type="text"
              placeholder="Search student or officer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-stone-300 rounded-xl text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-red-600"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
          </div>

          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value as any)}
            className="px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-xl text-stone-700 font-semibold"
          >
            <option value="all">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          {isTeacher && (
            <button
              id="btn-add-student"
              type="button"
              onClick={handleOpenAdd}
              className="px-3.5 py-1.5 bg-red-700 hover:bg-red-800 text-yellow-200 text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Student / Officer</span>
            </button>
          )}
        </div>
      </div>

      {/* Roster Cards / Table */}
      <div className="bg-white rounded-2xl border-2 border-amber-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-black uppercase tracking-wider text-stone-500">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Student Full Name</th>
                <th className="py-3 px-4">Officer Designation</th>
                <th className="py-3 px-4">Gender</th>
                <th className="py-3 px-4">Student ID</th>
                <th className="py-3 px-4 text-center">Attendance Track</th>
                {isTeacher && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs text-stone-800">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-stone-500">
                    No students in roster. Click "+ Add Student / Officer" above to add.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => {
                  const summary = summaries.find((s) => s.studentId === student.id);
                  const rate = summary ? summary.attendanceRate : 100;

                  return (
                    <tr key={student.id} className="hover:bg-stone-50 transition-colors">
                      <td className="py-3 px-4 text-center font-mono font-bold text-stone-400">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 font-bold text-stone-900">
                        {student.name}
                      </td>
                      <td className="py-3 px-4">
                        {student.officerRole ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md">
                            <Crown className="w-3 h-3 text-amber-600" />
                            <span>{student.officerRole}</span>
                          </span>
                        ) : (
                          <span className="text-stone-400 text-[11px] italic">Student</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium text-stone-600">
                        {student.gender}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-stone-500">
                        {student.studentNumber}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-black ${
                            rate >= 90
                              ? 'bg-emerald-100 text-emerald-900'
                              : rate >= 75
                              ? 'bg-yellow-100 text-yellow-900'
                              : 'bg-red-100 text-red-900'
                          }`}
                        >
                          {rate}%
                        </span>
                      </td>
                      {isTeacher && (
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(student)}
                              className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
                              title="Edit Student"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setStudentToDelete(student)}
                              className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Student"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT STUDENT MODAL (ADVISER ONLY) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <h3 className="text-base font-extrabold text-stone-900">
                {editingStudent ? 'Edit Student & Role' : 'Add Student to Roster'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                  placeholder="e.g. Tom Martorillas"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Officer Designation (If Officer)
                </label>
                <input
                  type="text"
                  value={studentForm.officerRole}
                  onChange={(e) => setStudentForm({ ...studentForm, officerRole: e.target.value })}
                  placeholder="e.g. President, Vice President, Secretary, Treasurer, etc."
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-600 focus:outline-hidden"
                />
                <span className="text-[10px] text-stone-500 mt-0.5 block">
                  Leave empty if regular student.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Gender
                  </label>
                  <select
                    value={studentForm.gender}
                    onChange={(e) =>
                      setStudentForm({ ...studentForm, gender: e.target.value as any })
                    }
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-xl"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Student ID
                  </label>
                  <input
                    type="text"
                    required
                    value={studentForm.studentNumber}
                    onChange={(e) =>
                      setStudentForm({ ...studentForm, studentNumber: e.target.value })
                    }
                    placeholder="2026-001"
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-red-700 hover:bg-red-800 text-yellow-200 rounded-xl shadow-xs"
                >
                  {editingStudent ? 'Save Changes' : 'Add to Roster'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PRESIDENT PASSWORD MODAL (ADVISER ONLY) */}
      {isResetPwdModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl border border-stone-200">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100 mb-4">
              <KeyRound className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-extrabold text-stone-900">
                Reset President Password
              </h3>
            </div>
            <p className="text-xs text-stone-600 mb-4 leading-relaxed">
              As Teacher Adviser, you can reset the login password for the Class President encoder account (<code className="font-bold">president.santos</code>).
            </p>

            {resetSuccess && (
              <div className="mb-4 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                {resetSuccess}
              </div>
            )}

            <form onSubmit={handleResetPresidentPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  New Password
                </label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsResetPwdModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-red-700 hover:bg-red-800 text-yellow-200 rounded-xl"
                >
                  Confirm Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl border border-stone-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-extrabold text-stone-900">Remove Student?</h4>
            <p className="text-xs text-stone-600 mt-1">
              Are you sure you want to remove <strong>{studentToDelete.name}</strong> from the class roster?
            </p>
            <div className="mt-5 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteStudent}
                className="px-5 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs"
              >
                Delete Student
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
