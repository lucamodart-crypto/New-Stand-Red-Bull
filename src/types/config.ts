/**
 * Configuration types for the 3D Architectural Structure (Can Pavilion, Shipping Containers & Bar Counters)
 */

export type CanFinish = 'red_bull' | 'brushed_aluminum' | 'carbon_black' | 'crimson_beverage' | 'champagne_gold' | 'titanium_white';

export type DeckMaterial = 'teak_wood' | 'polished_concrete' | 'smoked_glass' | 'dark_composite';

export type RailingType = 'iron_industrial' | 'frameless_glass' | 'tension_cables' | 'black_louvers';

export type ContainerColor = 'mirror_chrome' | 'anthracite' | 'corten_rust' | 'navy_blue' | 'olive_green' | 'pure_white';

export type BarCounterPlacement = 'front_and_back' | 'front_only' | 'four_sides';

export type BarCounterFinish = 'industrial_black' | 'brushed_steel' | 'backlit_wood' | 'translucent_led';

export type RoofType = 'none' | 'bioclimatic_pergola' | 'tensile_sail' | 'open_sky';

export type EnvironmentMode = 'day' | 'sunset' | 'night';

export type TerraceStaging = 'lounge_bar' | 'cocktail_minimal' | 'empty_showroom';

export type CameraPreset = 'perspective' | 'top' | 'front' | 'side' | 'terrace' | 'tower_detail' | 'containers_view' | 'bar_view';

export interface StructureConfig {
  // Dimensions (in meters)
  totalWidth: number; // 12.0 m outer pavilion footprint (widened by 1m per side: 12x12m)
  totalHeight: number; // 5.0 m can towers height
  towerDiameter: number; // 1.6 m

  // 8.0 x 0.80 m (H 1.10m) Bar Counters between Can Towers
  showBarCounters: boolean;
  barCounterLength: number; // 8.0 m
  barCounterDepth: number; // 0.80 m
  barCounterHeight: number; // 1.10 m
  barCounterPlacement: BarCounterPlacement;
  barCounterFinish: BarCounterFinish;
  showBarStools: boolean;

  // 3 Base Containers + 3 Covered Terrace Modules side-by-side (6.058 x 7.314 m = 3 x 2.438m)
  showContainers: boolean;
  containerWidth: number; // 7.314 m (3 x 2.438 m)
  containerLength: number; // 6.058 m
  containerHeight: number; // 2.591 m
  containerColor: ContainerColor;
  containerDoorsOpen: boolean;
  containerSideWindows: boolean;

  // 3 Covered Rooftop Terrace Modules on Containers (6.058 x 7.314 m, H 2.591 m)
  terraceHeight: number; // 2.591 m (matches container roof level)
  deckMaterial: DeckMaterial;
  railingType: RailingType;
  staging: TerraceStaging;
  underglowLedColor: string; // Hex color e.g. '#00e5ff'
  underglowEnabled: boolean;
  terraceRoofLedEnabled: boolean; // Red LED lines around terrace roof perimeter
  terraceRoofLedColor: string; // Default '#ff1428'

  // Can Tower specifics
  canFinish: CanFinish;
  canBrandText: string;
  showPullTab: boolean;
  showSpiralStairs: boolean;

  // Roof / Pergola over structure ('none' removes outer pavilion roof)
  roofType: RoofType;
  louverAngle: number; // 0 (closed) to 90 (vertical open)

  // Environment & View
  environmentMode: EnvironmentMode;
  explodedProgress: number; // 0 to 1
  showDimensions: boolean;
  showGrid: boolean;
  autoRotate: boolean;

  // Lighting & Atmospheric Controls
  ambientLightIntensity: number; // 0.1 to 3.0 (diffuse hemisphere light)
  sunLightIntensity: number; // 0.0 to 5.0 (key direct sunlight)
  towerSpotlightIntensity: number; // 0.0 to 8.0 (slider for LED spotlights on towers)
  towerSpotlightColor: string; // Hex color for LED spotlights on towers
  towerSpotlightEnabled: boolean; // Toggle for LED spotlights
  towerSpotlightAngle: number; // Beam spread angle in degrees (20° to 70°)
  barUnderglowIntensity: number; // 0.0 to 3.0 (under-counter LED along bars)
  barUnderglowColor: string; // Hex color for bar LED underglow
}

export const DEFAULT_CONFIG: StructureConfig = {
  totalWidth: 14.0, // 14.0 x 14.0m base footprint for generous operator clearance behind stairs
  totalHeight: 5.0, // Can towers 5m
  towerDiameter: 1.6,

  // 10m x 0.8m x 1.1m Bar Counters on all 4 sides (10 modules of 1m per side)
  showBarCounters: true,
  barCounterLength: 10.0,
  barCounterDepth: 0.8,
  barCounterHeight: 1.1,
  barCounterPlacement: 'four_sides',
  barCounterFinish: 'brushed_steel',
  showBarStools: false,

  // 3 Base Containers + 3 Covered Terraces footprint 6.058 x 7.314 m (3 x 2.438m)
  showContainers: true,
  containerWidth: 7.314,
  containerLength: 6.058,
  containerHeight: 2.591,
  containerColor: 'anthracite',
  containerDoorsOpen: true,
  containerSideWindows: true,

  // Covered Rooftop terrace on container
  terraceHeight: 2.591,
  deckMaterial: 'dark_composite',
  railingType: 'iron_industrial',
  staging: 'lounge_bar',
  underglowLedColor: '#00e5ff',
  underglowEnabled: true,
  terraceRoofLedEnabled: true,
  terraceRoofLedColor: '#ff1428',

  canFinish: 'red_bull',
  canBrandText: '',
  showPullTab: true,
  showSpiralStairs: false,

  roofType: 'none',
  louverAngle: 35,

  environmentMode: 'day',
  explodedProgress: 0,
  showDimensions: true,
  showGrid: true,
  autoRotate: false,

  // Default Lighting Parameters
  ambientLightIntensity: 1.0,
  sunLightIntensity: 2.4,
  towerSpotlightIntensity: 3.5,
  towerSpotlightColor: '#38bdf8',
  towerSpotlightEnabled: true,
  towerSpotlightAngle: 45,
  barUnderglowIntensity: 1.8,
  barUnderglowColor: '#f59e0b',
};
