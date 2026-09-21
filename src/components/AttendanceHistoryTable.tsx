import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Calendar,
  Clock,
  MapPin,
  FileText,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Laptop,
  ArrowUpDown,
  Building,
  Sparkles,
} from 'lucide-react';
import { AttendanceRecord, AttendanceStatus, AttendanceStats } from '../types';
import { formatTime12h } from '../storage';

interface AttendanceHistoryTableProps {
  records: AttendanceRecord[];
  stats: AttendanceStats;
  onEdit: (record: AttendanceRecord) => void;
  onDelete: (record: AttendanceRecord) => void;
  onOpenLogModal: () => void;
}

export const AttendanceHistoryTable: React.FC<AttendanceHistoryTableProps> = ({
  records,
  stats,
  onEdit,
  onDelete,
  onOpenLogModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Filter & Search logic
  const filteredRecords = useMemo(() => {
    return records
      .filter((rec) => {
        // Status filter
        if (selectedStatus !== 'all' && rec.status !== selectedStatus) {
          return false;
        }

        // Search filter
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchDate = rec.date.toLowerCase().includes(q);
          const matchNotes = (rec.notes || '').toLowerCase().includes(q);
          const matchLocation = (rec.workLocation || '').toLowerCase().includes(q);
          const matchStatus = rec.status.toLowerCase().includes(q);
          return matchDate || matchNotes || matchLocation || matchStatus;
        }

        return true;
      })
      .sort((a, b) => {
        const compare = a.date.localeCompare(b.date);
        return sortOrder === 'desc' ? -compare : compare;
      });
  }, [records, selectedStatus, searchTerm, sortOrder]);

  // Export CSV
  const handleExportCSV = () => {
    if (records.length === 0) return;

    const headers = [
      'Date',
      'Time In',
      'Time Out',
      'Status',
      'Location',
      'Shift',
      'Total Hours',
      'Notes',
    ];

    const rows = filteredRecords.map((r) => [
      r.date,
      r.timeIn,
      r.timeOut || 'N/A',
      r.status,
      r.workLocation,
      r.shift,
      r.totalHours ? r.totalHours.toString() : '0',
      `"${(r.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `attendance_history_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Present
          </span>
        );
      case 'late':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Late Arrival
          </span>
        );
      case 'remote':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <Laptop className="w-3 h-3 text-sky-500" />
            Remote (WFH)
          </span>
        );
      case 'half_day':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Clock className="w-3 h-3 text-indigo-500" />
            Half Day
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Days */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Total Logged</span>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 font-mono">
            {stats.totalDays}
          </div>
          <div className="text-xs text-slate-500 mt-1">Days recorded</div>
        </div>

        {/* On-Time Arrival Rate */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>On-Time Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-2 font-mono">
            {stats.onTimeRate}%
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {stats.presentCount + stats.remoteCount} on-time shifts
          </div>
        </div>

        {/* Late Count */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Late Arrivals</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-700 mt-2 font-mono">
            {stats.lateCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">Days marked late</div>
        </div>

        {/* Total Hours Worked */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Total Hours</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 font-mono">
            {stats.totalHours} <span className="text-sm font-normal text-slate-500">hrs</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Avg {stats.averageHoursPerDay} hrs / day
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Table Controls & Filter Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Personal Attendance History
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage, update, or remove your daily attendance entries.
              </p>
            </div>

            {/* Actions: Export and Log */}
            <div className="flex items-center gap-2">
              <button
                id="btn-export-csv"
                type="button"
                onClick={handleExportCSV}
                disabled={records.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export CSV</span>
              </button>
              <button
                id="btn-table-new-record"
                type="button"
                onClick={onOpenLogModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <span>+ Log Attendance</span>
              </button>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                id="search-attendance-input"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by date (YYYY-MM-DD), notes, or location..."
                className="w-full pl-9 pr-3.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              />
            </div>

            {/* Status Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { label: 'All', value: 'all' },
                { label: 'Present', value: 'present' },
                { label: 'Late', value: 'late' },
                { label: 'Remote', value: 'remote' },
                { label: 'Half Day', value: 'half_day' },
              ].map((filter) => (
                <button
                  key={filter.value}
                  id={`filter-${filter.value}`}
                  type="button"
                  onClick={() => setSelectedStatus(filter.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedStatus === filter.value
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}

              {/* Sort Order Toggle */}
              <button
                id="btn-sort-order"
                type="button"
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                title={`Sorted by ${sortOrder === 'desc' ? 'Newest first' : 'Oldest first'}`}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer shrink-0"
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredRecords.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">No attendance records found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {searchTerm || selectedStatus !== 'all'
                ? 'Try adjusting your search criteria or resetting filters.'
                : "You haven't logged any attendance entries yet. Use the punch widget above or click Log Attendance."}
            </p>
            {searchTerm || selectedStatus !== 'all' ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedStatus('all');
                }}
                className="mt-3 text-xs font-semibold text-slate-900 hover:underline cursor-pointer"
              >
                Clear all filters
              </button>
            ) : (
              <button
                onClick={onOpenLogModal}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Log First Attendance
              </button>
            )}
          </div>
        )}

        {/* Desktop Table View */}
        {filteredRecords.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                <tr>
                  <th scope="col" className="py-3 px-4 sm:px-6">
                    Date
                  </th>
                  <th scope="col" className="py-3 px-4">
                    Status
                  </th>
                  <th scope="col" className="py-3 px-4">
                    Time In / Out
                  </th>
                  <th scope="col" className="py-3 px-4">
                    Duration
                  </th>
                  <th scope="col" className="py-3 px-4">
                    Location & Shift
                  </th>
                  <th scope="col" className="py-3 px-4 max-w-[200px]">
                    Work Summary / Notes
                  </th>
                  <th scope="col" className="py-3 px-4 text-right pr-4 sm:pr-6">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((record) => (
                  <tr
                    key={record.id}
                    id={`record-row-${record.id}`}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    {/* Date */}
                    <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-900 whitespace-nowrap">
                      {new Date(record.date + 'T00:00:00').toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(record.status)}
                    </td>

                    {/* Time In & Out */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-700 font-semibold">
                          {formatTime12h(record.timeIn)}
                        </span>
                        <span className="text-slate-400">→</span>
                        <span>
                          {record.timeOut ? (
                            <span className="text-slate-900">{formatTime12h(record.timeOut)}</span>
                          ) : (
                            <span className="text-amber-600 italic">In progress</span>
                          )}
                        </span>
                      </div>
                    </td>

                    {/* Total Hours */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono font-medium text-slate-900">
                      {record.totalHours !== null ? (
                        <span>{record.totalHours} hrs</span>
                      ) : (
                        <span className="text-slate-400">--</span>
                      )}
                    </td>

                    {/* Location & Shift */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-600">
                      <div className="capitalize font-medium text-slate-800">
                        {record.workLocation === 'office'
                          ? 'Office HQ'
                          : record.workLocation === 'remote'
                          ? 'Remote WFH'
                          : record.workLocation}
                      </div>
                      <div className="text-[11px] text-slate-400 capitalize">
                        {record.shift} Shift
                      </div>
                    </td>

                    {/* Notes */}
                    <td className="py-3.5 px-4 text-xs text-slate-600 max-w-[240px]">
                      <p className="truncate" title={record.notes}>
                        {record.notes || <span className="text-slate-300 italic">No notes</span>}
                      </p>
                    </td>

                    {/* Action buttons: Edit (Update) and Delete */}
                    <td className="py-3.5 px-4 text-right pr-4 sm:pr-6 whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          id={`btn-edit-${record.id}`}
                          type="button"
                          onClick={() => onEdit(record)}
                          title="Update / Edit Record"
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                          <span className="sr-only">Edit</span>
                        </button>
                        <button
                          id={`btn-delete-${record.id}`}
                          type="button"
                          onClick={() => onDelete(record)}
                          title="Delete Record"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="sr-only">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Summary */}
        <div className="px-4 sm:px-6 py-3 border-t border-slate-200 bg-slate-50/70 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-700">{filteredRecords.length}</span>{' '}
            of <span className="font-semibold text-slate-700">{records.length}</span> records
          </div>
          <div>All records stored locally in browser session storage.</div>
        </div>
      </div>
    </div>
  );
};
