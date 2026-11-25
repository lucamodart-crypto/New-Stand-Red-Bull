import { useEffect, useRef, useState, useCallback } from 'react';
import { CameraPreset, DEFAULT_CONFIG, StructureConfig } from './types/config';
import { SceneManager, ScreenDimensionCallout } from './three/SceneManager';
import { Header } from './components/Header';
import { CameraControls } from './components/CameraControls';
import { DimensionOverlay } from './components/DimensionOverlay';
import { BottomDock } from './components/BottomDock';
import { TechnicalSpecsModal } from './components/TechnicalSpecsModal';

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const sceneManagerRef = useRef<SceneManager | null>(null);

  const [config, setConfig] = useState<StructureConfig>(DEFAULT_CONFIG);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('perspective');
  const [dimensionCallouts, setDimensionCallouts] = useState<ScreenDimensionCallout[]>([]);
  const [isSpecsModalOpen, setIsSpecsModalOpen] = useState(false);
  const [snapshotUrl, setSnapshotUrl] = useState<string | undefined>(undefined);
  const [activeNav, setActiveNav] = useState('containers');

  // Initialize Three.js scene once
  useEffect(() => {
    if (!canvasMountRef.current) return;

    const manager = new SceneManager(canvasMountRef.current, config);
    manager.onDimensionsUpdated = (callouts) => {
      setDimensionCallouts(callouts);
    };
    sceneManagerRef.current = manager;

    return () => {
      manager.dispose();
      sceneManagerRef.current = null;
    };
  }, []);

  // Sync configuration updates to 3D scene
  useEffect(() => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.updateConfig(config);
    }
  }, [config]);

  // Camera preset handler
  const handleSelectPreset = useCallback((preset: CameraPreset) => {
    setCameraPreset(preset);
    sceneManagerRef.current?.setCameraPreset(preset);
  }, []);

  // Partial config update helper
  const handleConfigChange = useCallback((updated: Partial<StructureConfig>) => {
    setConfig((prev) => ({ ...prev, ...updated }));
  }, []);

  // Reset to default configuration
  const handleReset = useCallback(() => {
    setConfig({ ...DEFAULT_CONFIG });
    handleSelectPreset('perspective');
  }, [handleSelectPreset]);

  // Snapshot capture
  const handleTakeSnapshot = useCallback(() => {
    if (sceneManagerRef.current) {
      const dataUrl = sceneManagerRef.current.captureScreenshot();
      setSnapshotUrl(dataUrl);
      setIsSpecsModalOpen(true);
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'Escape') {
        setIsSpecsModalOpen(false);
      } else if (e.key === '1') {
        handleSelectPreset('perspective');
      } else if (e.key === '2') {
        handleSelectPreset('containers_view');
      } else if (e.key === '3') {
        handleSelectPreset('terrace');
      } else if (e.key === '4') {
        handleSelectPreset('top');
      } else if (e.key === '5') {
        handleSelectPreset('front');
      } else if (e.key === '6') {
        handleSelectPreset('tower_detail');
      } else if (e.key === ' ') {
        e.preventDefault();
        handleConfigChange({ autoRotate: !config.autoRotate });
      } else if (e.key === 'e' || e.key === 'E') {
        handleConfigChange({
          explodedProgress: config.explodedProgress > 0 ? 0 : 0.8,
        });
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [config.autoRotate, config.explodedProgress, handleConfigChange, handleSelectPreset]);

  // Navigation click routing to dock tabs
  const handleNavSelect = (nav: string) => {
    setActiveNav(nav);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none">
      {/* 3D WebGL Canvas Mounting Container (Isolated ref container per SKILL.md) */}
      <div
        ref={canvasMountRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing outline-none"
      />

      {/* 3D Dimensional Dimension Callout Overlay */}
      <DimensionOverlay
        callouts={dimensionCallouts}
        showDimensions={config.showDimensions}
      />

      {/* Top Bar (adheres to Top Bar Contract) */}
      <Header
        activeNav={activeNav}
        setActiveNav={handleNavSelect}
        onOpenSpecs={() => setIsSpecsModalOpen(true)}
        onTakeSnapshot={handleTakeSnapshot}
      />

      {/* Camera Presets & Orbit Toolbar */}
      <CameraControls
        currentPreset={cameraPreset}
        onSelectPreset={handleSelectPreset}
        autoRotate={config.autoRotate}
        onToggleAutoRotate={() => handleConfigChange({ autoRotate: !config.autoRotate })}
      />

      {/* Central 3D Viewport is 100% Unobstructed */}

      {/* Discreet 3D Viewport Navigation Guide (Bottom Right) */}
      <div className="absolute bottom-6 right-6 z-20 hidden lg:flex items-center gap-3 px-3 py-1.5 bg-slate-900/70 border border-slate-800/60 rounded-xl text-[11px] text-slate-400 backdrop-blur-sm pointer-events-none">
        <span>Ruota: Click + Trascina</span>
        <span aria-hidden="true" className="text-slate-600">·</span>
        <span>Sposta: Tasto Destro</span>
        <span aria-hidden="true" className="text-slate-600">·</span>
        <span>Zoom: Rotellina</span>
      </div>

      {/* Unified Collapsible Bottom Dock (Consolidating all controls) */}
      <BottomDock
        config={config}
        onChange={handleConfigChange}
        onReset={handleReset}
        activeTab={
          activeNav === 'containers'
            ? 'containers'
            : activeNav === 'bars'
            ? 'bars'
            : activeNav === 'terrace'
            ? 'terrace'
            : activeNav === 'structure'
            ? 'dimensions'
            : activeNav === 'towers'
            ? 'towers'
            : activeNav === 'environment'
            ? 'environment'
            : undefined
        }
        onSelectTab={(tab) => {
          if (tab === 'containers') setActiveNav('containers');
          else if (tab === 'bars') setActiveNav('bars');
          else if (tab === 'terrace') setActiveNav('terrace');
          else if (tab === 'dimensions') setActiveNav('structure');
          else if (tab === 'towers') setActiveNav('towers');
          else if (tab === 'environment') setActiveNav('environment');
        }}
      />

      {/* Technical Specifications & BOM Modal */}
      <TechnicalSpecsModal
        isOpen={isSpecsModalOpen}
        onClose={() => setIsSpecsModalOpen(false)}
        config={config}
        snapshotUrl={snapshotUrl}
      />
    </div>
  );
}
