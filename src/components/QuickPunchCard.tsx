import React, { useState, useEffect } from 'react';
import {
  Clock,
  LogIn,
  LogOut,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Laptop,
  Building,
  Sparkles,
  ArrowRight,
  Edit2,
} from 'lucide-react';
import { AttendanceRecord, WorkLocation } from '../types';
import { formatTime12h } from '../storage';

interface QuickPunchCardProps {
  todayRecord: AttendanceRecord | null;
  onPunchIn: (location: WorkLocation, notes?: string) => void;
  onPunchOut: (recordId: string, notes?: string) => void;
  onOpenDetailedForm: () => void;
  onEditTodayRecord: (record: AttendanceRecord) => void;
}

export const QuickPunchCard: React.FC<QuickPunchCardProps> = ({
  todayRecord,
  onPunchIn,
  onPunchOut,
  onOpenDetailedForm,
  onEditTodayRecord,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [punchLocation, setPunchLocation] = useState<WorkLocation>('office');
  const [punchNotes, setPunchNotes] = useState('');
  const [elapsedString, setElapsedString] = useState('');

  // Live timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      // If currently checked in without punch out, calculate elapsed time
      if (todayRecord && todayRecord.timeIn && !todayRecord.timeOut) {
        const [inH, inM] = todayRecord.timeIn.split(':').map(Number);
        const inDate = new Date();
        inDate.setHours(inH, inM, 0, 0);

        const diffMs = Math.max(0, now.getTime() - inDate.getTime());
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

        setElapsedString(
          `${hours}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`
        );
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [todayRecord]);

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedClock = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const isCheckedIn = !!todayRecord;
  const isCheckedOut = !!(todayRecord && todayRecord.timeOut);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Clock & Date Context */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full w-fit">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
            </div>
            <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-slate-900">
              {formattedClock}
            </div>
            <p className="text-xs text-slate-500">
              Standard working hours: 09:00 AM – 06:00 PM (8.0 Hours)
            </p>
          </div>

          {/* Middle: Current Attendance Status */}
          <div className="flex-1 max-w-md bg-slate-50 border border-slate-200/80 rounded-xl p-4">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Today's Attendance Status
            </div>

            {!isCheckedIn && (
              <div>
                <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                  <span>Not checked in yet today</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Ready to start your shift? Punch in below or fill the attendance form.
                </p>
              </div>
            )}

            {isCheckedIn && !isCheckedOut && (
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Currently Checked In (Active)</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {elapsedString || 'In progress'}
                  </span>
                </div>
                <div className="text-xs text-slate-600 mt-1.5 flex items-center gap-3">
                  <span>
                    Time In: <strong>{formatTime12h(todayRecord.timeIn)}</strong>
                  </span>
                  <span>•</span>
                  <span className="capitalize">
                    Location: <strong>{todayRecord.workLocation}</strong>
                  </span>
                </div>
              </div>
            )}

            {isCheckedOut && (
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-700 font-semibold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                    <span>Attendance Complete For Today</span>
                  </div>
                  <button
                    onClick={() => onEditTodayRecord(todayRecord)}
                    className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit Log</span>
                  </button>
                </div>
                <div className="text-xs text-slate-600 mt-1.5 flex flex-wrap items-center gap-2 sm:gap-3">
                  <span>
                    In: <strong>{formatTime12h(todayRecord.timeIn)}</strong>
                  </span>
                  <span>→</span>
                  <span>
                    Out: <strong>{formatTime12h(todayRecord.timeOut)}</strong>
                  </span>
                  <span>•</span>
                  <span className="text-emerald-700 font-semibold">
                    Total: {todayRecord.totalHours} hrs
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right: Quick Action Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            {!isCheckedIn && (
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                {/* Location select */}
                <select
                  id="punch-location-select"
                  value={punchLocation}
                  onChange={(e) => setPunchLocation(e.target.value as WorkLocation)}
                  className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="office">🏢 Office (HQ)</option>
                  <option value="remote">💻 Remote (WFH)</option>
                  <option value="client">🤝 Client Site</option>
                  <option value="field">📍 Field Work</option>
                </select>

                <button
                  id="btn-punch-in"
                  type="button"
                  onClick={() => onPunchIn(punchLocation, punchNotes)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Punch In Attendance</span>
                </button>
              </div>
            )}

            {isCheckedIn && !isCheckedOut && (
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <button
                  id="btn-punch-out"
                  type="button"
                  onClick={() => onPunchOut(todayRecord.id, 'Shift concluded.')}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-semibold text-sm rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Punch Out (Clock Out)</span>
                </button>
              </div>
            )}

            {/* Manual Form Trigger */}
            <button
              id="btn-detailed-attendance-form"
              type="button"
              onClick={onOpenDetailedForm}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer border border-slate-200"
            >
              <span>Custom / Manual Entry</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
