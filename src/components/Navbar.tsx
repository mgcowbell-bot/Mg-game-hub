import React, { useState } from 'react';
import { 
  Gamepad2, 
  Search, 
  ShieldCheck, 
  Sparkles, 
  Lock, 
  Menu, 
  X, 
  DownloadCloud,
  Layers,
  LogOut,
  Home
} from 'lucide-react';
import { auth, ADMIN_EMAIL } from '../lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { HubStats } from '../types/game';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  stats: HubStats | null;
  onOpenSafetyGuide: () => void;
  onOpenAdminPortal: () => void;
  onOpenAiStudio: () => void;
  onSelectCategory: (category: string) => void;
  currentCategory: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  stats,
  onOpenSafetyGuide,
  onOpenAdminPortal,
  onOpenAiStudio,
  onSelectCategory,
  currentCategory,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

  const isAdmin = user && user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#080b12]/85 border-b border-cyan-950/60 shadow-lg shadow-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => onSelectCategory('All')}>
            <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 p-0.5 shadow-lg shadow-cyan-500/20 group">
              <div className="w-full h-full bg-[#080b12] rounded-[10px] flex items-center justify-center transition group-hover:bg-[#0c1220]">
                <Gamepad2 className="w-6 h-6 text-cyan-400 animate-pulse" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#080b12]" title="Hub Online" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-extrabold tracking-wider text-white font-gaming">
                  MG <span className="text-cyan-400">GAMES</span> HUB
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 rounded">
                  APK
                </span>
              </div>
              <p className="text-[11px] font-medium tracking-wider text-slate-400">
                BY <span className="text-cyan-300 font-semibold">MGCOWBELL</span> &bull; <span className="text-blue-400 font-semibold">MGTECH</span>
              </p>
            </div>
          </div>

          {/* Search bar (Desktop & Tablet) */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search Android games, genres, or packages..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Action buttons (Desktop) */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={() => onSelectCategory('All')}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-900/70 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition"
              title="Return to Home Showcase & Library"
            >
              <Home className="w-3.5 h-3.5 text-cyan-400" />
              <span>Home</span>
            </button>

            <button
              onClick={onOpenSafetyGuide}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-cyan-300 bg-slate-900/70 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Safety & Install Guide</span>
            </button>

            <button
              onClick={onOpenAiStudio}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-cyan-200 bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-700/50 rounded-xl transition shadow-sm"
              title="AI Game Artwork Generator (Gemini 3 Pro Image Preview)"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>AI Art Studio</span>
              <span className="px-1.5 py-0.2 text-[9px] bg-cyan-500 text-slate-950 font-bold rounded">
                4K
              </span>
            </button>

            {isAdmin ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenAdminPortal}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-700/60 rounded-xl transition shadow-sm"
                  title={`Admin signed in: ${user?.email}`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Admin Studio</span>
                </button>
                <button
                  onClick={async () => {
                    try {
                      await signOut(auth);
                    } catch {}
                    sessionStorage.removeItem('mg_admin_token');
                    window.location.reload();
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-300 bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/60 rounded-xl transition"
                  title="Log out from Admin session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAdminPortal}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/70 hover:bg-slate-800 border border-slate-700/70 rounded-xl transition"
                title="Admin Sign-In (mgcowbell@gmail.com)"
              >
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Admin Sign-In</span>
              </button>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenAdminPortal}
              className="p-2 text-slate-400 hover:text-cyan-400 rounded-lg"
              title="Owner Portal"
            >
              <Lock className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white bg-slate-800/80 border border-slate-700 rounded-xl"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search Android games..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800 space-y-2">
            <button
              onClick={() => {
                onSelectCategory('All');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-200 bg-slate-900/70 rounded-xl border border-slate-800"
            >
              <Home className="w-4 h-4 text-cyan-400" />
              <span>Home Showcase & Library</span>
            </button>
            <button
              onClick={() => {
                onOpenSafetyGuide();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-200 bg-slate-900/70 rounded-xl border border-slate-800"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Safety & Android Install Guide</span>
            </button>
            <button
              onClick={() => {
                onOpenAiStudio();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-cyan-200 bg-cyan-950/40 rounded-xl border border-cyan-800/60"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>AI Artwork Studio (1K, 2K, 4K)</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-cyan-500 text-slate-950 font-bold rounded">
                PRO
              </span>
            </button>
            <button
              onClick={() => {
                onOpenAdminPortal();
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium rounded-xl border ${
                isAdmin
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800'
                  : 'bg-slate-900/70 text-slate-300 border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Lock className="w-4 h-4 text-cyan-400" />
                <span>{isAdmin ? 'Admin Studio (mgcowbell@gmail.com)' : 'Admin Sign-In'}</span>
              </div>
              {isAdmin && (
                <span className="text-[10px] px-2 py-0.5 bg-emerald-500 text-slate-950 font-bold rounded">
                  Post APK
                </span>
              )}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
