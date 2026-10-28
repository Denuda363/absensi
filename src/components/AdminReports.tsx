import React, { useState } from 'react';
import { DailyReport, Employee, PharmacySettings, Shift } from '../types';
import {
  FileText,
  CheckCircle2,
  Filter,
  Search,
  Thermometer,
  Pill,
  ShoppingBag,
  Clock,
  Printer,
  X,
  MessageSquare,
  ShieldCheck,
  Plus,
  Check
} from 'lucide-react';
import { formatIndonesianDate, getIndonesianCurrentDateString } from '../utils/date';

interface AdminReportsProps {
  dailyReports: DailyReport[];
  employees: Employee[];
  settings: PharmacySettings;
  shifts?: Shift[];
  onUpdateReport: (report: DailyReport) => void;
}

export const AdminReports: React.FC<AdminReportsProps> = ({
  dailyReports,
  employees,
  settings,
  shifts = [],
  onUpdateReport
}) => {
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);
  const [filterEmployeeId, setFilterEmployeeId] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [verificationFeedback, setVerificationFeedback] = useState<string>('');

  // Create report modal state (strictly in Admin mode)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [createEmployeeId, setCreateEmployeeId] = useState<string>(employees[0]?.id || '');
  const [createShiftName, setCreateShiftName] = useState<string>(
    shifts[0]?.name || 'Shift 1 (Pagi)'
  );
  const [createPrescriptions, setCreatePrescriptions] = useState<number>(25);
  const [createOtc, setCreateOtc] = useState<number>(60);
  const [createFridgeTemp, setCreateFridgeTemp] = useState<number>(4.5);
  const [createRoomTemp, setCreateRoomTemp] = useState<number>(23.0);
  const [createHumidity, setCreateHumidity] = useState<number>(55);
  const [createLowStock, setCreateLowStock] = useState<string>('');
  const [createTasks, setCreateTasks] = useState<string>(
    'Pelayanan resep obat BPJS & Umum, cek suhu kulkas vaksin dan kelembaban ruang obat.'
  );
  const [createGoods, setCreateGoods] = useState<string>('');

  const filteredReports = dailyReports.filter((r) => {
    if (filterEmployeeId !== 'all' && r.employeeId !== filterEmployeeId) return false;
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      const matchName = r.employeeName.toLowerCase().includes(q);
      const matchTasks = r.dailyTasksSummary.toLowerCase().includes(q);
      const matchStock = r.lowStockItems?.toLowerCase().includes(q);
      if (!matchName && !matchTasks && !matchStock) return false;
    }
    return true;
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const handleOpenVerification = (rep: DailyReport) => {
    setSelectedReport(rep);
    setVerificationFeedback(rep.supervisorFeedback || 'Laporan telah diverifikasi lengkap, parameter suhu kulkas dan pelayanan resep sesuai SOP.');
  };

  const handleVerifySubmit = () => {
    if (!selectedReport) return;
    const updated: DailyReport = {
      ...selectedReport,
      status: 'diverifikasi',
      verifiedBy: settings.supervisorName,
      verifiedAt: new Date().toLocaleTimeString('id-ID') + ' WIB',
      supervisorFeedback: verificationFeedback,
      updatedAt: new Date().toLocaleTimeString('id-ID')
    };
    onUpdateReport(updated);
    setSelectedReport(null);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === createEmployeeId) || employees[0];
    const newReport: DailyReport = {
      id: `rep-${Date.now()}`,
      employeeId: emp.id,
      employeeName: emp.name,
      employeeRole: emp.role,
      date: getIndonesianCurrentDateString(),
      shiftName: createShiftName,
      prescriptionsCount: Number(createPrescriptions),
      otcSalesCount: Number(createOtc),
      temperatureLog: {
        fridgeTemp: Number(createFridgeTemp),
        roomTemp: Number(createRoomTemp),
        humidity: Number(createHumidity)
      },
      lowStockItems: createLowStock,
      goodsReceivedNotes: createGoods,
      dailyTasksSummary: createTasks,
      status: 'diverifikasi',
      verifiedBy: settings.supervisorName,
      verifiedAt: new Date().toLocaleTimeString('id-ID') + ' WIB',
      supervisorFeedback: 'Laporan dicatat dan diverifikasi langsung oleh Admin / Penanggung Jawab Apotek.',
      createdAt: new Date().toLocaleTimeString('id-ID') + ' WIB',
      updatedAt: new Date().toLocaleTimeString('id-ID') + ' WIB'
    };
    onUpdateReport(newReport);
    setIsCreateModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span>Apotek Assyifa Farma Cideres</span>
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-emerald-800">Khusus Mode Admin</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
            Laporan Harian Farmasi
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Pengelolaan & verifikasi resep dokter, log suhu kulkas/ruang obat, dan laporan operasional harian seluruh staf farmasi.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ Input Laporan Farmasi Baru</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Laporan Lengkap</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs no-print">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Cari dalam laporan..."
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Filter Karyawan:</span>
            <select
              value={filterEmployeeId}
              onChange={(e) => setFilterEmployeeId(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              <option value="all">Semua Karyawan</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              <option value="all">Semua Status</option>
              <option value="terkirim">Menunggu Verifikasi</option>
              <option value="diverifikasi">Sudah Diverifikasi APA</option>
              <option value="draft">Draf</option>
            </select>
          </div>
        </div>

        <span className="text-slate-500 font-mono tabular-nums">
          Ditemukan {filteredReports.length} laporan
        </span>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReports.length === 0 ? (
          <div className="col-span-full bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400 text-xs">
            Tidak ada laporan harian yang sesuai kriteria pencarian.
          </div>
        ) : (
          filteredReports.map((rep) => {
            const isVerified = rep.status === 'diverifikasi';

            return (
              <div
                key={rep.id}
                className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{rep.employeeName}</h3>
                      <p className="text-[11px] text-slate-500">{rep.employeeRole}</p>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                        isVerified
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {isVerified ? 'Diverifikasi' : 'Menunggu APA'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tanggal:</span>
                      <strong className="text-slate-800">{formatIndonesianDate(rep.date)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Shift:</span>
                      <strong className="text-slate-800">{rep.shiftName}</strong>
                    </div>
                  </div>

                  {/* Operational stats */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-lg text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Resep Dokter</span>
                      <strong className="text-slate-900 font-mono">{rep.prescriptionsCount} Resep</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Transaksi OTC</span>
                      <strong className="text-slate-900 font-mono">{rep.otcSalesCount} Trx</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Suhu Kulkas</span>
                      <strong className="text-slate-900 font-mono">{rep.temperatureLog.fridgeTemp}°C</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Suhu Ruangan</span>
                      <strong className="text-slate-900 font-mono">{rep.temperatureLog.roomTemp}°C</strong>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Uraian Tugas:
                    </span>
                    <p className="text-xs text-slate-600 line-clamp-3 bg-slate-50/70 p-2 rounded border border-slate-200/60">
                      {rep.dailyTasksSummary}
                    </p>
                  </div>

                  {rep.lowStockItems && (
                    <div className="text-[11px] text-amber-900 bg-amber-50/70 p-2 rounded border border-amber-200">
                      <strong>Stok Kritis:</strong> {rep.lowStockItems}
                    </div>
                  )}

                  {isVerified && rep.supervisorFeedback && (
                    <div className="text-[11px] text-emerald-900 bg-emerald-50 p-2 rounded border border-emerald-200">
                      <strong>Catatan APA:</strong> {rep.supervisorFeedback}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono tabular-nums">
                    {rep.createdAt}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenVerification(rep)}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{isVerified ? 'Edit Verifikasi' : 'Verifikasi Laporan'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Verification Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Verifikasi Laporan Farmasi oleh Apoteker Pengelola (APA)
                </h3>
                <span className="text-xs text-slate-500">
                  {selectedReport.employeeName} · {formatIndonesianDate(selectedReport.date)}
                </span>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg">
                <div>
                  <span className="text-slate-500 block">Shift & Waktu:</span>
                  <strong className="text-slate-900">{selectedReport.shiftName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Pelayanan Resep:</span>
                  <strong className="text-slate-900">{selectedReport.prescriptionsCount} Resep Dokter</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Suhu Kulkas Vaksin:</span>
                  <strong className="text-slate-900 font-mono">{selectedReport.temperatureLog.fridgeTemp}°C</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Suhu Ruang / RH:</span>
                  <strong className="text-slate-900 font-mono">
                    {selectedReport.temperatureLog.roomTemp}°C / {selectedReport.temperatureLog.humidity}% RH
                  </strong>
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-900 block mb-1">Penerimaan Barang PBF:</span>
                <p className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  {selectedReport.goodsReceivedNotes || 'Tidak ada penerimaan barang pada shift ini.'}
                </p>
              </div>

              <div>
                <span className="font-semibold text-slate-900 block mb-1">Rangkuman Aktivitas:</span>
                <p className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  {selectedReport.dailyTasksSummary}
                </p>
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="block font-semibold text-slate-800">
                  Instruksi / Catatan Persetujuan Apoteker Penanggung Jawab (APA):
                </label>
                <textarea
                  rows={3}
                  value={verificationFeedback}
                  onChange={(e) => setVerificationFeedback(e.target.value)}
                  placeholder="Beri catatan evaluasi, tindak lanjut stok kritis, atau persetujuan..."
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleVerifySubmit}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simpan & Sahkan Verifikasi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input Laporan Farmasi Baru (Mode Admin) Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-150">
            <div className="p-4 sm:p-5 bg-emerald-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-emerald-300" />
                <div>
                  <h3 className="font-bold text-sm sm:text-base">
                    Input Laporan Operasional Farmasi Baru
                  </h3>
                  <p className="text-xs text-emerald-200">
                    Apotek Assyifa Farma Cideres · Entri Khusus Mode Admin
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-emerald-200 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Petugas Pelapor:
                  </label>
                  <select
                    value={createEmployeeId}
                    onChange={(e) => setCreateEmployeeId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name} ({e.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Shift Pelayanan:
                  </label>
                  <select
                    value={createShiftName}
                    onChange={(e) => setCreateShiftName(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    {shifts.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} ({s.startTime} - {s.endTime})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Transactions */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Resep Dokter Dilayani:
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={createPrescriptions}
                    onChange={(e) => setCreatePrescriptions(Number(e.target.value))}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Transaksi Obat Bebas (OTC):
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={createOtc}
                    onChange={(e) => setCreateOtc(Number(e.target.value))}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono"
                  />
                </div>
              </div>

              {/* Temperatures */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 text-[11px]">
                <div>
                  <label className="block font-semibold text-emerald-950 mb-1">
                    Suhu Kulkas (°C):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={createFridgeTemp}
                    onChange={(e) => setCreateFridgeTemp(Number(e.target.value))}
                    className="w-full p-1.5 bg-white border border-emerald-300 rounded font-mono font-bold text-emerald-900"
                  />
                  <span className="text-[10px] text-emerald-700">Std: 2 - 8 °C</span>
                </div>
                <div>
                  <label className="block font-semibold text-emerald-950 mb-1">
                    Suhu Ruangan (°C):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={createRoomTemp}
                    onChange={(e) => setCreateRoomTemp(Number(e.target.value))}
                    className="w-full p-1.5 bg-white border border-emerald-300 rounded font-mono font-bold text-emerald-900"
                  />
                  <span className="text-[10px] text-emerald-700">Std: &lt; 25 °C</span>
                </div>
                <div>
                  <label className="block font-semibold text-emerald-950 mb-1">
                    Kelembaban (%):
                  </label>
                  <input
                    type="number"
                    value={createHumidity}
                    onChange={(e) => setCreateHumidity(Number(e.target.value))}
                    className="w-full p-1.5 bg-white border border-emerald-300 rounded font-mono font-bold text-emerald-900"
                  />
                  <span className="text-[10px] text-emerald-700">Std: 40 - 60%</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Uraian Aktivitas Pelayanan & Tugas Harian:
                </label>
                <textarea
                  rows={2}
                  value={createTasks}
                  onChange={(e) => setCreateTasks(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Stok Obat Menipis / Kritis (Fast Moving):
                </label>
                <input
                  type="text"
                  value={createLowStock}
                  onChange={(e) => setCreateLowStock(e.target.value)}
                  placeholder="Contoh: Paracetamol Sirup (sisa 2), Cefixime 100mg (sisa 1 box)"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Penerimaan Barang / Faktur PBF:
                </label>
                <input
                  type="text"
                  value={createGoods}
                  onChange={(e) => setCreateGoods(e.target.value)}
                  placeholder="Contoh: Faktur PBF Anugrah Argo (1 koli vitamin & infus)"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="p-3 bg-slate-100 rounded-xl text-[11px] text-slate-600 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Laporan yang dibuat di Mode Admin akan langsung berstatus <strong>Diverifikasi</strong> oleh {settings.supervisorName}.
                </span>
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan & Sahkan Laporan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
