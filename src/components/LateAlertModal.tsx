import React, { useState } from 'react';
import { AlertTriangle, Send, CheckCircle2, Clock, MapPin, X } from 'lucide-react';
import { generateWhatsAppLateNotificationUrl } from '../utils/date';
import { PharmacySettings, AttendanceRecord } from '../types';

interface LateAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: AttendanceRecord | null;
  settings: PharmacySettings;
  onSubmitReason: (reason: string, category: AttendanceRecord['lateReasonCategory']) => void;
}

const COMMON_REASONS: AttendanceRecord['lateReasonCategory'][] = [
  'Macet',
  'Kendala Cuaca / Hujan',
  'Kerusakan Kendaraan',
  'Keperluan Darurat Medis',
  'Lainnya'
];

export const LateAlertModal: React.FC<LateAlertModalProps> = ({
  isOpen,
  onClose,
  record,
  settings,
  onSubmitReason
}) => {
  if (!isOpen || !record) return null;

  const [category, setCategory] = useState<AttendanceRecord['lateReasonCategory']>('Macet');
  const [detailReason, setDetailReason] = useState<string>(record.lateReason || '');
  const [hasSentWhatsApp, setHasSentWhatsApp] = useState<boolean>(record.notificationDispatched);

  const handleSendWhatsApp = () => {
    const fullReason = detailReason.trim()
      ? `[${category}] ${detailReason.trim()}`
      : `[${category}]`;

    const url = generateWhatsAppLateNotificationUrl({
      supervisorPhone: settings.supervisorPhone,
      pharmacyName: settings.pharmacyName,
      employeeName: record.employeeName,
      employeeRole: record.employeeRole,
      shiftName: record.shiftName,
      scheduledTime: record.scheduledStartTime,
      clockInTime: record.clockInTime || '-',
      lateMinutes: record.lateMinutes,
      reason: fullReason
    });

    window.open(url, '_blank', 'noopener,noreferrer');
    setHasSentWhatsApp(true);
    onSubmitReason(fullReason, category);
  };

  const handleSaveOnly = () => {
    const fullReason = detailReason.trim()
      ? `[${category}] ${detailReason.trim()}`
      : `[${category}] Alasan dicatat pada sistem`;
    onSubmitReason(fullReason, category);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Alert Strip */}
        <div className="bg-rose-50 border-b border-rose-200 p-4 sm:p-5 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-600 text-white rounded-lg shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-rose-950">
                Pemberitahuan Keterlambatan Otomatis
              </h2>
              <p className="text-xs text-rose-800 mt-0.5">
                Sistem mendeteksi presensi hadir melebihi jadwal batas toleransi shift.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Summary Breakdown */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 border border-slate-200/80 rounded-lg text-xs">
            <div>
              <span className="text-slate-500 block">Karyawan:</span>
              <span className="font-semibold text-slate-900 block truncate">{record.employeeName}</span>
              <span className="text-slate-500 block mt-0.5">{record.employeeRole}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Jadwal Shift:</span>
              <span className="font-semibold text-slate-900 block">{record.shiftName} ({record.scheduledStartTime} WIB)</span>
              <span className="text-rose-700 font-bold block mt-0.5 tabular-nums">
                Terlambat {record.lateMinutes} Menit
              </span>
            </div>
            <div className="col-span-2 pt-2 border-t border-slate-200 flex items-center justify-between text-slate-600">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Waktu Presensi: <strong className="tabular-nums text-slate-900">{record.clockInTime} WIB</strong></span>
              </div>
              {record.clockInLocation && (
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <MapPin className="w-3 h-3 text-emerald-600" />
                  <span>Radius: {record.clockInLocation.distanceMeters}m</span>
                </div>
              )}
            </div>
          </div>

          {/* Form: Alasan Keterlambatan */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Kategori Kendala / Alasan:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setCategory(r)}
                  className={`px-2.5 py-1 text-xs rounded-md border transition-colors cursor-pointer ${
                    category === r
                      ? 'bg-slate-900 text-white border-slate-900 font-medium'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <label className="block text-xs font-semibold text-slate-700 pt-2">
              Keterangan Rinci (Opsional):
            </label>
            <textarea
              rows={3}
              value={detailReason}
              onChange={(e) => setDetailReason(e.target.value)}
              placeholder="Contoh: Ban motor bocor di perempatan Dawuan, antre tambal ban 20 menit..."
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 bg-white"
            />
          </div>

          {/* Auto WhatsApp Dispatch Section */}
          <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-lg flex items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-semibold text-emerald-950 block">
                Notifikasi WhatsApp Pimpinan
              </span>
              <span className="text-emerald-800 text-[11px] block">
                Tujuan: {settings.supervisorName} ({settings.supervisorPhone})
              </span>
            </div>
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-lg text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{hasSentWhatsApp ? 'Kirim Ulang WA' : 'Kirim WA Otomatis'}</span>
            </button>
          </div>

          {hasSentWhatsApp && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Format pesan WhatsApp telah diteruskan ke pimpinan.</span>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3.5 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={handleSaveOnly}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Simpan Alasan & Lanjutkan
          </button>
          <button
            type="button"
            onClick={() => {
              if (!hasSentWhatsApp && settings.autoSendWhatsAppPrompt) {
                handleSendWhatsApp();
              } else {
                handleSaveOnly();
              }
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Selesai & Masuk Tugas
          </button>
        </div>

      </div>
    </div>
  );
};
