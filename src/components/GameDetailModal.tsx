import React, { useState } from 'react';
import { 
  X, 
  Download, 
  ShieldCheck, 
  Smartphone, 
  HardDrive, 
  Calendar, 
  Cpu, 
  Copy, 
  Check, 
  Share2, 
  FileCode, 
  Layers, 
  Star, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  Maximize2,
  Loader2,
  MessageSquare,
  Send,
  User
} from 'lucide-react';
import { Game, GameComment } from '../types/game';
import { auth } from '../lib/firebase';

interface GameDetailModalProps {
  game: Game | null;
  onClose: () => void;
  onDownloadApk: (game: Game) => void;
  onCommentAdded?: (updatedGame: Game) => void;
}

export const GameDetailModal: React.FC<GameDetailModalProps> = ({
  game,
  onClose,
  onDownloadApk,
  onCommentAdded,
}) => {
  const [copiedSha, setCopiedSha] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeScreenshot, setActiveScreenshot] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  // Comments state
  const currentUser = auth.currentUser;
  const [commentAuthor, setCommentAuthor] = useState(currentUser?.displayName || currentUser?.email?.split('@')[0] || '');
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentsList, setCommentsList] = useState<GameComment[]>(game?.comments || []);

  React.useEffect(() => {
    if (game) {
      setCommentsList(game.comments || []);
    }
  }, [game]);

  if (!game) return null;

  const handleCopySha = () => {
    if (!game.sha256) return;
    navigator.clipboard.writeText(game.sha256);
    setCopiedSha(true);
    setTimeout(() => setCopiedSha(false), 2000);
  };

  const handleShareLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?game=${game.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownload = () => {
    setDownloading(true);
    onDownloadApk(game);
    setTimeout(() => setDownloading(false), 2500);
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setSubmittingComment(true);
      const res = await fetch(`/api/games/${game.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: commentAuthor.trim() || currentUser?.displayName || 'Anonymous Gamer',
          text: commentText.trim(),
        }),
      });

      if (!res.ok) throw new Error('Failed to post comment');
      const newComment = await res.json();
      const updatedComments = [newComment, ...commentsList];
      setCommentsList(updatedComments);
      setCommentText('');

      if (onCommentAdded) {
        onCommentAdded({ ...game, comments: updatedComments });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      
      {/* Container */}
      <div className="relative w-full max-w-4xl bg-slate-950 border border-cyan-900/60 rounded-3xl overflow-hidden shadow-2xl shadow-cyan-950/60 my-auto text-slate-200">
        
        {/* Floating close and share buttons */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button
            onClick={handleShareLink}
            className="p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 backdrop-blur-md transition"
            title="Copy Direct Link to this Game"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 backdrop-blur-md transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hero Header with Cover Image */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-900">
          <img
            src={game.coverImage}
            alt={game.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />

          {/* Header text content */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-start gap-4">
              {game.logoUrl && (
                <img
                  src={game.logoUrl}
                  alt={`${game.title} Logo`}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-cyan-400/80 shadow-lg bg-slate-900 shrink-0 hidden sm:block"
                />
              )}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-cyan-500 text-slate-950 rounded-lg">
                    {game.category}
                  </span>
                  <span className="px-2.5 py-1 text-xs font-semibold bg-slate-900/80 text-cyan-300 border border-cyan-800/60 rounded-lg">
                    Dev: {game.developer}
                  </span>
                  <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-slate-900/80 text-amber-300 border border-slate-800 rounded-lg">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {game.rating} / 5.0
                  </span>
                </div>

                <h2 className="text-2xl sm:text-4xl font-black text-white font-gaming tracking-tight">
                  {game.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                  {game.tagline || game.description.slice(0, 140) + '...'}
                </p>
              </div>
            </div>

            {/* Quick stats on banner */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Downloads</span>
                <span className="text-sm font-bold text-emerald-400">
                  {game.downloadCount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-8 space-y-8">
          
          {/* Main Download CTA Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-blue-950/50 to-slate-900 border border-cyan-600/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Verified Direct APK Package</span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full">
                  100% Free
                </span>
              </div>
              <h3 className="text-xl font-bold text-white font-gaming">
                Download {game.title} v{game.version}
              </h3>
              <p className="text-xs text-slate-400">
                Direct file transfer from MG GAMES HUB servers. No login, registration, or third-party installer required.
              </p>
            </div>

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 active:scale-95 text-white font-extrabold text-sm tracking-wider shadow-lg shadow-cyan-500/30 hover:shadow-cyan-400/50 transition font-gaming shrink-0"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  <span>STARTING DOWNLOAD...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 text-white animate-bounce" />
                  <span>DOWNLOAD APK ({game.fileSize})</span>
                </>
              )}
            </button>
          </div>

          {/* Social Media Sharing Component */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-300 font-medium flex items-center gap-2">
              <Share2 className="w-4 h-4 text-cyan-400" />
              <span>Share this Android game with friends:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out ${game.title} - Download the Android APK on MG GAMES HUB: ${window.location.origin}${window.location.pathname}?game=${game.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/80 text-xs font-bold flex items-center gap-1.5 transition"
                title="Share on WhatsApp"
              >
                <span>WhatsApp</span>
              </a>

              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(`${window.location.origin}${window.location.pathname}?game=${game.slug}`)}&text=${encodeURIComponent(`Download ${game.title} Android APK on MG GAMES HUB!`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-xl bg-sky-950/80 hover:bg-sky-900 text-sky-300 border border-sky-800/80 text-xs font-bold flex items-center gap-1.5 transition"
                title="Share on Telegram"
              >
                <span>Telegram</span>
              </a>

              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Download ${game.title} Android APK on MG GAMES HUB!`)}&url=${encodeURIComponent(`${window.location.origin}${window.location.pathname}?game=${game.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
                title="Share on Twitter / X"
              >
                <span>Twitter / X</span>
              </a>

              <button
                onClick={handleShareLink}
                className="px-3 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/80 text-xs font-bold flex items-center gap-1.5 transition"
                title="Copy Direct Link"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Android Technical Specifications Table */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              Technical Specifications & System Requirements
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-[11px] text-slate-400 block font-medium">APK Version</span>
                <span className="text-sm font-bold text-cyan-300">{game.version}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-[11px] text-slate-400 block font-medium">Download Size</span>
                <span className="text-sm font-bold text-white">{game.fileSize}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-[11px] text-slate-400 block font-medium">Min Android OS</span>
                <span className="text-sm font-bold text-slate-200">{game.minAndroid}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-[11px] text-slate-400 block font-medium">CPU Architecture</span>
                <span className="text-sm font-bold text-slate-200">{game.architecture}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-[11px] text-slate-400 block font-medium">Package Identifier</span>
                <span className="text-xs font-mono font-semibold text-slate-300 truncate block" title={game.packageName}>
                  {game.packageName}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-[11px] text-slate-400 block font-medium">Initial Release</span>
                <span className="text-xs font-semibold text-slate-300">{game.releaseDate}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-[11px] text-slate-400 block font-medium">Last Updated</span>
                <span className="text-xs font-semibold text-cyan-300">{game.updatedAt}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-[11px] text-slate-400 block font-medium">Publisher Signature</span>
                <span className="text-xs font-bold text-emerald-400">MGCowbell Verified</span>
              </div>
            </div>

            {/* SHA-256 Checksum Card */}
            {game.sha256 && (
              <div className="mt-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="text-slate-400 shrink-0">SHA-256 Checksum:</span>
                  <span className="font-mono text-slate-300 truncate select-all">{game.sha256}</span>
                </div>
                <button
                  onClick={handleCopySha}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white shrink-0 flex items-center gap-1 transition"
                  title="Copy SHA-256 Checksum"
                >
                  {copiedSha ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Screenshots Gallery */}
          {game.screenshots && game.screenshots.length > 0 && (
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-2">
                <Maximize2 className="w-4 h-4" />
                In-Game Screenshots
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {game.screenshots.map((shot, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveScreenshot(shot)}
                    className="relative group rounded-xl overflow-hidden border border-slate-800 hover:border-cyan-500/60 cursor-pointer h-40 bg-slate-900 transition"
                  >
                    <img
                      src={shot}
                      alt={`${game.title} Screenshot ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                      <span className="px-3 py-1 rounded-full bg-slate-950/80 text-xs font-semibold text-white border border-slate-700">
                        Click to enlarge
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description & Key Features */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            <div className="md:col-span-7 space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-cyan-400">About the Game</h4>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {game.description}
              </p>

              {game.features && game.features.length > 0 && (
                <div className="pt-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Key Highlights</h5>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {game.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Version Changelog & What's New */}
            <div className="md:col-span-5 space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-cyan-400">Changelog & Updates</h4>
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                  <span className="font-bold text-cyan-300">Version {game.version}</span>
                  <span className="text-slate-400">{game.updatedAt}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line font-mono">
                  {game.changelog || 'Performance improvements and bug fixes.'}
                </p>
              </div>
            </div>

          </div>

          {/* Game Comments Section (Optional login or register name) */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span>Gamer Community Comments ({commentsList.length})</span>
              </h4>
              <span className="text-[11px] text-slate-400">Optional login or register</span>
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handlePostComment} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Your Name / Gamer Tag</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="e.g. CyberGamer"
                      value={commentAuthor}
                      onChange={(e) => setCommentAuthor(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              </div>

              <div>
                <textarea
                  required
                  rows={2}
                  placeholder="Share your thoughts, review, or tips for this Android game..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingComment}
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition disabled:opacity-50"
                >
                  {submittingComment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Post Comment</span>
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-3 pt-2 border-t border-slate-800/80 max-h-64 overflow-y-auto">
              {commentsList.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No comments yet. Be the first gamer to share feedback!</p>
              ) : (
                commentsList.map((c) => (
                  <div key={c.id} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-cyan-300">{c.author}</span>
                      <span className="text-[10px] text-slate-500">{c.date}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{c.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Safety Reminder & Verified Banner */}
          <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-amber-200/90 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-400 text-sm">
              <ShieldCheck className="w-4 h-4" />
              Safety Guarantee & Android Installation Notice
            </div>
            <p className="leading-relaxed">
              Every APK distributed on MG GAMES HUB is compiled directly by the MGCowbell and MGTECH engineering team. 
              We never host third-party clones, cracked binaries, or inject tracking software. 
              Always ensure you download Android APKs exclusively from trusted creators.
            </p>
          </div>

        </div>

      </div>

      {/* Fullscreen Screenshot Lightbox */}
      {activeScreenshot && (
        <div 
          onClick={() => setActiveScreenshot(null)}
          className="fixed inset-0 z-60 bg-black/95 flex items-center justify-center p-4 cursor-pointer"
        >
          <button 
            onClick={() => setActiveScreenshot(null)}
            className="absolute top-6 right-6 p-3 rounded-full bg-slate-800 text-white"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={activeScreenshot}
            alt="Fullscreen preview"
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}

    </div>
  );
};
