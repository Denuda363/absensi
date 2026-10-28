import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Employee, JobPosition } from '../types';
import {
  Search,
  X,
  UserCheck,
  Building2,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Users
} from 'lucide-react';

interface EmployeeSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  currentEmployeeId: string;
  onSelectEmployee: (employeeId: string) => void;
}

export const EmployeeSearchModal: React.FC<EmployeeSearchModalProps> = ({
  isOpen,
  onClose,
  employees,
  currentEmployeeId,
  onSelectEmployee
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto-focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedRoleFilter('all');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Unique roles for filter chips
  const roles = useMemo(() => {
    const unique = Array.from(new Set(employees.map((e) => e.role)));
    return ['all', ...unique];
  }, [employees]);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return employees.filter((emp) => {
      // Role filter
      if (selectedRoleFilter !== 'all' && emp.role !== selectedRoleFilter) {
        return false;
      }
      if (!q) return true;

      // Search matching name, NIP, role, or phone
      const matchName = emp.name.toLowerCase().includes(q);
      const matchNip = emp.nip.toLowerCase().includes(q);
      const matchRole = emp.role.toLowerCase().includes(q);
      const matchPhone = emp.phone.toLowerCase().includes(q);

      return matchName || matchNip || matchRole || matchPhone;
    });
  }, [employees, searchQuery, selectedRoleFilter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-2xs">
              <Users className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Pencarian Profil Petugas
              </h2>
              <p className="text-xs text-slate-500">
                Apotek Assyifa Farma Cideres · Pilih petugas yang bertugas
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
            title="Tutup (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Box */}
        <div className="p-4 border-b border-slate-100 space-y-3 bg-white">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ketik nama petugas, NIP, jabatan (APA, TTK, Kasir), atau nomor HP..."
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 rounded-md"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Role Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
            {roles.map((r) => {
              const label =
                r === 'all'
                  ? 'Semua Posisi'
                  : r.includes('APA')
                  ? 'APA (Penanggung Jawab)'
                  : r.includes('Aping')
                  ? 'Aping (Pendamping)'
                  : r.includes('TTK')
                  ? 'TTK'
                  : r.includes('Kasir')
                  ? 'Kasir'
                  : 'Gudang';
              const isActive = selectedRoleFilter === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRoleFilter(r)}
                  className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-700 text-white font-bold shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Employee List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-slate-100/80">
          {filteredEmployees.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Search className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-700">
                Tidak ada petugas yang cocok dengan "{searchQuery}"
              </p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Coba gunakan kata kunci nama lain, nomor NIP, atau bersihkan filter pencarian.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedRoleFilter('all');
                }}
                className="mt-2 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Reset Pencarian
              </button>
            </div>
          ) : (
            filteredEmployees.map((emp) => {
              const isSelected = emp.id === currentEmployeeId;
              return (
                <div
                  key={emp.id}
                  onClick={() => {
                    onSelectEmployee(emp.id);
                    onClose();
                  }}
                  className={`pt-2.5 first:pt-0 p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                    isSelected
                      ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-500/20 shadow-2xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200/80 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={emp.avatar}
                        alt={emp.name}
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-200 group-hover:ring-emerald-400 transition-all"
                      />
                      {isSelected && (
                        <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-0.5 shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-emerald-700 transition-colors truncate">
                          {emp.name}
                        </span>
                        {isSelected && (
                          <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-full">
                            Aktif
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-medium text-emerald-700 mt-0.5 truncate">
                        {emp.role}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-0.5">
                        <span className="font-mono">NIP: {emp.nip}</span>
                        {emp.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-2.5 h-2.5 text-slate-400" />
                            <span>{emp.phone}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-700 group-hover:bg-emerald-600 group-hover:text-white'
                      }`}
                    >
                      {isSelected ? 'Terpilih' : 'Pilih'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>
            Ditemukan <strong>{filteredEmployees.length}</strong> dari {employees.length} petugas
          </span>
          <span className="text-[10px] text-slate-400">Tekan Esc untuk menutup</span>
        </div>
      </div>
    </div>
  );
};
