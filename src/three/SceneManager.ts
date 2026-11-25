import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CameraPreset, EnvironmentMode, StructureConfig } from '../types/config';
import { CanTower } from './CanTowerGeometry';
import { TerraceStructure } from './TerraceStructure';
import { ContainerCluster } from './ContainerCluster';
import { BarCounterCluster } from './BarCounter';
import { createStarrySkyTexture, StarfieldDome } from './StarrySky';

export interface ScreenDimensionCallout {
  id: string;
  label: string;
  value: string;
  x: number; // screen px
  y: number; // screen px
  visible: boolean;
}

export class SceneManager {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;

  private canTowers: CanTower[] = [];
  private terraceStructure!: TerraceStructure;
  private containerCluster!: ContainerCluster;
  private barCounterCluster!: BarCounterCluster;

  // Lighting
  private keyLight!: THREE.DirectionalLight;
  private fillLight!: THREE.HemisphereLight;
  private rimLight!: THREE.DirectionalLight;
  private towerUplights: THREE.SpotLight[] = [];

  // Celestial Night Sky & Starfield
  private starrySkyTexture!: THREE.CanvasTexture;
  private starfieldDome!: StarfieldDome;

  // Ground Grid
  private gridHelper!: THREE.GridHelper;

  // Animation & Damping
  private animFrameId: number | null = null;
  private lastTime = 0;
  private targetCameraPos = new THREE.Vector3(18, 10.5, 20.5);
  private targetLookAt = new THREE.Vector3(0, 2.2, 0);
  private isTransitioningCamera = false;

  // Dimension tracking points in world space
  private dimensionPoints = [
    {
      id: 'footprint_w',
      label: 'Impronta Totale Base',
      value: '14.00 x 14.00 m',
      worldPos: new THREE.Vector3(-4.6, 0.2, 7.3),
    },
    {
      id: 'height_t',
      label: 'Altezza Torri Lattina',
      value: '5.00 m (Tubi in Testa)',
      worldPos: new THREE.Vector3(6.4, 3.2, 6.4),
    },
    {
      id: 'bar_dim',
      label: 'Station Bar sui 4 Lati',
      value: '4 Postazioni 10.00x0.80m (H 1.10m)',
      worldPos: new THREE.Vector3(3.1, 1.1, 6.4),
    },
    {
      id: 'containers_dim',
      label: '3 Container Base + 3 Terrazze',
      value: '6.06 x 7.31 m (3x2.44m)',
      worldPos: new THREE.Vector3(-3.0, 1.3, 3.1),
    },
    {
      id: 'terrace_h',
      label: '3 Terrazze Coperte & LED Rossi',
      value: 'Quota +2.59 m / Tetto +5.18 m',
      worldPos: new THREE.Vector3(0, 5.35, 0),
    },
    {
      id: 'stairs_short',
      label: 'Scale ai Lati (15 Alzate)',
      value: 'Torre 1.2x1.2m + 4.5m (Tot 5.7m)',
      worldPos: new THREE.Vector3(4.3, 1.8, -0.5),
    },
  ];

  public onDimensionsUpdated?: (callouts: ScreenDimensionCallout[]) => void;

  constructor(
    private container: HTMLElement,
    private config: StructureConfig
  ) {
    // 1. Renderer Setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    // 2. Scene & Camera Setup
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      200
    );
    this.camera.position.set(18, 10.5, 20.5);

    // 3. OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.01;
    this.controls.minDistance = 2.5;
    this.controls.maxDistance = 50;
    this.controls.target.set(0, 2.2, 0);

    // 4. Environment & Lighting
    this.setupEnvironment();
    this.setupLighting();

    // 5. Build Architectural Structure
    this.buildPavilion();

    // 6. Ground Grid
    this.gridHelper = new THREE.GridHelper(20, 20, 0x64748b, 0x334155);
    this.gridHelper.position.y = -0.01;
    this.gridHelper.visible = config.showGrid;
    this.scene.add(this.gridHelper);

    // 7. Event Listeners
    window.addEventListener('resize', this.onResize);

    // Pre-warm shaders
    this.renderer.compile(this.scene, this.camera);

