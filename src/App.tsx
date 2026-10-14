/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  Gamepad2, 
  Search, 
  Sparkles, 
  DownloadCloud, 
  ShieldCheck, 
  Flame, 
  Zap, 
  ChevronRight, 
  Loader2, 
  AlertCircle,
  RefreshCw,
  FolderOpen
} from 'lucide-react';

import { Game, HubStats } from './types/game';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { CategoryFilter } from './components/CategoryFilter';
import { GameCard } from './components/GameCard';
import { GameDetailModal } from './components/GameDetailModal';
import { SafetyGuideModal } from './components/SafetyGuideModal';
import { AiArtGeneratorModal } from './components/AiArtGeneratorModal';
import { AdminPortalModal } from './components/AdminPortalModal';
import { Footer } from './components/Footer';
import { AuthGateModal } from './components/AuthGateModal';
import { auth } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [games, setGames] = useState<Game[]>([]);
  const [stats, setStats] = useState<HubStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('latest');

  // Modals state
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [safetyGuideOpen, setSafetyGuideOpen] = useState(false);
  const [aiStudioOpen, setAiStudioOpen] = useState(false);
  const [adminPortalOpen, setAdminPortalOpen] = useState(false);

  // Callback to set generated AI art into game cover
  const [coverCallback, setCoverCallback] = useState<((url: string) => void) | null>(null);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  // Fetch games & stats from API
  const loadHubData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [gamesRes, statsRes] = await Promise.all([
        fetch('/api/games'),
        fetch('/api/stats/summary'),
      ]);

      if (!gamesRes.ok) throw new Error('Could not load games catalog.');

      const gamesData = await gamesRes.json();
      setGames(gamesData);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to MG GAMES HUB.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadHubData();

      // Check URL parameters for direct game link (?game=slug)
      const params = new URLSearchParams(window.location.search);
      const gameParam = params.get('game');
      if (gameParam) {
        fetch(`/api/games/${gameParam}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data) setSelectedGame(data);
          })
          .catch(() => {});
      }
    }

    // Hotkey: Ctrl+Shift+A opens Admin Portal
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setAdminPortalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [user]);

  // Update URL parameter when selectedGame changes
  useEffect(() => {
    const url = new URL(window.location.href);
    if (selectedGame) {
      url.searchParams.set('game', selectedGame.slug);
    } else {
      url.searchParams.delete('game');
    }
    window.history.replaceState({}, '', url.toString());
  }, [selectedGame]);

  // Handle actual APK download
  const handleDownloadApk = (game: Game) => {
    // 1. Confetti burst on download
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#00f0ff', '#3b82f6', '#10b981', '#f59e0b'],
    });

    // 2. Trigger real download endpoint
    const downloadUrl = `/api/games/${game.id}/download`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', game.apkFileName || `${game.slug}-v${game.version}.apk`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 3. Increment count locally for instant UI responsiveness
    setGames((prev) =>
      prev.map((g) => (g.id === game.id ? { ...g, downloadCount: g.downloadCount + 1 } : g))
    );
    if (selectedGame && selectedGame.id === game.id) {
      setSelectedGame((prev) => (prev ? { ...prev, downloadCount: prev.downloadCount + 1 } : null));
    }
    if (stats) {
      setStats((prev) => (prev ? { ...prev, totalDownloads: prev.totalDownloads + 1 } : null));
    }
  };

  // Categories list
  const categories = useMemo(() => {
    const list = ['All', 'Action', 'RPG', 'Racing', 'Arcade', 'Strategy', 'Casual', 'Sci-Fi', 'Multiplayer'];
    return list;
  }, []);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: games.length };
    games.forEach((g) => {
      counts[g.category] = (counts[g.category] || 0) + 1;
    });
    return counts;
  }, [games]);

  // Filter & sort games
  const filteredGames = useMemo(() => {
    let result = [...games];

    if (selectedCategory !== 'All') {
      result = result.filter(
        (g) => g.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.tagline?.toLowerCase().includes(q) ||
          g.description?.toLowerCase().includes(q) ||
          g.packageName?.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'popular') {
      result.sort((a, b) => b.downloadCount - a.downloadCount);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }

    return result;
  }, [games, selectedCategory, searchQuery, sortBy]);

  // Top featured game
  const featuredGame = useMemo(() => {
    return games.find((g) => g.isFeatured) || games[0] || null;
  }, [games]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#080b12] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-cyan-400" />
      </div>
    );
  }

  // Show registration/login gate first before website opens if not authenticated
  if (!user) {
    return (
      <AuthGateModal
        isOpen={true}
        onSuccess={() => {
          // Trigger reload of hub data
          loadHubData();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#080b12] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-blue-950 via-cyan-950 to-slate-950 border-b border-cyan-900/40 py-2 px-4 text-center text-xs text-cyan-200">
        <span className="font-bold text-white tracking-wide">SECURE FIREBASE AUTHENTICATION:</span>{' '}
        Direct Android APK game downloads signed by <strong>MGCowbell</strong> and <strong>MGTECH</strong>.
      </div>

      {/* Navigation */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        stats={stats}
        onOpenSafetyGuide={() => setSafetyGuideOpen(true)}
        onOpenAdminPortal={() => setAdminPortalOpen(true)}
        onOpenAiStudio={() => {
          setCoverCallback(null);
          setAiStudioOpen(true);
        }}
        onSelectCategory={setSelectedCategory}
        currentCategory={selectedCategory}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        
        {/* Loading Spinner */}
        {loading && (
          <div className="py-24 text-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-cyan-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-300 font-gaming tracking-wider">
              LOADING MG GAMES HUB...
            </p>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-300 text-sm flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadHubData}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white transition flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Hero Showcase (only shown when not searching and on 'All' category) */}
            {!searchQuery && selectedCategory === 'All' && featuredGame && (
              <HeroBanner
                featuredGame={featuredGame}
                onSelectGame={setSelectedGame}
                onDownloadApk={handleDownloadApk}
              />
            )}

            {/* Quick Stats Bar */}
            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
                <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                    <DownloadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider block">Total Downloads</span>
                    <span className="text-lg font-black text-white font-gaming">
                      {stats.totalDownloads.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                    <Gamepad2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider block">Android Games</span>
                    <span className="text-lg font-black text-white font-gaming">
                      {stats.totalGames} Titles
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider block">Security Integrity</span>
                    <span className="text-lg font-black text-emerald-400 font-gaming">
                      100% Clean
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider block">User Session</span>
                    <span className="text-xs font-black text-amber-300 font-gaming truncate block max-w-[120px]" title={user?.email || ''}>
                      {user?.email || 'Authenticated'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-white font-gaming flex items-center gap-2">
                  <span>Browse Android Game Library</span>
                  <span className="text-xs font-mono font-normal text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                    {filteredGames.length}
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click any game to inspect screenshots, changelog, SHA-256 hash, or download immediately.
                </p>
              </div>
            </div>

            {/* Category Filter and Sorting */}
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              sortBy={sortBy}
              onSortChange={setSortBy}
              categoryCounts={categoryCounts}
            />

            {/* Games Grid */}
            {filteredGames.length === 0 ? (
              <div className="p-12 text-center space-y-4 rounded-3xl bg-slate-900/30 border border-dashed border-slate-800 my-8">
                <FolderOpen className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-white font-gaming">No Games Match Your Criteria</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Try clearing your search query or switching to another category to view available Android games.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredGames.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    onSelectGame={setSelectedGame}
                    onDownloadApk={handleDownloadApk}
                  />
                ))}
              </div>
            )}
          </>
        )}

      </main>

      {/* Footer */}
      <Footer
        onOpenSafetyGuide={() => setSafetyGuideOpen(true)}
        onOpenAdminPortal={() => setAdminPortalOpen(true)}
      />

      {/* Game Detail Modal */}
      <GameDetailModal
        game={selectedGame}
        onClose={() => setSelectedGame(null)}
        onDownloadApk={handleDownloadApk}
        onCommentAdded={(updated) => setSelectedGame(updated)}
      />

      {/* Safety & Android Install Guide Modal */}
      <SafetyGuideModal
        isOpen={safetyGuideOpen}
        onClose={() => setSafetyGuideOpen(false)}
      />

      {/* AI Art Studio Modal (Gemini 3 Pro Image Preview with 1K, 2K, 4K) */}
      <AiArtGeneratorModal
        isOpen={aiStudioOpen}
        onClose={() => {
          setAiStudioOpen(false);
          setCoverCallback(null);
        }}
        onApplyImage={coverCallback || undefined}
        applyTargetName={coverCallback ? 'Game Cover' : undefined}
      />

      {/* Private Owner Management Portal Modal */}
      <AdminPortalModal
        isOpen={adminPortalOpen}
        onClose={() => setAdminPortalOpen(false)}
        onGamesUpdated={loadHubData}
        onOpenAiStudioForCover={(cb) => {
          setCoverCallback(() => cb);
          setAiStudioOpen(true);
        }}
      />

    </div>
  );
}
