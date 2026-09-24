import React, { useState } from 'react';
import { UserRole } from '../types';
import { loginUser, createStudentViewerSession } from '../storage';
import { useTheme } from '../ThemeContext';
import {
  GraduationCap,
  Crown,
  Eye,
  KeyRound,
  ArrowRight,
  ShieldCheck,
  School,
  Sparkles,
} from 'lucide-react';

interface AuthViewProps {
  onSuccess: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccess }) => {
  const { theme } = useTheme();

  // Selected entry flow: null (front page cards) | 'teacher' | 'president'
  const [selectedRole, setSelectedRole] = useState<'teacher' | 'president' | null>(null);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Student 1-click public view (No password needed!)
  const handleStudentDirectAccess = () => {
    createStudentViewerSession();
    onSuccess();
  };

  const handleOpenLogin = (role: 'teacher' | 'president') => {
    setSelectedRole(role);
    setError(null);
    if (role === 'teacher') {
      setIdentifier('adviser.santos');
      setPassword('password');
    } else {
      setIdentifier('president.santos');
      setPassword('password');
    }
  };

  const handleSubmitLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const res = loginUser(identifier, password);
    setIsLoading(false);

    if (res.success) {
      onSuccess();
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-[78vh] flex items-center justify-center py-6 px-4">
      <div className="w-full max-w-2xl">
        {/* School Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-red-800 text-yellow-300 shadow-md border-2 border-yellow-400/40 mb-3">
            <School className="w-9 h-9" />
          </div>
          <span className="block text-xs font-black tracking-widest text-red-700 uppercase mb-1">
            Official Classroom Attendance
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Sto. Niño Mactan Montessori School
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-md mx-auto">
            Authorized Class President Roll Call & Adviser Admin System
          </p>
        </div>

        {/* 3 FRONT PAGE CARDS: TEACHER | PRESIDENT | STUDENT */}
        {!selectedRole ? (
          <div className="space-y-4">
            <div className="text-center mb-5">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
                Are you a Teacher, President, or Student?
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 1. TEACHER / ADVISER */}
              <button
                id="btn-role-teacher"
                type="button"
                onClick={() => handleOpenLogin('teacher')}
                className="group p-5 rounded-2xl border-2 border-amber-200/90 bg-white hover:border-red-600 hover:shadow-md transition-all text-left flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-red-800 text-yellow-300 flex items-center justify-center mb-3 shadow-xs group-hover:scale-105 transition-transform">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-stone-900 group-hover:text-red-700 transition-colors">
                    Teacher / Adviser
                  </h3>
                  <span className="inline-block text-[10px] font-bold text-red-800 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md mt-1">
                    Master Admin
                  </span>
                  <p className="text-xs text-stone-600 mt-2.5 leading-relaxed">
                    Set Grade & Section, manage student & officer list, view notifications & export records.
                  </p>
                </div>
                <div className="pt-4 mt-2 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-red-700">
                  <span>Sign In as Adviser</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* 2. CLASS PRESIDENT */}
              <button
                id="btn-role-president"
                type="button"
                onClick={() => handleOpenLogin('president')}
                className="group p-5 rounded-2xl border-2 border-yellow-300 bg-yellow-50/40 hover:border-amber-500 hover:shadow-md transition-all text-left flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center mb-3 shadow-xs group-hover:scale-105 transition-transform font-bold">
                    <Crown className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-stone-900 group-hover:text-amber-700 transition-colors">
                    Class President
                  </h3>
                  <span className="inline-block text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md mt-1">
                    Attendance Encoder
                  </span>
                  <p className="text-xs text-stone-600 mt-2.5 leading-relaxed">
                    Only the President marks Present, Absent, Late, or Half Day. Submissions alert Adviser immediately.
                  </p>
                </div>
                <div className="pt-4 mt-2 border-t border-amber-200/60 flex items-center justify-between text-xs font-bold text-amber-900">
                  <span>Sign In as President</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* 3. STUDENT (NO LOGIN NEEDED) */}
              <button
                id="btn-role-student"
                type="button"
                onClick={handleStudentDirectAccess}
                className="group p-5 rounded-2xl border-2 border-stone-200 bg-stone-50/70 hover:border-stone-400 hover:bg-white hover:shadow-md transition-all text-left flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-stone-800 text-white flex items-center justify-center mb-3 shadow-xs group-hover:scale-105 transition-transform">
                    <Eye className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-stone-900">
                    Student
                  </h3>
                  <span className="inline-block text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md mt-1">
                    No Login Needed
                  </span>
                  <p className="text-xs text-stone-600 mt-2.5 leading-relaxed">
                    Check "Who is absent today?" and live classroom attendance records. View-only mode for students.
                  </p>
                </div>
                <div className="pt-4 mt-2 border-t border-stone-200 flex items-center justify-between text-xs font-bold text-stone-700">
                  <span>Open Student View</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>

            <div className="mt-4 p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-stone-700 text-center flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <strong>Anti-Cheating Architecture:</strong> Single-encoder system prevents unauthorized self-marking.
              </span>
            </div>
          </div>
        ) : (
          /* LOGIN DIALOG FOR TEACHER OR PRESIDENT */
          <div className="bg-white rounded-2xl border-2 border-amber-200/90 shadow-md p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-5">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    selectedRole === 'teacher'
                      ? 'bg-red-800 text-yellow-300'
                      : 'bg-amber-500 text-stone-950'
                  }`}
                >
                  {selectedRole === 'teacher' ? (
                    <GraduationCap className="w-5 h-5" />
                  ) : (
                    <Crown className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">
                    {selectedRole === 'teacher' ? 'Teacher / Adviser Login' : 'Class President Login'}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {selectedRole === 'teacher'
                      ? 'Master admin account to manage roster & verify attendance'
                      : 'Official encoder account to take roll call'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRole(null)}
                className="text-xs font-semibold text-stone-500 hover:text-stone-800 px-2.5 py-1 rounded-lg hover:bg-stone-100 transition-colors"
              >
                ← Back
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmitLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Username or ID
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={selectedRole === 'teacher' ? 'adviser.santos' : 'president.santos'}
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:bg-white focus:ring-2 focus:ring-red-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:bg-white focus:ring-2 focus:ring-red-600 focus:outline-hidden"
                />
              </div>

              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-600 flex items-center justify-between">
                <span>Default credentials:</span>
                <span className="font-mono font-bold text-stone-800">
                  {selectedRole === 'teacher' ? 'adviser.santos / password' : 'president.santos / password'}
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-red-700 hover:bg-red-800 text-yellow-200 text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
