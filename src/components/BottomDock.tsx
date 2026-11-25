import React, { useState } from 'react';
import {
  CanFinish,
  ContainerColor,
  DeckMaterial,
  EnvironmentMode,
  RailingType,
  RoofType,
  StructureConfig,
  TerraceStaging,
} from '../types/config';
import {
  Sliders,
  Sparkles,
  Layers,
  Umbrella,
  SunMoon,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Package,
  Wine,
  Moon,
  Sun,
  Lightbulb,
  Zap,
} from 'lucide-react';

interface BottomDockProps {
  config: StructureConfig;
  onChange: (updated: Partial<StructureConfig>) => void;
  onReset: () => void;
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  config,
  onChange,
  onReset,
  activeTab: externalTab,
  onSelectTab,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [internalTab, setInternalTab] = useState<'dimensions' | 'containers' | 'bars' | 'terrace' | 'towers' | 'environment'>('bars');

  const activeTab = (externalTab as typeof internalTab) || internalTab;
  const setActiveTab = (t: typeof internalTab) => {
    setInternalTab(t);
    onSelectTab?.(t);
  };

  const containerColorOptions: { id: ContainerColor; name: string; hex: string; desc: string }[] = [
    { id: 'mirror_chrome', name: 'Effetto Specchio (Mirror)', hex: '#f1f5f9', desc: 'Acciaio inox lucidato a specchio riflettente' },
    { id: 'anthracite', name: 'Antracite Industriale', hex: '#1e293b', desc: 'Acciaio corten scuro opaco' },
    { id: 'corten_rust', name: 'Corten Ruggine', hex: '#c2410c', desc: 'Ruggine architettura contemporanea' },
    { id: 'navy_blue', name: 'Blu Marittimo ISO', hex: '#1e3a8a', desc: 'Classico colore navale cargo' },
    { id: 'olive_green', name: 'Verde Militare / Oliva', hex: '#365314', desc: 'Stile safari / outdoor eco' },
    { id: 'pure_white', name: 'Bianco Architettonico', hex: '#ffffff', desc: 'Minimalista pulito per eventi' },
  ];

  const finishOptions: { id: CanFinish; name: string; color: string; desc: string }[] = [
    { id: 'red_bull', name: 'Rhombus Blu & Argento', color: '#00205b', desc: 'Pattern a rombi blu metallizzato e argento spazzolato (senza loghi)' },
    { id: 'brushed_aluminum', name: 'Alluminio Satinato', color: '#94a3b8', desc: 'Metallo spazzolato' },
    { id: 'carbon_black', name: 'Carbon Black', color: '#1e293b', desc: 'Opaco tecnico' },
    { id: 'crimson_beverage', name: 'Rosso Corsa Gloss', color: '#dc2626', desc: 'Lattina beverage' },
    { id: 'champagne_gold', name: 'Oro Champagne', color: '#d4af37', desc: 'Finitura lusso' },
    { id: 'titanium_white', name: 'Bianco Titanio', color: '#f8fafc', desc: 'Verniciato a polvere' },
  ];

  const deckOptions: { id: DeckMaterial; name: string }[] = [
    { id: 'teak_wood', name: 'Teak Marino Naturale' },
    { id: 'polished_concrete', name: 'Cemento Levigato' },
    { id: 'smoked_glass', name: 'Vetro Fumé Trasparente' },
    { id: 'dark_composite', name: 'Composite Grafite' },
  ];

  const railingOptions: { id: RailingType; name: string; desc: string }[] = [
    { id: 'iron_industrial', name: 'Parapetto in Ferro Battuto / Acciaio', desc: 'Ringhiera in ferro pieno con bacchette verticali (richiesta utente)' },
    { id: 'frameless_glass', name: 'Vetro Strutturale', desc: 'Pannelli trasparenti temperati' },
    { id: 'tension_cables', name: 'Cavi Inox Tesi', desc: 'Stile nautico minimalista' },
    { id: 'black_louvers', name: 'Frangisole Verticali', desc: 'Lamelle metalliche nere' },
  ];

