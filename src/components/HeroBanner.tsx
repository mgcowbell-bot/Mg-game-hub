import React from 'react';
import { 
  Download, 
  ShieldCheck, 
  Smartphone, 
  Sparkles, 
  Flame, 
  Star, 
  Cpu, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { Game } from '../types/game';

interface HeroBannerProps {
  featuredGame: Game | null;
  onSelectGame: (game: Game) => void;
  onDownloadApk: (game: Game) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  featuredGame,
  onSelectGame,
  onDownloadApk,
}) => {
  if (!featuredGame) return null;

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-cyan-900/60 bg-gradient-to-br from-slate-950 via-[#0a0f1d] to-[#0d1629] p-6 sm:p-10 lg:p-12 mb-12 shadow-2xl shadow-cyan-950/40">
      
      {/* Background ambient decorative effects */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Info & Action */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              Featured Release
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800/80 text-slate-300 border border-slate-700">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              {featuredGame.rating} / 5.0
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Verified Clean APK
            </span>
          </div>

          <div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight font-gaming mb-3">
              {featuredGame.title}
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              {featuredGame.tagline || featuredGame.description.slice(0, 160) + '...'}
            </p>
          </div>

          {/* Quick specs pill badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-1">
            <div className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-left">
              <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider block">APK Version</span>
              <span className="text-sm font-bold text-cyan-300">{featuredGame.version}</span>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-left">
              <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider block">File Size</span>
              <span className="text-sm font-bold text-white">{featuredGame.fileSize}</span>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-left">
              <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider block">Requirement</span>
              <span className="text-sm font-bold text-slate-200 truncate block">{featuredGame.minAndroid.split('(')[0]}</span>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-left">
              <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider block">Downloads</span>
              <span className="text-sm font-bold text-emerald-400">{featuredGame.downloadCount.toLocaleString()}</span>
            </div>
          </div>

          {/* Key highlights checklist */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              100% Free & No Sign-up Required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              Signed with MGCowbell Release Key
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              Zero Third-Party Adware
            </span>
          </div>

          {/* Call to actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button
              onClick={() => onDownloadApk(featuredGame)}
              className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 text-white font-extrabold text-base tracking-wide shadow-xl shadow-cyan-500/25 hover:shadow-cyan-400/40 transition transform active:scale-95 group font-gaming"
            >
              <Download className="w-5 h-5 text-white animate-bounce group-hover:scale-110 transition" />
              <span>DOWNLOAD APK ({featuredGame.fileSize})</span>
            </button>

            <button
              onClick={() => onSelectGame(featuredGame)}
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-sm border border-slate-700/80 transition"
            >
              <span>View Screenshots & Specs</span>
              <ArrowRight className="w-4 h-4 text-cyan-400" />
            </button>
          </div>

        </div>

        {/* Right Column: Game Cover Showcase with 3D feel */}
        <div className="lg:col-span-5 relative group cursor-pointer" onClick={() => onSelectGame(featuredGame)}>
          <div className="relative mx-auto max-w-md rounded-2xl overflow-hidden border-2 border-cyan-500/40 shadow-2xl shadow-cyan-500/20 group-hover:border-cyan-400 group-hover:shadow-cyan-400/40 transition duration-500">
            <img
              src={featuredGame.coverImage}
              alt={featuredGame.title}
              className="w-full h-72 sm:h-80 object-cover transform group-hover:scale-105 transition duration-700 ease-out"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

            {/* Bottom floating tag */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between p-3 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800">
              <div>
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">Official Release</span>
                <span className="text-xs font-semibold text-white">{featuredGame.packageName}</span>
              </div>
              <span className="text-xs font-bold text-cyan-300 group-hover:translate-x-1 transition flex items-center gap-1">
                Explore <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
