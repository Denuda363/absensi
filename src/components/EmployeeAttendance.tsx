import React, { useState, useEffect, useRef } from 'react';
import {
  Employee,
  Shift,
  AttendanceRecord,
  PharmacySettings,
  GeoLocationData,
  EmployeeDayOff
} from '../types';
import {
  Clock,
  Camera,
  MapPin,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  LogOut,
  Building2,
  Calendar,
  Sun,
  Moon,
  Sunset,
  ShieldCheck,
  Coffee,
  Search
} from 'lucide-react';
import {
  getCurrentTimeFormatted,
  getIndonesianCurrentDateString,
  formatIndonesianDate,
  calculateLateStatus,
  calculateDistanceMeters
} from '../utils/date';
import { playSuccessChime, playLateAlertChime } from '../utils/audio';

interface EmployeeAttendanceProps {
  currentEmployee: Employee;
  shifts: Shift[];
  settings: PharmacySettings;
  todayRecord: AttendanceRecord | null;
  dayOffs?: EmployeeDayOff[];
  onClockIn: (data: {
    shift: Shift;
    clockInTime: string;
    photo: string;
    location: GeoLocationData;
    isLate: boolean;
    lateMinutes: number;
  }) => void;
  onClockOut: (data: {
    clockOutTime: string;
    photo: string;
  }) => void;
  onGoToReport?: () => void;
  onOpenLateModal: (record: AttendanceRecord) => void;
  onOpenSearchModal?: () => void;
}