  const stagingOptions: { id: TerraceStaging; name: string }[] = [
    { id: 'lounge_bar', name: 'Lounge Divani + Bancone Bar' },
    { id: 'cocktail_minimal', name: 'Tavoli Cocktail Alti' },
    { id: 'empty_showroom', name: 'Spazio Vuoto Showroom' },
  ];

  const roofOptions: { id: RoofType; name: string }[] = [
    { id: 'none', name: 'Senza Tetto (Tubi di Collegamento a Lattine)' },
    { id: 'bioclimatic_pergola', name: 'Pergola Bioclimatica a Lamelle' },
    { id: 'tensile_sail', name: 'Vela Tensostruttura' },
    { id: 'open_sky', name: 'Open Sky con Catenarie Luce' },
  ];

  const envOptions: { id: EnvironmentMode; name: string; icon: string }[] = [
    { id: 'day', name: 'Giorno Studio', icon: '☀️' },
    { id: 'sunset', name: 'Tramonto Golden', icon: '🌅' },
    { id: 'night', name: 'Notte Evento LED', icon: '🌙' },
  ];

  const ledColors = [
    { hex: '#00e5ff', name: 'Ciano' },
    { hex: '#f59e0b', name: 'Ambra' },
    { hex: '#ec4899', name: 'Magenta' },
    { hex: '#10b981', name: 'Smeraldo' },
    { hex: '#ffffff', name: 'Bianco' },
  ];

