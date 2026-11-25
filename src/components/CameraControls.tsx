import React from 'react';
import { CameraPreset } from '../types/config';
import { Eye, Compass, RotateCw, Box, MoveUpRight, ZoomIn, Package, Wine } from 'lucide-react';

interface CameraControlsProps {
  currentPreset: CameraPreset;
  onSelectPreset: (preset: CameraPreset) => void;
  autoRotate: boolean;
  onToggleAutoRotate: () => void;
}

export const CameraControls: React.FC<CameraControlsProps> = ({
  currentPreset,
  onSelectPreset,
  autoRotate,
  onToggleAutoRotate,
}) => {
  const presets: { id: CameraPreset; label: string; icon: React.ReactNode }[] = [
    { id: 'perspective', label: 'Prospettiva 3D', icon: <Box className="w-3.5 h-3.5" /> },
    { id: 'bar_view', label: 'Banchi Bar (10m)', icon: <Wine className="w-3.5 h-3.5" /> },
    { id: 'containers_view', label: '3 Container', icon: <Package className="w-3.5 h-3.5" /> },
    { id: 'terrace', label: 'Terrazza & Ferro', icon: <Eye className="w-3.5 h-3.5" /> },
    { id: 'top', label: 'Pianta (Top)', icon: <Compass className="w-3.5 h-3.5" /> },
    { id: 'front', label: 'Prospetto', icon: <MoveUpRight className="w-3.5 h-3.5" /> },
    { id: 'tower_detail', label: 'Dettaglio Torre', icon: <ZoomIn className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="absolute top-20 left-6 z-20 flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-900/85 backdrop-blur-md border border-slate-800 rounded-xl shadow-lg">
      <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
        Viste
      </div>
      {presets.map((p) => {
        const isActive = currentPreset === p.id;
        return (
          <button
            key={p.id}
            onClick={() => onSelectPreset(p.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              isActive
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-transparent'
            }`}
          >
            {p.icon}
            {p.label}
          </button>
        );
      })}

      <div className="w-[1px] h-4 bg-slate-800 mx-1" />

      <button
        onClick={onToggleAutoRotate}
        title={autoRotate ? 'Ferma auto-rotazione' : 'Avvia auto-rotazione'}
        className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
          autoRotate
            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-transparent'
        }`}
      >
        <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
        <span>Gira 360°</span>
      </button>
    </div>
  );
};
