import React, { useState } from 'react';
import { 
  Download, 
  Star, 
  Smartphone, 
  HardDrive, 
  ShieldCheck, 
  Layers, 
  ExternalLink,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { Game } from '../types/game';

interface GameCardProps {
  game: Game;
  onSelectGame: (game: Game) => void;
  onDownloadApk: (game: Game) => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  onSelectGame,
  onDownloadApk,
}) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloading(true);
    onDownloadApk(game);
    setTimeout(() => setDownloading(false), 2000);
  };

  return (
    <div 
      onClick={() => onSelectGame(game)}
      className="group relative flex flex-col bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-cyan-950/40 cursor-pointer"
    >
      {/* Cover Image & Overlay Badges */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-950">
        <img
          src={game.coverImage}
          alt={game.title}
          loading="lazy"
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <span className="px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase bg-slate-950/80 backdrop-blur-md text-cyan-400 border border-cyan-800/60 rounded-lg">
            {game.category}
          </span>

          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-800 text-xs font-semibold text-amber-300">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{game.rating}</span>
          </div>
        </div>

        {/* Developer Branding Watermark */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-slate-300">
          <span className="font-semibold px-2 py-0.5 rounded bg-slate-950/70 backdrop-blur-sm border border-slate-800/80">
            Dev: <span className="text-cyan-300">{game.developer}</span>
          </span>
          <span className="flex items-center gap-1 font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
            <ShieldCheck className="w-3 h-3" /> Clean APK
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-1 p-5 space-y-4">
        
        <div>
          <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition font-gaming line-clamp-1">
            {game.title}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
            {game.tagline || game.description}
          </p>
        </div>

        {/* Specifications Matrix */}
        <div className="grid grid-cols-3 gap-2 py-2 px-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-center">
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Version</span>
            <span className="text-xs font-bold text-cyan-300">{game.version}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 block font-medium">APK Size</span>
            <span className="text-xs font-bold text-slate-200">{game.fileSize}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Downloads</span>
            <span className="text-xs font-bold text-emerald-400">
              {game.downloadCount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Action Button Row */}
        <div className="mt-auto pt-2 flex items-center gap-2">
          <button
            onClick={handleDownloadClick}
            disabled={downloading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-slate-950 font-bold text-xs tracking-wider transition shadow-md shadow-cyan-500/20 hover:shadow-cyan-400/40 font-gaming"
            title={`Download ${game.title} APK directly`}
          >
            {downloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>DOWNLOADING...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-slate-950" />
                <span>DOWNLOAD APK</span>
              </>
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectGame(game);
            }}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
            title="View screenshots, specs and changelog"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
