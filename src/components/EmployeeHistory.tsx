import React, { useState } from 'react';
import {
  Employee,
  AttendanceRecord,
  DailyReport
} from '../types';
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Search,
  Eye,
  X
} from 'lucide-react';
import { formatIndonesianDate } from '../utils/date';

interface EmployeeHistoryProps {
  currentEmployee: Employee;
  attendanceList: AttendanceRecord[];
  dailyReports: DailyReport[];
  onOpenReportForm: () => void;
}

export const EmployeeHistory: React.FC<EmployeeHistoryProps> = ({
  currentEmployee,
  attendanceList,
  dailyReports,
  onOpenReportForm
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedReportDetail, setSelectedReportDetail] = useState<DailyReport | null>(null);

  // Filter records for this employee
  const myRecords = attendanceList
    .filter((r) => r.employeeId === currentEmployee.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const filteredRecords = myRecords.filter((r) => {
    return (
      r.date.includes(searchTerm) ||
      r.shiftName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Riwayat Presensi & Laporan Karyawan
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {currentEmployee.name} · {currentEmployee.role} (NIP: {currentEmployee.nip})
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari tanggal / status..."
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
          />
        </div>
      </div>

      {/* Table list */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Tanggal</th>
                <th className="px-4 py-3.5">Shift</th>
                <th className="px-4 py-3.5">Jam Masuk</th>
                <th className="px-4 py-3.5">Jam Pulang</th>
                <th className="px-4 py-3.5">Status Kehadiran</th>
                <th className="px-4 py-3.5">Laporan Harian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    Belum ada catatan riwayat presensi yang cocok.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((item) => {
                  const correspondingReport = dailyReports.find(
                    (rep) => rep.employeeId === item.employeeId && rep.date === item.date
                  );

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5 whitespace-nowrap font-medium text-slate-900">
                        {formatIndonesianDate(item.date)}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-medium text-slate-800">{item.shiftName}</span>
                        <span className="text-[11px] text-slate-400 block font-mono">
                          {item.scheduledStartTime} - {item.scheduledEndTime}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap font-mono tabular-nums text-slate-800">
                        {item.clockInTime || '-'}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap font-mono tabular-nums text-slate-800">
                        {item.clockOutTime || '-'}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {item.status === 'terlambat' ? (
                          <div>
                            <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200 inline-flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Terlambat {item.lateMinutes} mnt</span>
                            </span>
                            {item.lateReason && (
                              <p className="text-[11px] text-slate-500 mt-0.5 max-w-xs truncate" title={item.lateReason}>
                                Alasan: {item.lateReason}
                              </p>
                            )}
                          </div>
                        ) : item.status === 'tepat_waktu' ? (
                          <span className="text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            <span>Tepat Waktu</span>
                          </span>
                        ) : (
                          <span className="text-slate-500">{item.status}</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {correspondingReport ? (
                          <button
                            onClick={() => setSelectedReportDetail(correspondingReport)}
                            className="text-xs text-emerald-700 hover:text-emerald-900 font-medium flex items-center gap-1 cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>
                              {correspondingReport.status === 'diverifikasi'
                                ? 'Terverifikasi APA'
                                : 'Terkirim (Lihat)'}
                            </span>
                          </button>
                        ) : (
                          <button
                            onClick={onOpenReportForm}
                            className="text-xs text-slate-500 hover:text-emerald-700 underline cursor-pointer"
                          >
                            + Isi Laporan
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal View Detail Laporan */}
      {selectedReportDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-700" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Detail Laporan Harian · {formatIndonesianDate(selectedReportDetail.date)}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReportDetail(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg">
                <div>
                  <span className="text-slate-500 block">Resep Dokter:</span>
                  <strong className="text-slate-900">{selectedReportDetail.prescriptionsCount} Resep</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Penjualan Bebas (OTC):</span>
                  <strong className="text-slate-900">{selectedReportDetail.otcSalesCount} Transaksi</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Suhu Kulkas Vaksin:</span>
                  <strong className="text-slate-900 font-mono">{selectedReportDetail.temperatureLog.fridgeTemp}°C</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Suhu Ruang / Kelembaban:</span>
                  <strong className="text-slate-900 font-mono">
                    {selectedReportDetail.temperatureLog.roomTemp}°C / {selectedReportDetail.temperatureLog.humidity}% RH
                  </strong>
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-900 block mb-1">Rangkuman Pekerjaan:</span>
                <p className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  {selectedReportDetail.dailyTasksSummary}
                </p>
              </div>

              {selectedReportDetail.lowStockItems && (
                <div>
                  <span className="font-semibold text-slate-900 block mb-1">Obat Menipis / Stok Kritis:</span>
                  <p className="bg-amber-50/60 p-2.5 rounded border border-amber-200 text-amber-950">
                    {selectedReportDetail.lowStockItems}
                  </p>
                </div>
              )}

              {selectedReportDetail.supervisorFeedback && (
                <div className="p-3 bg-emerald-50 rounded border border-emerald-200">
                  <span className="font-bold text-emerald-950 block">Catatan Verifikasi APA:</span>
                  <p className="text-emerald-900 mt-1">{selectedReportDetail.supervisorFeedback}</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedReportDetail(null)}
                className="px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
