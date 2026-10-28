import React, { useState, useEffect } from 'react';
import {
  Employee,
  Shift,
  AttendanceRecord,
  AttendanceStatus,
  PharmacySettings
} from '../types';
import {
  X,
  UserCheck,
  Calendar,
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle,
  Save,
  Image as ImageIcon,
  Search
} from 'lucide-react';
import { calculateLateStatus, getIndonesianCurrentDateString } from '../utils/date';

interface ManualAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  shifts: Shift[];
  settings: PharmacySettings;
  existingRecord?: AttendanceRecord | null;
  selectedDate?: string;
  onSave: (record: AttendanceRecord) => void;
}

export const ManualAttendanceModal: React.FC<ManualAttendanceModalProps> = ({
  isOpen,
  onClose,
  employees,
  shifts,
  settings,
  existingRecord,
  selectedDate,
  onSave
}) => {
  if (!isOpen) return null;

  const today = getIndonesianCurrentDateString();
  const isEditing = !!existingRecord;

  const [employeeId, setEmployeeId] = useState<string>(
    existingRecord?.employeeId || employees[0]?.id || ''
  );
  const [date, setDate] = useState<string>(
    existingRecord?.date || selectedDate || today
  );
  const [shiftId, setShiftId] = useState<string>(
    existingRecord?.shiftId || shifts[0]?.id || ''
  );
  const [status, setStatus] = useState<AttendanceStatus>(
    existingRecord?.status || 'tepat_waktu'
  );
  const [clockInTime, setClockInTime] = useState<string>(
    existingRecord?.clockInTime || '07:25'
  );
  const [clockOutTime, setClockOutTime] = useState<string>(
    existingRecord?.clockOutTime || '15:05'
  );
  const [lateMinutes, setLateMinutes] = useState<number>(
    existingRecord?.lateMinutes || 0
  );
  const [reason, setReason] = useState<string>(
    existingRecord?.lateReason || ''
  );
  const [adminNote, setAdminNote] = useState<string>(
    existingRecord?.adminNote || (isEditing ? '' : 'Diinput manual oleh Admin / Apoteker Pengelola Apotek (APA)')
  );
  const [photoUrl, setPhotoUrl] = useState<string>(
    existingRecord?.clockInPhoto || ''
  );
  const [employeeSearch, setEmployeeSearch] = useState<string>('');

  const filteredEmployees = employees.filter((emp) => {
    if (!employeeSearch.trim()) return true;
    const q = employeeSearch.toLowerCase();
    return (
      emp.name.toLowerCase().includes(q) ||
      emp.nip.toLowerCase().includes(q) ||
      emp.role.toLowerCase().includes(q)
    );
  });

  const selectedEmployee = employees.find((e) => e.id === employeeId) || employees[0];
  const selectedShift = shifts.find((s) => s.id === shiftId) || shifts[0];

  // Auto calculate late status if clock-in changes and status is related to attendance
  useEffect(() => {
    if (status === 'tepat_waktu' || status === 'terlambat') {
      if (clockInTime && selectedShift) {
        const result = calculateLateStatus(
          selectedShift.startTime,
          clockInTime,
          selectedShift.gracePeriodMinutes
        );
        if (result.isLate) {
          setStatus('terlambat');
          setLateMinutes(result.lateMinutes);
        } else {
          setStatus('tepat_waktu');
          setLateMinutes(0);
        }
      }
    }
  }, [clockInTime, shiftId]);

  // When employee changes, default photo if empty
  useEffect(() => {
    if (!photoUrl && selectedEmployee) {
      setPhotoUrl(selectedEmployee.avatar);
    }
  }, [employeeId, selectedEmployee, photoUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isPresent = status === 'tepat_waktu' || status === 'terlambat';
    const isLate = status === 'terlambat';

    const recordToSave: AttendanceRecord = {
      id: existingRecord?.id || `att-man-${Date.now()}`,
      employeeId: selectedEmployee.id,
      employeeName: selectedEmployee.name,
      employeeRole: selectedEmployee.role,
      date: date,
      shiftId: selectedShift.id,
      shiftName: selectedShift.name,
      scheduledStartTime: selectedShift.startTime,
      scheduledEndTime: selectedShift.endTime,
      clockInTime: isPresent ? (clockInTime ? `${clockInTime}:00` : null) : null,
      clockInPhoto: isPresent ? (photoUrl || selectedEmployee.avatar) : null,
      clockInLocation: isPresent
        ? {
            lat: settings.latitude,
            lng: settings.longitude,
            address: `${settings.pharmacyAddress} (Verifikasi Manual Admin)`,
            distanceMeters: 0,
            isWithinRadius: true
          }
        : null,
      clockOutTime: isPresent && clockOutTime ? `${clockOutTime}:00` : null,
      clockOutPhoto: isPresent ? (photoUrl || selectedEmployee.avatar) : null,
      status: status,
      lateMinutes: isLate ? Number(lateMinutes) : 0,
      lateReason: isLate ? (reason || 'Keterangan dicatat oleh admin') : (status !== 'tepat_waktu' ? reason : null),
      lateStatusAcknowledged: true,
      adminNote: adminNote || 'Disahkan oleh Admin / APA',
      notificationDispatched: false
    };

    onSave(recordToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-lg">
              <UserCheck className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                {isEditing ? 'Edit Data Presensi Karyawan' : 'Input Presensi Manual oleh Admin'}
              </h2>
              <p className="text-xs text-emerald-100">
                Apotek Assyifa Farma Cideres · Entri kehadiran & izin staf
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          
          {/* Employee & Date row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Nama Karyawan:
              </label>
              
              {!isEditing ? (
                <div className="space-y-2">
                  {/* Search box for employees */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={employeeSearch}
                      onChange={(e) => setEmployeeSearch(e.target.value)}
                      placeholder="Ketik cari nama, NIP, atau jabatan..."
                      className="w-full text-xs pl-8 pr-7 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
                    />
                    {employeeSearch && (
                      <button
                        type="button"
                        onClick={() => setEmployeeSearch('')}
                        className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 p-0.5"
                        title="Hapus pencarian"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Dropdown list of filtered employees */}
                  <select
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 font-medium text-slate-900"
                  >
                    {filteredEmployees.length > 0 ? (
                      filteredEmployees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} — {emp.role} (NIP: {emp.nip})
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        Tidak ada staf yang cocok dengan "{employeeSearch}"
                      </option>
                    )}
                  </select>

                  {/* Selected employee info badge */}
                  {selectedEmployee && (
                    <div className="flex items-center gap-2.5 p-2 bg-emerald-50/70 border border-emerald-200 rounded-lg">
                      <img
                        src={selectedEmployee.avatar}
                        alt={selectedEmployee.name}
                        className="w-7 h-7 rounded-full object-cover border border-emerald-300"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {selectedEmployee.name}
                        </div>
                        <div className="text-[10px] text-emerald-800 font-medium truncate">
                          {selectedEmployee.role} · NIP: {selectedEmployee.nip}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2.5 p-2.5 bg-slate-100 border border-slate-300 rounded-lg">
                  <img
                    src={selectedEmployee.avatar}
                    alt={selectedEmployee.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-300"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900">{selectedEmployee.name}</div>
                    <div className="text-[10px] text-slate-500">{selectedEmployee.role} · NIP: {selectedEmployee.nip}</div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Tanggal Presensi:
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 font-mono tabular-nums text-slate-900"
                required
              />
            </div>
          </div>

          {/* Shift & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Jadwal Shift:
              </label>
              <select
                value={shiftId}
                onChange={(e) => setShiftId(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 font-medium text-slate-900"
              >
                {shifts.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.startTime} - {s.endTime})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Status Kehadiran:
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AttendanceStatus)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 font-semibold text-slate-900"
              >
                <option value="tepat_waktu">Hadir - Tepat Waktu</option>
                <option value="terlambat">Hadir - Terlambat</option>
                <option value="izin">Izin (Dengan Keterangan)</option>
                <option value="sakit">Sakit (Surat Dokter)</option>
                <option value="cuti">Cuti Tahunan / Bersalin</option>
                <option value="dinas_luar">Dinas Luar (BPOM/Dinkes/PBF)</option>
                <option value="alpha">Alpha (Tanpa Keterangan)</option>
              </select>
            </div>
          </div>

          {/* If Present: Clock In and Out Timers */}
          {(status === 'tepat_waktu' || status === 'terlambat') && (
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3">
              <div className="font-semibold text-slate-900 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Waktu Jam Kerja Karyawan</span>
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  Jadwal Shift: {selectedShift.startTime} - {selectedShift.endTime}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Jam Masuk (Clock-in):
                  </label>
                  <input
                    type="time"
                    value={clockInTime}
                    onChange={(e) => setClockInTime(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded font-mono tabular-nums text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Jam Pulang (Clock-out):
                  </label>
                  <input
                    type="time"
                    value={clockOutTime}
                    onChange={(e) => setClockOutTime(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded font-mono tabular-nums text-slate-900"
                  />
                </div>
              </div>

              {status === 'terlambat' && (
                <div className="pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-rose-700 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Keterlambatan (Menit):</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={lateMinutes}
                      onChange={(e) => setLateMinutes(Number(e.target.value))}
                      className="w-24 text-xs p-1.5 bg-white border border-rose-300 rounded text-right font-mono font-bold text-rose-700 tabular-nums"
                      required
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Keterangan / Alasan */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              Alasan / Keterangan (Wajib jika Terlambat, Izin, atau Sakit):
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Contoh: Surat keterangan dokter dari RSUD Majalengka terlampir..."
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {/* Catatan Admin / APA */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              Catatan Pengesahan Admin / Apoteker Penanggung Jawab:
            </label>
            <textarea
              rows={2}
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Tambahkan catatan dispensasi, bukti fisik, atau keterangan pimpinan..."
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Simpan Perubahan' : 'Catat Presensi Manual'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
