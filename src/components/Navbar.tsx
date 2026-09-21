import React from 'react';
import { User } from '../types';
import { useTheme } from '../ThemeContext';
import { ThemeSelector } from './ThemeSelector';
import {
  ClipboardCheck,
  History,
  Users,
  LogOut,
  Crown,
  User as UserIcon,
  ShieldCheck,
  School,
  ArrowRightLeft,
} from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  activeTab: 'rollcall' | 'history' | 'roster';
  onSelectTab: (tab: 'rollcall' | 'history' | 'roster') => void;
  onLogout: () => void;
  onSwitchRole: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  onSelectTab,
  onLogout,
  onSwitchRole,
}) => {
  const { theme } = useTheme();
  const isPresident = currentUser?.role === 'class_president';

  return (
    <header className={`sticky top-0 z-30 ${theme.headerBg} border-b ${theme.headerBorder} shadow-sm transition-colors duration-200`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Section Branding */}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${theme.brandIconBg} ${theme.brandIconText} flex items-center justify-center shadow-sm font-bold shrink-0`}>
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight">
                  Classroom Attendance
                </h1>
                <span className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${theme.accentBadgeBg} ${theme.accentBadgeText} border ${theme.accentBadgeBorder}`}>
                  <School className="w-3 h-3 mr-1" />
                  {currentUser?.gradeSection || 'Grade 10 - Diamond'}
                </span>
              </div>
              <p className="text-[11px] opacity-75 hidden sm:block">
                Official Daily Roll Call Management System
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          {currentUser && (
            <nav className="flex items-center bg-black/15 p-1 rounded-xl gap-1">
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
                {isPresident ? (
                  <span className="ml-1 w-2 h-2 rounded-full bg-amber-400 animate-pulse hidden sm:inline-block" />
                ) : (
                  <span className="ml-1 text-[10px] bg-white/20 text-current px-1.5 py-0.2 rounded font-medium">View</span>
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
                <span>Students</span>
              </button>
            </nav>
          )}

          {/* User Profile & Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Selector Button */}
            <ThemeSelector />

            {currentUser ? (
              <>
                {/* Role badge */}
                <div
                  className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
                    isPresident
                      ? `${theme.presidentBadgeBg} ${theme.presidentBadgeBorder} ${theme.presidentBadgeText}`
                      : 'bg-white/10 border-white/20 text-white'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isPresident ? 'bg-amber-400 text-slate-900' : 'bg-blue-500 text-white'
                    }`}
                  >
                    {isPresident ? <Crown className="w-3.5 h-3.5" /> : <UserIcon className="w-3.5 h-3.5" />}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-1 leading-none">
                      <span className="text-xs font-bold">
                        {currentUser.name}
                      </span>
                      {isPresident && (
                        <span title="Authorized Attendance Officer">
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-400 inline" />
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-medium opacity-80">
                      {isPresident ? 'Class President' : 'Student'}
                    </span>
                  </div>
                </div>

                {/* Quick switch role button for testing */}
                <button
                  id="btn-switch-role"
                  type="button"
                  onClick={onSwitchRole}
                  title={isPresident ? 'Switch to Student View' : 'Switch to Class President'}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-colors"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Switch Role</span>
                </button>

                {/* Logout button */}
                <button
                  id="btn-logout"
                  type="button"
                  onClick={onLogout}
                  className="p-2 opacity-80 hover:opacity-100 hover:bg-rose-500/20 hover:text-rose-300 rounded-lg transition-colors"
                  title="Log Out"
                >
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
};