  return (
    <div
      style={{
        transform: `translateX(-50%) translateY(${isCollapsed ? 'calc(100% - 38px)' : '0'})`,
      }}
      className="fixed bottom-4 left-1/2 z-30 w-full max-w-[960px] px-4 transition-transform duration-300 ease-out"
    >
      <div className="bg-slate-950/92 backdrop-blur-xl border border-slate-800/90 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Dock Header & Tabs */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            <button
              onClick={() => {
                setActiveTab('containers');
                if (isCollapsed) setIsCollapsed(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'containers'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Package className="w-3.5 h-3.5 text-sky-400" />
              3 Container & Terrazze
            </button>

            <button
              onClick={() => {
                setActiveTab('bars');
                if (isCollapsed) setIsCollapsed(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'bars'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Wine className="w-3.5 h-3.5 text-amber-400" />
              Station Bar (4 Lati)
            </button>

            <button
              onClick={() => {
                setActiveTab('terrace');
                if (isCollapsed) setIsCollapsed(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'terrace'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Terrazza & Ferro
            </button>

            <button
              onClick={() => {
                setActiveTab('dimensions');
                if (isCollapsed) setIsCollapsed(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'dimensions'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Dimensioni Totali
            </button>

            <button
              onClick={() => {
                setActiveTab('towers');
                if (isCollapsed) setIsCollapsed(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'towers'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Torri a Lattina
            </button>

            <button
              onClick={() => {
                setActiveTab('environment');
                if (isCollapsed) setIsCollapsed(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'environment'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <SunMoon className="w-3.5 h-3.5" />
              Copertura, Luci & Notte
            </button>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Modalità Notturna Quick Toggle */}
            <button
              onClick={() => {
                const nextNight = config.environmentMode !== 'night';
                onChange({
                  environmentMode: nextNight ? 'night' : 'day',
                  ambientLightIntensity: nextNight ? 0.15 : 1.0,
                  towerSpotlightIntensity: nextNight ? 6.0 : 3.5,
                  towerSpotlightEnabled: true,
                });
              }}
              title={
                config.environmentMode === 'night'
                  ? 'Disattiva Modalità Notturna (Torna a Giorno Studio)'
                  : 'Attiva Modalità Notturna (Cielo stellato 360°, luce soffusa e LED torri esaltati)'
              }
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                config.environmentMode === 'night'
                  ? 'bg-indigo-950 text-cyan-300 border border-cyan-400/60 shadow-md shadow-cyan-900/30 ring-1 ring-cyan-400/40'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <Moon
                className={`w-3.5 h-3.5 ${
                  config.environmentMode === 'night' ? 'text-cyan-400 fill-cyan-400' : 'text-slate-400'
                }`}
              />
              <span className="hidden sm:inline">Modalità Notturna</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                  config.environmentMode === 'night'
                    ? 'bg-cyan-400 text-slate-950'
                    : 'bg-slate-900 text-slate-400'
                }`}
              >
                {config.environmentMode === 'night' ? 'ON' : 'OFF'}
              </span>
            </button>

            <button
              onClick={onReset}
              title="Ripristina valori iniziali (14x14m + Banchi 10m + 3 Container 6.06x7.31m)"
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 px-2 py-1 hover:bg-slate-800 rounded transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="flex items-center gap-1 text-xs font-medium text-slate-300 hover:text-white px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              {isCollapsed ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>Mostra Controlli</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>Riduci</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tab Content Panes */}
        <div className="p-4 max-h-[300px] overflow-y-auto">
          {/* TAB 1: CONTAINER BASE + TERRAZZA + SCALE AI LATI */}
          {activeTab === 'containers' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-900/80 border border-slate-800 rounded-xl">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>3 Container Base + 3 Terrazze Coperte Affiancate (6.058 x 7.314 m)</span>
                    <span className="px-2 py-0.5 text-[10px] bg-sky-500/20 text-sky-300 rounded font-mono font-semibold">
                      3x2.44m · Colonne Mantenute
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Struttura originale delle terrazze invariata (tutte le colonne conservate) · LED rossi perimetrali · Tubi alla testa delle lattine
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-mono">H Modulo: {config.containerHeight.toFixed(3)}m</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 mb-2 block">
                  Colore & Finitura Struttura Container & Lamiera Grecata
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {containerColorOptions.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => onChange({ containerColor: c.id })}
                      className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        config.containerColor === c.id
                          ? 'border-sky-400 bg-sky-500/15 shadow-sm'
                          : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800/60'
                      }`}
                    >
                      <div
                        className="w-6 h-6 rounded-lg border border-white/20 shadow-inner"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="text-xs font-semibold text-slate-200">{c.name}</span>
                      <span className="text-[10px] text-slate-400 line-clamp-1">{c.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80 text-xs text-slate-300">
                <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800/80 space-y-1">
                  <div className="font-semibold text-sky-300">Tubi di Collegamento alla Testa delle Lattine</div>
                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    Copertura superiore rimossa: 4 tubi strutturali in acciaio collegano gli spigoli del tetto della terrazza (H 5.10m) alla parte superiore delle 4 torri a lattina (H 4.58m).
                  </div>
                </div>

                <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800/80 space-y-1">
                  <div className="font-semibold text-emerald-300">Scale ai Lati Monolitiche (15 Alzate / 15 Pedate)</div>
                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    Due rampe ai lati da 5.7m totali con torretta pianerottolo 1.2x1.2m (H 2.591m), gradini mandorlati in corpo unico e parapetti H 1.10m.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: BANCHI BAR (8.00 x 0.80 m H 1.10 m) */}
          {activeTab === 'bars' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-900/80 border border-slate-800 rounded-xl">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>Station Bar sui 4 Lati (Area Allargata 14x14m)</span>
                    <span className="px-2 py-0.5 text-[10px] bg-amber-500/20 text-amber-300 rounded font-mono font-semibold">
                      4 Lati · 10.00 x 0.80 m · H 1.10 m
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    10 moduli da 1m per lato (+1 modulo) · Base 14x14m con corridoio libero da ~1.14m per gli operatori tra banchi bar e scale laterali
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 cursor-pointer bg-slate-800/80 hover:bg-slate-700/80 px-2.5 py-1 rounded-lg border border-slate-700 text-xs text-white">
                    <input
                      type="checkbox"
                      checked={config.showBarCounters}
                      onChange={(e) => onChange({ showBarCounters: e.target.checked })}
                      className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
                    />
                    <span>Attiva Station Bar</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 mb-2 block">
                    Disposizione Station Bar nel Padiglione
                  </label>
                  <div className="space-y-1.5">
                    {[
                      { id: 'four_sides', name: 'Quattro Lati (Station su tutti i 4 lati)', desc: '4 Station continue da 10m (10 moduli/lato) con ampio passaggio operatori dietro le scale' },
                      { id: 'front_and_back', name: 'Fronte e Retro (2 Station da 10m)', desc: 'Due station opposte sui lati lunghi (Sud e Nord)' },
                      { id: 'front_only', name: 'Solo Fronte (1 Station da 10m)', desc: 'Station singola sull\'ingresso principale' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        onClick={() => onChange({ barCounterPlacement: p.id as any, showBarCounters: true })}
                        className={`w-full text-left p-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-start justify-between ${
                          config.barCounterPlacement === p.id && config.showBarCounters
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50'
                            : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-slate-200">{p.name}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{p.desc}</div>
                        </div>
                        {config.barCounterPlacement === p.id && config.showBarCounters && (
                          <span className="text-amber-400 text-xs font-bold">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 mb-2 block">
                    Finitura Materiale Banco Bar
                  </label>
                  <div className="space-y-1.5">
                    {[
                      { id: 'brushed_steel', name: 'Tutto Metallo (Acciaio Inox AISI 304)', desc: 'Banco interamente in acciaio inox spazzolato e satinato con top lucido' },
                      { id: 'industrial_black', name: 'Nero Industriale Corazzato', desc: 'Acciaio verniciato nero opaco con top grafite' },
                      { id: 'backlit_wood', name: 'Teak Naturale + Sottobanco', desc: 'Fascia in doghe di teak con top antracite' },
                      { id: 'translucent_led', name: 'Pannello LED Retroilluminato', desc: 'Fronte ciano ghiaccio luminoso per eventi notturni' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => onChange({ barCounterFinish: f.id as any, showBarCounters: true })}
                        className={`w-full text-left p-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-start justify-between ${
                          config.barCounterFinish === f.id
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50'
                            : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-slate-200">{f.name}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{f.desc}</div>
                        </div>
                        {config.barCounterFinish === f.id && (
                          <span className="text-amber-400 text-xs font-bold">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                <label className="flex items-center justify-between p-2.5 bg-slate-900/60 border border-slate-800 rounded-xl cursor-pointer">
                  <div>
                    <div className="text-xs text-slate-200 font-medium">Sgabelli Alti di Design (6 per banco)</div>
                    <div className="text-[10px] text-slate-400">Postazioni clienti con seduta H 78cm e poggiapiedi</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.showBarStools}
                    onChange={(e) => onChange({ showBarStools: e.target.checked })}
                    className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
                  />
                </label>

                <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-200 font-medium">Dimensioni Banco Verificate</div>
                    <div className="text-[10px] text-amber-400 font-mono">
                      L {config.barCounterLength.toFixed(2)}m · P {config.barCounterDepth.toFixed(2)}m · H {config.barCounterHeight.toFixed(2)}m
                    </div>
                  </div>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded font-mono">
                    {Math.round(config.barCounterLength)} Moduli / Lato
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TERRAZZA & FERRO */}
          {activeTab === 'terrace' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="text-xs font-medium text-slate-300 mb-2 block">
                  Parapetti Terrazza sul Tetto
                </label>
                <div className="space-y-1.5">
                  {railingOptions.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => onChange({ railingType: r.id })}
                      className={`w-full text-left p-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-start justify-between ${
                        config.railingType === r.id
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-400/50'
                          : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-slate-200">{r.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{r.desc}</div>
                      </div>
                      {config.railingType === r.id && <span className="text-sky-400 text-xs font-bold">✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 mb-2 block">
                  Materiale Pavimentazione Tetto Container
                </label>
                <div className="space-y-1.5">
                  {deckOptions.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => onChange({ deckMaterial: d.id })}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center justify-between ${
                        config.deckMaterial === d.id
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-400/50'
                          : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      <span>{d.name}</span>
                      {config.deckMaterial === d.id && <span className="text-sky-400 text-xs">✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 mb-2 block">
                  Arredi Rooftop & LED Sottopiano
                </label>
                <div className="space-y-1.5 mb-3">
                  {stagingOptions.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => onChange({ staging: s.id })}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center justify-between ${
                        config.staging === s.id
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-400/50'
                          : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      <span>{s.name}</span>
                      {config.staging === s.id && <span className="text-sky-400 text-xs">✓</span>}
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-800/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-rose-300 font-semibold">Linee LED Rosse Tetto Terrazza</span>
                    <button
                      onClick={() => onChange({ terraceRoofLedEnabled: !config.terraceRoofLedEnabled })}
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded cursor-pointer ${
                        config.terraceRoofLedEnabled ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40' : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {config.terraceRoofLedEnabled ? 'ATTIVO' : 'SPENTO'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/50">
                    <span className="text-xs text-slate-300">Neon LED Sottopiano</span>
                    <button
                      onClick={() => onChange({ underglowEnabled: !config.underglowEnabled })}
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded cursor-pointer ${
                        config.underglowEnabled ? 'bg-sky-500/20 text-sky-300' : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {config.underglowEnabled ? 'ATTIVO' : 'SPENTO'}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    {ledColors.map((c) => (
                      <button
                        key={c.hex}
                        onClick={() => onChange({ underglowLedColor: c.hex, underglowEnabled: true })}
                        title={c.name}
                        className={`w-6 h-6 rounded-full border transition-all cursor-pointer ${
                          config.underglowLedColor === c.hex ? 'scale-110 border-white' : 'border-transparent opacity-70'
                        }`}
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DIMENSIONI TOTALI */}
          {activeTab === 'dimensions' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-300 font-medium">Impronta Esterna Padiglione</span>
                  <span className="font-mono text-sky-400 font-semibold">{config.totalWidth.toFixed(1)} x {config.totalWidth.toFixed(1)} m</span>
                </div>
                <input
                  type="range"
                  min="10.0"
                  max="16.0"
                  step="0.5"
                  value={config.totalWidth}
                  onChange={(e) => onChange({ totalWidth: parseFloat(e.target.value) })}
                  className="w-full accent-sky-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <span className="text-[10px] text-amber-400/90 font-medium">Base allargata: 14.0 x 14.0 m (196 m²)</span>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-300 font-medium">Altezza Torri Lattina</span>
                  <span className="font-mono text-sky-400 font-semibold">{config.totalHeight.toFixed(1)} m</span>
                </div>
                <input
                  type="range"
                  min="4.0"
                  max="7.5"
                  step="0.25"
                  value={config.totalHeight}
                  onChange={(e) => onChange({ totalHeight: parseFloat(e.target.value) })}
                  className="w-full accent-sky-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <span className="text-[10px] text-sky-400 font-medium">Specifica utente: 5.0 metri</span>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-300 font-medium">Dimensioni 3 Container + 3 Terrazze</span>
                  <span className="font-mono text-sky-400 font-semibold">{config.containerLength.toFixed(3)} x {config.containerWidth.toFixed(3)} m</span>
                </div>
                <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                  3 moduli affiancati da 6.058 x 2.438 m ciascuno (Totale 7.314 m, H 5.18 m) con colonne mantenute e scale ai lati.
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-300 font-medium">Diametro Torri Lattina</span>
                  <span className="font-mono text-sky-400 font-semibold">{config.towerDiameter.toFixed(2)} m</span>
                </div>
                <input
                  type="range"
                  min="1.2"
                  max="2.2"
                  step="0.1"
                  value={config.towerDiameter}
                  onChange={(e) => onChange({ towerDiameter: parseFloat(e.target.value) })}
                  className="w-full accent-sky-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <span className="text-[10px] text-slate-500">Proporzioni lattina standard</span>
              </div>

              <div className="md:col-span-2">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-300 font-medium">Vista Esplosa Struttura Architettonica</span>
                  <span className="font-mono text-amber-400 font-semibold">{(config.explodedProgress * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={config.explodedProgress}
                  onChange={(e) => onChange({ explodedProgress: parseFloat(e.target.value) })}
                  className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <button onClick={() => onChange({ explodedProgress: 0 })} className="hover:text-slate-300 cursor-pointer">Unita (0%)</button>
                  <button onClick={() => onChange({ explodedProgress: 0.5 })} className="hover:text-slate-300 cursor-pointer">50%</button>
                  <button onClick={() => onChange({ explodedProgress: 1 })} className="hover:text-slate-300 cursor-pointer">Esplosa (100%)</button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TORRI A LATTINA */}
          {activeTab === 'towers' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 mb-2 block">
                  Finitura Metallo PBR Lattine (4 Angoli)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {finishOptions.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => onChange({ canFinish: f.id })}
                      className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        config.canFinish === f.id
                          ? 'border-sky-400 bg-sky-500/15 shadow-sm'
                          : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800/60'
                      }`}
                    >
                      <div
                        className="w-6 h-6 rounded-full border border-white/20 shadow-inner"
                        style={{ backgroundColor: f.color }}
                      />
                      <span className="text-xs font-semibold text-slate-200">{f.name}</span>
                      <span className="text-[10px] text-slate-400 line-clamp-1">{f.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
                <div>
                  <label className="text-xs font-medium text-slate-300 mb-1.5 block">
                    Grafica / Brand Personalizzato su Fusto
                  </label>
                  <input
                    type="text"
                    maxLength={20}
                    value={config.canBrandText}
                    onChange={(e) => onChange({ canBrandText: e.target.value })}
                    placeholder="Es. PAVILION 2026, RED BULL..."
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-sky-400"
                  />
                  <span className="text-[10px] text-slate-500">Applicata in tempo reale in alta risoluzione</span>
                </div>

                <div className="flex flex-col justify-center">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-300">
                    <input
                      type="checkbox"
                      checked={config.showPullTab}
                      onChange={(e) => onChange({ showPullTab: e.target.checked })}
                      className="w-4 h-4 accent-sky-400 rounded cursor-pointer"
                    />
                    <span>Linguetta 3D Stay-on Tab Superiore</span>
                  </label>
                  <span className="text-[10px] text-slate-500 pl-6">Dettaglio realistico sagomato in alluminio</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: COPERTURA, ILLUMINAZIONE & NOTTE */}
          {activeTab === 'environment' && (
            <div className="space-y-4">
              {/* Top Banner: Modalità Notturna & Atmosfera Stellata */}
              <div
                className={`p-3.5 rounded-2xl border transition-all ${
                  config.environmentMode === 'night'
                    ? 'bg-gradient-to-r from-indigo-950/90 via-slate-900/90 to-sky-950/80 border-cyan-400/50 shadow-lg shadow-indigo-950/50 ring-1 ring-cyan-500/30'
                    : 'bg-slate-900/70 border-slate-800'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-xl border mt-0.5 transition-colors ${
                        config.environmentMode === 'night'
                          ? 'bg-cyan-500/20 border-cyan-400/40 text-cyan-300'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      <Moon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white tracking-tight">
                          Modalità Notturna (Cielo Stellato & LED)
                        </span>
                        <span
                          className={`px-2 py-0.5 text-[10px] rounded-full font-mono font-bold tracking-wide uppercase ${
                            config.environmentMode === 'night'
                              ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 animate-pulse'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {config.environmentMode === 'night' ? '● Attiva (360° Stars)' : 'Disattivata'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300/80 mt-0.5 max-w-xl leading-relaxed">
                        Trasforma lo sfondo del cielo in un panorama stellato 360° con galassia e stelle scintillanti, abbassa drasticamente la luce diffusa/solare ed esalta l&apos;intensità dei fasci LED e dei bagliori sulle 4 torri a lattina.
                      </p>
                    </div>
                  </div>

                  {/* Large Toggle Switch Button */}
                  <button
                    onClick={() => {
                      const nextNight = config.environmentMode !== 'night';
                      onChange({
                        environmentMode: nextNight ? 'night' : 'day',
                        ambientLightIntensity: nextNight ? 0.15 : 1.0,
                        towerSpotlightIntensity: nextNight ? 6.0 : 3.5,
                        towerSpotlightEnabled: true,
                      });
                    }}
                    className={`relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none ${
                      config.environmentMode === 'night'
                        ? 'bg-cyan-500 border-cyan-400 shadow-md shadow-cyan-500/40'
                        : 'bg-slate-800 border-slate-700'
                    }`}
                    role="switch"
                    aria-checked={config.environmentMode === 'night'}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-slate-950 shadow-md ring-0 transition duration-200 ease-in-out mt-0.5 flex items-center justify-center ${
                        config.environmentMode === 'night' ? 'translate-x-8 text-cyan-300' : 'translate-x-0.5 text-slate-400'
                      }`}
                    >
                      {config.environmentMode === 'night' ? (
                        <Moon className="w-3.5 h-3.5 fill-cyan-300" />
                      ) : (
                        <Sun className="w-3.5 h-3.5" />
                      )}
                    </span>
                  </button>
                </div>

                {/* Scenario Switcher Row */}
                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/80">
                  {envOptions.map((e) => (
                    <button
                      key={e.id}
                      onClick={() => {
                        const isNightTarget = e.id === 'night';
                        onChange({
                          environmentMode: e.id,
                          ambientLightIntensity: isNightTarget ? 0.15 : e.id === 'sunset' ? 0.85 : 1.0,
                          towerSpotlightIntensity: isNightTarget ? 6.0 : e.id === 'sunset' ? 3.5 : 2.5,
                          towerSpotlightEnabled: true,
                        });
                      }}
                      className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-center transition-all cursor-pointer text-xs font-semibold ${
                        config.environmentMode === e.id
                          ? 'border-cyan-400 bg-cyan-500/20 text-white shadow-sm'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>{e.icon}</span>
                      <span>{e.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Controls Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Left Column: Ambient & Tower Spotlight Lighting Controls */}
                <div className="space-y-3.5 p-3.5 bg-slate-900/60 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      <span>Gestione Illuminazione Ambientale & LED</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Controllo Lux & Shader PBR</span>
                  </div>

                  {/* 1. Ambient Light Slider (Diffuse Hemisphere) */}
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="text-slate-300 font-medium flex items-center gap-1.5">
                        <span>Luce Ambientale (Diffusa)</span>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold ${
                          config.ambientLightIntensity <= 0.3
                            ? 'bg-indigo-500/20 text-indigo-300'
                            : config.ambientLightIntensity <= 0.8
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-sky-500/20 text-sky-300'
                        }`}>
                          {config.ambientLightIntensity <= 0.25
                            ? '🌙 Notte Drastica'
                            : config.ambientLightIntensity <= 0.6
                            ? 'Soffusa'
                            : config.ambientLightIntensity <= 1.2
                            ? 'Standard'
                            : 'Piena Luce'}
                        </span>
                      </span>
                      <span className="font-mono text-cyan-400 font-bold">
                        {config.ambientLightIntensity.toFixed(2)}x
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.05"
                      max="2.50"
                      step="0.05"
                      value={config.ambientLightIntensity}
                      onChange={(e) => onChange({ ambientLightIntensity: parseFloat(e.target.value) })}
                      className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                    />
                    <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5 gap-1">
                      <button
                        onClick={() => onChange({ ambientLightIntensity: 0.12 })}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer transition-colors"
                      >
                        Notte Cupa (0.12)
                      </button>
                      <button
                        onClick={() => onChange({ ambientLightIntensity: 0.50 })}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer transition-colors"
                      >
                        Soffusa (0.50)
                      </button>
                      <button
                        onClick={() => onChange({ ambientLightIntensity: 1.00 })}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer transition-colors"
                      >
                        Giorno (1.00)
                      </button>
                      <button
                        onClick={() => onChange({ ambientLightIntensity: 2.00 })}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer transition-colors"
                      >
                        Piena (2.00)
                      </button>
                    </div>
                  </div>

                  {/* 2. Tower Spotlights Slider & Toggle */}
                  <div className="pt-2 border-t border-slate-800/80">
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <label className="flex items-center gap-1.5 text-slate-200 font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.towerSpotlightEnabled}
                          onChange={(e) => onChange({ towerSpotlightEnabled: e.target.checked })}
                          className="w-3.5 h-3.5 accent-cyan-400 rounded cursor-pointer"
                        />
                        <span>Faretti LED Spotlights sulle Torri</span>
                      </label>
                      <span className="font-mono text-cyan-400 font-bold">
                        {config.towerSpotlightEnabled ? `${config.towerSpotlightIntensity.toFixed(1)} / 8.0` : 'SPENTI'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="8.0"
                      step="0.25"
                      disabled={!config.towerSpotlightEnabled}
                      value={config.towerSpotlightIntensity}
                      onChange={(e) => onChange({ towerSpotlightIntensity: parseFloat(e.target.value) })}
                      className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg disabled:opacity-40"
                    />

                    {/* Spotlight Color Palette */}
                    <div className="flex items-center justify-between gap-1.5 mt-2">
                      <span className="text-[10px] text-slate-400">Tonalità LED:</span>
                      <div className="flex items-center gap-1.5">
                        {[
                          { hex: '#38bdf8', name: 'Ciano' },
                          { hex: '#ffffff', name: 'Bianco' },
                          { hex: '#f59e0b', name: 'Oro' },
                          { hex: '#ec4899', name: 'Magenta' },
                          { hex: '#10b981', name: 'Smeraldo' },
                          { hex: '#2563eb', name: 'Blu Royal' },
                        ].map((c) => (
                          <button
                            key={c.hex}
                            onClick={() => onChange({ towerSpotlightColor: c.hex })}
                            title={c.name}
                            className={`w-5 h-5 rounded-full border transition-all cursor-pointer ${
                              config.towerSpotlightColor === c.hex
                                ? 'scale-115 border-white shadow-sm shadow-white/40 ring-1 ring-white/60'
                                : 'border-slate-700 opacity-70 hover:opacity-100'
                            }`}
                            style={{ backgroundColor: c.hex }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 3. Sun/Direct Light Slider */}
                  <div className="pt-2 border-t border-slate-800/80">
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="text-slate-300 font-medium">Luce Diretta / Sole (Key Light)</span>
                      <span className="font-mono text-amber-400 font-bold">
                        {config.sunLightIntensity.toFixed(1)}x
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="4.0"
                      step="0.1"
                      value={config.sunLightIntensity}
                      onChange={(e) => onChange({ sunLightIntensity: parseFloat(e.target.value) })}
                      className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                    />
                  </div>
                </div>

                {/* Right Column: Roof / Pergola & View Options */}
                <div className="space-y-3.5">
                  <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2.5">
                    <label className="text-xs font-bold text-white block">
                      Copertura Superiore Padiglione
                    </label>
                    <div className="space-y-1.5">
                      {roofOptions.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => onChange({ roofType: r.id })}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center justify-between ${
                            config.roofType === r.id
                              ? 'bg-sky-500/20 text-sky-300 border border-sky-400/50'
                              : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                        >
                          <span>{r.name}</span>
                          {config.roofType === r.id && <span className="text-sky-400 text-xs">✓</span>}
                        </button>
                      ))}
                    </div>

                    {config.roofType === 'bioclimatic_pergola' && (
                      <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-300 font-medium">Orientamento Lamelle Pergola</span>
                          <span className="font-mono text-sky-400 font-semibold">{config.louverAngle}°</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="90"
                          step="5"
                          value={config.louverAngle}
                          onChange={(e) => onChange({ louverAngle: parseInt(e.target.value, 10) })}
                          className="w-full accent-sky-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>0° (Chiuso)</span>
                          <span>45° (Ombra filtrata)</span>
                          <span>90° (Aperto cielo)</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center justify-between p-2.5 bg-slate-900/60 border border-slate-800 rounded-xl cursor-pointer">
                      <span className="text-xs text-slate-200 font-medium">Mostra Quote e Misure 3D</span>
                      <input
                        type="checkbox"
                        checked={config.showDimensions}
                        onChange={(e) => onChange({ showDimensions: e.target.checked })}
                        className="w-4 h-4 accent-sky-400 rounded cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2.5 bg-slate-900/60 border border-slate-800 rounded-xl cursor-pointer">
                      <span className="text-xs text-slate-200 font-medium">Griglia Metrica al Suolo (1m)</span>
                      <input
                        type="checkbox"
                        checked={config.showGrid}
                        onChange={(e) => onChange({ showGrid: e.target.checked })}
                        className="w-4 h-4 accent-sky-400 rounded cursor-pointer"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
