import React from 'react';
import { User, AdviserNotification } from '../types';
import { useTheme } from '../ThemeContext';
import { ThemeSelector } from './ThemeSelector';
import {
  ClipboardCheck,
  History,
  Users,
  LogOut,
  Crown,
  GraduationCap,
  Eye,
  Bell,
  School,
  ArrowRightLeft,
} from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  gradeSection: string;
  activeTab: 'rollcall' | 'history' | 'roster';
  notifications: AdviserNotification[];
  onSelectTab: (tab: 'rollcall' | 'history' | 'roster') => void;
  onLogout: () => void;
  onSwitchRole: () => void;
  onOpenNotifications?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  gradeSection,
  activeTab,
  notifications,
  onSelectTab,
  onLogout,
  onSwitchRole,
  onOpenNotifications,
}) => {
  const { theme } = useTheme();
  const isTeacher = currentUser?.role === 'teacher';
  const isPresident = currentUser?.role === 'class_president';
  const isStudent = currentUser?.role === 'student';

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className={`sticky top-0 z-30 ${theme.headerBg} border-b ${theme.headerBorder} shadow-sm transition-colors duration-200`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* UPPER-LEFT: SCHOOL + GRADE & SECTION */}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${theme.brandIconBg} ${theme.brandIconText} flex items-center justify-center shadow-xs font-bold shrink-0 border border-yellow-300`}>
              <School className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-yellow-300 tracking-wide uppercase">
                  Sto. Niño Mactan Montessori School
                </span>
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                  {gradeSection || 'Grade 10 - St. Francis'}
                </h1>
                <span className="text-[10px] uppercase font-bold bg-yellow-400/20 text-yellow-300 px-2 py-0.2 rounded border border-yellow-400/40 hidden sm:inline-block">
                  Classroom Attendance
                </span>
              </div>
            </div>
          </div>

          {/* NAVIGATION TABS (Roll Call, History, Student Roster) */}
          {currentUser && (
            <nav className="hidden md:flex items-center bg-black/20 p-1 rounded-xl gap-1">
              <button
                id="tab-rollcall"
                type="button"
                onClick={() => onSelectTab('rollcall')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'rollcall'
                    ? theme.navActiveBg
                    : theme.navInactiveText
                }`}
              >
                <ClipboardCheck className="w-4 h-4" />
                <span>Roll Call</span>
                {isPresident && (
                  <span className="ml-1 text-[10px] bg-amber-400 text-stone-950 font-bold px-1.5 py-0.2 rounded">
                    Encoder
                  </span>
                )}
              </button>

              <button
                id="tab-history"
                type="button"
                onClick={() => onSelectTab('history')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'history'
                    ? theme.navActiveBg
                    : theme.navInactiveText
                }`}
              >
                <History className="w-4 h-4" />
                <span>History</span>
              </button>

              <button
                id="tab-roster"
                type="button"
                onClick={() => onSelectTab('roster')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'roster'
                    ? theme.navActiveBg
                    : theme.navInactiveText
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Students & Officers</span>
                {isTeacher && (
                  <span className="ml-1 text-[10px] bg-yellow-400 text-stone-950 font-bold px-1.5 py-0.2 rounded">
                    Manage
                  </span>
                )}
              </button>
            </nav>
          )}

          {/* UPPER-RIGHT: USER IDENTIFIER (Adviser, President, or Student #random) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Adviser Notifications Bell */}
            {isTeacher && (
              <button
                id="btn-adviser-notifs"
                type="button"
                onClick={onOpenNotifications}
                className="relative p-2 rounded-xl bg-white/10 hover:bg-white/20 text-yellow-300 transition-colors"
                title="Adviser Notifications"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 text-red-950 font-bold text-[10px] rounded-full flex items-center justify-center animate-bounce shadow-xs">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* Theme Selector */}
            <ThemeSelector />

            {currentUser && (
              <>
                {/* User indicator: Adviser, President, or Student #number */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-black/25 border-white/20 text-white">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isTeacher
                        ? 'bg-yellow-400 text-red-950'
                        : isPresident
                        ? 'bg-amber-400 text-stone-950'
                        : 'bg-stone-200 text-stone-900'
                    }`}
                  >
                    {isTeacher ? (
                      <GraduationCap className="w-3.5 h-3.5" />
                    ) : isPresident ? (
                      <Crown className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold leading-tight">
                      {isTeacher && `Adviser: ${currentUser.name}`}
                      {isPresident && `President: ${currentUser.name}`}
                      {isStudent && `${currentUser.name} (View-Only)`}
                    </div>
                    <div className="text-[10px] text-yellow-200/80">
                      {isTeacher && 'Master Admin'}
                      {isPresident && 'Authorized Encoder'}
                      {isStudent && 'Public Live Display'}
                    </div>
                  </div>
                </div>

                {/* Role switcher button */}
                <button
                  id="btn-switch-role"
                  type="button"
                  onClick={onSwitchRole}
                  title="Switch Role"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 text-white transition-colors"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Switch</span>
                </button>

                {/* Log Out / Exit View */}
                <button
                  id="btn-logout"
                  type="button"
                  onClick={onLogout}
                  className="p-2 opacity-80 hover:opacity-100 hover:bg-rose-500/20 hover:text-rose-200 rounded-xl transition-colors text-white"
                  title={isStudent ? 'Exit Student View' : 'Sign Out'}
                >
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        {currentUser && (
          <div className="md:hidden flex items-center justify-around py-2 border-t border-white/10">
            <button
              type="button"
              onClick={() => onSelectTab('rollcall')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold ${
                activeTab === 'rollcall' ? theme.navActiveBg : theme.navInactiveText
              }`}
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>Roll Call</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('history')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold ${
                activeTab === 'history' ? theme.navActiveBg : theme.navInactiveText
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>History</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('roster')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold ${
                activeTab === 'roster' ? theme.navActiveBg : theme.navInactiveText
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Students</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
