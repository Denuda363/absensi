import React, { useState } from 'react';
import {
  Employee,
  DailyReport,
  Shift
} from '../types';
import {
  FileText,
  Save,
  Send,
  Thermometer,
  Pill,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  Truck,
  Printer
} from 'lucide-react';
import {
  getIndonesianCurrentDateString,
  formatIndonesianDate
} from '../utils/date';

interface DailyReportFormProps {
  currentEmployee: Employee;
  shifts: Shift[];
  existingReport: DailyReport | null;
  onSaveReport: (report: DailyReport) => void;
}

export const DailyReportForm: React.FC<DailyReportFormProps> = ({
  currentEmployee,
  shifts,
  existingReport,
  onSaveReport
}) => {
  const today = getIndonesianCurrentDateString();
  const defaultShift = shifts.find((s) => s.id === currentEmployee.defaultShiftId) || shifts[0];

  const [shiftName, setShiftName] = useState<string>(
    existingReport?.shiftName || defaultShift.name
  );
  const [prescriptionsCount, setPrescriptionsCount] = useState<number>(
    existingReport?.prescriptionsCount ?? 25
  );
  const [otcSalesCount, setOtcSalesCount] = useState<number>(
    existingReport?.otcSalesCount ?? 60
  );
  const [fridgeTemp, setFridgeTemp] = useState<number>(
    existingReport?.temperatureLog.fridgeTemp ?? 4.5
  );
  const [roomTemp, setRoomTemp] = useState<number>(
    existingReport?.temperatureLog.roomTemp ?? 23.0
  );
  const [humidity, setHumidity] = useState<number>(
    existingReport?.temperatureLog.humidity ?? 55
  );
  const [lowStockItems, setLowStockItems] = useState<string>(
    existingReport?.lowStockItems || 'Amoxicillin Sirup 125mg (sisa 3), Paracetamol Drop (sisa 2)'
  );
  const [goodsReceivedNotes, setGoodsReceivedNotes] = useState<string>(
    existingReport?.goodsReceivedNotes || 'Penerimaan faktur PBF Anugrah Pharmindo: 3 koli barang sirup & obat generik. Batch & ED terverifikasi.'
  );
  const [dailyTasksSummary, setDailyTasksSummary] = useState<string>(
    existingReport?.dailyTasksSummary || 'Pelayanan 25 resep dokter, penyerahan obat & Pelayanan Informasi Obat (PIO) ke pasien rawat jalan, pengecekan kebersihan etalase dan suhu kulkas penyimpanan insulin.'
  );
  const [incidentReport, setIncidentReport] = useState<string>(
    existingReport?.incidentReport || 'Tidak ada komplain atau kendala fatal selama shift berjalan.'
  );

  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const handleSubmit = (status: 'draft' | 'terkirim') => {
    const reportData: DailyReport = {
      id: existingReport?.id || `rep-${Date.now()}`,
      employeeId: currentEmployee.id,
      employeeName: currentEmployee.name,
      employeeRole: currentEmployee.role,
      date: today,
      shiftName,
      prescriptionsCount: Number(prescriptionsCount),
      otcSalesCount: Number(otcSalesCount),
      temperatureLog: {
        fridgeTemp: Number(fridgeTemp),
        roomTemp: Number(roomTemp),
        humidity: Number(humidity)
      },
      lowStockItems,
      goodsReceivedNotes,
      dailyTasksSummary,
      incidentReport,
      status: status,
      verifiedBy: existingReport?.verifiedBy,
      verifiedAt: existingReport?.verifiedAt,
      supervisorFeedback: existingReport?.supervisorFeedback,
      createdAt: existingReport?.createdAt || `${today} 14:00:00`,
      updatedAt: new Date().toLocaleTimeString('id-ID')
    };

    onSaveReport(reportData);
    setNotificationMsg(
      status === 'terkirim'
        ? 'Laporan harian berhasil dikirimkan ke Apoteker Pengelola Apotek (APA) untuk diverifikasi!'
        : 'Draf laporan harian berhasil disimpan!'
    );

    setTimeout(() => {
      setNotificationMsg(null);
    }, 4000);
  };

  const isVerified = existingReport?.status === 'diverifikasi';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header card */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span>Apotek Assyifa Farma Cideres</span>
            <span aria-hidden="true">·</span>
            <span>Standar Pelayanan Kefarmasian</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-700" />
            <span>Formulir Laporan Harian Tugas Karyawan</span>
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Tanggal: <strong className="text-slate-900">{formatIndonesianDate(today)}</strong> · Pelapor: <strong className="text-slate-900">{currentEmployee.name}</strong> ({currentEmployee.role})
          </p>
        </div>

        <div className="flex items-center gap-2">
          {existingReport && (
            <span
              className={`text-xs px-2.5 py-1 rounded font-medium ${
                isVerified
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : existingReport.status === 'terkirim'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-slate-100 text-slate-700 border border-slate-300'
              }`}
            >
              Status: {isVerified ? 'Diverifikasi APA' : existingReport.status === 'terkirim' ? 'Menunggu Verifikasi APA' : 'Draf'}
            </span>
          )}
          <button
            type="button"
            onClick={() => window.print()}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
            title="Cetak Salinan Laporan"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {notificationMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-medium flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Verification Feedback Banner if already verified by APA */}
      {isVerified && existingReport?.supervisorFeedback && (
        <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-1">
          <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>Catatan Verifikasi Apoteker Pengelola Apotek ({existingReport.verifiedBy}):</span>
          </div>
          <p className="text-xs text-emerald-900 pl-5">
            "{existingReport.supervisorFeedback}"
          </p>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit('terkirim');
        }}
        className="space-y-6"
      >
        {/* Section 1: Informasi Shift & Metrik Penjualan Obat */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-emerald-700" />
            <span>1. Informasi Shift & Volume Pelayanan Pasien</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jadwal Shift Tugas:
              </label>
              <select
                value={shiftName}
                onChange={(e) => setShiftName(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
              >
                {shifts.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name} ({s.startTime} - {s.endTime})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jumlah Resep Dokter Terlayani:
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={prescriptionsCount}
                  onChange={(e) => setPrescriptionsCount(Number(e.target.value))}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 font-mono tabular-nums"
                  required
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400">resep</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Transaksi Obat Bebas (OTC) & Alkes:
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={otcSalesCount}
                  onChange={(e) => setOtcSalesCount(Number(e.target.value))}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 font-mono tabular-nums"
                  required
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400">transaksi</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Pemantauan Suhu & Kelembaban (Standar BPOM Farmasi) */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-emerald-700" />
              <span>2. Log Pemantauan Suhu & Kelembaban Farmasi</span>
            </h2>
            <span className="text-[11px] text-slate-500">Standar Permenkes 73 / BPOM</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Suhu Kulkas Vaksin/Obat (Standar: 2°C - 8°C):
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={fridgeTemp}
                  onChange={(e) => setFridgeTemp(Number(e.target.value))}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 font-mono tabular-nums"
                  required
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400">°C</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                {fridgeTemp >= 2 && fridgeTemp <= 8 ? '✓ Suhu kulkas normal' : '⚠ Periksa thermostat kulkas'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Suhu Ruang Farmasi (Standar: {'<'} 25°C):
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={roomTemp}
                  onChange={(e) => setRoomTemp(Number(e.target.value))}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 font-mono tabular-nums"
                  required
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400">°C</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                {roomTemp <= 25 ? '✓ Suhu ruangan ber-AC ideal' : '⚠ Suhu ruang melebihi 25°C'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kelembaban Udara (Standar: 40% - 60%):
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={humidity}
                  onChange={(e) => setHumidity(Number(e.target.value))}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 font-mono tabular-nums"
                  required
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400">% RH</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Pengelolaan Stok Obat & Penerimaan Faktur */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Pill className="w-4 h-4 text-emerald-700" />
            <span>3. Pengendalian Stok Obat & Penerimaan Barang PBF</span>
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Obat Menipis / Kritis (Perlu Order Ulang ke Distributor):
              </label>
              <textarea
                rows={2}
                value={lowStockItems}
                onChange={(e) => setLowStockItems(e.target.value)}
                placeholder="Tuliskan nama obat, bentuk sediaan, dan sisa stok fisik..."
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Penerimaan Barang Datang (Faktur PBF):
              </label>
              <textarea
                rows={2}
                value={goodsReceivedNotes}
                onChange={(e) => setGoodsReceivedNotes(e.target.value)}
                placeholder="Contoh: Datang PBF Enseval / KFTD, No Faktur, kesesuaian expired date..."
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Uraian Kegiatan Harian & Kejadian Khusus */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-700" />
            <span>4. Rangkuman Aktivitas & Kendala Shift</span>
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Rangkuman Pekerjaan yang Telah Diselesaikan:
              </label>
              <textarea
                rows={3}
                value={dailyTasksSummary}
                onChange={(e) => setDailyTasksSummary(e.target.value)}
                placeholder="Tuliskan uraian pekerjaan: peracikan obat, konseling pasien, stok opname harian..."
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kejadian Khusus / Kendala / Catatan untuk Shift Berikutnya:
              </label>
              <textarea
                rows={2}
                value={incidentReport}
                onChange={(e) => setIncidentReport(e.target.value)}
                placeholder="Catatan titipan resep, pasien komplain, atau instruksi handover shift..."
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 no-print">
          <button
            type="button"
            onClick={() => handleSubmit('draft')}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4 text-slate-500" />
            <span>Simpan Sebagai Draf</span>
          </button>

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Kirim Laporan Harian ke APA</span>
          </button>
        </div>
      </form>

    </div>
  );
};
