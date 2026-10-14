import React, { useState, useEffect, useRef } from 'react';
import { 
  Lock, 
  X, 
  Upload, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  EyeOff, 
  BarChart3, 
  FileCode, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Save, 
  RefreshCw,
  LogOut,
  FolderUp,
  Server,
  Cloud,
  Layers,
  Smartphone,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { auth, googleProvider, ADMIN_EMAIL } from '../lib/firebase';
import { Game } from '../types/game';

interface AdminPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGamesUpdated: () => void;
  onOpenAiStudioForCover: (callback: (url: string) => void) => void;
}

export const AdminPortalModal: React.FC<AdminPortalModalProps> = ({
  isOpen,
  onClose,
  onGamesUpdated,
  onOpenAiStudioForCover,
}) => {
  const [authToken, setAuthToken] = useState<string | null>(() => {
    return sessionStorage.getItem('mg_admin_token');
  });

  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isFirebaseAdmin, setIsFirebaseAdmin] = useState(false);

  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Tabs: 'catalog' | 'new-game' | 'analytics' | 'firebase-guide'
  const [activeTab, setActiveTab] = useState<'catalog' | 'new-game' | 'analytics' | 'firebase-guide'>('catalog');

  // Admin games list & analytics
  const [allGames, setAllGames] = useState<Game[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loadingGames, setLoadingGames] = useState(false);

  // Form states for creating / editing game
  const [editingGameId, setEditingGameId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formTagline, setFormTagline] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('Action');
  const [formDeveloper, setFormDeveloper] = useState('MGCowbell');
  const [formVersion, setFormVersion] = useState('1.0.0');
  const [formMinAndroid, setFormMinAndroid] = useState('Android 8.0+ (Oreo, API 26)');
  const [formPackageName, setFormPackageName] = useState('');
  const [formArchitecture, setFormArchitecture] = useState('arm64-v8a, armeabi-v7a');
  const [formChangelog, setFormChangelog] = useState('');
  const [formCoverImage, setFormCoverImage] = useState('');
  const [formScreenshots, setFormScreenshots] = useState<string[]>([]);
  const [formPublished, setFormPublished] = useState(true);
  const [formIsFeatured, setFormIsFeatured] = useState(false);

  // APK file upload tracking
  const [uploadedApkFile, setUploadedApkFile] = useState<{
    apkFileName: string;
    fileSize: string;
    fileSizeBytes: number;
    sha256: string;
  } | null>(null);

  const [uploadingApk, setUploadingApk] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const apkInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user && user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        setIsFirebaseAdmin(true);
        // Automatically exchange token with server
        try {
          const idToken = await user.getIdToken();
          const res = await fetch('/api/admin/firebase-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken, email: user.email }),
          });
          const data = await res.json();
          if (data.token) {
            setAuthToken(data.token);
            sessionStorage.setItem('mg_admin_token', data.token);
            fetchAdminGames(data.token);
            fetchAnalytics(data.token);
          }
        } catch (e) {
          console.warn('Firebase admin auto-exchange error:', e);
        }
      } else {
        setIsFirebaseAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Verify stored session on mount or change
  useEffect(() => {
    if (authToken && isOpen) {
      verifySession();
    }
  }, [authToken, isOpen]);

  const verifySession = async () => {
    try {
      const res = await fetch('/api/admin/verify-session', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (data.valid) {
        fetchAdminGames();
        fetchAnalytics();
      } else {
        handleLogout();
      }
    } catch {
      handleLogout();
    }
  };

  // Firebase Google Login Handler
  const handleFirebaseGoogleLogin = async () => {
    setGoogleLoading(true);
    setAuthError(null);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      if (!user.email || user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        await signOut(auth);
        throw new Error(
          `Access Denied: Signed in as ${user.email || 'unknown'}. Only ${ADMIN_EMAIL} is authorized to post and manage APKs.`
        );
      }

      const idToken = await user.getIdToken();
      const res = await fetch('/api/admin/firebase-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, email: user.email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Server validation failed');
      }

      setAuthToken(data.token);
      sessionStorage.setItem('mg_admin_token', data.token);
      setIsFirebaseAdmin(true);
      fetchAdminGames(data.token);
      fetchAnalytics(data.token);
      setStatusMessage({
        type: 'success',
        text: `Welcome Administrator (${ADMIN_EMAIL}). Full APK posting permissions unlocked.`,
      });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      setAuthError(err.message || 'Firebase login failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Passcode login fallback
  const handlePasscodeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;

    setAuthLoading(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcode.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      setAuthToken(data.token);
      sessionStorage.setItem('mg_admin_token', data.token);
      setPasscode('');
      fetchAdminGames(data.token);
      fetchAnalytics(data.token);
    } catch (err: any) {
      setAuthError(err.message || 'Invalid passcode');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch {}
    if (authToken) {
      fetch('/api/admin/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
      }).catch(() => {});
    }
    setAuthToken(null);
    sessionStorage.removeItem('mg_admin_token');
    setIsFirebaseAdmin(false);
    setAllGames([]);
    setAnalytics(null);
  };

  const fetchAdminGames = async (token = authToken) => {
    if (!token) return;
    setLoadingGames(true);
    try {
      const res = await fetch('/api/admin/games', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setAllGames(data);
      }
    } catch (err) {
      console.error('Error fetching admin games:', err);
    } finally {
      setLoadingGames(false);
    }
  };

  const fetchAnalytics = async (token = authToken) => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/analytics', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  };

  // Toggle publish
  const handleTogglePublish = async (gameId: string) => {
    try {
      const res = await fetch(`/api/admin/games/${gameId}/toggle-publish`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to toggle publication');
      }

      setStatusMessage({ type: 'success', text: `Game status changed to: ${data.published ? 'PUBLISHED' : 'DRAFT'}` });
      fetchAdminGames();
      onGamesUpdated();
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  // Delete game
  const handleDeleteGame = async (gameId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This permanently removes the game and its APK binary.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/games/${gameId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (!res.ok) {
        throw new Error('Failed to delete game');
      }

      setStatusMessage({ type: 'success', text: `Deleted "${title}" successfully.` });
      fetchAdminGames();
      onGamesUpdated();
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  };

  // APK file upload
  const handleApkFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.apk')) {
      setStatusMessage({ type: 'error', text: 'Selected file must be an Android .apk package' });
      return;
    }

    const formData = new FormData();
    formData.append('apk', file);

    setUploadingApk(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/admin/upload-apk', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'APK upload failed');
      }

      setUploadedApkFile({
        apkFileName: data.apkFileName,
        fileSize: data.fileSize,
        fileSizeBytes: data.fileSizeBytes,
        sha256: data.sha256,
      });

      if (data.autoMetadata) {
        const meta = data.autoMetadata;
        if (meta.title) setFormTitle(meta.title);
        if (meta.slug) setFormSlug(meta.slug);
        if (meta.tagline) setFormTagline(meta.tagline);
        if (meta.description) setFormDescription(meta.description);
        if (meta.category) setFormCategory(meta.category);
        if (meta.developer) setFormDeveloper(meta.developer);
        if (meta.version) setFormVersion(meta.version);
        if (meta.minAndroid) setFormMinAndroid(meta.minAndroid);
        if (meta.packageName) setFormPackageName(meta.packageName);
        if (meta.architecture) setFormArchitecture(meta.architecture);
        if (meta.changelog) setFormChangelog(meta.changelog);
        if (meta.coverImage) setFormCoverImage(meta.coverImage);
        setActiveTab('new-game');
      }

      setStatusMessage({
        type: 'success',
        text: `APK uploaded & verified! AI auto-filled metadata for "${data.autoMetadata?.title || data.originalName}".`,
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setUploadingApk(false);
      if (apkInputRef.current) apkInputRef.current.value = '';
    }
  };

  // Cover image file upload
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploadingImage(true);

    try {
      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Image upload failed');

      setFormCoverImage(data.url);
      setStatusMessage({ type: 'success', text: 'Cover image uploaded.' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  // Save game form (Create or Update)
  const handleSaveGame = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle.trim()) {
      setStatusMessage({ type: 'error', text: 'Game title is required' });
      return;
    }

    const payload: any = {
      title: formTitle.trim(),
      slug: formSlug.trim() || formTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      tagline: formTagline.trim(),
      description: formDescription.trim(),
      category: formCategory,
      developer: formDeveloper.trim() || 'MGCowbell',
      version: formVersion.trim() || '1.0.0',
      minAndroid: formMinAndroid.trim(),
      packageName: formPackageName.trim() || `com.mgcowbell.${formTitle.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      architecture: formArchitecture.trim(),
      changelog: formChangelog.trim(),
      coverImage: formCoverImage || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
      screenshots: formScreenshots,
      published: formPublished,
      isFeatured: formIsFeatured,
    };

    if (uploadedApkFile) {
      payload.apkFileName = uploadedApkFile.apkFileName;
      payload.fileSize = uploadedApkFile.fileSize;
      payload.fileSizeBytes = uploadedApkFile.fileSizeBytes;
      payload.sha256 = uploadedApkFile.sha256;
    }

    try {
      const url = editingGameId ? `/api/admin/games/${editingGameId}` : '/api/admin/games';
      const method = editingGameId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save game');
      }

      setStatusMessage({
        type: 'success',
        text: editingGameId ? 'Game updated successfully!' : 'New game published to MG GAMES HUB!',
      });

      resetForm();
      setActiveTab('catalog');
      fetchAdminGames();
      onGamesUpdated();
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  };

  const startEditGame = (game: Game) => {
    setEditingGameId(game.id);
    setFormTitle(game.title);
    setFormSlug(game.slug);
    setFormTagline(game.tagline || '');
    setFormDescription(game.description || '');
    setFormCategory(game.category || 'Action');
    setFormDeveloper(game.developer || 'MGCowbell');
    setFormVersion(game.version || '1.0.0');
    setFormMinAndroid(game.minAndroid || 'Android 8.0+ (Oreo, API 26)');
    setFormPackageName(game.packageName || '');
    setFormArchitecture(game.architecture || 'arm64-v8a');
    setFormChangelog(game.changelog || '');
    setFormCoverImage(game.coverImage || '');
    setFormScreenshots(game.screenshots || []);
    setFormPublished(game.published);
    setFormIsFeatured(game.isFeatured);
    setUploadedApkFile({
      apkFileName: game.apkFileName,
      fileSize: game.fileSize,
      fileSizeBytes: game.fileSizeBytes,
      sha256: game.sha256,
    });
    setActiveTab('new-game');
  };

  const resetForm = () => {
    setEditingGameId(null);
    setFormTitle('');
    setFormSlug('');
    setFormTagline('');
    setFormDescription('');
    setFormCategory('Action');
    setFormDeveloper('MGCowbell');
    setFormVersion('1.0.0');
    setFormMinAndroid('Android 8.0+ (Oreo, API 26)');
    setFormPackageName('');
    setFormArchitecture('arm64-v8a, armeabi-v7a');
    setFormChangelog('');
    setFormCoverImage('');
    setFormScreenshots([]);
    setFormPublished(true);
    setFormIsFeatured(false);
    setUploadedApkFile(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-slate-950 border border-cyan-800/60 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6 text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white font-gaming">
                  MG GAMES HUB &bull; Admin Portal
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 rounded">
                  Admin: {ADMIN_EMAIL}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Only <strong className="text-cyan-300">{ADMIN_EMAIL}</strong> has administrator permissions to post, edit, or delete APKs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {authToken && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs text-rose-300 border border-rose-900/40 transition"
                title="Log out from Owner Session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Toast Banner */}
        {statusMessage && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/40 border border-emerald-800/60 text-emerald-300'
                : 'bg-rose-950/40 border border-rose-800/60 text-rose-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Step 1: Authentication Form (if not logged in) */}
        {!authToken ? (
          <div className="max-w-md mx-auto py-6 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
              <Lock className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-lg font-bold text-white font-gaming">Administrator Sign-In</h4>
              <p className="text-xs text-slate-400 mt-1">
                Sign in with your Firebase Google account (<strong className="text-cyan-300">{ADMIN_EMAIL}</strong>) to post and manage APK games.
              </p>
            </div>

            {authError && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 text-left">
                {authError}
              </div>
            )}

            {/* Primary Firebase Google Sign-In Button */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleFirebaseGoogleLogin}
                disabled={googleLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-500/20 font-gaming flex items-center justify-center gap-3 disabled:opacity-60"
              >
                {googleLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting to Firebase Auth...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>Sign in with Google ({ADMIN_EMAIL})</span>
                  </>
                )}
              </button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
                <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-slate-950 px-2 text-slate-500 font-bold">Or enter master key</span></div>
              </div>

              {/* Master Passcode Fallback */}
              <form onSubmit={handlePasscodeLogin} className="space-y-3 text-left">
                <div>
                  <input
                    type="password"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Enter owner master passcode..."
                    className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                >
                  {authLoading ? 'Verifying...' : 'Authorize with Passcode'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Step 2: Management Console with Tabs */
          <div className="space-y-6">
            
            {/* Authenticated Admin Bar */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-xs">
              <div className="flex items-center gap-2 text-emerald-300">
                <UserCheck className="w-4 h-4" />
                <span>Authorized as Administrator: <strong className="text-white">{ADMIN_EMAIL}</strong></span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                APK Posting Enabled
              </span>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
              <button
                onClick={() => setActiveTab('catalog')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeTab === 'catalog'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Game Catalog ({allGames.length})</span>
              </button>

              <button
                onClick={() => {
                  resetForm();
                  setActiveTab('new-game');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeTab === 'new-game'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{editingGameId ? 'Edit Game' : 'Post New APK'}</span>
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeTab === 'analytics'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Download Analytics</span>
              </button>

              <button
                onClick={() => setActiveTab('firebase-guide')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeTab === 'firebase-guide'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Cloud className="w-3.5 h-3.5 text-amber-400" />
                <span>Firebase Rules & Config</span>
              </button>
            </div>

            {/* TAB 1: CATALOG VIEW */}
            {activeTab === 'catalog' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Manage published games, update versions, or replace APK files.
                  </span>
                  <button
                    onClick={() => fetchAdminGames()}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Refresh
                  </button>
                </div>

                {loadingGames ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-400" />
                    Loading catalog...
                  </div>
                ) : allGames.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-800 rounded-2xl">
                    No games found in the hub. Click "Post New APK" to upload your first Android title!
                  </div>
                ) : (
                  <div className="grid gap-3 max-h-[500px] overflow-y-auto pr-1">
                    {allGames.map((game) => (
                      <div
                        key={game.id}
                        className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={game.coverImage}
                            alt={game.title}
                            className="w-14 h-14 rounded-xl object-cover border border-slate-700 shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-white font-gaming">{game.title}</h4>
                              <span
                                className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                                  game.published
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                    : 'bg-amber-950 text-amber-300 border border-amber-800'
                                }`}
                              >
                                {game.published ? 'PUBLISHED' : 'DRAFT (HIDDEN)'}
                              </span>
                              {game.isFeatured && (
                                <span className="px-1.5 py-0.2 text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-800 rounded">
                                  FEATURED
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 flex flex-wrap gap-x-3 gap-y-1 mt-0.5">
                              <span>v{game.version}</span>
                              <span>&bull;</span>
                              <span>{game.category}</span>
                              <span>&bull;</span>
                              <span>{game.fileSize}</span>
                              <span>&bull;</span>
                              <span className="text-emerald-400 font-semibold">
                                {game.downloadCount.toLocaleString()} downloads
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            onClick={() => handleTogglePublish(game.id)}
                            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                              game.published
                                ? 'bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-800/60'
                                : 'bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60'
                            }`}
                            title={game.published ? 'Unpublish game' : 'Publish game'}
                          >
                            {game.published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            <span>{game.published ? 'Unpublish' : 'Publish'}</span>
                          </button>

                          <button
                            onClick={() => startEditGame(game)}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                            title="Edit details or replace APK"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteGame(game.id, game.title)}
                            className="p-2 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-900/40 transition"
                            title="Delete game and binary"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: NEW / EDIT GAME FORM */}
            {activeTab === 'new-game' && (
              <form onSubmit={handleSaveGame} className="space-y-6 max-h-[550px] overflow-y-auto pr-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h4 className="text-sm font-bold text-white font-gaming">
                    {editingGameId ? 'Edit Game Specifications' : 'Post New Android Game APK'}
                  </h4>
                  {editingGameId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Cancel Editing
                    </button>
                  )}
                </div>

                {/* Primary info grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Game Title *</label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="e.g. CyberStrike: Neo Tokyo"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Genre / Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                    >
                      {['Action', 'RPG', 'Racing', 'Arcade', 'Strategy', 'Casual', 'Sci-Fi', 'Multiplayer'].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">APK Version *</label>
                    <input
                      type="text"
                      required
                      value={formVersion}
                      onChange={(e) => setFormVersion(e.target.value)}
                      placeholder="e.g. 2.4.0"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Developer Studio</label>
                    <input
                      type="text"
                      value={formDeveloper}
                      onChange={(e) => setFormDeveloper(e.target.value)}
                      placeholder="MGCowbell or MGTECH"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Min Android OS</label>
                    <input
                      type="text"
                      value={formMinAndroid}
                      onChange={(e) => setFormMinAndroid(e.target.value)}
                      placeholder="Android 8.0+ (Oreo, API 26)"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Package Name</label>
                    <input
                      type="text"
                      value={formPackageName}
                      onChange={(e) => setFormPackageName(e.target.value)}
                      placeholder="com.mgcowbell.gamename"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                {/* Tagline & Description */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Short Catchy Tagline</label>
                    <input
                      type="text"
                      value={formTagline}
                      onChange={(e) => setFormTagline(e.target.value)}
                      placeholder="High-octane cyberpunk combat runner with blade dashing."
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Full Description</label>
                    <textarea
                      rows={3}
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Describe the gameplay, story, features, and Android controls..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Changelog / Release Notes</label>
                    <textarea
                      rows={2}
                      value={formChangelog}
                      onChange={(e) => setFormChangelog(e.target.value)}
                      placeholder="v2.4.0 Updates: New boss encounter, performance boost for Android 14..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>
                </div>

                {/* Real APK File Uploader */}
                <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-800/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider block">
                        Android APK Package Binary (.apk)
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Upload the compiled and signed Android application file (Max 350MB)
                      </span>
                    </div>

                    <input
                      ref={apkInputRef}
                      type="file"
                      accept=".apk,application/vnd.android.package-archive"
                      onChange={handleApkFileChange}
                      className="hidden"
                    />

                    <button
                      type="button"
                      disabled={uploadingApk}
                      onClick={() => apkInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition"
                    >
                      {uploadingApk ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Uploading APK...</span>
                        </>
                      ) : (
                        <>
                          <FolderUp className="w-3.5 h-3.5" />
                          <span>{uploadedApkFile ? 'Replace APK File' : 'Upload APK File'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {uploadedApkFile && (
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-emerald-400" />
                        <span className="font-semibold text-white">{uploadedApkFile.apkFileName}</span>
                        <span className="text-slate-400">({uploadedApkFile.fileSize})</span>
                      </div>
                      <span className="text-[10px] font-mono text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        Verified APK
                      </span>
                    </div>
                  )}
                </div>

                {/* Cover Image & AI Art Generator */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Cover Image URL</label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={formCoverImage}
                        onChange={(e) => setFormCoverImage(e.target.value)}
                        placeholder="https://..."
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                      />
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
                        title="Upload local image"
                      >
                        <Upload className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onOpenAiStudioForCover((url) => setFormCoverImage(url));
                        }}
                        className="px-3 py-2 rounded-xl bg-cyan-950 text-cyan-300 border border-cyan-800 text-xs font-bold flex items-center gap-1.5 hover:bg-cyan-900"
                        title="Generate with Gemini 3 Pro Image (1K, 2K, 4K)"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        <span>AI Studio</span>
                      </button>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="flex items-center gap-6 pt-5">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formPublished}
                        onChange={(e) => setFormPublished(e.target.checked)}
                        className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700 focus:ring-0"
                      />
                      <span>Publish immediately</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formIsFeatured}
                        onChange={(e) => setFormIsFeatured(e.target.checked)}
                        className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700 focus:ring-0"
                      />
                      <span>Feature in Hero Banner</span>
                    </label>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveTab('catalog')}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition shadow-md shadow-cyan-500/20 font-gaming"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingGameId ? 'Save Changes' : 'Post APK to Hub'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: DOWNLOAD ANALYTICS */}
            {activeTab === 'analytics' && (
              <div className="space-y-6 max-h-[500px] overflow-y-auto pr-1">
                {analytics ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[11px] text-slate-400 block uppercase font-bold">Total Hub Downloads</span>
                        <span className="text-2xl font-black text-emerald-400 font-gaming">
                          {analytics.totalDownloads?.toLocaleString()}
                        </span>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[11px] text-slate-400 block uppercase font-bold">Total Games</span>
                        <span className="text-2xl font-black text-white font-gaming">
                          {analytics.totalGames}
                        </span>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[11px] text-slate-400 block uppercase font-bold">Published Titles</span>
                        <span className="text-2xl font-black text-cyan-400 font-gaming">
                          {analytics.publishedGames}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                        Downloads by Title
                      </h4>
                      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                        {allGames.map((g) => (
                          <div key={g.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60 last:border-0">
                            <span className="font-semibold text-white">{g.title}</span>
                            <span className="font-bold text-emerald-400">{g.downloadCount.toLocaleString()} downloads</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {analytics.recentDownloads && analytics.recentDownloads.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                          Recent Atomic Download Log
                        </h4>
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 max-h-48 overflow-y-auto font-mono text-[11px]">
                          {analytics.recentDownloads.map((log: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between text-slate-400">
                              <span className="text-white">{log.gameTitle} (v{log.version})</span>
                              <span>{log.deviceType}</span>
                              <span className="text-cyan-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-cyan-400" />
                    Aggregating download metrics...
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: FIREBASE DEPLOYMENT & RULES GUIDE */}
            {activeTab === 'firebase-guide' && (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 text-xs">
                <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/50 text-cyan-200">
                  <h4 className="font-bold text-cyan-300 text-sm mb-1 flex items-center gap-1.5">
                    <Cloud className="w-4 h-4" />
                    Firebase Live Project Connected: ivory-window-7qmt3
                  </h4>
                  <p className="leading-relaxed text-slate-300">
                    Your Firebase Firestore database, Security Rules, and Authentication are provisioned and active.
                    The rules strictly enforce that <strong>{ADMIN_EMAIL}</strong> is the only authorized administrator who can create, update, or delete games and APK packages.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="font-bold text-white block">Active Security Rule Invariant:</span>
                  <pre className="p-3 rounded bg-black/70 text-[11px] font-mono text-emerald-400 overflow-x-auto">
{`function isMasterAdmin() {
  return request.auth != null && 
         request.auth.token.email == "${ADMIN_EMAIL}" &&
         request.auth.token.email_verified == true;
}`}
                  </pre>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 font-mono">
                  <div className="space-y-1">
                    <span className="text-cyan-400 font-bold block">Deploy to Firebase Hosting:</span>
                    <pre className="p-2.5 rounded bg-black/60 text-slate-200">npm run build &amp;&amp; firebase deploy</pre>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
