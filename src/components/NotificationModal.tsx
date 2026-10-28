import React from 'react';
import { LateAlertNotification, Employee } from '../types';
import { Bell, AlertTriangle, Send, CheckCircle, X } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: LateAlertNotification[];
  employees: Employee[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  employees,
  onMarkAsRead,
  onMarkAllAsRead
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-700" />
            <h3 className="font-bold text-slate-900 text-sm">
              Pusat Notifikasi Keterlambatan Otomatis
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action strip */}
        <div className="px-4 py-2 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">
            Total {notifications.length} notifikasi
          </span>
          {notifications.some((n) => !n.isRead) && (
            <button
              onClick={onMarkAllAsRead}
              className="text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer"
            >
              Tandai Semua Telah Dibaca
            </button>
          )}
        </div>

        {/* Notification list */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1 text-xs">
          {notifications.length === 0 ? (
            <div className="py-10 text-center text-slate-400">
              Tidak ada notifikasi keterlambatan.
            </div>
          ) : (
            notifications.map((notif) => {
              const emp = employees.find((e) => e.id === notif.employeeId);
              return (
                <div
                  key={notif.id}
                  className={`p-3 rounded-lg border transition-all ${
                    notif.isRead
                      ? 'bg-slate-50 border-slate-200 text-slate-600'
                      : 'bg-rose-50/70 border-rose-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <div className="p-1 bg-rose-600 text-white rounded mt-0.5 shrink-0">
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">
                          {notif.employeeName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {notif.shiftName} · Jadwal: {notif.scheduledTime} WIB
                        </div>
                      </div>
                    </div>

                    <span className="text-rose-700 font-bold bg-white px-2 py-0.5 rounded border border-rose-200 tabular-nums shrink-0">
                      +{notif.lateMinutes} mnt
                    </span>
                  </div>

                  <div className="mt-2 text-[11px] text-slate-600 space-y-1">
                    <div>
                      Jam Masuk: <strong className="text-slate-900 font-mono">{notif.clockInTime} WIB</strong>
                    </div>
                    {notif.reason && (
                      <div className="bg-white/80 p-1.5 rounded border border-slate-200/80">
                        Alasan: {notif.reason}
                      </div>
                    )}
                    <div className="text-slate-400 text-[10px] tabular-nums">
                      {notif.timestamp}
                    </div>
                  </div>

                  {!notif.isRead && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200 flex justify-end">
                      <button
                        onClick={() => onMarkAsRead(notif.id)}
                        className="text-xs text-slate-600 hover:text-slate-900 font-medium underline cursor-pointer"
                      >
                        Tandai sudah ditinjau
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-900 cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
