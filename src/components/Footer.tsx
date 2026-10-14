import React, { useState } from 'react';
import { 
  Gamepad2, 
  ShieldCheck, 
  Mail, 
  Lock, 
  Heart, 
  ExternalLink,
  X
} from 'lucide-react';

interface FooterProps {
  onOpenSafetyGuide: () => void;
  onOpenAdminPortal: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenSafetyGuide,
  onOpenAdminPortal,
}) => {
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <footer className="w-full bg-[#06080e] border-t border-slate-900 mt-20 pt-12 pb-8 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center p-0.5">
                <div className="w-full h-full bg-[#080b12] rounded-[6px] flex items-center justify-center">
                  <Gamepad2 className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <span className="text-lg font-bold text-white font-gaming tracking-wider">
                MG <span className="text-cyan-400">GAMES</span> HUB
              </span>
            </div>

            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              The premier Android gaming portal dedicated to high-performance APK distribution. 
              Built with zero user accounts, zero bloat, and pure direct download access for mobile gamers worldwide.
            </p>

            <div className="text-[11px] text-slate-400 space-y-0.5">
              <p>Publisher: <span className="text-cyan-300 font-semibold">MGCowbell</span> &bull; <span className="text-blue-400 font-semibold">MGTECH</span></p>
              <p>Contact: <a href="mailto:mgcowbell@gmail.com" className="text-slate-300 hover:text-cyan-300 underline">mgcowbell@gmail.com</a></p>
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-white font-gaming">
              Navigation & Guides
            </h5>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={onOpenSafetyGuide}
                  className="hover:text-cyan-300 transition text-left"
                >
                  Android APK Installation Guide
                </button>
              </li>
              <li>
                <button
                  onClick={() => setAboutOpen(true)}
                  className="hover:text-cyan-300 transition text-left"
                >
                  About MG GAMES HUB
                </button>
              </li>
              <li>
                <button
                  onClick={() => setPrivacyOpen(true)}
                  className="hover:text-cyan-300 transition text-left"
                >
                  Privacy Policy & Zero-Login Charter
                </button>
              </li>
            </ul>
          </div>

          {/* Owner & Security */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-white font-gaming">
              Security & Ownership
            </h5>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              All published APK packages are verified for integrity, compiled with native arm64/armeabi-v7a targets, and scanned for Android safety.
            </p>
            <div className="pt-2">
              <button
                onClick={onOpenAdminPortal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition text-[11px]"
              >
                <Lock className="w-3 h-3 text-cyan-400" />
                <span>Owner Management Portal</span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>&copy; {new Date().getFullYear()} MG GAMES HUB &bull; MGCowbell & MGTECH. All rights reserved.</p>
          <p className="flex items-center gap-1">
            <span>Optimized for Android smartphones and tablets</span>
          </p>
        </div>

      </div>

      {/* Privacy Policy Modal */}
      {privacyOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-xl bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white font-gaming">Privacy Policy & Zero-Data Charter</h4>
              <button onClick={() => setPrivacyOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-slate-300 leading-relaxed max-h-72 overflow-y-auto pr-1">
              <p><strong>1. Zero Account Architecture:</strong> MG GAMES HUB is strictly engineered without user registration, sign-up forms, or visitor profiles. You are never asked for names, emails, passwords, or personal credentials.</p>
              <p><strong>2. Direct Downloads:</strong> Clicking "DOWNLOAD APK" downloads the binary directly from our server. We do not inject telemetry, analytics trackers, or commercial cookies into the APK packages.</p>
              <p><strong>3. Minimal Atomic Counters:</strong> When an APK is downloaded, an anonymous counter increments to display download statistics. No personal identifying information (PII) is captured or retained.</p>
              <p><strong>4. Inquiries:</strong> Contact developer MGCowbell at mgcowbell@gmail.com.</p>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPrivacyOpen(false)}
                className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* About Modal */}
      {aboutOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-xl bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white font-gaming">About MG GAMES HUB</h4>
              <button onClick={() => setAboutOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-slate-300 leading-relaxed">
              <p>
                <strong>MG GAMES HUB</strong> is the official gaming distribution platform for independent game releases created by <strong>MGCowbell</strong> and <strong>MGTECH</strong>.
              </p>
              <p>
                Frustrated by ad-cluttered app stores and mandatory account sign-ups, MG GAMES HUB was created with a simple philosophy: <em>Make great Android games and let players download them instantly.</em>
              </p>
              <p>
                From cyberpunk reflex combat to dark fantasy RPGs and arcade drift racing, all titles are engineered with custom high-frame-rate Android graphics and responsive touch controls.
              </p>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setAboutOpen(false)}
                className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </footer>
  );
};