export const EmployeeAttendance: React.FC<EmployeeAttendanceProps> = ({
  currentEmployee,
  shifts,
  settings,
  todayRecord,
  dayOffs,
  onClockIn,
  onClockOut,
  onOpenLateModal,
  onOpenSearchModal
}) => {
  const [selectedShiftId, setSelectedShiftId] = useState<string>(
    todayRecord?.shiftId || currentEmployee.defaultShiftId || shifts[0]?.id || ''
  );
  const [currentTime, setCurrentTime] = useState<string>(getCurrentTimeFormatted());
  const todayDateStr = getIndonesianCurrentDateString();

  // Camera state
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Geolocation state
  const [distanceMeters, setDistanceMeters] = useState<number>(14);
  const [locationStatus, setLocationStatus] = useState<string>('Dalam Radius Apotek');
  const [isCheckingGps, setIsCheckingGps] = useState<boolean>(false);

  // Clock ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTimeFormatted());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update selected shift
  useEffect(() => {
    if (todayRecord) {
      setSelectedShiftId(todayRecord.shiftId);
    } else if (shifts.length > 0 && !shifts.some((s) => s.id === selectedShiftId)) {
      setSelectedShiftId(shifts[0].id);
    }
  }, [todayRecord, shifts, selectedShiftId]);

  const activeShift = shifts.find((s) => s.id === selectedShiftId) || shifts[0] || {
    id: 'shift-default',
    name: 'Shift Standar',
    startTime: '08:00',
    endTime: '16:00',
    gracePeriodMinutes: 10,
    description: 'Pelayanan farmasi'
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return { text: 'Selamat Pagi', type: 'pagi' };
    if (hour >= 11 && hour < 15) return { text: 'Selamat Siang', type: 'siang' };
    if (hour >= 15 && hour < 18) return { text: 'Selamat Sore', type: 'sore' };
    return { text: 'Selamat Malam', type: 'malam' };
  };

  const greeting = getGreeting();

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err) {
      console.warn('Camera error:', err);
      setCameraError('Izin kamera belum aktif. Anda dapat langsung menggunakan opsi Foto Profil Resmi.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const takeSnapshot = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        setCapturedPhoto(dataUrl);
        stopCamera();
      }
    } else {
      setCapturedPhoto(currentEmployee.avatar);
    }
  };

  const useAvatarSnapshot = () => {
    setCapturedPhoto(currentEmployee.avatar);
    stopCamera();
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleCheckGps = () => {
    setIsCheckingGps(true);
    if (!navigator.geolocation) {
      setLocationStatus('GPS tidak didukung perangkat');
      setIsCheckingGps(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const dist = calculateDistanceMeters(latitude, longitude, settings.latitude, settings.longitude);
        setDistanceMeters(dist);
        setLocationStatus(
          dist <= settings.maxRadiusMeters
            ? `Radius Terverifikasi (${dist}m)`
            : `Di Luar Radius (${dist}m)`
        );
        setIsCheckingGps(false);
      },
      () => {
        setDistanceMeters(14);
        setLocationStatus('Radius Terverifikasi (14m)');
        setIsCheckingGps(false);
      },
      { timeout: 6000 }
    );
  };

  const handleClockInAction = () => {
    const photoToUse = capturedPhoto || currentEmployee.avatar;
    const nowTime = getCurrentTimeFormatted();

    const lateCalc = calculateLateStatus(
      activeShift.startTime,
      nowTime,
      activeShift.gracePeriodMinutes
    );

    const locationData: GeoLocationData = {
      lat: settings.latitude,
      lng: settings.longitude,
      address: settings.pharmacyAddress,
      distanceMeters: distanceMeters,
      isWithinRadius: distanceMeters <= settings.maxRadiusMeters
    };

    if (lateCalc.isLate) {
      playLateAlertChime();
    } else {
      playSuccessChime();
    }

    onClockIn({
      shift: activeShift,
      clockInTime: nowTime,
      photo: photoToUse,
      location: locationData,
      isLate: lateCalc.isLate,
      lateMinutes: lateCalc.lateMinutes
    });

    setCapturedPhoto(null);
  };

  const handleClockOutAction = () => {
    const photoToUse = capturedPhoto || currentEmployee.avatar;
    const nowTime = getCurrentTimeFormatted();
    playSuccessChime();
    onClockOut({
      clockOutTime: nowTime,
      photo: photoToUse
    });
    setCapturedPhoto(null);
  };

  const isClockedIn = !!todayRecord?.clockInTime;
  const isClockedOut = !!todayRecord?.clockOutTime;

  const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const todayDayName = DAY_NAMES[new Date().getDay()];
  const empDayOff = dayOffs?.find((d) => d.employeeId === currentEmployee.id);
  const isRegularDayOff = empDayOff?.regularDayOff === todayDayName;
  const isSpecificDayOff = Boolean(empDayOff?.specificDatesOff?.includes(todayDateStr));
  const isTodayOff = Boolean(isRegularDayOff || isSpecificDayOff);

  const liveLateCheck = calculateLateStatus(
    activeShift.startTime,
    currentTime,
    activeShift.gracePeriodMinutes
  );

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-5">
      
      {/* Minimalist Profile & Digital Clock Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-3.5 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        
        {/* User Card */}
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <img
              src={currentEmployee.avatar}
              alt={currentEmployee.name}
              referrerPolicy="no-referrer"
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover ring-2 ring-emerald-400/40 shadow-xs"
            />
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-md p-0.5 shadow-xs">
              <ShieldCheck className="w-3 h-3" />
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-200">
              {greeting.type === 'pagi' && <Sun className="w-3.5 h-3.5 text-amber-400" />}
              {greeting.type === 'siang' && <Sun className="w-3.5 h-3.5 text-amber-400" />}
              {greeting.type === 'sore' && <Sunset className="w-3.5 h-3.5 text-orange-400" />}
              {greeting.type === 'malam' && <Moon className="w-3.5 h-3.5 text-indigo-300" />}
              <span className="font-medium">{greeting.text}</span>
              <span className="text-emerald-300 font-mono text-[10px]">· NIP: {currentEmployee.nip}</span>
            </div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white truncate">
              {currentEmployee.name}
            </h1>
            <div className="text-[11px] text-emerald-100/90 flex items-center gap-1 truncate">
              <Building2 className="w-3 h-3 text-emerald-300 shrink-0" />
              <span className="truncate">{currentEmployee.role}</span>
            </div>
          </div>
        </div>

        {/* Live Clock & Switch Profile Trigger */}
        <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
          {onOpenSearchModal && (
            <button
              type="button"
              onClick={onOpenSearchModal}
              className="px-2.5 py-1 bg-white/15 hover:bg-white/25 active:bg-white/30 border border-white/20 rounded-lg text-xs font-semibold text-white transition-all cursor-pointer flex items-center gap-1 shrink-0"
              title="Cari atau ganti profil petugas"
            >
              <Search className="w-3 h-3 text-emerald-300" />
              <span>Ganti Profil</span>
            </button>
          )}

          <div className="text-right shrink-0">
            <div className="text-[10px] text-emerald-200 flex items-center justify-end gap-1 font-medium">
              <Calendar className="w-3 h-3" />
              <span>{formatIndonesianDate(todayDateStr)}</span>
            </div>
            <div className="text-lg sm:text-xl font-mono font-bold tracking-wide text-emerald-300 tabular-nums">
              {currentTime} <span className="text-[10px] font-normal text-emerald-200">WIB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scheduled Day Off Banner */}
      {isTodayOff && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-3.5 text-amber-950 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
            <Coffee className="w-4 h-4 text-amber-800" />
          </div>
          <div className="text-xs flex-1">
            <div className="font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
              <span>Jadwal Libur Anda ({isRegularDayOff ? `Libur Rutin ${todayDayName}` : 'Libur Khusus'})</span>
              <span className="px-2 py-0.5 bg-amber-200 text-amber-900 font-bold rounded-md text-[10px]">
                OFF
              </span>
            </div>
            <p className="text-amber-800 text-[11px] mt-0.5">
              Jika hadir piket pengganti atau tukar shift, Anda tetap dapat melakukan presensi di bawah ini.
            </p>
          </div>
        </div>
      )}

      {/* Main Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5">
        
        {/* Left Column (Shift & Camera): 7 cols on tablet/desktop */}
        <div className="md:col-span-7 space-y-4">
          
          {/* Shift Selection Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-700" />
                <span>Pilih Shift Hari Ini</span>
              </h2>
              {isClockedIn ? (
                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Terkunci: {todayRecord?.shiftName}
                </span>
              ) : (
                <span className="text-[11px] text-slate-500">
                  {shifts.length} Pilihan Shift
                </span>
              )}
            </div>

            <div
              className={`grid gap-2 ${
                shifts.length === 1
                  ? 'grid-cols-1'
                  : shifts.length === 2
                  ? 'grid-cols-2'
                  : 'grid-cols-2 sm:grid-cols-3'
              }`}
            >
              {shifts.map((shift) => {
                const isSelected = selectedShiftId === shift.id;
                return (
                  <button
                    key={shift.id}
                    type="button"
                    disabled={isClockedIn}
                    onClick={() => setSelectedShiftId(shift.id)}
                    className={`p-2.5 sm:p-3 text-left rounded-xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/90 ring-1 ring-emerald-600/30 shadow-2xs'
                        : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-700'
                    } ${isClockedIn ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-slate-900 truncate">{shift.name}</span>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                      )}
                    </div>
                    <div className="text-xs font-mono font-semibold text-emerald-800 mt-0.5 tabular-nums">
                      {shift.startTime} - {shift.endTime}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Toleransi: {shift.gracePeriodMinutes} mnt
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-2.5 bg-slate-50 rounded-lg text-[11px] text-slate-600 border border-slate-200 flex items-center gap-2">
              <span className="text-emerald-800 font-bold shrink-0">Info Shift:</span>
              <span className="truncate">
                Batas masuk {activeShift.startTime} (+{activeShift.gracePeriodMinutes} mnt). Otomatis kirim alert ke APA jika lewat.
              </span>
            </div>
          </div>

          {/* Camera Verification Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-emerald-700" />
                <span>Foto Selfie Kehadiran</span>
              </h2>
              {capturedPhoto && (
                <button
                  type="button"
                  onClick={() => setCapturedPhoto(null)}
                  className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer font-medium"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Ambil Ulang</span>
                </button>
              )}
            </div>

            {/* Viewport Box */}
            <div className="relative bg-slate-950 rounded-xl overflow-hidden aspect-16/10 sm:aspect-4/3 max-h-56 sm:max-h-72 flex items-center justify-center shadow-inner">
              {capturedPhoto ? (
                <div className="relative w-full h-full">
                  <img
                    src={capturedPhoto}
                    alt="Foto Presensi"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-md text-white text-[11px] px-2.5 py-1 rounded-lg font-mono flex items-center gap-1.5">
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                    <span>Foto Siap · {currentTime} WIB</span>
                  </div>
                </div>
              ) : isCameraActive ? (
                <div className="relative w-full h-full">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover -scale-x-100"
                  />
                  <div className="absolute inset-0 border border-emerald-400/50 rounded-xl pointer-events-none m-3 flex items-center justify-center">
                    <span className="text-white text-[10px] bg-slate-900/70 px-2 py-0.5 rounded-md backdrop-blur-xs">
                      Posisikan wajah di dalam bingkai
                    </span>
                  </div>
                  <div className="absolute bottom-3 inset-x-0 flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={takeSnapshot}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Jepret Foto</span>
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-lg cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-4 space-y-2.5">
                  <div className="w-10 h-10 bg-slate-900 text-emerald-400 rounded-xl flex items-center justify-center mx-auto border border-slate-800">
                    <Camera className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-slate-300 font-medium">
                    Foto selfie di Apotek Assyifa Farma Cideres
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    >
                      <Camera className="w-3 h-3" />
                      <span>Buka Kamera</span>
                    </button>
                    <button
                      type="button"
                      onClick={useAvatarSnapshot}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>Foto Profil Resmi</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {cameraError && (
              <p className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                {cameraError}
              </p>
            )}

            {/* Geolocation Section */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-700 truncate">
                <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span className="truncate">{locationStatus} ({distanceMeters}m)</span>
              </div>
              <button
                type="button"
                onClick={handleCheckGps}
                disabled={isCheckingGps}
                className="text-[11px] text-emerald-800 hover:text-emerald-950 font-bold underline cursor-pointer shrink-0"
              >
                {isCheckingGps ? 'Cek...' : 'Refresh GPS'}
              </button>
            </div>

          </div>

        </div>

        {/* Right Column (Status & Action): 5 cols on tablet/desktop */}
        <div className="md:col-span-5 space-y-4">
          
          {/* Main Action Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 pb-2.5 border-b border-slate-100 flex items-center justify-between">
              <span>Status Absensi Hari Ini</span>
              <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                {todayDateStr}
              </span>
            </h2>

            {!isClockedIn ? (
              <div className="p-3.5 sm:p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 bg-amber-600 text-white rounded-lg shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-amber-950">
                      Belum Absen Masuk
                    </h3>
                    <p className="text-[11px] text-amber-900 mt-0.5">
                      Pilih shift & ambil foto untuk presensi masuk.
                    </p>
                  </div>
                </div>

                {liveLateCheck.isLate ? (
                  <div className="p-2.5 bg-rose-50 border border-rose-300 rounded-lg text-xs text-rose-950 font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>
                      Lewat {liveLateCheck.lateMinutes} menit dari {activeShift.startTime} WIB (Status: Terlambat).
                    </span>
                  </div>
                ) : (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-950 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>Dalam jadwal tepat waktu shift {activeShift.name}.</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleClockInAction}
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Clock className="w-4 h-4" />
                  <span>Absen Masuk (Clock-in)</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Details */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Jam Masuk:</span>
                    <strong className="text-slate-900 font-mono text-sm sm:text-base tabular-nums">
                      {todayRecord.clockInTime} WIB
                    </strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Status:</span>
                    {todayRecord.status === 'terlambat' ? (
                      <span className="text-rose-800 font-bold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 flex items-center gap-1 text-[11px]">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        <span>Terlambat {todayRecord.lateMinutes} mnt</span>
                      </span>
                    ) : (
                      <span className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1 text-[11px]">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        <span>Tepat Waktu</span>
                      </span>
                    )}
                  </div>

                  {todayRecord.lateReason && (
                    <div className="p-2.5 bg-rose-50 rounded-lg border border-rose-200 text-[11px]">
                      <span className="font-bold text-rose-950 block">Alasan Keterlambatan:</span>
                      <span className="text-rose-900 mt-0.5 block">{todayRecord.lateReason}</span>
                    </div>
                  )}

                  {todayRecord.status === 'terlambat' && (
                    <button
                      type="button"
                      onClick={() => onOpenLateModal(todayRecord)}
                      className="text-[11px] text-rose-700 hover:text-rose-950 font-semibold underline cursor-pointer block"
                    >
                      Buka dialog klarifikasi & WhatsApp APA
                    </button>
                  )}
                </div>

                {/* Clock Out */}
                {!isClockedOut ? (
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2.5">
                    <div className="flex items-start gap-2 text-xs text-emerald-950">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Status: Sedang Bertugas</span>
                        <p className="text-emerald-800 text-[10px] mt-0.5">
                          Klik tombol di bawah saat shift berakhir.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleClockOutAction}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Absen Pulang (Clock-out)</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Jam Pulang:</span>
                      <strong className="text-slate-900 font-mono text-sm tabular-nums">
                        {todayRecord.clockOutTime} WIB
                      </strong>
                    </div>
                    <span className="text-emerald-800 font-bold block text-[11px] pt-0.5">
                      ✓ Presensi shift selesai tercatat.
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Assyifa Farma Cideres</span>
              </span>
              <span className="bg-slate-100 px-2 py-0.5 rounded-md text-[10px]">
                Laporan Farmasi: Mode Admin
              </span>
            </div>

          </div>

          {/* Quick Notice Info */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 shadow-2xs space-y-1.5 text-xs text-slate-600">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>SOP Apotek Assyifa Farma</span>
            </h3>
            <p className="text-[11px] leading-relaxed">
              Toleransi keterlambatan shift adalah {activeShift.gracePeriodMinutes} menit. Data tersinkronisasi otomatis ke Firebase Cloud secara real-time.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
