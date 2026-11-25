import { Camera, FileText, Layers, ShieldCheck, Sparkles, Wine } from 'lucide-react';

interface HeaderProps {
  onOpenSpecs: () => void;
  onTakeSnapshot: () => void;
  activeNav: string;
  setActiveNav: (nav: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSpecs,
  onTakeSnapshot,
  activeNav,
  setActiveNav,
}) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between gap-8 px-6 py-4 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-400/30 flex items-center justify-center text-sky-400 font-bold text-base">
          S
        </div>
        <span className="text-base font-bold tracking-tight text-white whitespace-nowrap shrink-0">
          STRUKTURA 3D
        </span>
      </div>

      {/* Zone 2: 4 clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
        <button
          onClick={() => setActiveNav('containers')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
            activeNav === 'containers' ? 'text-sky-400 font-semibold' : ''
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          3 Container & Terrazze (6.06x7.31m)
        </button>

        <button
          onClick={() => setActiveNav('bars')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
            activeNav === 'bars' ? 'text-amber-400 font-semibold' : ''
          }`}
        >
          <Wine className="w-3.5 h-3.5" />
          Banchi Bar (10x0.8m)
        </button>

        <button
          onClick={() => setActiveNav('terrace')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
            activeNav === 'terrace' ? 'text-sky-400 font-semibold' : ''
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Terrazza & Ferro
        </button>

        <button
          onClick={() => setActiveNav('towers')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
            activeNav === 'towers' ? 'text-sky-400 font-semibold' : ''
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Torri Lattina H5m
        </button>

        <button
          onClick={onOpenSpecs}
          className="hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 text-slate-300 cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5" />
          Distinta Base (BOM)
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onTakeSnapshot}
          title="Cattura immagine ad alta risoluzione"
          className="p-2 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition-colors cursor-pointer"
        >
          <Camera className="w-4 h-4" />
        </button>
        <button
          onClick={onOpenSpecs}
          className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
        >
          Scheda Tecnica & BOM
        </button>
      </div>
    </header>
  );
};
