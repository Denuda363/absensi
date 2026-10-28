import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, Laptop, X, Share, PlusSquare, Check } from 'lucide-react';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'compact' | 'full' | 'navbar';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'compact'
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  // If already running inside installed standalone PWA app, hide button
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      setShowHelpModal(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        title="Pasang / Install Aplikasi di PC, Tablet, atau HP (Bisa dibuka offline dan tanpa browser address bar)"
        className={`group relative flex items-center gap-1.5 transition-all cursor-pointer font-bold ${
          variant === 'navbar'
            ? 'px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-2xs text-xs'
            : variant === 'compact'
            ? 'px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs'
            : 'px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl shadow-md text-xs'
        } ${className}`}
      >
        <Download className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
        <span className="whitespace-nowrap">Install Aplikasi</span>
      </button>

      {/* Modal Petunjuk Install iOS (iPhone / iPad) */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Smartphone className="w-4 h-4 text-emerald-700" />
                <span>Pasang di iPhone / iPad</span>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <p>Untuk memasang aplikasi <strong>Apotek Assyifa Farma</strong> di layar utama iPhone/iPad:</p>
              
              <div className="space-y-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    1
                  </span>
                  <span>Buka halaman ini di browser <strong>Safari</strong>.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    2
                  </span>
                  <span>
                    Ketuk tombol <strong>Bagikan</strong> (<Share className="w-3.5 h-3.5 inline text-blue-600" />) di bilah bawah Safari.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    3
                  </span>
                  <span>
                    Gulir ke bawah dan pilih <strong>Tambahkan ke Layar Utama</strong> (<PlusSquare className="w-3.5 h-3.5 inline text-slate-800" />).
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    4
                  </span>
                  <span>Ketuk <strong>Tambah</strong> di pojok kanan atas. Ikon aplikasi akan langsung muncul di layar utama!</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}

      {/* Modal Petunjuk Install PC & Android */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Laptop className="w-4 h-4 text-emerald-700" />
                <span>Pasang Aplikasi (PWA)</span>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <p>Aplikasi ini dapat diinstall sebagai aplikasi mandiri di semua perangkat:</p>
              
              <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Laptop className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Pada Komputer / Laptop (Chrome / Edge):</span>
                </div>
                <p className="text-[11px] text-slate-600 pl-5">
                  Klik ikon install (<Download className="w-3 h-3 inline text-emerald-700" />) di ujung kanan bilah alamat (URL bar) browser Anda, lalu klik <strong>Install</strong>.
                </p>

                <div className="font-semibold text-slate-800 flex items-center gap-1.5 pt-1 border-t border-slate-200/60">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Pada HP / Tablet Android (Chrome):</span>
                </div>
                <p className="text-[11px] text-slate-600 pl-5">
                  Ketuk menu titik tiga (⋮) di pojok kanan atas browser, lalu pilih <strong>Tambahkan ke Layar Utama</strong> atau <strong>Install Aplikasi</strong>.
                </p>
              </div>

              <div className="text-[11px] text-emerald-900 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                ✓ Aplikasi akan terbuka dalam jendela tersendiri tanpa bilah URL browser, lebih cepat, dan nyaman digunakan sehari-hari.
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
};
