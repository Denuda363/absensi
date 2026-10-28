export type UserRole = 'karyawan' | 'admin';

export type JobPosition =
  | 'Apoteker Pengelola Apotek (APA)'
  | 'Apoteker Pendamping (Aping)'
  | 'Tenaga Teknis Kefarmasian (TTK)'
  | 'Kasir & Front Office'
  | 'Logistik & Gudang Farmasi';

export interface Employee {
  id: string;
  name: string;
  nip: string;
  role: JobPosition;
  phone: string;
  avatar: string;
  defaultShiftId: string;
}

export interface Shift {
  id: string;
  name: string;
  startTime: string; // "07:30"
  endTime: string;   // "15:00"
  gracePeriodMinutes: number; // e.g. 10 minutes
  description: string;
}

export type AttendanceStatus = 'tepat_waktu' | 'terlambat' | 'izin' | 'sakit' | 'alpha' | 'cuti' | 'dinas_luar';

export interface GeoLocationData {
  lat: number;
  lng: number;
  address: string;
  distanceMeters: number;
  isWithinRadius: boolean;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeRole: JobPosition;
  date: string; // YYYY-MM-DD
  shiftId: string;
  shiftName: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  clockInTime: string | null; // HH:mm:ss
  clockInPhoto: string | null; // Base64 or image url
  clockInLocation: GeoLocationData | null;
  clockOutTime: string | null;
  clockOutPhoto: string | null;
  status: AttendanceStatus;
  lateMinutes: number;
  lateReason: string | null;
  lateReasonCategory?: 'Macet' | 'Kendala Cuaca / Hujan' | 'Kerusakan Kendaraan' | 'Keperluan Darurat Medis' | 'Lainnya';
  lateStatusAcknowledged: boolean;
  adminNote?: string;
  notificationDispatched: boolean;
  notificationDispatchedAt?: string;
}

export interface DailyReport {
  id: string;
  attendanceId?: string;
  employeeId: string;
  employeeName: string;
  employeeRole: JobPosition;
  date: string;
  shiftName: string;
  prescriptionsCount: number; // Resep dokter dilayani
  otcSalesCount: number;      // Transaksi Obat Bebas / OTC
  temperatureLog: {
    fridgeTemp: number; // Suhu kulkas vaksin/sirup (2 - 8 °C)
    roomTemp: number;   // Suhu ruang obat (< 25 °C)
    humidity: number;   // Kelembaban (40 - 60%)
  };
  lowStockItems: string;     // Daftar obat menipis / kritis
  goodsReceivedNotes: string; // Penerimaan barang dari PBF / distributor
  dailyTasksSummary: string; // Rangkuman pekerjaan harian
  incidentReport?: string;   // Kejadian khusus / keluhan pasien
  status: 'draft' | 'terkirim' | 'diverifikasi';
  verifiedBy?: string;
  verifiedAt?: string;
  supervisorFeedback?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LateAlertNotification {
  id: string;
  attendanceId: string;
  employeeId: string;
  employeeName: string;
  employeeRole: JobPosition;
  shiftName: string;
  scheduledTime: string;
  clockInTime: string;
  lateMinutes: number;
  reason?: string;
  timestamp: string;
  isRead: boolean;
  waSent: boolean;
}

export interface PharmacySettings {
  pharmacyName: string;
  pharmacyAddress: string;
  latitude: number;
  longitude: number;
  maxRadiusMeters: number;
  supervisorPhone: string;
  supervisorName: string;
  enableSoundAlerts: boolean;
  enableBrowserAlerts: boolean;
  autoSendWhatsAppPrompt: boolean;
  adminPin: string;
}

export type DayOfWeek = 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Minggu';

export interface EmployeeDayOff {
  id: string;
  employeeId: string;
  employeeName: string;
  regularDayOff: DayOfWeek; // Hari libur rutin mingguan
  specificDatesOff: string[]; // Tanggal libur khusus (YYYY-MM-DD)
  notes?: string;
}

export interface DayOffSwapRecord {
  id: string;
  employeeId1: string;
  employeeName1: string;
  originalDate1: string; // YYYY-MM-DD
  newDate1: string;      // YYYY-MM-DD
  employeeId2?: string;  // Jika tukar dengan rekan kerja
  employeeName2?: string;
  originalDate2?: string;
  newDate2?: string;
  reason: string;
  status: 'disetujui' | 'dibatalkan';
  approvedBy: string;
  createdAt: string;
}

