import * as XLSX from 'xlsx';
import { Employee, AttendanceRecord } from '../types';

export const INDONESIAN_MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember'
];

/**
 * Returns attendance status code for the grid cell:
 * H  = Hadir (Tepat Waktu)
 * T  = Terlambat
 * I  = Izin
 * S  = Sakit
 * C  = Cuti
 * DL = Dinas Luar
 * A  = Alpha
 */
export function getAttendanceStatusCode(status?: AttendanceRecord['status']): string {
  if (!status) return '';
  switch (status) {
    case 'tepat_waktu':
      return 'H';
    case 'terlambat':
      return 'T';
    case 'izin':
      return 'I';
    case 'sakit':
      return 'S';
    case 'cuti':
      return 'C';
    case 'dinas_luar':
      return 'DL';
    case 'alpha':
      return 'A';
    default:
      return '';
  }
}

/**
 * Exports attendance records to Excel matching the exact user template:
 * - Row 1: Bulan : [Bulan Tahun]
 * - Row 2-3: Empty
 * - Row 4-5: Table Header (No, Nama, Tanggal 1..31)
 * - Row 6+: Employee data rows
 */
export function exportAttendanceToExcelTemplate(params: {
  pharmacyName: string;
  monthIndex: number; // 0 = Januari, 9 = Oktober
  year: number;
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
}) {
  const { pharmacyName, monthIndex, year, employees, attendanceRecords } = params;
  const monthName = INDONESIAN_MONTHS[monthIndex];
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  // Create workbook
  const wb = XLSX.utils.book_new();

  // We will build a 2D array of rows
  const wsData: (string | number)[][] = [];

  // Row 1: Bulan : [Bulan]
  // In user's screenshot:
  // Col A: "Bulan", Col B: ":", Col C-E: "Oktober"
  wsData.push(['Bulan', ':', `${monthName} ${year}`]);

  // Row 2 & 3: Empty spacing as in screenshot
  wsData.push([]);
  wsData.push([]);

  // Row 4: Header Level 1
  // Col A: "No", Col B: "Nama", Col C onwards: "Tanggal" merged across 1..31, then totals
  const headerRow1: (string | number)[] = ['No', 'Nama'];
  for (let d = 1; d <= 31; d++) {
    if (d === 1) {
      headerRow1.push('Tanggal');
    } else {
      headerRow1.push(''); // placeholder for merge
    }
  }
  // Total summary columns
  headerRow1.push('Total H', 'Total T', 'Total I/S/C', 'Total Hadir');
  wsData.push(headerRow1);

  // Row 5: Header Level 2
  // Col A: "", Col B: "", Col C..AG: 1..31, then summary headers
  const headerRow2: (string | number)[] = ['', ''];
  for (let d = 1; d <= 31; d++) {
    headerRow2.push(d);
  }
  headerRow2.push('H', 'T', 'I/S/C', 'Jml');
  wsData.push(headerRow2);

  // Map attendance by employeeId and day (1..31)
  const monthString = String(monthIndex + 1).padStart(2, '0');

  employees.forEach((emp, index) => {
    const row: (string | number)[] = [index + 1, emp.name];

    let countH = 0;
    let countT = 0;
    let countLeave = 0;

    for (let d = 1; d <= 31; d++) {
      if (d > daysInMonth) {
        row.push('-'); // day does not exist in this month (e.g. 31 in Feb/Apr/Jun/Sep/Nov)
        continue;
      }

      const dayStr = String(d).padStart(2, '0');
      const dateKey = `${year}-${monthString}-${dayStr}`;

      const record = attendanceRecords.find(
        (r) => r.employeeId === emp.id && r.date === dateKey
      );

      const code = getAttendanceStatusCode(record?.status);
      row.push(code);

      if (code === 'H') countH++;
      else if (code === 'T') countT++;
      else if (['I', 'S', 'C', 'DL'].includes(code)) countLeave++;
    }

    // Append summary totals
    row.push(countH, countT, countLeave, countH + countT);
    wsData.push(row);
  });

  // Empty row before footer
  wsData.push([]);

  // Footer notes & legend
  wsData.push(['* Keterangan Simbol:']);
  wsData.push(['  H  = Hadir Tepat Waktu']);
  wsData.push(['  T  = Hadir Terlambat']);
  wsData.push(['  I  = Izin']);
  wsData.push(['  S  = Sakit']);
  wsData.push(['  C  = Cuti']);
  wsData.push(['  DL = Dinas Luar']);
  wsData.push(['  A  = Alpha (Tanpa Keterangan)']);
  wsData.push([`* Rekapitulasi Presensi: ${pharmacyName}`]);

  // Convert array to worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Configure cell merges
  // Note: 0-indexed:
  // Row 4 is index 3, Row 5 is index 4
  // Col A is 0, Col B is 1, Col C is 2, Col AG is 32
  ws['!merges'] = [
    // Merge "No" row 4 & 5
    { s: { r: 3, c: 0 }, e: { r: 4, c: 0 } },
    // Merge "Nama" row 4 & 5
    { s: { r: 3, c: 1 }, e: { r: 4, c: 1 } },
    // Merge "Tanggal" row 4 from col C (index 2) to col AG (index 32)
    { s: { r: 3, c: 2 }, e: { r: 3, c: 32 } }
  ];

  // Set column widths
  const colWidths = [
    { wch: 6 },  // A: No
    { wch: 28 }, // B: Nama
  ];
  // 31 days columns
  for (let i = 0; i < 31; i++) {
    colWidths.push({ wch: 4.5 });
  }
  // Total columns
  colWidths.push({ wch: 9 }, { wch: 9 }, { wch: 11 }, { wch: 11 });

  ws['!cols'] = colWidths;

  // Add sheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, `Absensi_${monthName}`);

  // Write and trigger download
  const filename = `Rekap_Presensi_${pharmacyName.replace(/\s+/g, '_')}_${monthName}_${year}.xlsx`;
  XLSX.writeFile(wb, filename);
}
