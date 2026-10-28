import {
  Employee,
  Shift,
  AttendanceRecord,
  DailyReport,
  LateAlertNotification,
  PharmacySettings,
  EmployeeDayOff,
  DayOffSwapRecord
} from '../types';
import { getIndonesianCurrentDateString } from './date';

const STORAGE_KEYS = {
  EMPLOYEES: 'assyifa_employees_v1',
  SHIFTS: 'assyifa_shifts_v1',
  ATTENDANCE: 'assyifa_attendance_v1',
  REPORTS: 'assyifa_reports_v1',
  NOTIFICATIONS: 'assyifa_notifications_v1',
  SETTINGS: 'assyifa_settings_v1',
  ACTIVE_USER_ID: 'assyifa_active_user_v1',
  ACTIVE_ROLE: 'assyifa_active_role_v1',
  DAY_OFFS: 'assyifa_day_offs_v1',
  DAY_OFF_SWAPS: 'assyifa_day_off_swaps_v1'
};

export const DEFAULT_SHIFTS: Shift[] = [
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
  },
  {
    id: 'shift-full',
    name: 'Shift Lembur / Khusus',
    startTime: '08:00',
    endTime: '20:00',
    gracePeriodMinutes: 15,
    description: 'Jadwal piket akhir pekan atau pergantian shift operasional'
  }
];

export const DEFAULT_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    name: 'Apt. Siti Nurhaliza, S.Farm',
    nip: 'ASF-2023-001',
    role: 'Apoteker Pengelola Apotek (APA)',
    phone: '081223344551',
    avatar: '/src/assets/images/pharmacist_avatar_female_1792639729929.jpg',
    defaultShiftId: 'shift-pagi'
  },
  {
    id: 'emp-2',
    name: 'Rian Hidayat, A.Md.Farm',
    nip: 'ASF-2023-002',
    role: 'Tenaga Teknis Kefarmasian (TTK)',
    phone: '081223344552',
    avatar: '/src/assets/images/pharmacist_avatar_male_1792639729160.jpg',
    defaultShiftId: 'shift-pagi'
  },
  {
    id: 'emp-3',
    name: 'Dewi Lestari',
    nip: 'ASF-2024-003',
    role: 'Kasir & Front Office',
    phone: '081223344553',
    avatar: '/src/assets/images/pharmacist_avatar_female_1792639729929.jpg',
    defaultShiftId: 'shift-siang'
  },
  {
    id: 'emp-4',
    name: 'Budi Santoso',
    nip: 'ASF-2024-004',
    role: 'Logistik & Gudang Farmasi',
    phone: '081223344554',
    avatar: '/src/assets/images/pharmacist_avatar_male_1792639729160.jpg',
    defaultShiftId: 'shift-pagi'
  }
];

export const DEFAULT_SETTINGS: PharmacySettings = {
  pharmacyName: 'Apotek Assyifa Farma Cideres',
  pharmacyAddress: 'Jl. Raya Cideres - Kadipaten No. 88, Dawuan, Kab. Majalengka',
  latitude: -6.7412,
  longitude: 108.2045,
  maxRadiusMeters: 150,
  supervisorPhone: '081234567890',
  supervisorName: 'Apt. Siti Nurhaliza, S.Farm (APA)',
  enableSoundAlerts: true,
  enableBrowserAlerts: true,
  autoSendWhatsAppPrompt: true,
  adminPin: '1234'
};

