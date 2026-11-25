import React from 'react';
import { ScreenDimensionCallout } from '../three/SceneManager';
import { Ruler } from 'lucide-react';

interface DimensionOverlayProps {
  callouts: ScreenDimensionCallout[];
  showDimensions: boolean;
}

export const DimensionOverlay: React.FC<DimensionOverlayProps> = ({
  callouts,
  showDimensions,
}) => {
  if (!showDimensions) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
      {callouts.map((c) => {
        if (!c.visible) return null;
        return (
          <div
            key={c.id}
            style={{
              transform: `translate(${c.x}px, ${c.y}px) translate(-50%, -100%)`,
            }}
            className="absolute transition-transform duration-75 flex flex-col items-center pointer-events-none"
          >
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/90 border border-sky-400/50 rounded-md shadow-lg text-[11px] font-medium text-slate-100 backdrop-blur-sm">
              <Ruler className="w-3 h-3 text-sky-400 shrink-0" />
              <span className="text-slate-400">{c.label}:</span>
              <span className="font-mono text-sky-300 font-semibold">{c.value}</span>
            </div>
            {/* Small pin line */}
            <div className="w-[1px] h-3 bg-sky-400/70" />
            <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
          </div>
        );
      })}
    </div>
  );
};
