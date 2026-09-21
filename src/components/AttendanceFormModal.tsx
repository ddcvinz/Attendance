import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  FileText,
  CheckCircle2,
  AlertCircle,
  Building,
  Laptop,
  Briefcase,
  Layers,
} from 'lucide-react';
import {
  AttendanceFormData,
  AttendanceRecord,
  AttendanceStatus,
  ShiftType,
  WorkLocation,
} from '../types';
import { calculateHours, getCurrentTimeString, getTodayDateString } from '../storage';

interface AttendanceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AttendanceFormData) => void;
  editingRecord?: AttendanceRecord | null;
}

export const AttendanceFormModal: React.FC<AttendanceFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingRecord,
}) => {
  const [date, setDate] = useState(getTodayDateString());
  const [timeIn, setTimeIn] = useState('09:00');
  const [timeOut, setTimeOut] = useState('');
  const [status, setStatus] = useState<AttendanceStatus>('present');
  const [workLocation, setWorkLocation] = useState<WorkLocation>('office');
  const [shift, setShift] = useState<ShiftType>('morning');
  const [notes, setNotes] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync state when modal opens or editingRecord changes
  useEffect(() => {
    if (editingRecord) {
      setDate(editingRecord.date);
      setTimeIn(editingRecord.timeIn);
      setTimeOut(editingRecord.timeOut || '');
      setStatus(editingRecord.status);
      setWorkLocation(editingRecord.workLocation);
      setShift(editingRecord.shift);
      setNotes(editingRecord.notes || '');
    } else {
      setDate(getTodayDateString());
      setTimeIn(getCurrentTimeString());
      setTimeOut('');
      setStatus('present');
      setWorkLocation('office');
      setShift('morning');
      setNotes('');
    }
    setValidationError(null);
  }, [editingRecord, isOpen]);

  if (!isOpen) return null;

  const calculatedHours = calculateHours(timeIn, timeOut || null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!date) {
      setValidationError('Please select an attendance date.');
      return;
    }
    if (!timeIn) {
      setValidationError('Please specify a Time In.');
      return;
    }

    if (timeOut) {
      const [inH, inM] = timeIn.split(':').map(Number);
      const [outH, outM] = timeOut.split(':').map(Number);
      const startMinutes = inH * 60 + inM;
      const endMinutes = outH * 60 + outM;

      if (endMinutes <= startMinutes) {
        setValidationError('Time Out should be later than Time In.');
        return;
      }
    }

    onSubmit({
      date,
      timeIn,
      timeOut,
      status,
      workLocation,
      shift,
      notes,
    });
  };

  const handleSetCurrentTimeIn = () => {
    setTimeIn(getCurrentTimeString());
  };

  const handleSetCurrentTimeOut = () => {
    setTimeOut(getCurrentTimeString());
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div
        id="attendance-form-modal"
        className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {editingRecord ? 'Update Attendance Record' : 'Log Attendance Form'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {editingRecord
                ? 'Modify date, timestamps, or notes for this record.'
                : 'Fill details below to log your daily attendance check-in.'}
            </p>
          </div>
          <button
            id="close-attendance-modal-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {validationError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Date Picker */}
          <div>
            <label
              htmlFor="att-date"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Attendance Date *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                id="att-date"
                type="date"
                required
                value={date}
                max={getTodayDateString()}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Time In and Time Out */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="att-time-in"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Time In (Check-in) *
                </label>
                <button
                  type="button"
                  onClick={handleSetCurrentTimeIn}
                  className="text-[11px] text-emerald-700 hover:text-emerald-800 font-medium cursor-pointer underline"
                >
                  Now
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Clock className="w-4 h-4 text-emerald-600" />
                </div>
                <input
                  id="att-time-in"
                  type="time"
                  required
                  value={timeIn}
                  onChange={(e) => setTimeIn(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="att-time-out"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Time Out (Check-out)
                </label>
                <button
                  type="button"
                  onClick={handleSetCurrentTimeOut}
                  className="text-[11px] text-slate-600 hover:text-slate-800 font-medium cursor-pointer underline"
                >
                  Now
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <input
                  id="att-time-out"
                  type="time"
                  value={timeOut}
                  onChange={(e) => setTimeOut(e.target.value)}
                  placeholder="Optional"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Calculated Hours Preview */}
          {calculatedHours !== null && (
            <div className="p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-center justify-between text-xs text-emerald-900">
              <span className="font-medium">Total Duration Calculated:</span>
              <span className="font-bold font-mono text-emerald-700 text-sm">
                {calculatedHours} Hours
              </span>
            </div>
          )}

          {/* Status Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Attendance Status *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setStatus('present')}
                className={`py-2 px-2.5 text-xs font-medium rounded-xl border transition-all text-center cursor-pointer ${
                  status === 'present'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-500 font-semibold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Present
              </button>
              <button
                type="button"
                onClick={() => setStatus('late')}
                className={`py-2 px-2.5 text-xs font-medium rounded-xl border transition-all text-center cursor-pointer ${
                  status === 'late'
                    ? 'bg-amber-50 border-amber-500 text-amber-800 ring-1 ring-amber-500 font-semibold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Late
              </button>
              <button
                type="button"
                onClick={() => setStatus('remote')}
                className={`py-2 px-2.5 text-xs font-medium rounded-xl border transition-all text-center cursor-pointer ${
                  status === 'remote'
                    ? 'bg-sky-50 border-sky-500 text-sky-800 ring-1 ring-sky-500 font-semibold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Remote (WFH)
              </button>
              <button
                type="button"
                onClick={() => setStatus('half_day')}
                className={`py-2 px-2.5 text-xs font-medium rounded-xl border transition-all text-center cursor-pointer ${
                  status === 'half_day'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-800 ring-1 ring-indigo-500 font-semibold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Half Day
              </button>
            </div>
          </div>

          {/* Location and Shift */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="att-location"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Work Location
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <select
                  id="att-location"
                  value={workLocation}
                  onChange={(e) => setWorkLocation(e.target.value as WorkLocation)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                >
                  <option value="office">Office - Headquarters</option>
                  <option value="remote">Remote - Home Office</option>
                  <option value="client">Client Site</option>
                  <option value="field">Field Work</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="att-shift"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Shift Type
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Layers className="w-4 h-4" />
                </div>
                <select
                  id="att-shift"
                  value={shift}
                  onChange={(e) => setShift(e.target.value as ShiftType)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                >
                  <option value="morning">Morning Shift (09:00 - 18:00)</option>
                  <option value="evening">Evening Shift (14:00 - 22:00)</option>
                  <option value="flexible">Flexible Hours</option>
                </select>
              </div>
            </div>
          </div>

          {/* Daily Work Notes / Tasks */}
          <div>
            <label
              htmlFor="att-notes"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Daily Work Summary / Notes
            </label>
            <div className="relative">
              <div className="absolute top-2.5 left-3 pointer-events-none text-slate-400">
                <FileText className="w-4 h-4" />
              </div>
              <textarea
                id="att-notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe key responsibilities, deliverables or reasons for attendance adjustments..."
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="submit-attendance-record-btn"
              type="submit"
              className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm transition-all cursor-pointer"
            >
              {editingRecord ? 'Save Changes' : 'Submit Attendance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
