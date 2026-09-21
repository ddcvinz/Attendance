import React, { useState, useEffect } from 'react';
import { LogOut, User as UserIcon, Clock, CalendarCheck, Settings, ShieldCheck } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  user: User;
  onLogout: () => void;
  onOpenProfile: () => void;
  onOpenLogModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  onOpenProfile,
  onOpenLogModal,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
              <CalendarCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 block leading-tight">
                Attendance Tracker
              </span>
              <span className="text-xs text-slate-500 font-medium hidden sm:inline-block">
                Employee Attendance & Record Management
              </span>
            </div>
          </div>

          {/* Center: Live Time Clock Badge */}
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-100/80 border border-slate-200 text-slate-700 text-xs font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Local Time:</span>
            <span className="font-semibold text-slate-900 font-mono tracking-wide">{currentTime}</span>
          </div>

          {/* Right: User profile pill & controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Log Button */}
            <button
              id="nav-quick-log-btn"
              onClick={onOpenLogModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4 text-emerald-400" />
              <span>Log Attendance</span>
            </button>

            {/* Profile Dropdown / Trigger */}
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
              <button
                id="nav-profile-settings-btn"
                onClick={onOpenProfile}
                title="Account Settings & Profile"
                className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-lg hover:bg-slate-100 transition-colors text-left text-slate-700 cursor-pointer"
              >
                <div
                  className={`w-8 h-8 rounded-full ${user.avatarColor || 'bg-slate-800'} text-white flex items-center justify-center text-xs font-bold shadow-xs`}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:block text-left leading-tight">
                  <div className="text-xs font-semibold text-slate-900 truncate max-w-[130px]">
                    {user.name}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate max-w-[130px]">
                    {user.employeeId}
                  </div>
                </div>
                <Settings className="w-4 h-4 text-slate-400 hidden sm:block" />
              </button>

              {/* Logout Button */}
              <button
                id="nav-logout-btn"
                onClick={onLogout}
                title="Log Out"
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span className="sr-only">Log Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
