/**
 * Date and time utilities tailored for Indonesian pharmacy operations
 */

export function getIndonesianCurrentDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatIndonesianDate(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export function formatShortDate(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export function getCurrentTimeFormatted(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Calculates late duration in minutes
 * @param scheduledStart e.g. "07:30"
 * @param actualTime e.g. "08:05" or "08:05:22"
 * @param gracePeriodMinutes e.g. 10
 */
export function calculateLateStatus(
  scheduledStart: string,
  actualTime: string,
  gracePeriodMinutes: number = 5
): { isLate: boolean; lateMinutes: number } {
  const [schedH, schedM] = scheduledStart.split(':').map(Number);
  const [actH, actM] = actualTime.split(':').map(Number);

  const schedTotal = schedH * 60 + schedM;
  const actualTotal = actH * 60 + actM;

  const diffMinutes = actualTotal - schedTotal;

  if (diffMinutes > gracePeriodMinutes) {
    return {
      isLate: true,
      lateMinutes: diffMinutes
    };
  }

  return {
    isLate: false,
    lateMinutes: 0
  };
}

/**
 * Calculates distance between two coordinates in meters using Haversine formula
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Generates WhatsApp URL with formatted automatic late notice
 */
export function generateWhatsAppLateNotificationUrl(params: {
  supervisorPhone: string;
  pharmacyName: string;
  employeeName: string;
  employeeRole: string;
  shiftName: string;
  scheduledTime: string;
  clockInTime: string;
  lateMinutes: number;
  reason?: string;
}): string {
  let cleanPhone = params.supervisorPhone.replace(/\D/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '62' + cleanPhone.slice(1);
  } else if (!cleanPhone.startsWith('62')) {
    cleanPhone = '62' + cleanPhone;
  }

  const message = `*NOTIFIKASI KETERLAMBATAN KEHADIRAN*
*${params.pharmacyName.toUpperCase()}*
---------------------------------------
Kepada Yth. Pimpinan / Apoteker Pengelola (APA),

Sistem mencatat adanya keterlambatan presensi karyawan:
• *Nama Karyawan:* ${params.employeeName}
• *Jabatan:* ${params.employeeRole}
• *Jadwal Shift:* ${params.shiftName} (Jam Masuk: ${params.scheduledTime} WIB)
• *Waktu Presensi:* ${params.clockInTime} WIB
• *Total Keterlambatan:* ${params.lateMinutes} Menit
• *Keterangan / Alasan:* ${params.reason || 'Belum diisi oleh karyawan'}

_Pesan ini dibuat otomatis oleh Sistem Presensi Terintegrasi Apotek Assyifa Farma Cideres._`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