    // Start render loop
    this.animate(0);
  }

  private setupEnvironment() {
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();
    const roomEnv = new RoomEnvironment();
    this.scene.environment = pmremGenerator.fromScene(roomEnv, 0.04).texture;
    pmremGenerator.dispose();

    // High-resolution procedural 360° Starry Sky Panorama & 3D Celestial Dome
    this.starrySkyTexture = createStarrySkyTexture();
    this.starfieldDome = new StarfieldDome();
    this.scene.add(this.starfieldDome.group);
  }

  private setupLighting() {
    this.keyLight = new THREE.DirectionalLight(0xfff8ed, 2.4);
    this.keyLight.position.set(16, 22, 12);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 2048;
    this.keyLight.shadow.mapSize.height = 2048;
    this.keyLight.shadow.camera.near = 0.5;
    this.keyLight.shadow.camera.far = 60;
    const d = 12;
    this.keyLight.shadow.camera.left = -d;
    this.keyLight.shadow.camera.right = d;
    this.keyLight.shadow.camera.top = d;
    this.keyLight.shadow.camera.bottom = -d;
    this.keyLight.shadow.bias = -0.0004;
    this.keyLight.shadow.normalBias = 0.02;
    this.scene.add(this.keyLight);

    this.fillLight = new THREE.HemisphereLight(0xe0f2fe, 0x1e293b, 1.0);
    this.fillLight.position.set(0, 20, 0);
    this.scene.add(this.fillLight);

    this.rimLight = new THREE.DirectionalLight(0x93c5fd, 0.9);
    this.rimLight.position.set(-14, 12, -14);
    this.scene.add(this.rimLight);

    this.towerUplights = [];
    for (let i = 0; i < 4; i++) {
      const spot = new THREE.SpotLight(0x38bdf8, 0, 18, Math.PI / 3.4, 0.65, 1.1);
      spot.castShadow = false;
      this.scene.add(spot);
      this.towerUplights.push(spot);
    }

    this.applyEnvironmentMode(this.config.environmentMode);
  }

  private applyEnvironmentMode(mode: EnvironmentMode) {
    if (mode === 'day') {
      this.scene.background = new THREE.Color(0x0f172a);
      this.scene.fog = new THREE.Fog(0x0f172a, 30, 80);
      this.starfieldDome?.setVisible(false);

      this.keyLight.color.setHex(0xfff8ed);
      this.keyLight.intensity = this.config.sunLightIntensity ?? 2.4;
      this.keyLight.position.set(16, 22, 12);

      this.fillLight.color.setHex(0xe0f2fe);
      this.fillLight.groundColor.setHex(0x1e293b);
      this.fillLight.intensity = this.config.ambientLightIntensity ?? 1.0;

      this.rimLight.color.setHex(0x93c5fd);
      this.rimLight.intensity = 0.9;

      this.towerUplights.forEach((u) => (u.intensity = 0));
    } else if (mode === 'sunset') {
      this.scene.background = new THREE.Color(0x271424);
      this.scene.fog = new THREE.Fog(0x271424, 25, 75);
      this.starfieldDome?.setVisible(false);

      this.keyLight.color.setHex(0xf97316);
      this.keyLight.intensity = 3.2;
      this.keyLight.position.set(22, 9, 8);

      this.fillLight.color.setHex(0xfb7185);
      this.fillLight.groundColor.setHex(0x431407);
      this.fillLight.intensity = (this.config.ambientLightIntensity ?? 1.0) * 0.85;

      this.rimLight.color.setHex(0xfdba74);
      this.rimLight.intensity = 0.6;

      const spotColor = new THREE.Color(this.config.towerSpotlightColor || '#38bdf8');
      const spotIntensity = this.config.towerSpotlightEnabled
        ? (this.config.towerSpotlightIntensity ?? 3.5) * 0.8
        : 0;
      this.towerUplights.forEach((u) => {
        u.color.copy(spotColor);
        u.intensity = spotIntensity;
      });
    } else {
      // MODALITÀ NOTTURNA:
      // 1. Sfondo cielo stellato 360° panoramico equirectangular ad alta risoluzione
      this.scene.background = this.starrySkyTexture;
      // Nebbia scura che non oscura la volta celeste
      this.scene.fog = new THREE.Fog(0x020512, 45, 120);
      this.starfieldDome?.setVisible(true);

      // 2. Luce diretta (Key Light) abbassata a morbido chiarore lunare
      this.keyLight.color.setHex(0x38bdf8);
      this.keyLight.intensity = (this.config.sunLightIntensity ?? 2.4) * 0.05;
      this.keyLight.position.set(12, 18, 10);

      // 3. Luce diffusa / ambientale abbassata drasticamente per creare atmosfera notturna profonda
      this.fillLight.color.setHex(0x0a1124);
      this.fillLight.groundColor.setHex(0x010308);
      const baseAmb = this.config.ambientLightIntensity ?? 0.15;
      // In modalità notturna, l'intensità ambientale è ridotta drasticamente (0.04 - 0.22 max)
      this.fillLight.intensity = Math.max(0.03, Math.min(baseAmb, 1.8) * 0.14);

      this.rimLight.color.setHex(0x1e293b);
      this.rimLight.intensity = 0.12;

      // 4. Esaltazione massima dei faretti LED sulle 4 torri a lattina
      const spotColor = new THREE.Color(this.config.towerSpotlightColor || '#38bdf8');
      const spotIntensity = this.config.towerSpotlightEnabled
        ? (this.config.towerSpotlightIntensity ?? 3.5) * 2.4
        : 0;

      this.towerUplights.forEach((u) => {
        u.color.copy(spotColor);
        u.intensity = spotIntensity;
        u.distance = 22;
      });
    }
  }

  private buildPavilion() {
    const W = this.config.totalWidth;
    const D = this.config.towerDiameter;
    const R = D / 2;
    const halfW = W / 2 - R;

    // Dispose previous
    this.canTowers.forEach((t) => {
      this.scene.remove(t.group);
      t.dispose();
    });
    this.canTowers = [];

    if (this.terraceStructure) {
      this.scene.remove(this.terraceStructure.group);
      this.terraceStructure.dispose();
    }

    if (this.containerCluster) {
      this.scene.remove(this.containerCluster.group);
      this.containerCluster.dispose();
    }

    if (this.barCounterCluster) {
      this.scene.remove(this.barCounterCluster.group);
      this.barCounterCluster.dispose();
    }

    const maxAnisotropy = this.renderer.capabilities.getMaxAnisotropy();

    // 1. 4 Corner Can Towers (H 5.0m)
    const cornerOffsets = [
      { x: -halfW, z: halfW }, // NW (Index 0)
      { x: halfW, z: halfW }, // NE (Index 1)
      { x: halfW, z: -halfW }, // SE (Index 2)
      { x: -halfW, z: -halfW }, // SW (Index 3)
    ];

    cornerOffsets.forEach((pos, idx) => {
      const tower = new CanTower(idx, this.config, maxAnisotropy);
      tower.group.position.set(pos.x, 0, pos.z);
      this.scene.add(tower.group);
      this.canTowers.push(tower);

      if (this.towerUplights[idx]) {
        this.towerUplights[idx].position.set(pos.x * 0.9, 0.1, pos.z * 0.9);
        this.towerUplights[idx].target = tower.group;
      }
    });

    // 2. Ground Plaza & Overhead Canopy
    this.terraceStructure = new TerraceStructure(this.config, maxAnisotropy);
    this.scene.add(this.terraceStructure.group);

    // 3. 3 Shipping Containers (6 x 7.5m) with Rooftop Terrace, Iron Railings & Dual Short-Side Stairs
    if (this.config.showContainers) {
      this.containerCluster = new ContainerCluster(this.config, maxAnisotropy);
      this.scene.add(this.containerCluster.group);
    }

    // 4. 8.0m x 0.80m x 1.10m Bar Counters between the Can Towers
    if (this.config.showBarCounters) {
      this.barCounterCluster = new BarCounterCluster(this.config);
      this.scene.add(this.barCounterCluster.group);
    }

    // Apply exploded factor
    this.applyExplodedOffset(this.config.explodedProgress);
  }

  private applyExplodedOffset(factor: number) {
    if (this.terraceStructure) {
      this.terraceStructure.setExplodedOffset(factor);
    }
    if (this.containerCluster) {
      this.containerCluster.setExplodedOffset(factor);
    }
    if (this.barCounterCluster) {
      this.barCounterCluster.setExplodedOffset(factor);
    }

    const W = this.config.totalWidth;
    const D = this.config.towerDiameter;
    const R = D / 2;
    const halfW = W / 2 - R;

    const cornerSigns = [
      { x: -1, z: 1 },
      { x: 1, z: 1 },
      { x: 1, z: -1 },
      { x: -1, z: -1 },
    ];

    this.canTowers.forEach((tower, idx) => {
      const sign = cornerSigns[idx];
      const basePos = new THREE.Vector3(sign.x * halfW, 0, sign.z * halfW);
      const outward = new THREE.Vector3(sign.x, 0, sign.z).normalize();
      tower.group.position.copy(basePos);
      tower.setExplodedOffset(factor, outward);
      tower.group.position.add(basePos);
    });
  }

  public updateConfig(newConfig: StructureConfig) {
    const prev = this.config;
    this.config = { ...newConfig };

    // Geometry dimension changes require full rebuild
    if (
      prev.totalWidth !== newConfig.totalWidth ||
      prev.totalHeight !== newConfig.totalHeight ||
      prev.towerDiameter !== newConfig.towerDiameter ||
      prev.showContainers !== newConfig.showContainers ||
      prev.containerWidth !== newConfig.containerWidth ||
      prev.containerLength !== newConfig.containerLength ||
      prev.containerHeight !== newConfig.containerHeight ||
      prev.showBarCounters !== newConfig.showBarCounters ||
      prev.barCounterLength !== newConfig.barCounterLength ||
      prev.barCounterDepth !== newConfig.barCounterDepth ||
      prev.barCounterHeight !== newConfig.barCounterHeight ||
      prev.barCounterPlacement !== newConfig.barCounterPlacement ||
      prev.barCounterFinish !== newConfig.barCounterFinish ||
      prev.showBarStools !== newConfig.showBarStools
    ) {
      this.buildPavilion();
    } else {
      // Incremental updates
      const maxAnisotropy = this.renderer.capabilities.getMaxAnisotropy();
      this.canTowers.forEach((t) => t.update(newConfig, maxAnisotropy));
      this.terraceStructure?.update(newConfig, maxAnisotropy);
      this.containerCluster?.update(newConfig, maxAnisotropy);
      this.barCounterCluster?.update(newConfig);
    }

    if (prev.louverAngle !== newConfig.louverAngle) {
      this.terraceStructure?.setLouverAngle(newConfig.louverAngle);
    }

    if (
      prev.environmentMode !== newConfig.environmentMode ||
      prev.ambientLightIntensity !== newConfig.ambientLightIntensity ||
      prev.sunLightIntensity !== newConfig.sunLightIntensity ||
      prev.towerSpotlightIntensity !== newConfig.towerSpotlightIntensity ||
      prev.towerSpotlightColor !== newConfig.towerSpotlightColor ||
      prev.towerSpotlightEnabled !== newConfig.towerSpotlightEnabled
    ) {
      this.applyEnvironmentMode(newConfig.environmentMode);
    }

    if (prev.explodedProgress !== newConfig.explodedProgress) {
      this.applyExplodedOffset(newConfig.explodedProgress);
    }

    this.gridHelper.visible = newConfig.showGrid;
    this.controls.autoRotate = newConfig.autoRotate;
    this.controls.autoRotateSpeed = 1.2;

    // Update dimension annotation values
    this.dimensionPoints[0].label = 'Impronta Totale Base';
    this.dimensionPoints[0].value = `${newConfig.totalWidth.toFixed(2)} x ${newConfig.totalWidth.toFixed(2)} m`;
    this.dimensionPoints[1].value = `${newConfig.totalHeight.toFixed(2)} m (Tubi in Testa)`;
    this.dimensionPoints[2].label = newConfig.barCounterPlacement === 'four_sides' ? 'Station Bar sui 4 Lati' : 'Banchi Bar tra Torri';
    this.dimensionPoints[2].value = `${newConfig.barCounterPlacement === 'four_sides' ? '4 Station' : newConfig.barCounterPlacement === 'front_and_back' ? '2 Station' : '1 Station'} ${newConfig.barCounterLength.toFixed(2)} x ${newConfig.barCounterDepth.toFixed(2)} m (H ${newConfig.barCounterHeight.toFixed(2)}m)`;
    this.dimensionPoints[3].label = '3 Container Base + 3 Terrazze';
    this.dimensionPoints[3].value = `${newConfig.containerLength.toFixed(2)} x ${newConfig.containerWidth.toFixed(2)} m (3x2.44m)`;
    this.dimensionPoints[4].label = '3 Terrazze Coperte & LED Rossi';
    this.dimensionPoints[4].value = `Piano +${newConfig.containerHeight.toFixed(2)}m · Tetto +${(newConfig.containerHeight * 2).toFixed(2)}m`;
    this.dimensionPoints[5].label = 'Scale ai Lati (15 Alzate)';
    this.dimensionPoints[5].value = 'Torre 1.2x1.2m + 4.5m (Tot 5.7m)';

    this.dimensionPoints[0].worldPos.set(-4.6, 0.2, newConfig.totalWidth / 2 + 0.3);
    this.dimensionPoints[1].worldPos.set(newConfig.totalWidth / 2 + 0.2, newConfig.totalHeight * 0.65, newConfig.totalWidth / 2 + 0.2);
    this.dimensionPoints[2].worldPos.set(3.1, newConfig.barCounterHeight + 0.1, newConfig.totalWidth / 2 - 0.5);
    this.dimensionPoints[3].worldPos.set(-newConfig.containerWidth * 0.42, 1.3, newConfig.containerLength / 2 + 0.2);
    this.dimensionPoints[4].worldPos.set(0, newConfig.containerHeight * 2 + 0.2, 0);
    this.dimensionPoints[5].worldPos.set(newConfig.containerWidth / 2 + 0.7, 1.8, -0.5);
  }

  public setCameraPreset(preset: CameraPreset) {
    this.isTransitioningCamera = true;

    if (preset === 'perspective') {
      this.targetCameraPos.set(18, 10.5, 20.5);
      this.targetLookAt.set(0, 2.2, 0);
    } else if (preset === 'bar_view') {
      // Direct front angle at eye level facing the 10m bar counter between the front can towers
      this.targetCameraPos.set(0, 2.2, 12.2);
      this.targetLookAt.set(0, 1.1, 6.3);
    } else if (preset === 'top') {
      this.targetCameraPos.set(0, 26, 0.001);
      this.targetLookAt.set(0, 0, 0);
    } else if (preset === 'front') {
      this.targetCameraPos.set(0, 3.6, 21.0);
      this.targetLookAt.set(0, 2.2, 0);
    } else if (preset === 'side') {
      // Side view looking at the East Station Bar and clearly showing the 1.14m operator corridor & stairs
      this.targetCameraPos.set(17.5, 4.2, 3.4);
      this.targetLookAt.set(4.0, 1.8, -0.8);
    } else if (preset === 'terrace') {
      this.targetCameraPos.set(-1.4, this.config.containerHeight + 1.6, 1.2);
      this.targetLookAt.set(1.5, this.config.containerHeight + 1.4, -1.0);
    } else if (preset === 'containers_view') {
      this.targetCameraPos.set(0, 3.4, 10.5);
      this.targetLookAt.set(0, 1.8, 0);
    } else if (preset === 'tower_detail') {
      const halfW = this.config.totalWidth / 2 - this.config.towerDiameter / 2;
      this.targetCameraPos.set(halfW + 1.8, this.config.totalHeight + 0.9, halfW + 1.8);
      this.targetLookAt.set(halfW, this.config.totalHeight - 0.2, halfW);
    }
  }

  private onResize = () => {
    if (!this.container) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  private animate = (time: number) => {
    this.animFrameId = requestAnimationFrame(this.animate);
    const dt = Math.min((time - this.lastTime) / 1000, 0.1);
    this.lastTime = time;

    // Smooth camera damping if transitioning
    if (this.isTransitioningCamera) {
      this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, this.targetCameraPos.x, 4, dt);
      this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, this.targetCameraPos.y, 4, dt);
      this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, this.targetCameraPos.z, 4, dt);

      this.controls.target.x = THREE.MathUtils.damp(this.controls.target.x, this.targetLookAt.x, 4, dt);
      this.controls.target.y = THREE.MathUtils.damp(this.controls.target.y, this.targetLookAt.y, 4, dt);
      this.controls.target.z = THREE.MathUtils.damp(this.controls.target.z, this.targetLookAt.z, 4, dt);

      if (this.camera.position.distanceTo(this.targetCameraPos) < 0.08) {
        this.isTransitioningCamera = false;
      }
    }

    this.controls.update();
    this.starfieldDome?.animate(time);
    this.renderer.render(this.scene, this.camera);

    // Project 3D dimension points to 2D screen coordinates
    if (this.config.showDimensions && this.onDimensionsUpdated) {
      this.updateScreenDimensions();
    }
  };

  private tempVec = new THREE.Vector3();
  private updateScreenDimensions() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    const callouts: ScreenDimensionCallout[] = [];

    for (const pt of this.dimensionPoints) {
      this.tempVec.copy(pt.worldPos);
      this.tempVec.project(this.camera);

      const isVisible = this.tempVec.z < 1 && this.tempVec.z > -1;
      const screenX = (this.tempVec.x * 0.5 + 0.5) * width;
      const screenY = (-(this.tempVec.y * 0.5) + 0.5) * height;

      callouts.push({
        id: pt.id,
        label: pt.label,
        value: pt.value,
        x: Math.round(screenX),
        y: Math.round(screenY),
        visible: isVisible,
      });
    }

    this.onDimensionsUpdated!(callouts);
  }

  public captureScreenshot(): string {
    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement.toDataURL('image/png');
  }

  public dispose() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    window.removeEventListener('resize', this.onResize);
    this.controls.dispose();

    this.canTowers.forEach((t) => t.dispose());
    this.terraceStructure?.dispose();
    this.containerCluster?.dispose();
    this.barCounterCluster?.dispose();
    this.starfieldDome?.dispose();
    this.starrySkyTexture?.dispose();
    this.renderer.dispose();

    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