export function getInitialAttendance(today: string): AttendanceRecord[] {
  return [
    {
      id: 'att-seed-1',
      employeeId: 'emp-1',
      employeeName: 'Apt. Siti Nurhaliza, S.Farm',
      employeeRole: 'Apoteker Pengelola Apotek (APA)',
      date: today,
      shiftId: 'shift-pagi',
      shiftName: 'Shift Pagi',
      scheduledStartTime: '07:30',
      scheduledEndTime: '15:00',
      clockInTime: '07:22:15',
      clockInPhoto: '/src/assets/images/pharmacist_avatar_female_1792639729929.jpg',
      clockInLocation: {
        lat: -6.74121,
        lng: 108.20452,
        address: 'Jl. Raya Cideres - Kadipaten No. 88 (Dalam Radius)',
        distanceMeters: 12,
        isWithinRadius: true
      },
      clockOutTime: null,
      clockOutPhoto: null,
      status: 'tepat_waktu',
      lateMinutes: 0,
      lateReason: null,
      lateStatusAcknowledged: true,
      notificationDispatched: false
    },
    {
      id: 'att-seed-2',
      employeeId: 'emp-2',
      employeeName: 'Rian Hidayat, A.Md.Farm',
      employeeRole: 'Tenaga Teknis Kefarmasian (TTK)',
      date: today,
      shiftId: 'shift-pagi',
      shiftName: 'Shift Pagi',
      scheduledStartTime: '07:30',
      scheduledEndTime: '15:00',
      clockInTime: '08:08:42',
      clockInPhoto: '/src/assets/images/pharmacist_avatar_male_1792639729160.jpg',
      clockInLocation: {
        lat: -6.74125,
        lng: 108.20448,
        address: 'Jl. Raya Cideres - Kadipaten No. 88 (Dalam Radius)',
        distanceMeters: 28,
        isWithinRadius: true
      },
      clockOutTime: null,
      clockOutPhoto: null,
      status: 'terlambat',
      lateMinutes: 38,
      lateReason: 'Ban sepeda motor bocor di Jalan Raya Dawuan saat perjalanan berangkat, sempat tambal ban di bengkel terdekat.',
      lateReasonCategory: 'Kerusakan Kendaraan',
      lateStatusAcknowledged: false,
      adminNote: 'Diverifikasi oleh APA. Harap perhatikan waktu cadangan perjalanan.',
      notificationDispatched: true,
      notificationDispatchedAt: '08:09:00'
    }
  ];
}

export function getInitialDailyReports(today: string): DailyReport[] {
  return [
    {
      id: 'rep-seed-1',
      attendanceId: 'att-seed-1',
      employeeId: 'emp-1',
      employeeName: 'Apt. Siti Nurhaliza, S.Farm',
      employeeRole: 'Apoteker Pengelola Apotek (APA)',
      date: today,
      shiftName: 'Shift Pagi',
      prescriptionsCount: 34,
      otcSalesCount: 89,
      temperatureLog: {
        fridgeTemp: 4.5,
        roomTemp: 22.8,
        humidity: 54
      },
      lowStockItems: 'Amoxicillin Dry Syrup 125mg (sisa 3 botol), Paracetamol Drop 15ml (sisa 2 botol), Sanmol Forte tablet.',
      goodsReceivedNotes: 'Terima kiriman dari PBF Anugrah Pharmindo: 4 koli obat generik & sirup anak (Faktur No. APF-99210-JKT, batch & ED terverifikasi aman).',
      dailyTasksSummary: 'Konsultasi 5 pasien obat kronis hipertensi (Amlodipine & Candesartan), peracikan salep racikan dokter spesialis kulit, pengisian kartu stok narkotika/psikotropika.',
      incidentReport: 'Tidak ada kendala fatal. Semua resep terlayani dengan waktu tunggu rata-rata 11 menit.',
      status: 'diverifikasi',
      verifiedBy: 'Apt. Siti Nurhaliza, S.Farm (APA)',
      verifiedAt: '14:45 WIB',
      supervisorFeedback: 'Laporan lengkap, suhu kulkas dan penyimpanan obat stabil sesuai regulasi BPOM.',
      createdAt: `${today} 14:30:00`,
      updatedAt: `${today} 14:45:00`
    }
  ];
}

export function getInitialNotifications(today: string): LateAlertNotification[] {
  return [
    {
      id: 'notif-seed-1',
      attendanceId: 'att-seed-2',
      employeeId: 'emp-2',
      employeeName: 'Rian Hidayat, A.Md.Farm',
      employeeRole: 'Tenaga Teknis Kefarmasian (TTK)',
      shiftName: 'Shift Pagi',
      scheduledTime: '07:30',
      clockInTime: '08:08:42',
      lateMinutes: 38,
      reason: 'Ban sepeda motor bocor di Jalan Raya Dawuan saat perjalanan berangkat, sempat tambal ban di bengkel terdekat.',
      timestamp: `${today} 08:08:42`,
      isRead: false,
      waSent: true
    }
  ];
}

