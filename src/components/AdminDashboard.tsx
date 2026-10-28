import React, { useState } from 'react';
import {
  Employee,
  Shift,
  AttendanceRecord,
  DailyReport,
  LateAlertNotification,
  PharmacySettings
} from '../types';
import {
  Users,
  CheckCircle,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  Filter,
  Send,
  ExternalLink,
  MapPin,
  Clock,
  Eye,
  X,
  Printer,
  PlusCircle,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  Calendar,
  Briefcase
} from 'lucide-react';
import {
  formatIndonesianDate,
  getIndonesianCurrentDateString,
  generateWhatsAppLateNotificationUrl
} from '../utils/date';
import { ManualAttendanceModal } from './ManualAttendanceModal';
import { PrintMonthlyModal } from './PrintMonthlyModal';

interface AdminDashboardProps {
  employees: Employee[];
  shifts: Shift[];
  attendanceRecords: AttendanceRecord[];
  dailyReports: DailyReport[];
  notifications: LateAlertNotification[];
  settings: PharmacySettings;
  onUpdateRecord: (record: AttendanceRecord) => void;
  onDeleteRecord: (recordId: string) => void;
  onMarkNotificationRead: (id: string) => void;
  onNavigateToReports: () => void;
}

const StatusBadge: React.FC<{ status: AttendanceRecord['status']; lateMinutes: number }> = ({
  status,
  lateMinutes
}) => {
  if (status === 'tepat_waktu') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
        <CheckCircle className="w-3 h-3 text-emerald-600" />
        <span>Tepat Waktu</span>
      </span>
    );
  }
  if (status === 'terlambat') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
        <AlertTriangle className="w-3 h-3 text-rose-600" />
        <span>Terlambat {lateMinutes} mnt</span>
      </span>
    );
  }
  if (status === 'izin') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
        <span>Izin</span>
      </span>
    );
  }
  if (status === 'sakit') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
        <span>Sakit</span>
      </span>
    );
  }
  if (status === 'cuti') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
        <span>Cuti</span>
      </span>
    );
  }
  if (status === 'dinas_luar') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
        <span>Dinas Luar</span>
      </span>
    );
  }
  return <span className="text-slate-400 text-xs">-</span>;
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  employees,
  shifts,
  attendanceRecords,
  dailyReports,
  notifications,
  settings,
  onUpdateRecord,
  onDeleteRecord,
  onMarkNotificationRead,
  onNavigateToReports
}) => {
  const today = getIndonesianCurrentDateString();
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modals
  const [selectedRecordDetail, setSelectedRecordDetail] = useState<AttendanceRecord | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);
  const [isMonthlyModalOpen, setIsMonthlyModalOpen] = useState<boolean>(false);
  const [recordToEdit, setRecordToEdit] = useState<AttendanceRecord | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filter records by date and status and search
  const dateRecords = attendanceRecords.filter((r) => r.date === selectedDate);
  const filteredRecords = dateRecords.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = r.employeeName.toLowerCase().includes(q);
      const matchRole = r.employeeRole.toLowerCase().includes(q);
      const matchShift = r.shiftName.toLowerCase().includes(q);
      return matchName || matchRole || matchShift;
    }
    return true;
  });

  // KPI Calculations
  const totalEmployees = employees.length;
  const totalClockedIn = dateRecords.filter((r) => !!r.clockInTime).length;
  const totalOnTime = dateRecords.filter((r) => r.status === 'tepat_waktu').length;
  const totalLate = dateRecords.filter((r) => r.status === 'terlambat').length;
  const totalLeave = dateRecords.filter((r) => ['izin', 'sakit', 'cuti', 'dinas_luar'].includes(r.status)).length;
  const totalReportsSubmitted = dailyReports.filter((rep) => rep.date === selectedDate).length;

  const activeLateNotifs = notifications.filter((n) => !n.isRead);

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Tanggal',
      'NIP',
      'Nama Karyawan',
      'Jabatan',
      'Shift',
      'Jam Masuk',
      'Jam Pulang',
      'Status',
      'Keterlambatan (Menit)',
      'Alasan',
      'Catatan Admin'
    ];

    const rows = filteredRecords.map((r) => {
      const emp = employees.find((e) => e.id === r.employeeId);
      return [
        `"${r.date}"`,
        `"${emp?.nip || ''}"`,
        `"${r.employeeName}"`,
        `"${r.employeeRole}"`,
        `"${r.shiftName}"`,
        `"${r.clockInTime || '-'}"`,
        `"${r.clockOutTime || '-'}"`,
        `"${r.status}"`,
        r.lateMinutes,
        `"${(r.lateReason || '').replace(/"/g, '""')}"`,
        `"${(r.adminNote || '').replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Presensi_Assyifa_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // WhatsApp Warning to Employee
  const handleSendWarningWhatsApp = (notif: LateAlertNotification) => {
    const emp = employees.find((e) => e.id === notif.employeeId);
    if (!emp) return;

    let phone = emp.phone.replace(/\D/g, '');
    if (phone.startsWith('0')) phone = '62' + phone.slice(1);

    const message = `*TEGURAN KETERLAMBATAN - APOTEK ASSYIFA FARMA CIDERES*
Halo ${emp.name},
Presensi Anda hari ini (${formatIndonesianDate(selectedDate)}) tercatat terlambat ${notif.lateMinutes} menit (Jadwal masuk: ${notif.scheduledTime} WIB, Hadir: ${notif.clockInTime} WIB).
Alasan tercatat: "${notif.reason || 'Belum diisi'}".

Mohon untuk lebih mengantisipasi perjalanan demi kelancaran pelayanan obat kepada pasien di apotek. Terima kasih.
- Apoteker Pengelola Apotek (APA)`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    onMarkNotificationRead(notif.id);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Top Banner & Action Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
            <span>Apotek Assyifa Farma Cideres</span>
            <span aria-hidden="true">·</span>
            <span>Panel Pengawasan Presensi</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Dashboard Presensi & Monitoring Karyawan
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pantau kehadiran, kelola entri absensi manual, dan tinjau laporan harian farmasi.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Input Manual Button */}
          <button
            onClick={() => {
              setRecordToEdit(null);
              setIsManualModalOpen(true);
            }}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Input Absensi Manual</span>
          </button>

          {/* Template Excel Export Button (Format sesuai foto user) */}
          <button
            onClick={() => setIsMonthlyModalOpen(true)}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold rounded-xl shadow-2xs transition-colors flex items-center gap-2 cursor-pointer"
            title="Buka Rekap Bulanan & Unduh Excel Format Template Resmi"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>Rekap Excel Bulanan</span>
          </button>

          {/* Cetak / Print Rekap */}
          <button
            onClick={() => setIsMonthlyModalOpen(true)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Cetak Rekapitulasi Presensi (Landscape)"
          >
            <Printer className="w-4 h-4 text-emerald-300" />
            <span>Cetak Rekap</span>
          </button>

          {/* Date Picker */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs bg-transparent text-slate-900 font-medium focus:outline-none cursor-pointer font-mono tabular-nums"
              title="Pilih tanggal harian"
            />
          </div>

          {/* Export CSV Harian */}
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Ekspor data harian ke CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">CSV Harian</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 block">Total Karyawan</span>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
            {totalEmployees}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Staff & Apoteker</span>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 block">Sudah Clock-in</span>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
            {totalClockedIn} <span className="text-xs text-slate-400 font-normal">/ {totalEmployees}</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            {totalEmployees - totalClockedIn} belum masuk
          </span>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-2xs">
          <span className="text-[11px] font-medium text-emerald-800 block">Tepat Waktu</span>
          <div className="text-2xl font-bold text-emerald-700 mt-1 font-mono tabular-nums">
            {totalOnTime}
          </div>
          <span className="text-[10px] text-emerald-700 mt-0.5 block">Sesuai shift</span>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-2xs">
          <span className="text-[11px] font-medium text-rose-800 block">Terlambat</span>
          <div className="text-2xl font-bold text-rose-600 mt-1 font-mono tabular-nums">
            {totalLate}
          </div>
          <span className="text-[10px] text-rose-700 mt-0.5 block">Perlu verifikasi</span>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-2xs">
          <span className="text-[11px] font-medium text-blue-800 block">Izin / Sakit / Cuti</span>
          <div className="text-2xl font-bold text-blue-700 mt-1 font-mono tabular-nums">
            {totalLeave}
          </div>
          <span className="text-[10px] text-blue-700 mt-0.5 block">Dispensasi resmi</span>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 block">Laporan Harian</span>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
            {totalReportsSubmitted}
          </div>
          <button
            onClick={onNavigateToReports}
            className="text-[10px] text-emerald-700 hover:text-emerald-900 font-bold mt-0.5 block cursor-pointer"
          >
            Buka Verifikasi →
          </button>
        </div>
      </div>

      {/* Automatic Late Notifications Box */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-600 text-white rounded-xl shadow-xs">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Pusat Notifikasi Keterlambatan Otomatis Hari Ini
              </h2>
              <p className="text-xs text-slate-500">
                Deteksi otomatis presensi melewati batas toleransi masuk shift Apotek Assyifa Farma Cideres.
              </p>
            </div>
          </div>
          {activeLateNotifs.length > 0 && (
            <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-lg tabular-nums">
              {activeLateNotifs.length} Peringatan
            </span>
          )}
        </div>

        {activeLateNotifs.length === 0 ? (
          <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-500 flex items-center justify-between border border-slate-200/60">
            <span>Tidak ada peringatan keterlambatan baru yang perlu ditinjau hari ini.</span>
            <span className="text-emerald-700 font-semibold">Semua jadwal shift tertib</span>
          </div>
        ) : (
          <div className="space-y-2 pt-1">
            {activeLateNotifs.map((notif) => (
              <div
                key={notif.id}
                className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-slate-900 text-sm">{notif.employeeName}</strong>
                    <span className="text-slate-500">({notif.employeeRole})</span>
                    <span className="text-rose-700 font-bold bg-white px-2 py-0.5 rounded border border-rose-200 tabular-nums">
                      Terlambat {notif.lateMinutes} Menit
                    </span>
                  </div>
                  <div className="text-slate-600 mt-1 flex flex-wrap items-center gap-2">
                    <span>Shift: <strong>{notif.shiftName}</strong></span>
                    <span aria-hidden="true">·</span>
                    <span>Jadwal: <strong className="font-mono">{notif.scheduledTime} WIB</strong></span>
                    <span aria-hidden="true">·</span>
                    <span>Hadir: <strong className="font-mono text-slate-900">{notif.clockInTime} WIB</strong></span>
                  </div>
                  {notif.reason && (
                    <p className="text-slate-700 bg-white/90 p-2 rounded-lg border border-rose-100 mt-1.5 text-xs">
                      <span className="font-semibold text-rose-950">Alasan Karyawan:</span> {notif.reason}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleSendWarningWhatsApp(notif)}
                    className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim Teguran WA</span>
                  </button>
                  <button
                    onClick={() => onMarkNotificationRead(notif.id)}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-medium rounded-lg text-xs border border-slate-300 transition-colors cursor-pointer"
                  >
                    Tandai Selesai
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Attendance Table Section */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden p-6 space-y-4">
        
        {/* Table Toolbar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Daftar Kehadiran Staf · {formatIndonesianDate(selectedDate)}
            </h2>
            <p className="text-xs text-slate-500">
              Total {filteredRecords.length} catatan presensi pada tanggal ini.
            </p>
          </div>

          {/* Search & Status Filter Controls */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Search input */}
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama / shift..."
                className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs overflow-x-auto">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  statusFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setStatusFilter('tepat_waktu')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  statusFilter === 'tepat_waktu'
                    ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tepat Waktu
              </button>
              <button
                onClick={() => setStatusFilter('terlambat')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  statusFilter === 'terlambat'
                    ? 'bg-white text-rose-800 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Terlambat
              </button>
              <button
                onClick={() => setStatusFilter('izin')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  statusFilter === 'izin'
                    ? 'bg-white text-blue-800 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Izin/Sakit
              </button>
            </div>
          </div>
        </div>

        {/* Desktop & Tablet Table (md and up) */}
        <div className="hidden md:block overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Karyawan</th>
                <th className="px-4 py-3.5">Shift</th>
                <th className="px-4 py-3.5">Foto Presensi</th>
                <th className="px-4 py-3.5">Jam Masuk</th>
                <th className="px-4 py-3.5">Jam Pulang</th>
                <th className="px-4 py-3.5">Status Kehadiran</th>
                <th className="px-4 py-3.5">Radius GPS</th>
                <th className="px-4 py-3.5 text-right">Aksi Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    <div className="space-y-2">
                      <p>Tidak ada catatan presensi pada tanggal {selectedDate} dengan filter ini.</p>
                      <button
                        onClick={() => {
                          setRecordToEdit(null);
                          setIsManualModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold rounded-lg hover:bg-emerald-100 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Input Absensi Manual Sekarang</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-slate-900 block">{rec.employeeName}</span>
                        <span className="text-[11px] text-slate-500 block">{rec.employeeRole}</span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-semibold text-slate-800">{rec.shiftName}</span>
                        <span className="text-[11px] text-slate-400 font-mono block">
                          {rec.scheduledStartTime} - {rec.scheduledEndTime}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {rec.clockInPhoto ? (
                          <img
                            src={rec.clockInPhoto}
                            alt="Selfie"
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shadow-2xs cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => setSelectedRecordDetail(rec)}
                          />
                        ) : (
                          <span className="text-slate-400 italic">Tanpa foto</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap font-mono tabular-nums text-slate-800">
                        {rec.clockInTime || '-'}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap font-mono tabular-nums text-slate-800">
                        {rec.clockOutTime || '-'}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <StatusBadge status={rec.status} lateMinutes={rec.lateMinutes} />
                        {rec.lateReason && (
                          <p className="text-[10px] text-slate-500 max-w-xs truncate mt-0.5" title={rec.lateReason}>
                            {rec.lateReason}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {rec.clockInLocation ? (
                          <span className="text-emerald-800 font-medium text-[11px] flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-emerald-600" />
                            <span>{rec.clockInLocation.distanceMeters}m (Valid)</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Manual Admin</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedRecordDetail(rec)}
                            title="Lihat Detail & Foto"
                            className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setRecordToEdit(rec);
                              setIsManualModalOpen(true);
                            }}
                            title="Edit Data Presensi"
                            className="p-1.5 text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(rec.id)}
                            title="Hapus Catatan"
                            className="p-1.5 text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Minimalist Mobile Cards View (md:hidden) */}
        <div className="block md:hidden space-y-2.5">
          {filteredRecords.length === 0 ? (
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-400 space-y-2">
              <p className="text-xs">Tidak ada catatan presensi pada tanggal ini.</p>
              <button
                onClick={() => {
                  setRecordToEdit(null);
                  setIsManualModalOpen(true);
                }}
                className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-lg text-xs"
              >
                + Input Manual
              </button>
            </div>
          ) : (
            filteredRecords.map((rec) => (
              <div
                key={rec.id}
                className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {rec.clockInPhoto ? (
                      <img
                        src={rec.clockInPhoto}
                        alt={rec.employeeName}
                        referrerPolicy="no-referrer"
                        onClick={() => setSelectedRecordDetail(rec)}
                        className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0 cursor-pointer"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center font-bold text-xs shrink-0">
                        {rec.employeeName.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 text-xs truncate">
                        {rec.employeeName}
                      </h3>
                      <div className="text-[11px] text-slate-500 truncate">
                        {rec.employeeRole} · <span className="font-semibold text-slate-700">{rec.shiftName}</span>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <StatusBadge status={rec.status} lateMinutes={rec.lateMinutes} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-lg text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Jam Masuk</span>
                    <span className="font-mono font-bold text-slate-800">
                      {rec.clockInTime || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Jam Pulang</span>
                    <span className="font-mono font-bold text-slate-800">
                      {rec.clockOutTime || '-'}
                    </span>
                  </div>
                </div>

                {rec.lateReason && (
                  <p className="text-[11px] text-rose-900 bg-rose-50 p-2 rounded-lg border border-rose-100">
                    <span className="font-bold">Alasan:</span> {rec.lateReason}
                  </p>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                  <div className="text-[11px] text-slate-500">
                    {rec.clockInLocation ? (
                      <span className="text-emerald-700 flex items-center gap-1 font-medium">
                        <MapPin className="w-3 h-3" />
                        <span>{rec.clockInLocation.distanceMeters}m (Radius Valid)</span>
                      </span>
                    ) : (
                      <span className="text-slate-400">Manual Admin</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setSelectedRecordDetail(rec)}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Detail</span>
                    </button>
                    <button
                      onClick={() => {
                        setRecordToEdit(rec);
                        setIsManualModalOpen(true);
                      }}
                      className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(rec.id)}
                      className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Manual Attendance Modal */}
      <ManualAttendanceModal
        isOpen={isManualModalOpen}
        onClose={() => {
          setIsManualModalOpen(false);
          setRecordToEdit(null);
        }}
        employees={employees}
        shifts={shifts}
        settings={settings}
        existingRecord={recordToEdit}
        selectedDate={selectedDate}
        onSave={(savedRecord) => {
          onUpdateRecord(savedRecord);
        }}
      />

      {/* Monthly Attendance Excel & Print Modal */}
      <PrintMonthlyModal
        isOpen={isMonthlyModalOpen}
        onClose={() => setIsMonthlyModalOpen(false)}
        employees={employees}
        attendanceRecords={attendanceRecords}
        settings={settings}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-100 text-rose-700 rounded-lg">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Hapus Catatan Presensi?</h3>
                <p className="text-xs text-slate-500">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-800 font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onDeleteRecord(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail Record Presensi */}
      {selectedRecordDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Detail Presensi · Apotek Assyifa Farma Cideres
                </h3>
                <span className="text-xs text-slate-500">{formatIndonesianDate(selectedRecordDetail.date)}</span>
              </div>
              <button
                onClick={() => setSelectedRecordDetail(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="flex items-center gap-4">
                {selectedRecordDetail.clockInPhoto && (
                  <img
                    src={selectedRecordDetail.clockInPhoto}
                    alt="Selfie"
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 rounded-xl object-cover border border-slate-200 shadow-xs"
                  />
                )}
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{selectedRecordDetail.employeeName}</h4>
                  <p className="text-slate-500">{selectedRecordDetail.employeeRole}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="bg-slate-100 px-2.5 py-0.5 rounded font-medium text-slate-700">
                      {selectedRecordDetail.shiftName}
                    </span>
                    <StatusBadge status={selectedRecordDetail.status} lateMinutes={selectedRecordDetail.lateMinutes} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl">
                <div>
                  <span className="text-slate-500 block">Jadwal Shift:</span>
                  <strong className="text-slate-800 font-mono">
                    {selectedRecordDetail.scheduledStartTime} - {selectedRecordDetail.scheduledEndTime} WIB
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Realisasi Jam Masuk:</span>
                  <strong className="text-slate-900 font-mono">{selectedRecordDetail.clockInTime || '-'} WIB</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Realisasi Jam Pulang:</span>
                  <strong className="text-slate-900 font-mono">{selectedRecordDetail.clockOutTime || '-'} WIB</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Verifikasi Lokasi:</span>
                  <strong className="text-slate-900">
                    {selectedRecordDetail.clockInLocation ? `${selectedRecordDetail.clockInLocation.distanceMeters}m (GPS Valid)` : 'Entri Manual Admin'}
                  </strong>
                </div>
              </div>

              {selectedRecordDetail.lateReason && (
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                  <span className="font-bold text-rose-950 block">Alasan / Kendala:</span>
                  <p className="text-rose-900 mt-1">{selectedRecordDetail.lateReason}</p>
                </div>
              )}

              {/* Admin Note Input */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">
                  Catatan Apoteker Pengelola (APA) / Supervisor:
                </label>
                <textarea
                  rows={2}
                  defaultValue={selectedRecordDetail.adminNote || ''}
                  placeholder="Tambahkan evaluasi kedisiplinan atau keterangan dispensasi..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 text-xs"
                  id="adminNoteField"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setRecordToEdit(selectedRecordDetail);
                  setSelectedRecordDetail(null);
                  setIsManualModalOpen(true);
                }}
                className="text-xs text-emerald-800 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Lengkap di Formulir Manual</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRecordDetail(null)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-800 font-medium cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const noteField = document.getElementById('adminNoteField') as HTMLTextAreaElement | null;
                    const updated: AttendanceRecord = {
                      ...selectedRecordDetail,
                      adminNote: noteField?.value || selectedRecordDetail.adminNote,
                      lateStatusAcknowledged: true
                    };
                    onUpdateRecord(updated);
                    setSelectedRecordDetail(null);
                  }}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Simpan Catatan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
