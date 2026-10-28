import React, { useState } from 'react';
import { Employee, JobPosition, Shift } from '../types';
import {
  Users,
  UserPlus,
  X,
  Check,
  Edit2,
  Trash2,
  Phone,
  Briefcase,
  IdCard,
  Image as ImageIcon,
  Clock,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface EmployeeManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  shifts: Shift[];
  onAddEmployee: (employee: Employee) => void;
  onUpdateEmployee: (employee: Employee) => void;
  onDeleteEmployee: (employeeId: string) => void;
}

const JOB_POSITIONS: JobPosition[] = [
  'Apoteker Pengelola Apotek (APA)',
  'Apoteker Pendamping (Aping)',
  'Tenaga Teknis Kefarmasian (TTK)',
  'Kasir & Front Office',
  'Logistik & Gudang Farmasi'
];

// Curated avatar options for pharmacy staff
const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1594824813682-14c1d6830722?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80'
];

export const EmployeeManagementModal: React.FC<EmployeeManagementModalProps> = ({
  isOpen,
  onClose,
  employees,
  shifts,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [nip, setNip] = useState('');
  const [role, setRole] = useState<JobPosition>('Tenaga Teknis Kefarmasian (TTK)');
  const [phone, setPhone] = useState('628');
  const [avatar, setAvatar] = useState(DEFAULT_AVATARS[0]);
  const [defaultShiftId, setDefaultShiftId] = useState<string>(shifts[0]?.id || 'shift-1');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setNip(`KRY-${String(employees.length + 1).padStart(3, '0')}`);
    setRole('Tenaga Teknis Kefarmasian (TTK)');
    setPhone('628');
    setAvatar(DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)]);
    setDefaultShiftId(shifts[0]?.id || 'shift-1');
    setEditingEmployee(null);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleStartAdd = () => {
    resetForm();
    setActiveTab('add');
  };

  const handleStartEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setName(emp.name);
    setNip(emp.nip);
    setRole(emp.role);
    setPhone(emp.phone);
    setAvatar(emp.avatar);
    setDefaultShiftId(emp.defaultShiftId || shifts[0]?.id || 'shift-1');
    setErrorMessage(null);
    setSuccessMessage(null);
    setActiveTab('add');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Nama lengkap karyawan wajib diisi.');
      return;
    }
    if (!nip.trim()) {
      setErrorMessage('NIP atau ID Karyawan wajib diisi.');
      return;
    }

    // Clean phone number (format with 62)
    let cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1);
    } else if (!cleanPhone.startsWith('62')) {
      cleanPhone = '62' + cleanPhone;
    }

    if (editingEmployee) {
      const updated: Employee = {
        ...editingEmployee,
        name: name.trim(),
        nip: nip.trim(),
        role,
        phone: cleanPhone,
        avatar,
        defaultShiftId
      };
      onUpdateEmployee(updated);
      setSuccessMessage(`Data ${updated.name} berhasil diperbarui.`);
    } else {
      const newEmp: Employee = {
        id: `emp-${Date.now()}`,
        name: name.trim(),
        nip: nip.trim(),
        role,
        phone: cleanPhone,
        avatar,
        defaultShiftId
      };
      onAddEmployee(newEmp);
      setSuccessMessage(`Karyawan ${newEmp.name} berhasil ditambahkan ke sistem.`);
    }

    setTimeout(() => {
      setActiveTab('list');
      setEditingEmployee(null);
      setSuccessMessage(null);
    }, 900);
  };

  const handleDelete = (empId: string) => {
    if (employees.length <= 1) {
      alert('Sistem harus memiliki minimal 1 karyawan aktif!');
      return;
    }
    onDeleteEmployee(empId);
    setDeleteConfirmId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-emerald-200 border border-white/15">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Kelola Data Karyawan & Staf Farmasi
              </h2>
              <p className="text-xs text-emerald-200/90">
                Apotek Assyifa Farma Cideres · Total {employees.length} Petugas Aktif
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center border-b border-slate-200 px-4 sm:px-5 bg-slate-50/80 shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab('list');
              setEditingEmployee(null);
            }}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'list'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Daftar Karyawan ({employees.length})</span>
          </button>

          <button
            type="button"
            onClick={handleStartAdd}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'add'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>{editingEmployee ? 'Edit Data Karyawan' : '+ Tambah Karyawan Baru'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === 'list' ? (
            /* List View */
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-500 font-medium">
                  Seluruh staf terdaftar untuk presensi & laporan farmasi:
                </span>
                <button
                  type="button"
                  onClick={handleStartAdd}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Tambah Karyawan</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {employees.map((emp) => {
                  const defaultShift = shifts.find((s) => s.id === emp.defaultShiftId);
                  return (
                    <div
                      key={emp.id}
                      className="p-3 sm:p-3.5 bg-white border border-slate-200/90 rounded-xl shadow-2xs hover:border-emerald-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={emp.avatar}
                          alt={emp.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                              {emp.name}
                            </h3>
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-semibold border border-slate-200">
                              NIP: {emp.nip}
                            </span>
                          </div>
                          <div className="text-xs text-emerald-800 font-medium mt-0.5 truncate">
                            {emp.role}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>WA: {emp.phone}</span>
                            {defaultShift && (
                              <>
                                <span>·</span>
                                <span>Shift: {defaultShift.name}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(emp)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(emp.id)}
                          disabled={employees.length <= 1}
                          className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Delete confirmation modal */}
              {deleteConfirmId && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                  <div className="text-xs font-bold text-rose-950">
                    Konfirmasi Hapus Data Karyawan?
                  </div>
                  <p className="text-[11px] text-rose-800">
                    Karyawan ini akan dihapus dari daftar presensi Apotek Assyifa Farma Cideres. Riwayat absensi yang sudah tercatat sebelumnya tetap tersimpan di riwayat.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleDelete(deleteConfirmId)}
                      className="px-3 py-1 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      Ya, Hapus Karyawan
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-3 py-1 bg-white border border-slate-300 text-slate-700 font-semibold text-xs rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Add / Edit Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Nama Karyawan */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Nama Lengkap & Gelar Karyawan:
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Contoh: apt. Siti Nurhaliza, S.Farm atau Rina Melati, A.Md.Farm"
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 text-slate-900 font-medium"
                    />
                  </div>
                </div>

                {/* NIP / Nomor Induk Pegawai */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    NIP / ID Karyawan:
                  </label>
                  <input
                    type="text"
                    required
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                    placeholder="Contoh: KRY-004 atau 19940815..."
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 text-slate-900 font-mono font-medium"
                  />
                </div>

                {/* Jabatan / Posisi */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Jabatan / Posisi di Apotek:
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as JobPosition)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 text-slate-900 font-semibold"
                  >
                    {JOB_POSITIONS.map((pos) => (
                      <option key={pos} value={pos}>
                        {pos}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Nomor WhatsApp */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    No. WhatsApp (Untuk Notifikasi):
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 6281234567890"
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 text-slate-900 font-mono"
                  />
                  <span className="text-[10px] text-slate-400 block">
                    Gunakan kode negara 62 (misal: 6281234567890)
                  </span>
                </div>

                {/* Shift Default */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Shift Kerja Rutin:
                  </label>
                  <select
                    value={defaultShiftId}
                    onChange={(e) => setDefaultShiftId(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 text-slate-900 font-semibold"
                  >
                    {shifts.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.startTime} - {s.endTime})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pilihan Foto Profil / Avatar */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-800">
                  Pilih Foto Profil Resmi Karyawan:
                </label>
                <div className="flex items-center gap-3 overflow-x-auto py-1">
                  {DEFAULT_AVATARS.map((imgUrl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAvatar(imgUrl)}
                      className={`relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                        avatar === imgUrl
                          ? 'border-emerald-600 ring-2 ring-emerald-400/40 shadow-xs scale-105'
                          : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Avatar ${i + 1}`}
                        className="w-12 h-12 object-cover"
                      />
                      {avatar === imgUrl && (
                        <div className="absolute inset-0 bg-emerald-700/30 flex items-center justify-center text-white">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="pt-1">
                  <span className="text-[11px] text-slate-500 block mb-1">
                    Atau gunakan tautan URL foto kustom:
                  </span>
                  <input
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://..."
                    className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 text-slate-700 font-mono"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('list');
                    setEditingEmployee(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingEmployee ? 'Simpan Perubahan' : 'Simpan Karyawan Baru'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <span>Data karyawan otomatis tersinkronisasi ke Firebase Cloud Database.</span>
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