export const DEFAULT_DAY_OFFS: EmployeeDayOff[] = [
  {
    id: 'dayoff-1',
    employeeId: 'emp-1',
    employeeName: 'Apt. Siti Nurhaliza, S.Farm',
    regularDayOff: 'Minggu',
    specificDatesOff: [],
    notes: 'Libur operasional hari Minggu (Jadwal APA Penanggung Jawab)'
  },
  {
    id: 'dayoff-2',
    employeeId: 'emp-2',
    employeeName: 'Rian Hidayat, A.Md.Farm',
    regularDayOff: 'Rabu',
    specificDatesOff: [],
    notes: 'Libur rutin TTK tengah pekan'
  },
  {
    id: 'dayoff-3',
    employeeId: 'emp-3',
    employeeName: 'Dewi Lestari',
    regularDayOff: 'Kamis',
    specificDatesOff: [],
    notes: 'Libur rutin Front Office / Kasir'
  },
  {
    id: 'dayoff-4',
    employeeId: 'emp-4',
    employeeName: 'Budi Santoso',
    regularDayOff: 'Jumat',
    specificDatesOff: [],
    notes: 'Libur rotasi Logistik & Gudang'
  }
];

export const DEFAULT_DAY_OFF_SWAPS: DayOffSwapRecord[] = [
  {
    id: 'swap-seed-1',
    employeeId1: 'emp-2',
    employeeName1: 'Rian Hidayat, A.Md.Farm',
    originalDate1: '2026-10-21',
    newDate1: '2026-10-22',
    employeeId2: 'emp-3',
    employeeName2: 'Dewi Lestari',
    originalDate2: '2026-10-22',
    newDate2: '2026-10-21',
    reason: 'Tukar jadwal libur untuk menghadiri workshop kefarmasian di Cirebon',
    status: 'disetujui',
    approvedBy: 'Apt. Siti Nurhaliza, S.Farm (APA)',
    createdAt: '2026-10-20 16:30:00'
  }
];

// Storage helpers with LocalStorage fallback
export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Failed to parse ${key} from storage:`, e);
    return fallback;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to save ${key} to storage:`, e);
  }
}

export function getStoredData() {
  const today = getIndonesianCurrentDateString();
  const settings = loadFromStorage<PharmacySettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  const shifts = loadFromStorage<Shift[]>(STORAGE_KEYS.SHIFTS, DEFAULT_SHIFTS);
  const employees = loadFromStorage<Employee[]>(STORAGE_KEYS.EMPLOYEES, DEFAULT_EMPLOYEES);
  const attendance = loadFromStorage<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, getInitialAttendance(today));
  const reports = loadFromStorage<DailyReport[]>(STORAGE_KEYS.REPORTS, getInitialDailyReports(today));
  const notifications = loadFromStorage<LateAlertNotification[]>(STORAGE_KEYS.NOTIFICATIONS, getInitialNotifications(today));
  const dayOffs = loadFromStorage<EmployeeDayOff[]>(STORAGE_KEYS.DAY_OFFS, DEFAULT_DAY_OFFS);
  const dayOffSwaps = loadFromStorage<DayOffSwapRecord[]>(STORAGE_KEYS.DAY_OFF_SWAPS, DEFAULT_DAY_OFF_SWAPS);
  const activeUserId = loadFromStorage<string>(STORAGE_KEYS.ACTIVE_USER_ID, 'emp-2'); // Rian Hidayat by default
  const activeRole = loadFromStorage<'karyawan' | 'admin'>(STORAGE_KEYS.ACTIVE_ROLE, 'karyawan');

  return {
    settings,
    shifts,
    employees,
    attendance,
    reports,
    notifications,
    dayOffs,
    dayOffSwaps,
    activeUserId,
    activeRole
  };
}

export { STORAGE_KEYS };

