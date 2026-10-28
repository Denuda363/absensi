import React from 'react';
import { UserRole, Employee } from '../types';
import {
  Bell,
  Shield,
  User,
  Clock,
  FileSpreadsheet,
  Settings,
  LayoutDashboard,
  Lock,
  Search,
  Cloud
} from 'lucide-react';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onRequestAdminAccess: () => void;
  currentEmployee: Employee | null;
  employees: Employee[];
  onEmployeeSelect: (employeeId: string) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  onOpenSearchModal: () => void;
  firebaseConnected?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  onRequestAdminAccess,
  currentEmployee,
  employees,
  onEmployeeSelect,
  activeTab,
  onTabChange,
  unreadNotificationsCount,
  onOpenNotifications,
  onOpenSearchModal,
  firebaseConnected = true
}) => {
  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs no-print">
        {/* Main Header Row */}
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-6">
          
          {/* Brand & Title */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white font-extrabold text-base sm:text-lg shadow-2xs ring-1 ring-emerald-500/20">
              +
            </div>
            <button
              onClick={() => onTabChange(currentRole === 'karyawan' ? 'absensi' : 'admin-dashboard')}
              className="text-left group cursor-pointer"
            >
              <div className="text-sm sm:text-base font-bold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors whitespace-nowrap">
                Apotek Assyifa Farma
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-500 hidden sm:block whitespace-nowrap">
                Cideres · Presensi & Pelaporan Farmasi
              </div>
            </button>

            {/* Cloud Sync Status Badge */}
            <div
              title="Terhubung ke Firebase Firestore Cloud Database"
              className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-full text-[11px] font-semibold"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Cloud className="w-3 h-3 text-emerald-600" />
              <span>Firebase Cloud</span>
            </div>
          </div>

          {/* Desktop Nav Links (lg and up) */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            {currentRole === 'karyawan' ? (
              <button
                onClick={() => onTabChange('absensi')}
                className={`py-1.5 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'absensi'
                    ? 'text-emerald-700 font-bold border-b-2 border-emerald-600'
                    : 'hover:text-slate-900'
                }`}
              >
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Presensi Masuk & Pulang</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => onTabChange('admin-dashboard')}
                  className={`py-1.5 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'admin-dashboard'
                      ? 'text-emerald-700 font-bold border-b-2 border-emerald-600'
                      : 'hover:text-slate-900'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                  <span>Dashboard & Rekap</span>
                </button>
                <button
                  onClick={() => onTabChange('admin-reports')}
                  className={`py-1.5 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'admin-reports'
                      ? 'text-emerald-700 font-bold border-b-2 border-emerald-600'
                      : 'hover:text-slate-900'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Laporan Harian Farmasi</span>
                </button>
                <button
                  onClick={() => onTabChange('admin-settings')}
                  className={`py-1.5 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'admin-settings'
                      ? 'text-emerald-700 font-bold border-b-2 border-emerald-600'
                      : 'hover:text-slate-900'
                  }`}
                >
                  <Settings className="w-4 h-4 text-emerald-600" />
                  <span>Kustom Shift & Pengaturan</span>
                </button>
              </>
            )}
          </nav>

          {/* Right Action Icons: Cloud Indicator on mobile, Notif, Role Switch */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Mobile Cloud Dot */}
            <div
              title="Firebase Terhubung"
              className="md:hidden flex items-center gap-1 p-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-bold border border-emerald-200/80"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Cloud</span>
            </div>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              title="Pusat Notifikasi Keterlambatan"
              className="relative p-1.5 sm:p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-3.5 h-3.5 sm:w-4 sm:h-4 text-[9px] sm:text-[10px] font-bold text-white bg-rose-600 rounded-full flex items-center justify-center tabular-nums animate-pulse">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Switch Role Button */}
            <button
              onClick={() => {
                if (currentRole === 'karyawan') {
                  onRequestAdminAccess();
                } else {
                  onRoleChange('karyawan');
                  onTabChange('absensi');
                }
              }}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300/80 rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-2xs"
            >
              {currentRole === 'karyawan' ? (
                <>
                  <div className="relative">
                    <Shield className="w-3.5 h-3.5 text-emerald-700" />
                    <Lock className="w-2 h-2 text-slate-800 absolute -bottom-0.5 -right-0.5" />
                  </div>
                  <span className="hidden sm:inline">Mode Admin (PIN)</span>
                  <span className="sm:hidden text-[11px]">Admin</span>
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5 text-slate-700" />
                  <span className="hidden sm:inline">Mode Karyawan</span>
                  <span className="sm:hidden text-[11px]">Karyawan</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Minimalist Sub-bar: Staff selector on Employee mode, or Admin tabs on tablet */}
        <div className="bg-slate-50/90 border-t border-slate-200/70 px-3 sm:px-5 lg:px-8 py-1.5 sm:py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          {currentRole === 'karyawan' ? (
            <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
              <span className="text-slate-500 whitespace-nowrap text-[11px]">Petugas:</span>
              <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
                <select
                  value={currentEmployee?.id || ''}
                  onChange={(e) => onEmployeeSelect(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-900 font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600 shadow-2xs flex-1 sm:flex-initial max-w-[220px] sm:max-w-[280px] truncate"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} — {emp.role}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={onOpenSearchModal}
                  className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer shadow-2xs shrink-0"
                  title="Cari Profil Petugas (Nama, NIP, Posisi)"
                >
                  <Search className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="text-[11px] sm:text-xs">Cari</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-slate-700 text-xs truncate">
              <span className="font-bold text-emerald-800 shrink-0">Panel Admin:</span>
              <span className="truncate text-slate-600">Apt. Siti Nurhaliza, S.Farm (APA)</span>
            </div>
          )}

          {/* Minimalist Tablet Navigation Pills (sm to lg) */}
          <div className="hidden sm:flex lg:hidden items-center gap-1.5 overflow-x-auto py-0.5">
            {currentRole === 'karyawan' ? (
              <button
                onClick={() => onTabChange('absensi')}
                className={`px-3 py-1 rounded-lg font-medium text-xs transition-colors cursor-pointer ${
                  activeTab === 'absensi' ? 'bg-emerald-700 text-white font-bold' : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                Presensi
              </button>
            ) : (
              <>
                <button
                  onClick={() => onTabChange('admin-dashboard')}
                  className={`px-2.5 py-1 rounded-lg font-medium text-xs transition-colors cursor-pointer ${
                    activeTab === 'admin-dashboard' ? 'bg-emerald-700 text-white font-bold' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => onTabChange('admin-reports')}
                  className={`px-2.5 py-1 rounded-lg font-medium text-xs transition-colors cursor-pointer ${
                    activeTab === 'admin-reports' ? 'bg-emerald-700 text-white font-bold' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Laporan Farmasi
                </button>
                <button
                  onClick={() => onTabChange('admin-settings')}
                  className={`px-2.5 py-1 rounded-lg font-medium text-xs transition-colors cursor-pointer ${
                    activeTab === 'admin-settings' ? 'bg-emerald-700 text-white font-bold' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Kustom Shift
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Floating Minimalist Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-2.5 inset-x-3 z-40 bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl shadow-xl md:hidden px-2 py-1.5 flex items-center justify-around no-print">
        {currentRole === 'karyawan' ? (
          <>
            <button
              onClick={() => onTabChange('absensi')}
              className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
                activeTab === 'absensi'
                  ? 'bg-emerald-50 text-emerald-800 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span className="text-[10px] mt-0.5">Presensi</span>
            </button>

            <button
              onClick={onOpenSearchModal}
              className="flex flex-col items-center py-1 px-3 rounded-xl text-slate-600 hover:text-emerald-700 transition-all cursor-pointer"
            >
              <Search className="w-4 h-4 text-emerald-700" />
              <span className="text-[10px] mt-0.5 font-medium text-slate-700">Cari Petugas</span>
            </button>

            <button
              onClick={onRequestAdminAccess}
              className="flex flex-col items-center py-1 px-3 rounded-xl text-slate-600 hover:text-emerald-700 transition-all cursor-pointer"
            >
              <div className="relative">
                <Shield className="w-4 h-4 text-emerald-700" />
                <Lock className="w-2 h-2 text-slate-800 absolute -bottom-0.5 -right-0.5" />
              </div>
              <span className="text-[10px] mt-0.5 font-bold text-slate-700">Mode Admin</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onTabChange('admin-dashboard')}
              className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'admin-dashboard'
                  ? 'bg-emerald-50 text-emerald-800 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="text-[10px] mt-0.5">Dashboard</span>
            </button>

            <button
              onClick={() => onTabChange('admin-reports')}
              className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'admin-reports'
                  ? 'bg-emerald-50 text-emerald-800 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="text-[10px] mt-0.5">Laporan</span>
            </button>

            <button
              onClick={() => onTabChange('admin-settings')}
              className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'admin-settings'
                  ? 'bg-emerald-50 text-emerald-800 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="text-[10px] mt-0.5">Kustom Shift</span>
            </button>

            <button
              onClick={() => {
                onRoleChange('karyawan');
                onTabChange('absensi');
              }}
              className="flex flex-col items-center py-1 px-2.5 rounded-xl text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
            >
              <User className="w-4 h-4 text-slate-700" />
              <span className="text-[10px] mt-0.5 font-semibold">Karyawan</span>
            </button>
          </>
        )}
      </nav>
    </>
  );
};
