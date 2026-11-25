import React, { useState } from 'react';
import { StructureConfig } from '../types/config';
import { X, Download, Copy, Check, FileText, Layers, ShieldCheck, Package } from 'lucide-react';

interface TechnicalSpecsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: StructureConfig;
  snapshotUrl?: string;
}

export const TechnicalSpecsModal: React.FC<TechnicalSpecsModalProps> = ({
  isOpen,
  onClose,
  config,
  snapshotUrl,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Real structural math based on config
  const footprintArea = config.totalWidth * config.totalWidth; // 144 m²
  const containerArea = config.containerWidth * config.containerLength; // 2.438 * 6.058 ≈ 14.77 m²
  const terraceArea = containerArea;
  const towerR = config.towerDiameter / 2;

  // Capacity estimate
  const terraceCapacity = Math.floor(terraceArea / 0.85);
  const groundCapacity = Math.floor((footprintArea - containerArea) / 1.1);
  const totalCapacity = terraceCapacity + groundCapacity;

  // Weight estimates
  const containersTareWeight = 3 * 2200 + 3 * 1750; // 3 Base containers + 3 stacked terrace frames
  const ironRailingsWeight = Math.round((3 * 2.08 * 2 + 4.57 * 2) * 22);
  const dualStairsWeight = 2 * 780; // 2 side staircases (1.2x1.2m tower + 4.5m monolithic flight)
  const aluminumTowersWeight = Math.round(4 * 2 * Math.PI * towerR * config.totalHeight * 12);
  const connectingTubesWeight = 4 * 110; // 4 structural connecting tubes
  const totalWeightTons = ((containersTareWeight + ironRailingsWeight + dualStairsWeight + aluminumTowersWeight + connectingTubesWeight) / 1000).toFixed(2);

  const bomItems = [
    {
      code: 'CTNR-BASE-20',
      item: `Container Base (${config.containerLength.toFixed(3)}x${(config.containerWidth / 3).toFixed(3)}m H${config.containerHeight.toFixed(3)}m) affiancati con colonne portanti`,
      material: config.containerColor === 'mirror_chrome'
        ? 'Acciaio Inox Specchio + Copertura e Testate in Lamiera Grecata'
        : `Acciaio Strutturale (${config.containerColor}) · Tetto e Testate in Lamiera Grecata`,
      qty: 3,
      unit: 'container',
    },
    {
      code: 'TERR-MOD-20',
      item: `Moduli Terrazza Coperta Sovrapposti (${config.containerLength.toFixed(3)}x${(config.containerWidth / 3).toFixed(3)}m H${config.terraceHeight.toFixed(3)}m) - Struttura Invariata`,
      material: `Telaio Container con 4 Colonne per Modulo + Tetto Lamiera Grecata + Linee LED Rosse Perimetrali (${config.terraceRoofLedEnabled ? 'ATTIVE' : 'SPENTE'})`,
      qty: 3,
      unit: 'terrazze',
    },
    {
      code: 'TUBE-CONN-04',
      item: 'Tubi Strutturali di Collegamento (Spigoli Tetto Terrazza -> Testa Lattine)',
      material: 'Tubo Acciaio Strutturale S355 Ø136mm con Flange Saldate ai Nodi Superiori',
      qty: 4,
      unit: 'tubi',
    },
    {
      code: 'TW-CAN-01',
      item: `Torre Strutturale a Lattina H${config.totalHeight}m (Ø ${config.towerDiameter}m)`,
      material: config.canFinish === 'red_bull'
        ? 'Alluminio Serigrafato Alta Risoluzione PBR (Pattern 4 Quadranti Diagonali Blu Metallizzato & Argento Spazzolato)'
        : `Lega Alluminio Al-6061-T6 (${config.canFinish})`,
      qty: 4,
      unit: 'torri',
    },
    {
      code: 'RL-IRON-01',
      item: 'Parapetti Terrazza in Ferro a Bacchette Verticali H 1.10m (2.08m testate cad., 4.57m lati esterni)',
      material: 'Ferro Pieno Calandrato + Bacchette Verticali con Varchi Scale 1.20m',
      qty: Math.round(3 * 2.08 * 2 + 4.57 * 2),
      unit: 'ml',
    },
    {
      code: 'ST-SIDE-02',
      item: 'Scale Monolitiche ai Lati (Torretta 1.2x1.2m H 2.591m + Rampa 4.5m, 15 Alzate / 15 Pedate)',
      material: 'Corpo Unico in Lamiera Mandorlata Zincata + Cosciali e Parapetti H 1.10m (Totale 5.7m)',
      qty: 2,
      unit: 'rampe',
    },
    ...(config.roofType !== 'none'
      ? [
          {
            code: 'RF-COV-01',
            item: `Copertura Superiore (${config.roofType.replace('_', ' ').toUpperCase()})`,
            material: config.roofType === 'bioclimatic_pergola' ? 'Profili Estrusi Alluminio Motorizzati' : 'Membrana Architettonica PVDF',
            qty: 1,
            unit: 'sistema',
          },
        ]
      : []),
    ...(config.showBarCounters
      ? [
          {
            code: 'BAR-CTR-10',
            item: `Station Bar sui 4 Lati (${config.barCounterLength.toFixed(1)} x ${config.barCounterDepth.toFixed(2)} m, Altezza ${config.barCounterHeight.toFixed(2)} m - ${Math.round(config.barCounterLength)} moduli/lato)`,
            material: config.barCounterFinish === 'brushed_steel'
              ? 'Tutto Metallo: Struttura + Frontale Acciaio Inox AISI 304 Satinato, Top Acciaio Lucido, Poggiapiedi Inox + LED'
              : `Acciaio Verniciato + Top Satinato + Poggiapiedi Inox + LED (${config.barCounterFinish})`,
            qty: config.barCounterPlacement === 'front_and_back' ? 2 : config.barCounterPlacement === 'front_only' ? 1 : 4,
            unit: 'station',
          },
          ...(config.showBarStools
            ? [
                {
                  code: 'STL-BAR-01',
                  item: 'Sgabelli Alti da Bar con Poggiapiedi H78cm',
                  material: 'Acciaio Verniciato a Polvere + Seduta Imbottita',
                  qty: (config.barCounterPlacement === 'front_and_back' ? 2 : config.barCounterPlacement === 'front_only' ? 1 : 4) * 6,
                  unit: 'sgabelli',
                },
              ]
            : []),
        ]
      : []),
  ];

  const handleCopySpecs = () => {
    const text = `
STRUKTURA 3D - RELAZIONE TECNICA PADIGLIONE & CONTAINER + TERRAZZA
------------------------------------------------------------
Impronta Totale Esterna: ${config.totalWidth.toFixed(2)} x ${config.totalWidth.toFixed(2)} m (${footprintArea.toFixed(1)} m²)
Altezza Torri Lattina: ${config.totalHeight.toFixed(2)} m (4 Torri angolari, Diametro: ${config.towerDiameter.toFixed(2)} m)
${config.showBarCounters ? `Station Bar: ${config.barCounterPlacement === 'four_sides' ? `4 Station sui 4 lati (${config.barCounterLength.toFixed(2)}m cad, ${(config.barCounterLength * 4).toFixed(0)} ml totali, H ${config.barCounterHeight.toFixed(2)}m)` : `${config.barCounterLength.toFixed(2)} x ${config.barCounterDepth.toFixed(2)} m (Altezza ${config.barCounterHeight.toFixed(2)} m)`}\n` : ''}Container Base + Terrazza Coperta: ${config.containerLength.toFixed(3)} x ${config.containerWidth.toFixed(3)} m (H modulo ${config.containerHeight.toFixed(3)} m, Totale ${(config.containerHeight + config.terraceHeight).toFixed(3)} m)
Finitura Container: ${config.containerColor}
Tetto Terrazza: Lamiera Grecata con Linee LED Rosse Perimetrali (${config.terraceRoofLedEnabled ? 'Attive' : 'Spente'})
Collegamento Strutturale: 4 Tubi tra gli spigoli del tetto terrazza e il centro delle lattine (Copertura esterna: ${config.roofType === 'none' ? 'Rimossa' : config.roofType})
Parapetti Terrazza: In Ferro a Bacchette Verticali H 1.10m (2.08m sui lati corti, 4.57m sui lati lunghi)
Accessi: 2 Scale Monolitiche ai Lati da 5.7m (Torretta 1.2x1.2m + 15 Alzate / 15 Pedate su 4.5m)
Capienza Stimata: ~${terraceCapacity} pax (terrazza) / ~${totalCapacity} pax (totale evento)
Peso Strutturale Stimato: ~${totalWeightTons} tonnellate
Normative di Riferimento: Eurocodice 3 (EN 1993) / NTC 2018 / ISO 6346 Container
------------------------------------------------------------
Generato con Configuratore 3D Struttura Architettonica
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJSON = () => {
    const payload = {
      project: 'Configuratore 3D Struttura Architettonica con 3 Container',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      dimensions: {
        pavilionFootprintWidthMeters: config.totalWidth,
        canTowersHeightMeters: config.totalHeight,
        canTowersDiameterMeters: config.towerDiameter,
        barCounters: {
          show: config.showBarCounters,
          lengthMeters: config.barCounterLength,
          depthMeters: config.barCounterDepth,
          heightMeters: config.barCounterHeight,
          placement: config.barCounterPlacement,
          finish: config.barCounterFinish,
          showStools: config.showBarStools,
        },
        containersTotalWidthMeters: config.containerWidth, // 7.5m
        containersTotalLengthMeters: config.containerLength, // 6.0m
        containersHeightMeters: config.containerHeight, // 2.6m
        containerFootprintAreaM2: containerArea, // 45m²
        rooftopTerraceAreaM2: terraceArea, // 45m²
      },
      specifications: {
        containerUnitsCount: 3,
        containerColor: config.containerColor,
        railingType: 'iron_industrial (Parapetti in ferro)',
        stairsLocation: 'two_short_sides (Scale sui due lati corti)',
        stairsCount: 2,
        deckMaterial: config.deckMaterial,
        canFinish: config.canFinish,
        canBrandText: config.canBrandText,
        roofType: config.roofType,
        louverAngleDegrees: config.louverAngle,
        staging: config.staging,
      },
      engineeringEstimates: {
        terraceOccupancyPersons: terraceCapacity,
        totalOccupancyPersons: totalCapacity,
        totalWeightMetricTons: parseFloat(totalWeightTons),
        ironRailingsLinearMeters: Math.round(config.containerWidth * 2 + config.containerLength * 2 - 2.3),
      },
      billOfMaterials: bomItems,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `struttura_3d_3container_padiglione_${config.totalWidth.toFixed(0)}x${config.totalWidth.toFixed(0)}m.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadSnapshot = () => {
    if (!snapshotUrl) return;
    const a = document.createElement('a');
    a.href = snapshotUrl;
    a.download = `render_struttura_3container_6x7.5m.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Scheda Tecnica & Distinta Base (BOM)
              </h2>
              <p className="text-xs text-slate-400">
                Padiglione {config.totalWidth.toFixed(0)}x{config.totalWidth.toFixed(0)}m (Lattine H{config.totalHeight.toFixed(0)}m) · 3 Container Base + 3 Terrazze (6.06x7.31m)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Snapshot Preview */}
          {snapshotUrl && (
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={snapshotUrl}
                  alt="Snapshot 3D"
                  className="w-20 h-14 object-cover rounded-lg border border-slate-700"
                />
                <div>
                  <div className="text-xs font-semibold text-slate-200">Rendering 3D 3 Container + 3 Terrazze & Scale</div>
                  <div className="text-[11px] text-slate-400">Colonne modulari preservate, LED rossi perimetrali e tubi alla testa delle lattine</div>
                </div>
              </div>
              <button
                onClick={handleDownloadSnapshot}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Scarica PNG
              </button>
            </div>
          )}

          {/* Key Metric Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-950/50 border border-slate-800/80 rounded-xl">
              <div className="text-[11px] text-slate-400">3 Container + Terrazze</div>
              <div className="font-mono text-lg font-bold text-sky-400 mt-0.5">
                {containerArea.toFixed(1)} m²
              </div>
              <div className="text-[10px] text-slate-500">6.058 x 7.314 m (3x2.44m)</div>
            </div>

            <div className="p-3 bg-slate-950/50 border border-slate-800/80 rounded-xl">
              <div className="text-[11px] text-slate-400">Tetto Terrazza & LED</div>
              <div className="font-mono text-lg font-bold text-rose-400 mt-0.5">
                +{(config.containerHeight + config.terraceHeight).toFixed(2)} m
              </div>
              <div className="text-[10px] text-slate-500">Lamiera grecata + LED rossi</div>
            </div>

            <div className="p-3 bg-slate-950/50 border border-slate-800/80 rounded-xl">
              <div className="text-[11px] text-slate-400">Scale ai Lati</div>
              <div className="font-mono text-lg font-bold text-amber-400 mt-0.5">
                15 Alzate
              </div>
              <div className="text-[10px] text-slate-500">Torre 1.2x1.2m + 4.5m (5.7m)</div>
            </div>

            <div className="p-3 bg-slate-950/50 border border-slate-800/80 rounded-xl">
              <div className="text-[11px] text-slate-400">Peso Complessivo</div>
              <div className="font-mono text-lg font-bold text-purple-400 mt-0.5">
                ~{totalWeightTons} t
              </div>
              <div className="text-[10px] text-slate-500">6 Moduli + Scale + Tubi + Torri</div>
            </div>
          </div>

          {/* Architectural Layout Detail Box */}
          <div className="p-3.5 bg-slate-950/60 border border-sky-500/30 rounded-xl flex items-start gap-3">
            <Package className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <div className="font-semibold text-white">Configurazione 3 Container Base + 3 Terrazze Coperte Affiancate</div>
              <p className="text-slate-300 leading-relaxed">
                Tre moduli base da 6.058 x 2.438 m affiancati (totale 7.314 m) con tre moduli terrazza sovrapposti la cui struttura originale resta invariata mantenendo tutte le colonne portanti perimetrali e intermedie.
                Il tetto in lamiera grecata integra <strong>linee LED rosse perimetrali</strong>, parapetti in ferro (H 1.10m), <strong>due scale monolitiche ai lati</strong> e <strong>4 tubi strutturali</strong> collegati alla testa delle 4 lattine.
              </p>
            </div>
          </div>

          {/* BOM Table */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-semibold text-white">Distinta Base Componenti Principali (BOM)</h3>
            </div>
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Codice</th>
                    <th className="py-2.5 px-3">Componente Architettonico</th>
                    <th className="py-2.5 px-3">Specifica Materiale</th>
                    <th className="py-2.5 px-3 text-right">Q.tà</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                  {bomItems.map((item) => (
                    <tr key={item.code} className="hover:bg-slate-800/30">
                      <td className="py-2 px-3 text-sky-400 font-semibold">{item.code}</td>
                      <td className="py-2 px-3 font-sans text-slate-200">{item.item}</td>
                      <td className="py-2 px-3 text-slate-400">{item.material}</td>
                      <td className="py-2 px-3 text-right font-semibold">
                        {item.qty} <span className="text-[10px] text-slate-500 font-normal">{item.unit}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Compliance & Engineering Notes */}
          <div className="p-4 bg-slate-950/40 border border-slate-800/80 rounded-xl text-xs space-y-1.5 text-slate-400">
            <div className="flex items-center gap-1.5 font-semibold text-slate-200">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              Conformità Statica e Dettagli Costruttivi
            </div>
            <p>
              I tetti dei container sono opportunamente rinforzati con travi HEB secondarie per sostenere un sovraccarico accidentale calpestabile di 4.0 kN/m² (folla per eventi).
              I parapetti in ferro sono ancorati ai montanti d'angolo e ai longheroni perimetrali dei container per resistere a una spinta orizzontale di 1.5 kN/m a quota 1.10m.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/60">
          <div className="text-xs text-slate-400">
            Dati aggiornati in tempo reale in base alla configurazione 3D.
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySpecs}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiato!' : 'Copia Testo'}</span>
            </button>
            <button
              onClick={handleDownloadJSON}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Esporta JSON</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
