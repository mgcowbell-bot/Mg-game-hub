import React from 'react';
import { 
  X, 
  ShieldCheck, 
  Smartphone, 
  Download, 
  CheckCircle2, 
  Settings, 
  PlayCircle,
  HelpCircle
} from 'lucide-react';

interface SafetyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SafetyGuideModal: React.FC<SafetyGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-slate-950 border border-cyan-800/60 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white font-gaming">
                Android APK Installation & Safety Guide
              </h3>
              <p className="text-xs text-slate-400">
                Official guide by MGCowbell and MGTECH
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Why direct APKs? */}
        <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 text-xs text-slate-300 space-y-1.5">
          <span className="font-bold text-cyan-300 block text-sm">
            Zero Accounts &bull; Zero Trackers &bull; Pure Gaming
          </span>
          <p className="leading-relaxed">
            MG GAMES HUB distributes APK packages directly from the developer to your Android device. 
            You never need to log in, register, or connect personal credentials. 
            All binaries are signed with our verified release key.
          </p>
        </div>

        {/* Step-by-step instructions */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-cyan-400">
            How to Install on Android in 4 Quick Steps:
          </h4>

          <div className="grid gap-3">
            
            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold text-xs flex items-center justify-center shrink-0 border border-cyan-500/40">
                1
              </div>
              <div className="text-xs space-y-0.5">
                <span className="font-bold text-white block">Tap "DOWNLOAD APK"</span>
                <p className="text-slate-400">
                  Select your game and download the package. If Chrome prompts "File might be harmful", tap <strong>"Download anyway"</strong> (standard Android notice for all apps downloaded outside Google Play).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold text-xs flex items-center justify-center shrink-0 border border-cyan-500/40">
                2
              </div>
              <div className="text-xs space-y-0.5">
                <span className="font-bold text-white block">Open the Downloaded APK</span>
                <p className="text-slate-400">
                  Tap the completed download alert in your notification bar, or open your Android <strong>Files / Downloads</strong> app.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold text-xs flex items-center justify-center shrink-0 border border-cyan-500/40">
                3
              </div>
              <div className="text-xs space-y-0.5">
                <span className="font-bold text-white block">Allow "Install Unknown Apps"</span>
                <p className="text-slate-400">
                  If prompted by Android Security, tap <strong>Settings</strong> and toggle on <strong>"Allow from this source"</strong> for Chrome or your File Manager.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-500/40">
                4
              </div>
              <div className="text-xs space-y-0.5">
                <span className="font-bold text-white block">Tap "Install" & Launch</span>
                <p className="text-slate-400">
                  Confirm installation. Within seconds, the game icon appears on your home screen or app drawer. Launch and enjoy!
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-wider transition"
          >
            Got it, Let's Play!
          </button>
        </div>

      </div>
    </div>
  );
};
