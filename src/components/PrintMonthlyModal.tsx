import React, { useState } from 'react';
import {
  Employee,
  AttendanceRecord,
  PharmacySettings
} from '../types';
import {
  X,
  Printer,
  Download,
  Calendar,
  FileSpreadsheet,
  CheckCircle2
} from 'lucide-react';
import {
  INDONESIAN_MONTHS,
  exportAttendanceToExcelTemplate,
  getAttendanceStatusCode
} from '../utils/excelExport';

const DAYS_31 = Array.from({ length: 31 }, (_, i) => i + 1);

interface PrintMonthlyModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  settings: PharmacySettings;
}

interface EmployeeRowProps {
  emp: Employee;
  index: number;
  daysInMonth: number;
  selectedYear: number;
  monthString: string;
  attendanceRecords: AttendanceRecord[];
}

const EmployeeRow: React.FC<EmployeeRowProps> = ({
  emp,
  index,
  daysInMonth,
  selectedYear,
  monthString,
  attendanceRecords
}) => {
  let totalH = 0;
  let totalT = 0;
  let totalLeave = 0;

  const dayCells = DAYS_31.map((day) => {
    if (day > daysInMonth) {
      return (
        <td
          key={day}
          className="border border-slate-800 py-1 bg-slate-100/60 text-slate-400 text-center font-mono text-[10px]"
        >
          -
        </td>
      );
    }

    const dayStr = String(day).padStart(2, '0');
    const dateKey = `${selectedYear}-${monthString}-${dayStr}`;
    const rec = attendanceRecords.find(
      (r) => r.employeeId === emp.id && r.date === dateKey
    );

    const code = getAttendanceStatusCode(rec?.status);
    if (code === 'H') totalH++;
    else if (code === 'T') totalT++;
    else if (['I', 'S', 'C', 'DL'].includes(code)) totalLeave++;

    let colorClass = 'text-slate-800';
    if (code === 'H') colorClass = 'text-emerald-800 font-bold';
    else if (code === 'T') colorClass = 'text-rose-700 font-bold';
    else if (code === 'I' || code === 'S') colorClass = 'text-blue-700 font-bold';

    return (
      <td
        key={day}
        className={`border border-slate-800 py-1 text-center font-mono text-[10px] ${colorClass}`}
      >
        {code}
      </td>
    );
  });

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="border border-slate-800 py-1.5 px-1 font-mono tabular-nums text-slate-800">
        {index + 1}
      </td>
      <td className="border border-slate-800 py-1.5 px-3 text-left font-medium text-slate-900 whitespace-nowrap">
        {emp.name}
      </td>
      {dayCells}
      <td className="border border-slate-800 py-1 font-mono font-bold text-emerald-800 bg-emerald-50/50">
        {totalH}
      </td>
      <td className="border border-slate-800 py-1 font-mono font-bold text-rose-700 bg-rose-50/50">
        {totalT}
      </td>
      <td className="border border-slate-800 py-1 font-mono font-bold text-blue-800 bg-blue-50/50">
        {totalLeave}
      </td>
      <td className="border border-slate-800 py-1 font-mono font-bold text-slate-900 bg-slate-100">
        {totalH + totalT}
      </td>
    </tr>
  );
};

