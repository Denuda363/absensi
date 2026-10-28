import React, { useState } from 'react';
import {
  PharmacySettings,
  Shift,
  Employee,
  EmployeeDayOff,
  DayOffSwapRecord,
  DayOfWeek
} from '../types';
import {
  Settings,
  Clock,
  MapPin,
  Phone,
  Volume2,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  Plus,
  Trash2,
  Copy,
  Layers,
  ArrowRight,
  Shield,
  EyeOff,
  Eye,
  KeyRound,
  Lock,
  Calendar,
  CalendarDays,
  ArrowLeftRight,
  RotateCcw,
  Coffee,
  Check,
  AlertCircle
} from 'lucide-react';
import { playLateAlertChime, playSuccessChime } from '../utils/audio';
import { getIndonesianCurrentDateString, formatIndonesianDate } from '../utils/date';

interface AdminSettingsProps {
  settings: PharmacySettings;
  shifts: Shift[];
  employees: Employee[];
  dayOffs: EmployeeDayOff[];
  dayOffSwaps: DayOffSwapRecord[];
  onSaveSettings: (settings: PharmacySettings, shifts: Shift[]) => void;
  onUpdateDayOffs: (dayOffs: EmployeeDayOff[]) => void;
  onAddSwapRecord: (swap: DayOffSwapRecord) => void;
  onCancelSwapRecord: (swapId: string) => void;
}

