import React, { useState } from 'react';
import { UserRole } from '../types';
import { loginUser, registerUser, DEFAULT_SECTION } from '../storage';
import { useTheme } from '../ThemeContext';
import {
  ClipboardCheck,
  Crown,
  User as UserIcon,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  School,
  Sparkles,
  Info,
} from 'lucide-react';

interface AuthViewProps {
  onSuccess: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccess }) => {
  const { theme } = useTheme();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Login inputs
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register inputs
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regStudentId, setRegStudentId] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('class_president');
  const [regGradeSection, setRegGradeSection] = useState(DEFAULT_SECTION);
  const [regPassword, setRegPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const res = loginUser(loginIdentifier, loginPassword);
    if (res.success) {
      onSuccess();
    } else {
      setError(res.message);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const res = registerUser({
      name: regName,
      email: regEmail,
      studentId: regStudentId,
      role: regRole,
      gradeSection: regGradeSection,
      password: regPassword,
    });

    if (res.success) {
      setSuccessMsg(res.message);
      setIsLogin(true);
      setLoginIdentifier(regEmail);
      setLoginPassword('');
    } else {
      setError(res.message);
    }
  };

  const handleQuickDemo = (role: 'president' | 'student') => {
    if (role === 'president') {
      const res = loginUser('jovinanunciado@gmail.com', 'password123');
      if (res.success) onSuccess();
    } else {
      const res = loginUser('liam@school.edu', 'student123');
      if (res.success) onSuccess();
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* App Logo & Header */}
        <div className="text-center mb-6">
          <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${theme.brandIconBg} ${theme.brandIconText} shadow-md mb-3`}>
            <ClipboardCheck className="w-8 h-8" />
          </div>
          <h1 className={`text-2xl font-bold ${theme.textPrimary} tracking-tight`}>
            Classroom Attendance
          </h1>
          <p className={`text-xs ${theme.textMuted} mt-1 max-w-xs mx-auto`}>
            Authorized Class President Roll Call & Student Attendance Management
          </p>
        </div>

        {/* Demo Quick Sign-in Pills */}
        <div className={`${theme.cardBg} rounded-2xl border ${theme.cardBorder} p-4 ${theme.cardShadow} mb-4`}>
          <span className={`text-[11px] font-bold ${theme.textMuted} uppercase tracking-wider block mb-2`}>
            1-Click Demo Profiles
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              id="quick-login-president"
              type="button"
              onClick={() => handleQuickDemo('president')}
              className="p-2.5 rounded-xl border border-amber-300 bg-amber-50/70 hover:bg-amber-100 text-left transition-colors flex items-center gap-2.5"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
                <Crown className="w-4 h-4" />
              </div>
              <div className="truncate">
                <span className="text-xs font-bold text-amber-950 block truncate">
                  Class President
                </span>
                <span className="text-[10px] text-amber-700 block truncate">
                  Full Roll Call Access
                </span>
              </div>
            </button>

            <button
              id="quick-login-student"
              type="button"
              onClick={() => handleQuickDemo('student')}
              className="p-2.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-left transition-colors flex items-center gap-2.5"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                <UserIcon className="w-4 h-4" />
              </div>
              <div className="truncate">
                <span className="text-xs font-bold text-blue-950 block truncate">
                  Regular Student
                </span>
                <span className="text-[10px] text-blue-700 block truncate">
                  View-Only Access
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Main Card */}
        <div className={`${theme.cardBg} rounded-2xl border ${theme.cardBorder} ${theme.cardShadow} p-6 sm:p-8`}>
          {/* Tab Switcher */}
          <div className="flex bg-black/5 p-1 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                isLogin ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                !isLogin ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Register Account
            </button>
          </div>

          {/* Feedback message */}
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-700">
              {successMsg}
            </div>
          )}

          {isLogin ? (
            /* LOGIN FORM */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className={`block text-xs font-bold ${theme.textSecondary} uppercase mb-1.5`}>
                  Email or Student / President ID
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="login-id"
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="e.g. jovinanunciado@gmail.com or PRES-2026-01"
                    className={`w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 ${theme.ringColor} focus:outline-hidden`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold ${theme.textSecondary} uppercase mb-1.5`}>
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="login-password"
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 ${theme.ringColor} focus:outline-hidden`}
                  />
                </div>
              </div>

              <button
                id="btn-submit-login"
                type="submit"
                className={`w-full py-2.5 ${theme.primaryBtn} text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 mt-2`}
              >
                <span>Sign In to Classroom</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Jovin Anunciado"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="you@school.edu"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    ID Number
                  </label>
                  <input
                    type="text"
                    required
                    value={regStudentId}
                    onChange={(e) => setRegStudentId(e.target.value)}
                    placeholder="PRES-2026-01"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Select Classroom Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label
                    className={`flex flex-col items-center text-center p-3 rounded-xl border cursor-pointer transition-all ${
                      regRole === 'class_president'
                        ? 'bg-amber-50 border-amber-500 text-amber-950 ring-1 ring-amber-500'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="class_president"
                      checked={regRole === 'class_president'}
                      onChange={() => setRegRole('class_president')}
                      className="sr-only"
                    />
                    <Crown className="w-5 h-5 text-amber-500 mb-1" />
                    <span className="text-xs font-bold">Class President</span>
                    <span className="text-[10px] text-amber-700 mt-0.5">
                      Can take attendance
                    </span>
                  </label>

                  <label
                    className={`flex flex-col items-center text-center p-3 rounded-xl border cursor-pointer transition-all ${
                      regRole === 'student'
                        ? 'bg-blue-50 border-blue-500 text-blue-950 ring-1 ring-blue-500'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="student"
                      checked={regRole === 'student'}
                      onChange={() => setRegRole('student')}
                      className="sr-only"
                    />
                    <UserIcon className="w-5 h-5 text-blue-600 mb-1" />
                    <span className="text-xs font-bold">Student</span>
                    <span className="text-[10px] text-blue-700 mt-0.5">
                      View attendance
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Section / Class
                </label>
                <input
                  type="text"
                  required
                  value={regGradeSection}
                  onChange={(e) => setRegGradeSection(e.target.value)}
                  placeholder="Grade 10 - Diamond"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Create password"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                className={`w-full py-2.5 ${theme.primaryBtn} text-sm font-bold rounded-xl shadow-xs transition-colors mt-2`}
              >
                Create Account
              </button>
            </form>
          )}
        </div>

        {/* Offline & Privacy Footer note */}
        <div className="mt-4 text-center">
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Runs 100% offline with local browser storage</span>
          </p>
        </div>
      </div>
    </div>
  );
};