export const PrintMonthlyModal: React.FC<PrintMonthlyModalProps> = ({
  isOpen,
  onClose,
  employees,
  attendanceRecords,
  settings
}) => {
  if (!isOpen) return null;

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const monthName = INDONESIAN_MONTHS[selectedMonth];
  const monthString = String(selectedMonth + 1).padStart(2, '0');

  // Trigger Excel export
  const handleExportExcel = () => {
    exportAttendanceToExcelTemplate({
      pharmacyName: settings.pharmacyName,
      monthIndex: selectedMonth,
      year: selectedYear,
      employees,
      attendanceRecords
    });

    setDownloadSuccess(`File Excel Rekap ${monthName} ${selectedYear} berhasil diunduh!`);
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  const handlePrint = () => {
    window.print();
  };

  const dayHeaders = DAYS_31.map((day) => (
    <th
      key={day}
      className={`border border-slate-800 py-1 px-0.5 w-6 text-center tabular-nums font-mono ${
        day > daysInMonth ? 'bg-slate-200/50 text-slate-400' : ''
      }`}
    >
      {day}
    </th>
  ));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs print-only-modal overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-6xl w-full my-auto overflow-hidden flex flex-col print-sheet-content">
        
        {/* Top Modal Controls (Hidden in Print) */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-900 to-teal-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 no-print">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl">
              <FileSpreadsheet className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                Rekapitulasi Presensi Bulanan (Format Template Excel)
              </h2>
              <p className="text-xs text-emerald-100">
                {settings.pharmacyName} · Sesuai template format tabel Excel resmi
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Excel (.xlsx)</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-emerald-700" />
              <span>Cetak / Print PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-white/70 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter bar (Hidden in Print) */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs no-print">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-700" />
              <span>Pilih Periode:</span>
            </span>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              {INDONESIAN_MONTHS.map((m, idx) => (
                <option key={m} value={idx}>
                  Bulan {m}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-600 font-mono"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  Tahun {y}
                </option>
              ))}
            </select>
          </div>

          {downloadSuccess && (
            <div className="text-xs text-emerald-800 font-semibold bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{downloadSuccess}</span>
            </div>
          )}
        </div>

        {/* Printable Sheet Viewport matching User's Excel Template */}
        <div className="p-4 sm:p-6 overflow-x-auto bg-white flex-1 text-slate-900">
          
          {/* Header Row 1: "Bulan : Oktober" exactly as in screenshot */}
          <div className="mb-4 space-y-1">
            <div className="flex items-baseline gap-2 text-sm sm:text-base font-bold text-slate-900">
              <span className="w-16">Bulan</span>
              <span>:</span>
              <span className="border-b-2 border-slate-900 px-4 font-bold text-emerald-950">
                {monthName} {selectedYear}
              </span>
            </div>
            <div className="text-xs text-slate-500 font-medium">
              {settings.pharmacyName} · {settings.pharmacyAddress}
            </div>
          </div>

          {/* Excel Grid Table */}
          <div className="overflow-x-auto border border-slate-800 rounded-xs">
            <table className="w-full text-center border-collapse text-[11px] font-sans excel-grid">
              <thead>
                {/* Row 4: No | Nama | Tanggal (merged across 31 cols) | Totals */}
                <tr className="bg-slate-200/90 text-slate-900 font-bold border-b border-slate-800">
                  <th rowSpan={2} className="border border-slate-800 px-2 py-2 w-10 text-center align-middle">
                    No
                  </th>
                  <th rowSpan={2} className="border border-slate-800 px-3 py-2 text-left align-middle min-w-[170px]">
                    Nama
                  </th>
                  <th colSpan={31} className="border border-slate-800 py-1.5 text-center font-bold tracking-wider">
                    Tanggal
                  </th>
                  <th colSpan={4} className="border border-slate-800 py-1.5 text-center font-bold bg-slate-300/80">
                    Rekapitulasi
                  </th>
                </tr>

                {/* Row 5: 1 to 31 numbers */}
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-800 text-[10px]">
                  {dayHeaders}
                  <th className="border border-slate-800 py-1 px-1.5 bg-emerald-50 text-emerald-900 text-[10px]">H</th>
                  <th className="border border-slate-800 py-1 px-1.5 bg-rose-50 text-rose-900 text-[10px]">T</th>
                  <th className="border border-slate-800 py-1 px-1.5 bg-blue-50 text-blue-900 text-[10px]">I/S</th>
                  <th className="border border-slate-800 py-1 px-1.5 bg-slate-200 text-slate-900 text-[10px]">Jml</th>
                </tr>
              </thead>

              <tbody>
                {employees.map((emp, index) => (
                  <EmployeeRow
                    key={emp.id}
                    emp={emp}
                    index={index}
                    daysInMonth={daysInMonth}
                    selectedYear={selectedYear}
                    monthString={monthString}
                    attendanceRecords={attendanceRecords}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Legend */}
          <div className="mt-4 pt-3 border-t border-slate-300 text-xs text-slate-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="font-bold text-slate-800 block text-[11px]">Keterangan Simbol Presensi:</span>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]">
                <span><strong className="text-emerald-800">H</strong> = Hadir Tepat Waktu</span>
                <span><strong className="text-rose-700">T</strong> = Terlambat</span>
                <span><strong className="text-blue-700">I</strong> = Izin</span>
                <span><strong className="text-amber-700">S</strong> = Sakit</span>
                <span><strong className="text-purple-700">C</strong> = Cuti</span>
                <span><strong className="text-teal-700">DL</strong> = Dinas Luar</span>
                <span><strong className="text-slate-700">A</strong> = Alpha</span>
              </div>
            </div>

            <div className="text-right text-[11px] text-slate-500 font-mono">
              Dicetak: {new Date().toLocaleDateString('id-ID')} · SIA: 503/014/SIA/DPMPTSP
            </div>
          </div>

        </div>

        {/* Modal Footer Controls (Hidden in Print) */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between no-print">
          <span className="text-xs text-slate-500">
            Tip: Untuk cetak terbaik, pilih orientasi <strong>Landscape</strong> di dialog cetak browser.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Tutup
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