const DAYS_OF_WEEK: DayOfWeek[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  settings,
  shifts,
  employees,
  dayOffs,
  dayOffSwaps,
  onSaveSettings,
  onUpdateDayOffs,
  onAddSwapRecord,
  onCancelSwapRecord
}) => {
  const [formData, setFormData] = useState<PharmacySettings>({ ...settings });
  const [shiftsData, setShiftsData] = useState<Shift[]>([...shifts]);
  const [dayOffsData, setDayOffsData] = useState<EmployeeDayOff[]>([...dayOffs]);
  const [dayOffSwapsData, setDayOffSwapsData] = useState<DayOffSwapRecord[]>([...dayOffSwaps]);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [showPin, setShowPin] = useState<boolean>(false);

  // Day Off UI state
  const [scheduleTab, setScheduleTab] = useState<'jadwal' | 'tukar' | 'riwayat' | 'matriks'>('jadwal');
  const [newDateInputs, setNewDateInputs] = useState<Record<string, string>>({});
  
  // Swap Form State
  const todayDate = getIndonesianCurrentDateString();
  const [swapForm, setSwapForm] = useState<{
    emp1Id: string;
    date1: string;
    mode: 'rekan' | 'geser';
    emp2Id: string;
    date2: string;
    reason: string;
  }>({
    emp1Id: employees[1]?.id || employees[0]?.id || '',
    date1: todayDate,
    mode: 'rekan',
    emp2Id: employees[2]?.id || employees[1]?.id || '',
    date2: todayDate,
    reason: ''
  });
  const [swapSuccessMessage, setSwapSuccessMessage] = useState<string | null>(null);
  const [swapErrorMessage, setSwapErrorMessage] = useState<string | null>(null);

  const handleShiftChange = (index: number, field: keyof Shift, value: string | number) => {
    const updated = [...shiftsData];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setShiftsData(updated);
  };

  // Add new custom shift
  const handleAddShift = () => {
    const shiftNumber = shiftsData.length + 1;
    const newShift: Shift = {
      id: `shift-custom-${Date.now()}`,
      name: `Shift ${shiftNumber}`,
      startTime: '08:00',
      endTime: '16:00',
      gracePeriodMinutes: 10,
      description: `Pelayanan farmasi dan tugas operasional Shift ${shiftNumber}`
    };
    setShiftsData([...shiftsData, newShift]);
  };

  // Duplicate shift
  const handleDuplicateShift = (index: number) => {
    const source = shiftsData[index];
    const duplicated: Shift = {
      ...source,
      id: `shift-copy-${Date.now()}`,
      name: `${source.name} (Salinan)`
    };
    const updated = [...shiftsData];
    updated.splice(index + 1, 0, duplicated);
    setShiftsData(updated);
  };

  // Delete shift
  const handleDeleteShift = (index: number) => {
    if (shiftsData.length <= 1) {
      alert('Sistem harus memiliki minimal 1 shift aktif!');
      return;
    }
    const updated = shiftsData.filter((_, i) => i !== index);
    setShiftsData(updated);
  };

  // Preset templates
  const applyPreset1Shift = () => {
    setShiftsData([
      {
        id: 'shift-tunggal',
        name: 'Shift Tunggal / Normal',
        startTime: '08:00',
        endTime: '17:00',
        gracePeriodMinutes: 15,
        description: 'Jam operasional satu shift penuh, pelayanan resep & konseling pasien'
      }
    ]);
  };

  const applyPreset2Shifts = () => {
    setShiftsData([
      {
        id: 'shift-pagi',
        name: 'Shift Pagi',
        startTime: '07:30',
        endTime: '15:00',
        gracePeriodMinutes: 10,
        description: 'Pelayanan resep pagi, penyiapan etalase, cek suhu kulkas obat & vaksin'
      },
      {
        id: 'shift-siang',
        name: 'Shift Siang',
        startTime: '14:30',
        endTime: '22:00',
        gracePeriodMinutes: 10,
        description: 'Pelayanan resep sore/malam, penerimaan faktur PBF, rekap kas harian'
      }
    ]);
  };

  const applyPreset3Shifts = () => {
    setShiftsData([
      {
        id: 'shift-pagi',
        name: 'Shift Pagi',
        startTime: '07:00',
        endTime: '15:00',
        gracePeriodMinutes: 10,
        description: 'Pelayanan resep pagi, cek suhu kulkas vaksin, penataan etalase'
      },
      {
        id: 'shift-siang',
        name: 'Shift Siang',
        startTime: '14:30',
        endTime: '21:30',
        gracePeriodMinutes: 10,
        description: 'Pelayanan resep sore, rekap transaksi kasir & penerimaan barang PBF'
      },
      {
        id: 'shift-malam',
        name: 'Shift Malam (24 Jam)',
        startTime: '21:00',
        endTime: '07:30',
        gracePeriodMinutes: 15,
        description: 'Jaga darurat malam, pelayanan obat cito/mendesak, closing laporan harian'
      }
    ]);
  };

  const applyPreset4Shifts = () => {
    setShiftsData([
      {
        id: 'shift-pagi',
        name: 'Shift Pagi',
        startTime: '07:00',
        endTime: '14:00',
        gracePeriodMinutes: 10,
        description: 'Pelayanan resep pagi & cek suhu kulkas'
      },
      {
        id: 'shift-middle',
        name: 'Shift Middle (Siang)',
        startTime: '11:00',
        endTime: '19:00',
        gracePeriodMinutes: 10,
        description: 'Bantuan jam sibuk siang/sore & penerimaan obat'
      },
      {
        id: 'shift-sore',
        name: 'Shift Sore',
        startTime: '14:00',
        endTime: '21:30',
        gracePeriodMinutes: 10,
        description: 'Pelayanan sore & rekap transaksi harian'
      },
      {
        id: 'shift-malam',
        name: 'Shift Malam',
        startTime: '21:00',
        endTime: '07:30',
        gracePeriodMinutes: 15,
        description: 'Jaga malam darurat farmasi 24 jam'
      }
    ]);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData, shiftsData);
    setSaveMessage('Pengaturan kustomisasi shift dan data apotek berhasil disimpan secara permanen!');
    setTimeout(() => {
      setSaveMessage(null);
    }, 4000);
  };

  const handleTestAudio = () => {
    playLateAlertChime();
  };

  // Helper to ensure employee day off record exists
  const getEmployeeDayOff = (empId: string): EmployeeDayOff => {
    const existing = dayOffsData.find(d => d.employeeId === empId);
    if (existing) return existing;
    const emp = employees.find(e => e.id === empId);
    return {
      id: `dayoff-${empId}`,
      employeeId: empId,
      employeeName: emp?.name || 'Karyawan',
      regularDayOff: 'Minggu',
      specificDatesOff: [],
      notes: 'Libur rotasi'
    };
  };

  // Helper: calculate upcoming routine days off and custom off dates for an employee
  const getUpcomingOffDayOptions = (employeeId: string): { dateStr: string; label: string; type: 'rutin' | 'khusus' }[] => {
    const emp = employees.find((e) => e.id === employeeId);
    const offRecord = dayOffsData.find((d) => d.employeeId === employeeId);
    if (!emp) return [];

    const regDay = offRecord?.regularDayOff || 'Minggu';
    const dayNameToIndex: Record<string, number> = {
      'Minggu': 0,
      'Senin': 1,
      'Selasa': 2,
      'Rabu': 3,
      'Kamis': 4,
      'Jumat': 5,
      'Sabtu': 6
    };

    const targetDayIdx = dayNameToIndex[regDay] ?? 0;
    const options: { dateStr: string; label: string; type: 'rutin' | 'khusus' }[] = [];

    const today = new Date();
    // Calculate the next 4 weekly occurrences of their regular day off
    for (let i = 0; i < 35; i++) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
      if (d.getDay() === targetDayIdx) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;
        const dateLabel = formatIndonesianDate(dateStr);
        const relativeTag = i <= 6 ? '(Pekan Ini)' : i <= 13 ? '(Pekan Depan)' : '';
        options.push({
          dateStr,
          label: `${regDay}, ${dateLabel} ${relativeTag} — Libur Rutin`,
          type: 'rutin'
        });
        if (options.filter(o => o.type === 'rutin').length >= 4) break;
      }
    }

    // Add specific dates off if any
    if (offRecord?.specificDatesOff && offRecord.specificDatesOff.length > 0) {
      offRecord.specificDatesOff.forEach((specDate) => {
        if (!options.some((o) => o.dateStr === specDate)) {
          options.push({
            dateStr: specDate,
            label: `${formatIndonesianDate(specDate)} — Libur Khusus / Pengganti`,
            type: 'khusus'
          });
        }
      });
    }

    // Sort by date string ascending
    options.sort((a, b) => a.dateStr.localeCompare(b.dateStr));
    return options;
  };

  // Update regular day of week off
  const handleUpdateRegularDayOff = (employeeId: string, day: DayOfWeek) => {
    let exists = false;
    const updated = dayOffsData.map(d => {
      if (d.employeeId === employeeId) {
        exists = true;
        return { ...d, regularDayOff: day };
      }
      return d;
    });
    const finalData = exists ? updated : [...updated, {
      id: `dayoff-${employeeId}`,
      employeeId,
      employeeName: employees.find(e => e.id === employeeId)?.name || 'Karyawan',
      regularDayOff: day,
      specificDatesOff: []
    }];
    setDayOffsData(finalData);
    onUpdateDayOffs(finalData);
    playSuccessChime();
  };

  // Add specific holiday / date off
  const handleAddSpecificDate = (employeeId: string) => {
    const date = newDateInputs[employeeId];
    if (!date) return;
    let exists = false;
    const updated = dayOffsData.map(d => {
      if (d.employeeId === employeeId) {
        exists = true;
        if (d.specificDatesOff.includes(date)) return d;
        return { ...d, specificDatesOff: [...d.specificDatesOff, date].sort() };
      }
      return d;
    });
    const finalData = exists ? updated : [...updated, {
      id: `dayoff-${employeeId}`,
      employeeId,
      employeeName: employees.find(e => e.id === employeeId)?.name || 'Karyawan',
      regularDayOff: 'Minggu' as DayOfWeek,
      specificDatesOff: [date]
    }];
    setDayOffsData(finalData);
    onUpdateDayOffs(finalData);
    setNewDateInputs({ ...newDateInputs, [employeeId]: '' });
    playSuccessChime();
  };

  // Remove specific date off
  const handleRemoveSpecificDate = (employeeId: string, date: string) => {
    const updated = dayOffsData.map(d => {
      if (d.employeeId === employeeId) {
        return { ...d, specificDatesOff: d.specificDatesOff.filter(x => x !== date) };
      }
      return d;
    });
    setDayOffsData(updated);
    onUpdateDayOffs(updated);
  };

  // Execute day off swap
  const handleExecuteSwap = (e: React.FormEvent) => {
    e.preventDefault();
    setSwapErrorMessage(null);
    setSwapSuccessMessage(null);

    const emp1 = employees.find(e => e.id === swapForm.emp1Id);
    if (!emp1) {
      setSwapErrorMessage('Pilih karyawan pemohon pertukaran.');
      return;
    }

    if (!swapForm.date1) {
      setSwapErrorMessage('Tentukan tanggal libur asal karyawan.');
      return;
    }

    if (swapForm.mode === 'rekan') {
      if (!swapForm.emp2Id || swapForm.emp1Id === swapForm.emp2Id) {
        setSwapErrorMessage('Pilih rekan kerja yang berbeda untuk ditukar jadwal liburnya.');
        return;
      }
      if (!swapForm.date2) {
        setSwapErrorMessage('Tentukan tanggal libur rekan kerja yang ditukar.');
        return;
      }

      const emp2 = employees.find(e => e.id === swapForm.emp2Id);
      if (!emp2) {
        setSwapErrorMessage('Rekan kerja tidak ditemukan.');
        return;
      }

      const newSwap: DayOffSwapRecord = {
        id: `swap-${Date.now()}`,
        employeeId1: emp1.id,
        employeeName1: emp1.name,
        originalDate1: swapForm.date1,
        newDate1: swapForm.date2,
        employeeId2: emp2.id,
        employeeName2: emp2.name,
        originalDate2: swapForm.date2,
        newDate2: swapForm.date1,
        reason: swapForm.reason || 'Pertukaran jadwal operasional apotek',
        status: 'disetujui',
        approvedBy: 'Apt. Siti Nurhaliza, S.Farm (APA)',
        createdAt: new Date().toLocaleString('id-ID')
      };

      // Update both employees' specific dates
      const updatedDayOffs = dayOffsData.map(d => {
        if (d.employeeId === emp1.id) {
          const filtered = d.specificDatesOff.filter(x => x !== swapForm.date1);
          return { ...d, specificDatesOff: Array.from(new Set([...filtered, swapForm.date2])) };
        }
        if (d.employeeId === emp2.id) {
          const filtered = d.specificDatesOff.filter(x => x !== swapForm.date2);
          return { ...d, specificDatesOff: Array.from(new Set([...filtered, swapForm.date1])) };
        }
        return d;
      });

      setDayOffsData(updatedDayOffs);
      onUpdateDayOffs(updatedDayOffs);
      const nextSwaps = [newSwap, ...dayOffSwapsData];
      setDayOffSwapsData(nextSwaps);
      onAddSwapRecord(newSwap);

      setSwapSuccessMessage(`Pertukaran hari libur ${emp1.name} (${swapForm.date1}) dengan ${emp2.name} (${swapForm.date2}) berhasil disetujui & dicatat!`);
      playSuccessChime();
    } else {
      // Geser tanggal sendiri
      if (!swapForm.date2) {
        setSwapErrorMessage('Tentukan tanggal libur pengganti baru.');
        return;
      }

      const newSwap: DayOffSwapRecord = {
        id: `swap-${Date.now()}`,
        employeeId1: emp1.id,
        employeeName1: emp1.name,
        originalDate1: swapForm.date1,
        newDate1: swapForm.date2,
        reason: swapForm.reason || 'Pergeseran jadwal libur staf apotek',
        status: 'disetujui',
        approvedBy: 'Apt. Siti Nurhaliza, S.Farm (APA)',
        createdAt: new Date().toLocaleString('id-ID')
      };

      const updatedDayOffs = dayOffsData.map(d => {
        if (d.employeeId === emp1.id) {
          const filtered = d.specificDatesOff.filter(x => x !== swapForm.date1);
          return { ...d, specificDatesOff: Array.from(new Set([...filtered, swapForm.date2])) };
        }
        return d;
      });

      setDayOffsData(updatedDayOffs);
      onUpdateDayOffs(updatedDayOffs);
      const nextSwaps = [newSwap, ...dayOffSwapsData];
      setDayOffSwapsData(nextSwaps);
      onAddSwapRecord(newSwap);

      setSwapSuccessMessage(`Pergeseran hari libur untuk ${emp1.name} dari ${swapForm.date1} ke ${swapForm.date2} berhasil disetujui!`);
      playSuccessChime();
    }
  };

  // Revert / cancel swap
  const handleCancelSwap = (swap: DayOffSwapRecord) => {
    if (!confirm('Batalkan pertukaran hari libur ini dan kembalikan jadwal semula?')) {
      return;
    }
    const updatedDayOffs = dayOffsData.map(d => {
      if (d.employeeId === swap.employeeId1) {
        const filtered = d.specificDatesOff.filter(x => x !== swap.newDate1);
        return { ...d, specificDatesOff: Array.from(new Set([...filtered, swap.originalDate1])) };
      }
      if (swap.employeeId2 && d.employeeId === swap.employeeId2 && swap.originalDate2) {
        const filtered = d.specificDatesOff.filter(x => x !== (swap.newDate2 || ''));
        return { ...d, specificDatesOff: Array.from(new Set([...filtered, swap.originalDate2])) };
      }
      return d;
    });

    const updatedSwaps = dayOffSwapsData.map(s => s.id === swap.id ? { ...s, status: 'dibatalkan' as const } : s);
    setDayOffsData(updatedDayOffs);
    onUpdateDayOffs(updatedDayOffs);
    setDayOffSwapsData(updatedSwaps);
    onCancelSwapRecord(swap.id);
    playSuccessChime();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <span>Apotek Assyifa Farma Cideres</span>
            <span aria-hidden="true">·</span>
            <span>Konfigurasi Operasional</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1 flex items-center gap-2.5">
            <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-700" />
            <span>Kustomisasi Jam Shift & Aturan Absensi</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Sesuaikan jumlah shift apotek (bisa 1 shift, 2 shift, 3 shift, 4 shift atau kustom bebas), batas toleransi, dan kontak WhatsApp.
          </p>
        </div>

        <div className="bg-emerald-50 text-emerald-900 border border-emerald-200 px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-emerald-700" />
          <span>{shiftsData.length} Shift Aktif</span>
        </div>
      </div>

      {saveMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-semibold flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Section 1: Kustomisasi Shift Fleksibel */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-700" />
                <span>1. Konfigurasi Shift Kustom (Bisa 1, 2, 3, 4+ Shift)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Tambahkan, edit, atau hapus shift sesuai kebutuhan jam operasional apotek Anda.
              </p>
            </div>

            {/* Tambah Shift Baru Button */}
            <button
              type="button"
              onClick={handleAddShift}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Shift Baru</span>
            </button>
          </div>

          {/* Preset Buttons for Quick Setup */}
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
            <span className="text-xs font-bold text-slate-700 block">
              Pilihan Cepat Template Shift:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={applyPreset1Shift}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 transition-colors cursor-pointer"
              >
                Gunakan 1 Shift Saja (Normal 08:00 - 17:00)
              </button>
              <button
                type="button"
                onClick={applyPreset2Shifts}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 transition-colors cursor-pointer"
              >
                Gunakan 2 Shift (Pagi & Siang)
              </button>
              <button
                type="button"
                onClick={applyPreset3Shifts}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 transition-colors cursor-pointer"
              >
                Gunakan 3 Shift (Pagi, Siang & Malam)
              </button>
              <button
                type="button"
                onClick={applyPreset4Shifts}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 transition-colors cursor-pointer"
              >
                Gunakan 4 Shift (24 Jam Lengkap)
              </button>
            </div>
          </div>

          {/* Shift Cards List */}
          <div className="space-y-4 pt-1">
            {shiftsData.map((shift, idx) => (
              <div
                key={shift.id}
                className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition-all space-y-3.5 relative"
              >
                {/* Shift Card Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center font-mono">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">
                      {shift.name || `Shift #${idx + 1}`}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      (ID: {shift.id})
                    </span>
                  </div>

                  {/* Actions: Duplicate & Delete */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleDuplicateShift(idx)}
                      title="Duplikat Shift"
                      className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline text-[11px]">Duplikat</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteShift(idx)}
                      title="Hapus Shift"
                      disabled={shiftsData.length <= 1}
                      className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline text-[11px]">Hapus</span>
                    </button>
                  </div>
                </div>

                {/* Form Fields for this Shift */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Nama Shift:
                    </label>
                    <input
                      type="text"
                      value={shift.name}
                      onChange={(e) => handleShiftChange(idx, 'name', e.target.value)}
                      placeholder="Contoh: Shift Pagi"
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Jam Masuk (Start Time):
                    </label>
                    <input
                      type="time"
                      value={shift.startTime}
                      onChange={(e) => handleShiftChange(idx, 'startTime', e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono tabular-nums text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Jam Pulang (End Time):
                    </label>
                    <input
                      type="time"
                      value={shift.endTime}
                      onChange={(e) => handleShiftChange(idx, 'endTime', e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono tabular-nums text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Batas Toleransi:
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="60"
                        value={shift.gracePeriodMinutes}
                        onChange={(e) => handleShiftChange(idx, 'gracePeriodMinutes', Number(e.target.value))}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono tabular-nums text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                        required
                      />
                      <span className="absolute right-2.5 top-2 text-[11px] text-slate-400">menit</span>
                    </div>
                  </div>

                  <div className="sm:col-span-2 lg:col-span-4">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Uraian Tugas / Catatan Shift:
                    </label>
                    <input
                      type="text"
                      value={shift.description}
                      onChange={(e) => handleShiftChange(idx, 'description', e.target.value)}
                      placeholder="Contoh: Pelayanan resep, cek suhu kulkas vaksin, penataan etalase..."
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600 text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Kontak WhatsApp & Notifikasi Otomatis */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 border-b border-slate-100 pb-2.5 flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-700" />
            <span>2. Kontak WhatsApp Supervisor / APA untuk Notifikasi Keterlambatan</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Pimpinan / Apoteker Penanggung Jawab:
              </label>
              <input
                type="text"
                value={formData.supervisorName}
                onChange={(e) => setFormData({ ...formData, supervisorName: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor WhatsApp Pimpinan (Format: 08... atau 628...):
              </label>
              <input
                type="text"
                value={formData.supervisorPhone}
                onChange={(e) => setFormData({ ...formData, supervisorPhone: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600 font-mono"
                required
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Notifikasi otomatis keterlambatan staf dikirimkan ke nomor ini.
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enableSoundAlerts}
                onChange={(e) => setFormData({ ...formData, enableSoundAlerts: e.target.checked })}
                className="rounded text-emerald-700 focus:ring-emerald-600"
              />
              <span className="font-medium">Bunyikan Audio Chime Peringatan saat Hadir Terlambat</span>
            </label>

            <button
              type="button"
              onClick={handleTestAudio}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Tes Suara Peringatan</span>
            </button>
          </div>
        </div>

        {/* Section 3: Geofence Lokasi Apotek */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 border-b border-slate-100 pb-2.5 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-700" />
            <span>3. Pengaturan Lokasi & Radius Geofence Apotek</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Tempat:
              </label>
              <input
                type="text"
                value={formData.pharmacyName}
                onChange={(e) => setFormData({ ...formData, pharmacyName: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Maksimal Radius Kehadiran Sah (Geofencing):
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="20"
                  max="5000"
                  value={formData.maxRadiusMeters}
                  onChange={(e) => setFormData({ ...formData, maxRadiusMeters: Number(e.target.value) })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600 font-mono tabular-nums"
                  required
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-slate-400">meter</span>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alamat Fisik Apotek:
              </label>
              <input
                type="text"
                value={formData.pharmacyAddress}
                onChange={(e) => setFormData({ ...formData, pharmacyAddress: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 4: PIN Keamanan Mode Admin */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 border-b border-slate-100 pb-2.5 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-700" />
            <span>4. Pengaturan PIN Keamanan Akses Mode Admin</span>
          </h2>
          <p className="text-xs text-slate-500">
            PIN ini diperlukan setiap kali berpindah dari Mode Karyawan ke Mode Admin (Apoteker Pengelola Apotek).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  PIN Akses Admin (4 - 6 Angka):
                </label>
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="text-xs text-emerald-700 hover:text-emerald-900 flex items-center gap-1 font-semibold cursor-pointer"
                >
                  {showPin ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Sembunyikan</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Lihat PIN</span>
                    </>
                  )}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  minLength={4}
                  maxLength={8}
                  value={formData.adminPin || '1234'}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, '');
                    setFormData({ ...formData, adminPin: clean });
                  }}
                  className="w-full text-sm font-mono tracking-widest p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600 font-bold text-slate-900"
                  required
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                PIN default bawaan adalah <strong>1234</strong>. Pastikan tidak lupa saat mengubahnya.
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5 flex flex-col justify-center">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-700" />
                <span>Hak Istimewa Mode Admin Terlindungi:</span>
              </span>
              <ul className="text-slate-600 text-[11px] space-y-1 list-disc list-inside">
                <li>Akses penuh seluruh <strong>Riwayat & Rekap Absensi</strong></li>
                <li>Verifikasi & persetujuan <strong>Laporan Farmasi</strong> harian</li>
                <li>Konfigurasi <strong>Kustom Shift</strong> & toleransi kehadiran</li>
                <li>Ekspor data absensi ke <strong>Excel</strong> & Cetak Bulanan</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 5: Pengaturan Jadwal Libur & Tukar Hari Libur Karyawan */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-emerald-700" />
                <span>5. Pengaturan Jadwal Libur & Fitur Tukar Hari Libur</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Atur hari libur mingguan rutin seluruh petugas apotek, tanggal cuti/libur khusus, dan lakukan pertukaran hari libur antar staf.
              </p>
            </div>

            {/* Navigation sub-tabs */}
            <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setScheduleTab('jadwal')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  scheduleTab === 'jadwal'
                    ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Jadwal Libur Staf
              </button>
              <button
                type="button"
                onClick={() => setScheduleTab('tukar')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  scheduleTab === 'tukar'
                    ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tukar Hari Libur</span>
              </button>
              <button
                type="button"
                onClick={() => setScheduleTab('riwayat')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  scheduleTab === 'riwayat'
                    ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Riwayat Tukar ({dayOffSwapsData.length})
              </button>
              <button
                type="button"
                onClick={() => setScheduleTab('matriks')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  scheduleTab === 'matriks'
                    ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Matriks Mingguan
              </button>
            </div>
          </div>

          {/* SUB-TAB 1: Jadwal Libur Staf */}
          {scheduleTab === 'jadwal' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs text-emerald-900 flex items-start gap-2.5">
                <Coffee className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Ketentuan Jadwal Libur Apotek Assyifa Farma:</span>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    Apotek beroperasi 7 hari seminggu. Setiap tenaga kefarmasian & kasir memiliki 1 hari libur rutin mingguan yang dirotasikan agar pelayanan pasien tetap optimal.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {employees.map((emp) => {
                  const dayOff = getEmployeeDayOff(emp.id);
                  return (
                    <div
                      key={emp.id}
                      className="bg-slate-50/90 border border-slate-200 rounded-xl p-4 space-y-3"
                    >
                      {/* Employee Info Header */}
                      <div className="flex items-center gap-3">
                        <img
                          src={emp.avatar}
                          alt={emp.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-300"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-slate-900 truncate">
                            {emp.name}
                          </div>
                          <div className="text-[11px] text-emerald-700 font-medium">
                            {emp.role}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            NIP: {emp.nip}
                          </div>
                        </div>
                      </div>

                      {/* Regular Weekly Day Off Selection */}
                      <div className="pt-2 border-t border-slate-200/70">
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Hari Libur Rutin Mingguan:
                        </label>
                        <select
                          value={dayOff.regularDayOff}
                          onChange={(e) => handleUpdateRegularDayOff(emp.id, e.target.value as DayOfWeek)}
                          className="w-full text-xs font-bold p-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                        >
                          {DAYS_OF_WEEK.map((day) => (
                            <option key={day} value={day}>
                              Hari {day} (Setiap Pekan)
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Specific Dates Off */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-semibold text-slate-700">
                          Tanggal Libur Khusus / Tambahan:
                        </label>
                        
                        {/* Chips */}
                        <div className="flex flex-wrap gap-1.5 min-h-[26px]">
                          {dayOff.specificDatesOff && dayOff.specificDatesOff.length > 0 ? (
                            dayOff.specificDatesOff.map((date) => (
                              <span
                                key={date}
                                className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-md font-mono font-medium"
                              >
                                {date}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSpecificDate(emp.id, date)}
                                  className="text-amber-800 hover:text-rose-700 font-bold ml-0.5 cursor-pointer"
                                  title="Hapus tanggal libur ini"
                                >
                                  ×
                                </button>
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              Belum ada tanggal libur khusus.
                            </span>
                          )}
                        </div>

                        {/* Add Date Input */}
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="date"
                            value={newDateInputs[emp.id] || ''}
                            onChange={(e) =>
                              setNewDateInputs({ ...newDateInputs, [emp.id]: e.target.value })
                            }
                            className="text-xs p-1.5 bg-white border border-slate-300 rounded-lg flex-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddSpecificDate(emp.id)}
                            className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer shrink-0"
                          >
                            + Tambah
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SUB-TAB 2: Tukar Hari Libur */}
          {scheduleTab === 'tukar' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
                <ArrowLeftRight className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Fitur Pertukaran Hari Libur Antar Petugas:</span>
                  <p className="text-[11px] text-blue-800 mt-0.5">
                    Gunakan formulir ini untuk menukar hari libur antar dua karyawan farmasi, atau menggeser hari libur seorang staf ke tanggal lain dengan persetujuan Apoteker Penanggung Jawab.
                  </p>
                </div>
              </div>

              {swapSuccessMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{swapSuccessMessage}</span>
                </div>
              )}

              {swapErrorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-900 font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
                  <span>{swapErrorMessage}</span>
                </div>
              )}

              <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-5 space-y-4">
                {/* Swap Mode Toggle */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">
                    Model Pertukaran Hari Libur:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSwapForm({ ...swapForm, mode: 'rekan' })}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        swapForm.mode === 'rekan'
                          ? 'bg-white border-emerald-600 ring-2 ring-emerald-500/20 text-emerald-950 font-bold'
                          : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-1">
                        <ArrowLeftRight className="w-4 h-4 text-emerald-700" />
                        <span>Tukar dengan Rekan Kerja</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-normal">
                        Karyawan A dan Karyawan B saling bertukar hari libur masing-masing.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSwapForm({ ...swapForm, mode: 'geser' })}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        swapForm.mode === 'geser'
                          ? 'bg-white border-emerald-600 ring-2 ring-emerald-500/20 text-emerald-950 font-bold'
                          : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-1">
                        <Calendar className="w-4 h-4 text-emerald-700" />
                        <span>Geser Hari Libur Mandiri</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-normal">
                        Karyawan menggeser jadwal liburnya ke tanggal lain dalam pekan yang sama.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Form Inputs Grid */}
                {(() => {
                  const upcomingOffDays1 = getUpcomingOffDayOptions(swapForm.emp1Id);
                  const upcomingOffDays2 = getUpcomingOffDayOptions(swapForm.emp2Id);
                  const emp1Obj = employees.find((e) => e.id === swapForm.emp1Id);
                  const emp2Obj = employees.find((e) => e.id === swapForm.emp2Id);

                  return (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                        {/* Party 1 */}
                        <div className="space-y-3 p-3.5 bg-white border border-slate-200 rounded-xl">
                          <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center justify-center">
                              1
                            </span>
                            <span>Karyawan Pemohon (Pihak 1):</span>
                          </span>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              Pilih Karyawan:
                            </label>
                            <select
                              value={swapForm.emp1Id}
                              onChange={(e) => {
                                const newId = e.target.value;
                                const newUpcoming = getUpcomingOffDayOptions(newId);
                                setSwapForm({
                                  ...swapForm,
                                  emp1Id: newId,
                                  date1: newUpcoming.length > 0 ? newUpcoming[0].dateStr : swapForm.date1
                                });
                              }}
                              className="w-full text-xs font-semibold p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                            >
                              {employees.map((emp) => {
                                const off = getEmployeeDayOff(emp.id);
                                return (
                                  <option key={emp.id} value={emp.id}>
                                    {emp.name} (Libur Rutin: {off.regularDayOff})
                                  </option>
                                );
                              })}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-800 mb-1">
                              Pilih Jadwal Libur yang Akan Masuk Kerja (Masuk):
                            </label>
                            <select
                              value={swapForm.date1}
                              onChange={(e) => setSwapForm({ ...swapForm, date1: e.target.value })}
                              className="w-full text-xs font-semibold p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600 mb-2"
                            >
                              <option value="">-- Pilih jadwal libur mana yang akan masuk --</option>
                              {upcomingOffDays1.map((opt) => (
                                <option key={opt.dateStr} value={opt.dateStr}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>

                            <div className="flex items-center gap-2 pt-1.5 border-t border-slate-100">
                              <span className="text-[10px] text-slate-500 whitespace-nowrap">
                                Tanggal Terpilih / Khusus:
                              </span>
                              <input
                                type="date"
                                value={swapForm.date1}
                                onChange={(e) => setSwapForm({ ...swapForm, date1: e.target.value })}
                                className="flex-1 text-xs p-1.5 bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600 font-mono"
                                required
                              />
                            </div>

                            {swapForm.date1 && (
                              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 flex items-start gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                  ⚡ <strong>{emp1Obj?.name}</strong> akan <strong>MASUK KERJA</strong> pada tanggal <strong>{formatIndonesianDate(swapForm.date1)}</strong>.
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Party 2 or Target Date */}
                        <div className="space-y-3 p-3.5 bg-white border border-slate-200 rounded-xl">
                          <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center justify-center">
                              2
                            </span>
                            <span>
                              {swapForm.mode === 'rekan'
                                ? 'Rekan Kerja yang Ditukar (Pihak 2):'
                                : 'Tanggal Hari Libur Pengganti Baru:'}
                            </span>
                          </span>

                          {swapForm.mode === 'rekan' ? (
                            <>
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                  Pilih Rekan Kerja:
                                </label>
                                <select
                                  value={swapForm.emp2Id}
                                  onChange={(e) => {
                                    const newId = e.target.value;
                                    const newUpcoming = getUpcomingOffDayOptions(newId);
                                    setSwapForm({
                                      ...swapForm,
                                      emp2Id: newId,
                                      date2: newUpcoming.length > 0 ? newUpcoming[0].dateStr : swapForm.date2
                                    });
                                  }}
                                  className="w-full text-xs font-semibold p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                                >
                                  {employees
                                    .filter((e) => e.id !== swapForm.emp1Id)
                                    .map((emp) => {
                                      const off = getEmployeeDayOff(emp.id);
                                      return (
                                        <option key={emp.id} value={emp.id}>
                                          {emp.name} (Libur Rutin: {off.regularDayOff})
                                        </option>
                                      );
                                    })}
                                </select>
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-slate-800 mb-1">
                                  Pilih Jadwal Libur Rekan yang Diambil untuk Libur:
                                </label>
                                <select
                                  value={swapForm.date2}
                                  onChange={(e) => setSwapForm({ ...swapForm, date2: e.target.value })}
                                  className="w-full text-xs font-semibold p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600 mb-2"
                                >
                                  <option value="">-- Pilih jadwal libur rekan yang akan diambil --</option>
                                  {upcomingOffDays2.map((opt) => (
                                    <option key={opt.dateStr} value={opt.dateStr}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>

                                <div className="flex items-center gap-2 pt-1.5 border-t border-slate-100">
                                  <span className="text-[10px] text-slate-500 whitespace-nowrap">
                                    Tanggal Terpilih / Khusus:
                                  </span>
                                  <input
                                    type="date"
                                    value={swapForm.date2}
                                    onChange={(e) => setSwapForm({ ...swapForm, date2: e.target.value })}
                                    className="flex-1 text-xs p-1.5 bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600 font-mono"
                                    required
                                  />
                                </div>

                                {swapForm.date2 && (
                                  <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-900 flex items-start gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                    <div>
                                      🌿 <strong>{emp1Obj?.name}</strong> akan <strong>LIBUR</strong> pada tanggal <strong>{formatIndonesianDate(swapForm.date2)}</strong> (dan <strong>{emp2Obj?.name}</strong> MASUK KERJA).
                                    </div>
                                  </div>
                                )}
                              </div>
                            </>
                          ) : (
                            <div>
                              <label className="block text-[11px] font-bold text-slate-800 mb-1">
                                Pilih Tanggal Baru untuk Libur:
                              </label>
                              <input
                                type="date"
                                value={swapForm.date2}
                                onChange={(e) => setSwapForm({ ...swapForm, date2: e.target.value })}
                                className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600 font-mono"
                                required
                              />
                              {swapForm.date2 && (
                                <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-900 flex items-start gap-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                  <div>
                                    🌿 <strong>{emp1Obj?.name}</strong> akan <strong>LIBUR</strong> pada tanggal <strong>{formatIndonesianDate(swapForm.date2)}</strong> sebagai pengganti tanggal {formatIndonesianDate(swapForm.date1)}.
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Summary Banner */}
                      {swapForm.date1 && swapForm.date2 && (
                        <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-1.5 text-xs text-emerald-950">
                          <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                            <ArrowLeftRight className="w-4 h-4 text-emerald-700" />
                            <span>Rangkuman Keputusan Pertukaran Hari Libur:</span>
                          </div>
                          <div className="space-y-1 text-[11px]">
                            <p>
                              • <strong>{emp1Obj?.name}</strong>: <span className="text-amber-800 font-bold">MASUK KERJA</span> pada {formatIndonesianDate(swapForm.date1)} (jadwal libur dipakai masuk), dan <span className="text-emerald-800 font-bold">LIBUR</span> pada {formatIndonesianDate(swapForm.date2)}.
                            </p>
                            {swapForm.mode === 'rekan' && emp2Obj && (
                              <p>
                                • <strong>{emp2Obj?.name}</strong>: <span className="text-emerald-800 font-bold">LIBUR</span> pada {formatIndonesianDate(swapForm.date1)}, dan <span className="text-amber-800 font-bold">MASUK KERJA</span> pada {formatIndonesianDate(swapForm.date2)} (jadwal libur rekan dipakai masuk).
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}

                {/* Reason */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Alasan / Keterangan Pertukaran Jadwal Libur:
                  </label>
                  <input
                    type="text"
                    value={swapForm.reason}
                    onChange={(e) => setSwapForm({ ...swapForm, reason: e.target.value })}
                    placeholder="Contoh: Menggantikan piket shift sore / keperluan keluarga / seminar IAI"
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                {/* Execute Button */}
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleExecuteSwap}
                    className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Konfirmasi & Setujui Tukar Hari Libur</span>
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* SUB-TAB 3: Riwayat Tukar Libur */}
          {scheduleTab === 'riwayat' && (
            <div className="space-y-3">
              {dayOffSwapsData.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Belum ada riwayat pertukaran hari libur yang tercatat.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {dayOffSwapsData.map((swap) => {
                    const isCancelled = swap.status === 'dibatalkan';
                    return (
                      <div
                        key={swap.id}
                        className={`p-4 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isCancelled
                            ? 'bg-slate-50 border-slate-200 text-slate-400'
                            : 'bg-white border-slate-200/90 shadow-2xs text-slate-800'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isCancelled
                                  ? 'bg-slate-200 text-slate-600'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {isCancelled ? 'Dibatalkan' : 'Disetujui APA'}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {swap.createdAt}
                            </span>
                          </div>

                          <div className="font-semibold text-slate-900 flex flex-wrap items-center gap-1.5 pt-0.5">
                            <span className="text-emerald-700">{swap.employeeName1}</span>
                            <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">
                              {swap.originalDate1}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400 inline" />
                            <span className="font-mono text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded font-bold">
                              {swap.newDate1}
                            </span>

                            {swap.employeeName2 && (
                              <>
                                <span className="text-slate-400 mx-1">⇄</span>
                                <span className="text-blue-700">{swap.employeeName2}</span>
                                <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">
                                  {swap.originalDate2}
                                </span>
                                <ArrowRight className="w-3.5 h-3.5 text-slate-400 inline" />
                                <span className="font-mono text-[11px] bg-blue-50 text-blue-800 border border-blue-200 px-1.5 py-0.5 rounded font-bold">
                                  {swap.newDate2}
                                </span>
                              </>
                            )}
                          </div>

                          <div className="text-[11px] text-slate-500 italic">
                            Alasan: "{swap.reason}" · Disetujui oleh: {swap.approvedBy}
                          </div>
                        </div>

                        {!isCancelled && (
                          <button
                            type="button"
                            onClick={() => handleCancelSwap(swap)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-300 hover:border-rose-300 font-semibold text-[11px] rounded-lg transition-colors cursor-pointer self-start sm:self-center shrink-0 flex items-center gap-1"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Batalkan Pertukaran</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SUB-TAB 4: Matriks Jadwal Mingguan */}
          {scheduleTab === 'matriks' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Ringkasan sebaran hari libur staf dalam sepekan untuk memastikan setiap hari terdapat apoteker, TTK, dan kasir bertugas.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
                {DAYS_OF_WEEK.map((day) => {
                  const offEmployees = employees.filter((emp) => {
                    const off = getEmployeeDayOff(emp.id);
                    return off.regularDayOff === day;
                  });

                  return (
                    <div
                      key={day}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between min-h-[140px]"
                    >
                      <div>
                        <div className="font-bold text-slate-900 border-b border-slate-200/80 pb-1 flex items-center justify-between">
                          <span>{day}</span>
                          <span className="text-[10px] text-slate-400">
                            {offEmployees.length} Libur
                          </span>
                        </div>

                        <div className="mt-2 space-y-1.5">
                          {offEmployees.length > 0 ? (
                            offEmployees.map((emp) => (
                              <div
                                key={emp.id}
                                className="bg-amber-50 text-amber-900 border border-amber-200 rounded-lg p-1.5 text-[11px]"
                              >
                                <div className="font-bold truncate">{emp.name}</div>
                                <div className="text-[9px] text-amber-700 truncate">{emp.role}</div>
                              </div>
                            ))
                          ) : (
                            <div className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 p-1.5 rounded-lg border border-emerald-200 text-center">
                              Seluruh Staf Masuk
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-400 text-center mt-2 pt-1 border-t border-slate-200/60">
                        {employees.length - offEmployees.length} Staf Tugas
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2 pb-6">
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Simpan Semua Pengaturan Shift & Apotek</span>
          </button>
        </div>
      </form>

    </div>
  );
};
