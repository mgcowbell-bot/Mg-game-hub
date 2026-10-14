import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Download, 
  Image as ImageIcon, 
  Sliders, 
  Check, 
  Loader2, 
  AlertCircle,
  Copy,
  ExternalLink,
  Wand2
} from 'lucide-react';

interface AiArtGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyImage?: (imageUrl: string) => void;
  applyTargetName?: string;
}

export const AiArtGeneratorModal: React.FC<AiArtGeneratorModalProps> = ({
  isOpen,
  onClose,
  onApplyImage,
  applyTargetName,
}) => {
  const [prompt, setPrompt] = useState('');
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('2K');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '1:1' | '9:16' | '4:3'>('16:9');
  const [stylePreset, setStylePreset] = useState('Cyberpunk Futuristic Key Visual');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [savedUrl, setSavedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const presets = [
    { name: 'Cyberpunk Action', prompt: 'Neon cyberpunk city cybernetic operative dashing on highway, plasma katana, blade sparks, cinematic 8k render' },
    { name: 'Dark Fantasy RPG', prompt: 'Eldritch knight holding glowing rune blade in ruined gothic cathedral, volumetric fog, dramatic lighting' },
    { name: 'Midnight Street Drift', prompt: 'Modified twin-turbo JDM drift car cornering at high speed on mountain road, colorful tire smoke, night scene' },
    { name: 'Galactic Shmup', prompt: 'Futuristic starfighter firing colossal laser beams through alien armada in vibrant cosmic nebula, epic arcade key visual' },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please provide a prompt describing your game artwork.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          imageSize,
          aspectRatio,
          stylePreset,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to generate image.');
      }

      setResultImage(data.imageUrl);
      setSavedUrl(data.savedUrl || null);
    } catch (err: any) {
      setError(err.message || 'Image generation error. Ensure Gemini API key is valid.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = () => {
    const target = savedUrl ? `${window.location.origin}${savedUrl}` : resultImage;
    if (!target) return;
    navigator.clipboard.writeText(target);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const a = document.createElement('a');
    a.href = resultImage;
    a.download = `mgtech-artwork-${imageSize.toLowerCase()}-${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-slate-950 border border-cyan-800/60 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6 text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 text-cyan-400">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white font-gaming">
                  MG Studio AI Artwork Generator
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 rounded">
                  gemini-3-pro-image-preview
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Generate ultra-high-definition promotional banners, game covers, and concept art
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

        {/* Form Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Controls Column */}
          <div className="md:col-span-7 space-y-5">
            
            {/* Quick Inspiration Presets */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                Quick Gaming Presets
              </label>
              <div className="grid grid-cols-2 gap-2">
                {presets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPrompt(preset.prompt);
                      setStylePreset(preset.name);
                    }}
                    className="p-2.5 rounded-xl text-left bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 transition text-xs group"
                  >
                    <span className="font-bold text-cyan-300 group-hover:text-cyan-200 block truncate">
                      {preset.name}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate block">
                      {preset.prompt.slice(0, 30)}...
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Textarea */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                Artwork Prompt
              </label>
              <textarea
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your game character, scene, or action shot (e.g. Neon cyber-ninja leaping between skyscrapers at night)..."
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Image Size Selection (Required 1K, 2K, 4K) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Resolution / Image Size (Affordance)
                </label>
                <span className="text-[11px] text-cyan-400 font-semibold font-mono">
                  {imageSize === '1K' ? '1024 x 1024' : imageSize === '2K' ? '2048 x 2048' : '4096 x 4096 Ultra'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {(['1K', '2K', '4K'] as const).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setImageSize(size)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-0.5 ${
                      imageSize === size
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-md shadow-cyan-500/30'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{size}</span>
                    <span className="text-[9px] font-normal opacity-80">
                      {size === '1K' ? 'Standard' : size === '2K' ? 'High Res' : 'Ultra 4K'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio Selector */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                Aspect Ratio
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: '16:9', label: '16:9 Banner' },
                  { id: '1:1', label: '1:1 Icon' },
                  { id: '9:16', label: '9:16 Poster' },
                  { id: '4:3', label: '4:3 Classic' },
                ].map((ratio) => (
                  <button
                    key={ratio.id}
                    type="button"
                    onClick={() => setAspectRatio(ratio.id as any)}
                    className={`py-2 px-2 rounded-xl text-xs font-medium text-center transition ${
                      aspectRatio === ratio.id
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 font-bold'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {ratio.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Action Button */}
            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-extrabold text-xs tracking-wider uppercase transition shadow-lg shadow-cyan-500/30 font-gaming"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing {imageSize} Artwork...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Generate {imageSize} Game Artwork</span>
                </>
              )}
            </button>

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

          </div>

          {/* Preview Column */}
          <div className="md:col-span-5 flex flex-col items-center justify-center bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 min-h-[300px]">
            {loading ? (
              <div className="text-center space-y-3 p-6">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto" />
                <p className="text-xs font-bold text-white">Rendering with Gemini 3 Pro Image Preview</p>
                <p className="text-[11px] text-slate-400 max-w-xs">
                  Generating high-resolution {imageSize} textures and cinematic lighting...
                </p>
              </div>
            ) : resultImage ? (
              <div className="w-full space-y-3">
                <div className="relative rounded-xl overflow-hidden border border-cyan-500/40 shadow-xl bg-black">
                  <img
                    src={resultImage}
                    alt="Generated Art"
                    className="w-full max-h-72 object-contain mx-auto"
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-slate-950/80 text-[10px] font-bold font-mono text-cyan-300 border border-cyan-800">
                    {imageSize} &bull; {aspectRatio}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleDownload}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>

                  <button
                    onClick={handleCopyUrl}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                {onApplyImage && (
                  <button
                    onClick={() => {
                      onApplyImage(savedUrl || resultImage);
                      onClose();
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-wider transition"
                  >
                    Apply as {applyTargetName || 'Cover Image'}
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center space-y-2 p-6 text-slate-500">
                <ImageIcon className="w-12 h-12 mx-auto stroke-1" />
                <span className="text-xs font-semibold block text-slate-400">Artwork Preview</span>
                <p className="text-[11px] max-w-xs">
                  Choose a preset or type a prompt, pick your resolution (1K, 2K, or 4K), and click Generate.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
