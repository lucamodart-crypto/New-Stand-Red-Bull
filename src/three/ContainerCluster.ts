import * as THREE from 'three';
import { ContainerColor, StructureConfig } from '../types/config';
import {
  createCheckeredSteelTexture,
  createConcreteTexture,
  createWoodDeckTexture,
} from './proceduralTextures';

/**
 * 3 Modular Base Containers + 3 Unmodified Covered Terraces side-by-side (6.058 x 7.314 m = 3 x 2.438m)
 * Preserves all structural corner columns of each unit, with Red LED roof perimeter,
 * Twin Monolithic Side Staircases (1.2x1.2m tower + 15 alzate / 15 pedate),
 * and 4 Structural Connecting Tubes to the upper shoulder of the 4 Can Towers.
 */
export class ContainerCluster {
  public group: THREE.Group;
  public containersGroup: THREE.Group;
  public roofTerraceGroup: THREE.Group;
  public stairsGroup: THREE.Group;
  public furnitureGroup: THREE.Group;
  public tubesGroup: THREE.Group;

  private underglowMesh!: THREE.Mesh;
  private underglowLight!: THREE.PointLight;
  private ironRailingGroup!: THREE.Group;
  private roofLedMeshes: THREE.Mesh[] = [];
  private roofLedLights: THREE.PointLight[] = [];

  constructor(public config: StructureConfig, maxAnisotropy = 8) {
    this.group = new THREE.Group();
    this.group.name = 'ContainerCluster';

    this.containersGroup = new THREE.Group();
    this.containersGroup.name = 'BaseContainersGroup';

    this.roofTerraceGroup = new THREE.Group();
    this.roofTerraceGroup.name = 'CoveredTerracesGroup';

    this.stairsGroup = new THREE.Group();
    this.stairsGroup.name = 'SideStairsGroup';

    this.furnitureGroup = new THREE.Group();
    this.furnitureGroup.name = 'TerraceFurnitureGroup';

    this.tubesGroup = new THREE.Group();
    this.tubesGroup.name = 'ConnectingTubesGroup';

    this.group.add(this.containersGroup);
    this.group.add(this.roofTerraceGroup);
    this.roofTerraceGroup.add(this.furnitureGroup);
    this.group.add(this.stairsGroup);
    this.group.add(this.tubesGroup);

    this.build(config, maxAnisotropy);
  }

  private getFrameColorHex(c: ContainerColor): number {
    switch (c) {
      case 'mirror_chrome':
        return 0xe2e8f0;
      case 'anthracite':
        return 0x222933;
      case 'corten_rust':
        return 0x9a3412;
      case 'navy_blue':
        return 0x1e3a8a;
      case 'olive_green':
        return 0x365314;
      case 'pure_white':
        return 0xe2e8f0;
      default:
        return 0x222933;
    }
  }

  private build(config: StructureConfig, maxAnisotropy: number) {
    const W = config.containerWidth; // 7.314 m (3 x 2.438 m)
    const L = config.containerLength; // 6.058 m
    const H = config.containerHeight; // 2.591 m
    const terraceH = config.terraceHeight || H; // 2.591 m
    const unitCount = 3;
    const singleW = W / unitCount; // 2.438 m

    // 1. 3 Base Containers side-by-side (preserving all 4 corner columns per container)
    this.buildBaseContainers(unitCount, singleW, L, H, config);

    // 2. 3 Unmodified Covered Rooftop Terraces side-by-side (preserving all corner columns) + Red LED Roof Perimeter
    this.buildRoofTerraces(unitCount, singleW, W, L, H, terraceH, config, maxAnisotropy);

    // 3. Vertical-Picket Iron Railings (2.08m ends per terrace unit, 4.57m outer sides + 1.20m stair gates)
    this.buildIronRailings(unitCount, singleW, W, L, H, config);

    // 4. Twin Monolithic Side Staircases (1.2x1.2m landing tower + 4.5m flight, 15 alzate / 15 pedate)
    this.buildSideStairs(W, L, H, maxAnisotropy);

    // 5. Modular Terrace Staging placed cleanly inside the 3 bays (zero column clipping)
    this.buildRooftopFurniture(unitCount, singleW, L, H, config);

    // 6. 4 Structural Connecting Tubes (Outer Terrace Roof Corners -> Upper Can Towers)
    this.buildConnectingTubes(W, L, H + terraceH, config);
  }

  private createSteelMaterials(config: StructureConfig) {
    const isMirror = config.containerColor === 'mirror_chrome';
    const baseHex = this.getFrameColorHex(config.containerColor);

    const frameMat = isMirror
      ? new THREE.MeshPhysicalMaterial({
          color: 0xf1f5f9,
          metalness: 1.0,
          roughness: 0.04,
          clearcoat: 1.0,
          envMapIntensity: 2.0,
        })
      : new THREE.MeshStandardMaterial({
          color: baseHex,
          metalness: 0.78,
          roughness: 0.36,
        });

    const panelMat = isMirror
      ? new THREE.MeshPhysicalMaterial({
          color: 0xffffff,
          metalness: 1.0,
          roughness: 0.03,
          clearcoat: 1.0,
          envMapIntensity: 2.2,
        })
      : new THREE.MeshStandardMaterial({
          color: baseHex,
          metalness: 0.72,
          roughness: 0.42,
        });

    const castingMat = isMirror
      ? new THREE.MeshStandardMaterial({
          color: 0xffffff,
          metalness: 1.0,
          roughness: 0.04,
        })
      : new THREE.MeshStandardMaterial({
          color: 0x111827,
          metalness: 0.9,
          roughness: 0.25,
        });

    return { frameMat, panelMat, castingMat };
  }

  /**
   * 3D Corrugated Steel Roof ("Lamiera Grecata") for a single 2.438m x 6.058m module
   */
  private createCorrugatedRoof(
    width: number,
    length: number,
    topY: number,
    panelMat: THREE.Material,
    frameMat: THREE.Material
  ): THREE.Group {
    const roof = new THREE.Group();

    const innerW = width - 0.14;
    const innerL = length - 0.14;

    const plateGeo = new THREE.BoxGeometry(innerW, 0.03, innerL);
    const plate = new THREE.Mesh(plateGeo, frameMat);
    plate.position.set(0, topY - 0.055, 0);
    plate.castShadow = true;
    plate.receiveShadow = true;
    roof.add(plate);

    const ribCount = 34;
    const pitch = innerL / ribCount;
    const ribGeo = new THREE.BoxGeometry(innerW, 0.042, pitch * 0.48);

    for (let i = 0; i < ribCount; i++) {
      const rz = -innerL / 2 + (i + 0.5) * pitch;
      const rib = new THREE.Mesh(ribGeo, panelMat);
      rib.position.set(0, topY - 0.025, rz);
      rib.castShadow = true;
      rib.receiveShadow = true;
      roof.add(rib);
    }

    return roof;
  }

  /**
   * 1. Three Base Containers side-by-side (each 2.438 x 6.058 x 2.591 m)
   * Every container retains all 4 structural corner columns & ISO castings.
   * Outer long walls feature twin 2.5 x 2.1 m open bays; short ends feature corrugated steel.
   */
  private buildBaseContainers(
    unitCount: number,
    singleW: number,
    L: number,
    H: number,
    config: StructureConfig
  ) {
    this.containersGroup.clear();
    const { frameMat, panelMat, castingMat } = this.createSteelMaterials(config);

    const postSize = 0.125;
    const postGeo = new THREE.BoxGeometry(postSize, H, postSize);
    const castingGeo = new THREE.BoxGeometry(0.155, 0.14, 0.155);
    const railZGeo = new THREE.BoxGeometry(postSize, postSize, L);
    const railXGeo = new THREE.BoxGeometry(singleW, postSize, postSize);

    const bayHeaderH = 0.22;
    const headerGeo = new THREE.BoxGeometry(0.11, bayHeaderH, L - postSize * 2);
    const centerPillarGeo = new THREE.BoxGeometry(0.12, H - postSize * 2, 0.38);
    const jambGeo = new THREE.BoxGeometry(0.11, H - postSize * 2, 0.16);

    const endW = singleW - postSize * 2;
    const endH = H - postSize * 2;
    const endBackGeo = new THREE.BoxGeometry(endW, endH, 0.035);
    const ribCountEnd = 13;
    const ribPitchEnd = endH / ribCountEnd;
    const endRibGeo = new THREE.BoxGeometry(endW, ribPitchEnd * 0.52, 0.035);

    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xd6cab8,
      roughness: 0.72,
      metalness: 0.05,
    });
    const ceilMat = new THREE.MeshStandardMaterial({
      color: 0xf1e8dc,
      roughness: 0.8,
      metalness: 0.05,
    });
    const warmLightMat = new THREE.MeshBasicMaterial({ color: 0xfef3c7 });

    for (let idx = 0; idx < unitCount; idx++) {
      const cx = (idx - (unitCount - 1) / 2) * singleW; // -2.438, 0, +2.438
      const unitGroup = new THREE.Group();
      unitGroup.name = `BaseContainer_${idx + 1}`;
      unitGroup.position.set(cx, 0, 0);

      // All 4 Corner Posts + 8 ISO Castings preserved on each container
      [
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
      ].forEach(([sx, sz]) => {
        const post = new THREE.Mesh(postGeo, frameMat);
        post.position.set(sx * (singleW / 2 - postSize / 2), H / 2, sz * (L / 2 - postSize / 2));
        post.castShadow = true;
        post.receiveShadow = true;
        unitGroup.add(post);

        const topCast = new THREE.Mesh(castingGeo, castingMat);
        topCast.position.set(sx * (singleW / 2 - 0.078), H - 0.07, sz * (L / 2 - 0.078));
        unitGroup.add(topCast);

        const botCast = new THREE.Mesh(castingGeo, castingMat);
        botCast.position.set(sx * (singleW / 2 - 0.078), 0.07, sz * (L / 2 - 0.078));
        unitGroup.add(botCast);
      });

      // Bottom & Top Longitudinal Rails (along Z)
      [-1, 1].forEach((sx) => {
        const botR = new THREE.Mesh(railZGeo, frameMat);
        botR.position.set(sx * (singleW / 2 - postSize / 2), postSize / 2, 0);
        botR.castShadow = true;
        unitGroup.add(botR);

        const topR = new THREE.Mesh(railZGeo, frameMat);
        topR.position.set(sx * (singleW / 2 - postSize / 2), H - postSize / 2, 0);
        topR.castShadow = true;
        unitGroup.add(topR);
      });

      // Bottom & Top Transverse Rails (along X)
      [-1, 1].forEach((sz) => {
        const botR = new THREE.Mesh(railXGeo, frameMat);
        botR.position.set(0, postSize / 2, sz * (L / 2 - postSize / 2));
        unitGroup.add(botR);

        const topR = new THREE.Mesh(railXGeo, frameMat);
        topR.position.set(0, H - postSize / 2, sz * (L / 2 - postSize / 2));
        unitGroup.add(topR);
      });

      // Outer Long Sides (West side of idx=0, East side of idx=2): Twin 2.5 x 2.1m Open Bays
      const outerSideSigns: number[] = [];
      if (idx === 0) outerSideSigns.push(-1);
      if (idx === unitCount - 1) outerSideSigns.push(1);

      outerSideSigns.forEach((sx) => {
        const sideX = sx * (singleW / 2 - postSize / 2);

        const header = new THREE.Mesh(headerGeo, frameMat);
        header.position.set(sideX, H - postSize - bayHeaderH / 2, 0);
        header.castShadow = true;
        unitGroup.add(header);

        const centerPillar = new THREE.Mesh(centerPillarGeo, frameMat);
        centerPillar.position.set(sideX, H / 2, 0);
        centerPillar.castShadow = true;
        centerPillar.receiveShadow = true;
        unitGroup.add(centerPillar);

        [-1, 1].forEach((sz) => {
          const jamb = new THREE.Mesh(jambGeo, frameMat);
          jamb.position.set(sideX, H / 2, sz * (L / 2 - postSize - 0.08));
          jamb.castShadow = true;
          unitGroup.add(jamb);
        });
      });

      // Short-End Walls (2.438m per unit): Corrugated Steel ("Lamiera Grecata")
      [-1, 1].forEach((sz) => {
        const endZ = sz * (L / 2 - 0.04);
        const backPlate = new THREE.Mesh(endBackGeo, frameMat);
        backPlate.position.set(0, H / 2, endZ);
        backPlate.castShadow = true;
        backPlate.receiveShadow = true;
        unitGroup.add(backPlate);

        for (let r = 0; r < ribCountEnd; r++) {
          const ry = postSize + (r + 0.5) * ribPitchEnd;
          const rib = new THREE.Mesh(endRibGeo, panelMat);
          rib.position.set(0, ry, endZ + sz * 0.018);
          rib.castShadow = true;
          rib.receiveShadow = true;
          unitGroup.add(rib);
        }
      });

      // Individual Corrugated Steel Roof per Base Container
      const baseRoof = this.createCorrugatedRoof(singleW, L, H, panelMat, frameMat);
      unitGroup.add(baseRoof);

      // Warm Interior Floor & Ceiling
      const floor = new THREE.Mesh(new THREE.BoxGeometry(singleW - 0.02, 0.12, L - 0.16), floorMat);
      floor.position.set(0, 0.06, 0);
      floor.receiveShadow = true;
      unitGroup.add(floor);

      const ceiling = new THREE.Mesh(new THREE.BoxGeometry(singleW - 0.14, 0.03, L - 0.2), ceilMat);
      ceiling.position.set(0, H - 0.11, 0);
      unitGroup.add(ceiling);

      // Warm recessed interior fixtures
      [-L * 0.23, L * 0.23].forEach((lz) => {
        const fixture = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.02, 0.85), warmLightMat);
        fixture.position.set(0, H - 0.13, lz);
        unitGroup.add(fixture);
      });

      const bayLight = new THREE.PointLight(0xfde68a, config.environmentMode === 'night' ? 1.8 : 0.9, 6.0);
      bayLight.position.set(0, H - 0.35, 0);
      unitGroup.add(bayLight);

      this.containersGroup.add(unitGroup);
    }
  }

  /**
   * 2. Three Unmodified Covered Terrace Modules side-by-side (Y = H to H + terraceH)
   * Preserves ALL 4 structural corner columns of each 2.438m terrace module + Red LED Roof Perimeter
   */
  private buildRoofTerraces(
    unitCount: number,
    singleW: number,
    W: number,
    L: number,
    H: number,
    terraceH: number,
    config: StructureConfig,
    maxAnisotropy: number
  ) {
    this.roofTerraceGroup.clear();
    this.roofTerraceGroup.add(this.furnitureGroup);
    this.roofLedMeshes = [];
    this.roofLedLights = [];

    const { frameMat, panelMat, castingMat } = this.createSteelMaterials(config);
    const roofTopY = H + terraceH; // 5.182 m
    const deckThickness = 0.10;
    const postSize = 0.125;

    let deckMat: THREE.Material;
    if (config.deckMaterial === 'teak_wood') {
      deckMat = new THREE.MeshStandardMaterial({
        map: createWoodDeckTexture(maxAnisotropy),
        roughness: 0.48,
        metalness: 0.05,
      });
    } else if (config.deckMaterial === 'polished_concrete') {
      deckMat = new THREE.MeshStandardMaterial({
        map: createConcreteTexture(maxAnisotropy),
        roughness: 0.38,
        metalness: 0.15,
      });
    } else if (config.deckMaterial === 'smoked_glass') {
      deckMat = new THREE.MeshPhysicalMaterial({
        color: 0x1e293b,
        transmission: 0.78,
        roughness: 0.15,
        thickness: 0.08,
        transparent: true,
        opacity: 0.85,
      });
    } else {
      deckMat = new THREE.MeshStandardMaterial({
        color: 0x1a222d,
        roughness: 0.36,
        metalness: 0.52,
      });
    }

    const postGeo = new THREE.BoxGeometry(postSize, terraceH, postSize);
    const castingGeo = new THREE.BoxGeometry(0.155, 0.14, 0.155);
    const railZGeo = new THREE.BoxGeometry(postSize, postSize, L);
    const railXGeo = new THREE.BoxGeometry(singleW, postSize, postSize);
    const deckGeo = new THREE.BoxGeometry(singleW - 0.04, deckThickness, L - 0.06);

    for (let idx = 0; idx < unitCount; idx++) {
      const cx = (idx - (unitCount - 1) / 2) * singleW; // -2.438, 0, +2.438
      const tGroup = new THREE.Group();
      tGroup.name = `CoveredTerrace_${idx + 1}`;
      tGroup.position.set(cx, 0, 0);

      // Deck Floor per module
      const deck = new THREE.Mesh(deckGeo, deckMat);
      deck.position.set(0, H + deckThickness / 2, 0);
      deck.castShadow = true;
      deck.receiveShadow = true;
      tGroup.add(deck);

      // All 4 Structural Corner Columns + 8 ISO Castings preserved ("rimangono le colonne")
      [
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
      ].forEach(([sx, sz]) => {
        const post = new THREE.Mesh(postGeo, frameMat);
        post.position.set(sx * (singleW / 2 - postSize / 2), H + terraceH / 2, sz * (L / 2 - postSize / 2));
        post.castShadow = true;
        post.receiveShadow = true;
        tGroup.add(post);

        const topCast = new THREE.Mesh(castingGeo, castingMat);
        topCast.position.set(sx * (singleW / 2 - 0.078), roofTopY - 0.07, sz * (L / 2 - 0.078));
        tGroup.add(topCast);

        const botCast = new THREE.Mesh(castingGeo, castingMat);
        botCast.position.set(sx * (singleW / 2 - 0.078), H + 0.07, sz * (L / 2 - 0.078));
        tGroup.add(botCast);
      });

      // Bottom & Top Longitudinal Frame Rails (along Z)
      [-1, 1].forEach((sx) => {
        const botR = new THREE.Mesh(railZGeo, frameMat);
        botR.position.set(sx * (singleW / 2 - postSize / 2), H + postSize / 2, 0);
        tGroup.add(botR);

        const topR = new THREE.Mesh(railZGeo, frameMat);
        topR.position.set(sx * (singleW / 2 - postSize / 2), roofTopY - postSize / 2, 0);
        topR.castShadow = true;
        tGroup.add(topR);
      });

      // Bottom & Top Transverse Frame Rails (along X)
      [-1, 1].forEach((sz) => {
        const botR = new THREE.Mesh(railXGeo, frameMat);
        botR.position.set(0, H + postSize / 2, sz * (L / 2 - postSize / 2));
        tGroup.add(botR);

        const topR = new THREE.Mesh(railXGeo, frameMat);
        topR.position.set(0, roofTopY - postSize / 2, sz * (L / 2 - postSize / 2));
        topR.castShadow = true;
        tGroup.add(topR);
      });

      // Individual Corrugated Steel Roof per Terrace Unit
      const terraceRoof = this.createCorrugatedRoof(singleW, L, roofTopY, panelMat, frameMat);
      tGroup.add(terraceRoof);

      this.roofTerraceGroup.add(tGroup);
    }

    // RED LED PERIMETER LINES AROUND THE OUTER TERRACE ROOF PERIMETER (7.314 x 6.058 m)
    const isNight = config.environmentMode === 'night';
    const ledHex = config.terraceRoofLedColor || '#ff1428';
    const redColor = new THREE.Color(ledHex);
    const ledMat = new THREE.MeshBasicMaterial({
      color: redColor,
      toneMapped: false,
    });

    const ledY = roofTopY - 0.045;
    const stripThick = 0.056;
    const overhang = 0.028;

    const stripN = new THREE.Mesh(new THREE.BoxGeometry(W + overhang * 2, stripThick, stripThick), ledMat);
    stripN.position.set(0, ledY, L / 2 + overhang / 2);

    const stripS = new THREE.Mesh(new THREE.BoxGeometry(W + overhang * 2, stripThick, stripThick), ledMat);
    stripS.position.set(0, ledY, -(L / 2 + overhang / 2));

    const stripE = new THREE.Mesh(new THREE.BoxGeometry(stripThick, stripThick, L + overhang * 2), ledMat);
    stripE.position.set(W / 2 + overhang / 2, ledY, 0);

    const stripW = new THREE.Mesh(new THREE.BoxGeometry(stripThick, stripThick, L + overhang * 2), ledMat);
    stripW.position.set(-(W / 2 + overhang / 2), ledY, 0);

    [stripN, stripS, stripE, stripW].forEach((s) => {
      s.visible = config.terraceRoofLedEnabled;
      this.roofTerraceGroup.add(s);
      this.roofLedMeshes.push(s);
    });

    // Red atmospheric glow lights around terrace roof perimeter
    const ledLightPositions: [number, number, number][] = [
      [0, ledY - 0.1, L / 2 + 0.25],
      [0, ledY - 0.1, -(L / 2 + 0.25)],
      [W / 2 + 0.25, ledY - 0.1, 0],
      [-(W / 2 + 0.25), ledY - 0.1, 0],
    ];
    ledLightPositions.forEach(([lx, ly, lz]) => {
      const pLight = new THREE.PointLight(
        redColor,
        config.terraceRoofLedEnabled ? (isNight ? 3.5 : 0.8) : 0,
        9.5
      );
      pLight.position.set(lx, ly, lz);
      this.roofTerraceGroup.add(pLight);
      this.roofLedLights.push(pLight);
    });

    // Optional Deck-level underglow strip
    const underGeo = new THREE.BoxGeometry(W - 0.18, 0.018, L - 0.18);
    const underMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(config.underglowLedColor),
    });
    this.underglowMesh = new THREE.Mesh(underGeo, underMat);
    this.underglowMesh.position.set(0, H - 0.01, 0);
    this.underglowMesh.visible = config.underglowEnabled;
    this.roofTerraceGroup.add(this.underglowMesh);

    this.underglowLight = new THREE.PointLight(
      new THREE.Color(config.underglowLedColor),
      config.underglowEnabled ? (isNight ? 2.0 : 0.5) : 0,
      9
    );
    this.underglowLight.position.set(0, H - 0.35, 0);
    this.roofTerraceGroup.add(this.underglowLight);
  }

  /**
   * 3. Iron Railings on the 3 Side-by-Side Terraces
   * Each of the 3 terraces keeps its own 2.08m short-end railings between its corner columns;
   * outer long sides feature the 4.57m railing + 1.20m stair gate opening.
   */
  private buildIronRailings(
    unitCount: number,
    singleW: number,
    W: number,
    L: number,
    H: number,
    config: StructureConfig
  ) {
    if (this.ironRailingGroup) {
      this.roofTerraceGroup.remove(this.ironRailingGroup);
      this.ironRailingGroup.clear();
    }
    this.ironRailingGroup = new THREE.Group();
    this.ironRailingGroup.name = 'IronRailingGroup';

    const railingH = 1.10;
    const Y = H + 0.10;
    const postInset = 0.065;

    const ironMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      metalness: 0.85,
      roughness: 0.34,
    });

    const buildRailingSegment = (x1: number, z1: number, x2: number, z2: number) => {
      const segLength = Math.hypot(x2 - x1, z2 - z1);
      if (segLength < 0.2) return;
      const angle = Math.atan2(z2 - z1, x2 - x1);
      const midX = (x1 + x2) / 2;
      const midZ = (z1 + z2) / 2;

      const side = new THREE.Group();
      side.position.set(midX, Y, midZ);
      side.rotation.y = -angle;

      if (config.railingType === 'frameless_glass') {
        const glassMat = new THREE.MeshPhysicalMaterial({
          color: 0xbae6fd,
          transmission: 0.85,
          roughness: 0.08,
          transparent: true,
          opacity: 0.5,
        });
        const glass = new THREE.Mesh(new THREE.BoxGeometry(segLength, railingH - 0.05, 0.02), glassMat);
        glass.position.set(0, (railingH - 0.05) / 2 + 0.04, 0);
        side.add(glass);

        const cap = new THREE.Mesh(new THREE.BoxGeometry(segLength, 0.035, 0.045), ironMat);
        cap.position.set(0, railingH, 0);
        side.add(cap);
      } else if (config.railingType === 'tension_cables') {
        const postCount = Math.max(2, Math.floor(segLength / 1.15));
        const postGeo = new THREE.BoxGeometry(0.04, railingH, 0.04);
        for (let p = 0; p <= postCount; p++) {
          const px = -segLength / 2 + (p / postCount) * segLength;
          const post = new THREE.Mesh(postGeo, ironMat);
          post.position.set(px, railingH / 2, 0);
          side.add(post);
        }
        const topRail = new THREE.Mesh(new THREE.BoxGeometry(segLength, 0.04, 0.05), ironMat);
        topRail.position.set(0, railingH, 0);
        side.add(topRail);

        const cableMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.95, roughness: 0.15 });
        for (let c = 1; c <= 6; c++) {
          const cable = new THREE.Mesh(new THREE.BoxGeometry(segLength, 0.01, 0.01), cableMat);
          cable.position.set(0, (c / 7) * (railingH - 0.1) + 0.06, 0);
          side.add(cable);
        }
      } else {
        const topRail = new THREE.Mesh(new THREE.BoxGeometry(segLength, 0.04, 0.055), ironMat);
        topRail.position.set(0, railingH, 0);
        topRail.castShadow = true;
        side.add(topRail);

        const botRail = new THREE.Mesh(new THREE.BoxGeometry(segLength, 0.03, 0.03), ironMat);
        botRail.position.set(0, 0.08, 0);
        side.add(botRail);

        const postCount = Math.max(2, Math.floor(segLength / 1.15));
        const postGeo = new THREE.BoxGeometry(0.042, railingH, 0.042);
        for (let p = 0; p <= postCount; p++) {
          const px = -segLength / 2 + (p / postCount) * segLength;
          const post = new THREE.Mesh(postGeo, ironMat);
          post.position.set(px, railingH / 2, 0);
          post.castShadow = true;
          side.add(post);
        }

        const picketCount = Math.max(2, Math.floor(segLength / 0.115));
        const picketGeo = new THREE.BoxGeometry(0.016, railingH - 0.10, 0.016);
        for (let i = 0; i <= picketCount; i++) {
          const px = -segLength / 2 + (i / picketCount) * segLength;
          const picket = new THREE.Mesh(picketGeo, ironMat);
          picket.position.set(px, 0.08 + (railingH - 0.10) / 2, 0);
          side.add(picket);
        }
      }

      this.ironRailingGroup.add(side);
    };

    const halfL = L / 2 - postInset; // ~2.964 m
    const clearEndHalf = singleW / 2 - 0.13; // ~1.089m per unit (2.18m clear between unit corner posts)

    // Short ends (North +Z & South -Z): 2.08m railing inside EACH of the 3 terrace units
    for (let idx = 0; idx < unitCount; idx++) {
      const cx = (idx - (unitCount - 1) / 2) * singleW;
      buildRailingSegment(cx - clearEndHalf, halfL, cx + clearEndHalf, halfL);
      buildRailingSegment(cx + clearEndHalf, -halfL, cx - clearEndHalf, -halfL);
    }

    // Outer Long sides (East +W/2 and West -W/2): 4.57m railing + 1.20m gate opening for side stairs
    const halfOuterW = W / 2 - postInset;
    const gateZEnd = -L / 2 + 0.13 + 1.20;
    buildRailingSegment(halfOuterW, gateZEnd, halfOuterW, L / 2 - 0.13);
    buildRailingSegment(-halfOuterW, L / 2 - 0.13, -halfOuterW, gateZEnd);

    this.roofTerraceGroup.add(this.ironRailingGroup);
  }

  /**
   * 4. Twin Monolithic Side Staircases ("Scale ai Lati")
   * 1.2x1.2m landing tower (H 2.591m) + 4.5m run (5.7m total), 15 alzate - 15 pedate
   */
  private buildSideStairs(W: number, L: number, H: number, maxAnisotropy: number) {
    this.stairsGroup.clear();

    const stairW = 1.20;
    const landingLen = 1.20;
    const totalRun = 4.50;
    const stepCount = 15;
    const treadDepth = totalRun / stepCount;
    const riserHeight = H / stepCount;

    const gateZStart = -L / 2 + 0.13;
    const landingZEnd = gateZStart + landingLen;
    const stairBottomZ = landingZEnd + totalRun;

    const checkeredTex = createCheckeredSteelTexture(maxAnisotropy);
    const treadMat = new THREE.MeshStandardMaterial({
      map: checkeredTex,
      color: 0xdbe4ee,
      metalness: 0.72,
      roughness: 0.32,
    });

    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x1a2029,
      metalness: 0.88,
      roughness: 0.3,
    });

    const ironMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      metalness: 0.86,
      roughness: 0.32,
    });

    const extrudeW = stairW - 0.08;
    const stairShape = new THREE.Shape();
    stairShape.moveTo(0, 0);

    for (let s = 0; s < stepCount; s++) {
      const su = s * treadDepth;
      const nextU = (s + 1) * treadDepth;
      const sv = (s + 1) * riserHeight;
      stairShape.lineTo(su, sv);
      stairShape.lineTo(nextU, sv);
    }

    stairShape.lineTo(totalRun + landingLen, H);
    stairShape.lineTo(totalRun + landingLen, H - 0.12);
    stairShape.lineTo(totalRun, H - 0.14);
    stairShape.lineTo(0.28, 0.02);
    stairShape.lineTo(0, 0);

    const stairGeo = new THREE.ExtrudeGeometry(stairShape, {
      steps: 1,
      depth: extrudeW,
      bevelEnabled: true,
      bevelThickness: 0.006,
      bevelSize: 0.006,
      bevelSegments: 2,
    });

    const buildRailingLine = (
      parent: THREE.Group,
      x1: number,
      y1: number,
      z1: number,
      x2: number,
      y2: number,
      z2: number,
      railingH = 1.10
    ) => {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const dz = z2 - z1;
      const horizLen = Math.hypot(dx, dz);
      const slopeLen = Math.hypot(horizLen, dy);
      if (slopeLen < 0.05) return;

      const railGeo = new THREE.BoxGeometry(0.036, 0.036, slopeLen);
      const rail = new THREE.Mesh(railGeo, ironMat);
      const mid = new THREE.Vector3((x1 + x2) / 2, (y1 + y2) / 2 + railingH, (z1 + z2) / 2);
      const dir = new THREE.Vector3(dx, dy, dz).normalize();
      rail.position.copy(mid);
      rail.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
      rail.castShadow = true;
      parent.add(rail);

      const botRail = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.028, slopeLen), ironMat);
      botRail.position.set((x1 + x2) / 2, (y1 + y2) / 2 + 0.08, (z1 + z2) / 2);
      botRail.quaternion.copy(rail.quaternion);
      parent.add(botRail);

      const count = Math.max(2, Math.floor(horizLen / 0.115));
      const picketGeo = new THREE.BoxGeometry(0.015, railingH - 0.06, 0.015);
      for (let i = 0; i <= count; i++) {
        const t = i / count;
        const px = x1 + dx * t;
        const py = y1 + dy * t + (railingH - 0.06) / 2 + 0.05;
        const pz = z1 + dz * t;
        const picket = new THREE.Mesh(picketGeo, ironMat);
        picket.position.set(px, py, pz);
        picket.castShadow = true;
        parent.add(picket);
      }
    };

    const buildOneStaircase = (sideSign: number) => {
      const flight = new THREE.Group();
      flight.name = `SideStair_${sideSign > 0 ? 'East' : 'West'}`;

      const wallX = sideSign * (W / 2); // ±3.657 m
      const outerX = sideSign * (W / 2 + stairW); // ±4.857 m
      const innerX = wallX;
      const midX = (innerX + outerX) / 2;

      const monolithic = new THREE.Mesh(stairGeo, treadMat);
      monolithic.rotation.y = Math.PI / 2;
      monolithic.position.set(
        sideSign > 0 ? wallX + 0.04 : outerX + 0.04,
        0,
        stairBottomZ
      );
      monolithic.castShadow = true;
      monolithic.receiveShadow = true;
      flight.add(monolithic);

      const runAngle = Math.atan2(H, totalRun);
      const stringerLen = Math.hypot(totalRun, H);
      const stringerGeo = new THREE.BoxGeometry(0.045, 0.24, stringerLen + 0.15);

      [outerX - sideSign * 0.022, innerX + sideSign * 0.022].forEach((sx) => {
        const stringer = new THREE.Mesh(stringerGeo, frameMat);
        stringer.rotation.x = runAngle;
        stringer.position.set(sx, H / 2 - 0.05, (stairBottomZ + landingZEnd) / 2);
        stringer.castShadow = true;
        flight.add(stringer);
      });

      const towerPostGeo = new THREE.BoxGeometry(0.08, H, 0.08);
      const landingCorners: [number, number][] = [
        [outerX - sideSign * 0.04, gateZStart + 0.04],
        [outerX - sideSign * 0.04, landingZEnd - 0.04],
        [innerX + sideSign * 0.04, gateZStart + 0.04],
        [innerX + sideSign * 0.04, landingZEnd - 0.04],
      ];
      landingCorners.forEach(([px, pz]) => {
        const leg = new THREE.Mesh(towerPostGeo, frameMat);
        leg.position.set(px, H / 2, pz);
        leg.castShadow = true;
        leg.receiveShadow = true;
        flight.add(leg);
      });

      const tieXGeo = new THREE.BoxGeometry(stairW, 0.06, 0.06);
      const tieZGeo = new THREE.BoxGeometry(0.06, 0.06, landingLen);
      [gateZStart + 0.03, landingZEnd - 0.03].forEach((tz) => {
        const tieX = new THREE.Mesh(tieXGeo, frameMat);
        tieX.position.set(midX, 0.03, tz);
        flight.add(tieX);

        const topTieX = new THREE.Mesh(tieXGeo, frameMat);
        topTieX.position.set(midX, H - 0.06, tz);
        flight.add(topTieX);
      });
      [outerX - sideSign * 0.03, innerX + sideSign * 0.03].forEach((tx) => {
        const tieZ = new THREE.Mesh(tieZGeo, frameMat);
        tieZ.position.set(tx, 0.03, (gateZStart + landingZEnd) / 2);
        flight.add(tieZ);

        const topTieZ = new THREE.Mesh(tieZGeo, frameMat);
        topTieZ.position.set(tx, H - 0.06, (gateZStart + landingZEnd) / 2);
        flight.add(topTieZ);
      });

      [
        { y: 0.22, z: stairBottomZ - 0.4 },
        { y: 1.35, z: (stairBottomZ + landingZEnd) / 2 },
        { y: H - 0.12, z: landingZEnd - 0.2 },
        { y: H - 0.12, z: gateZStart + 0.2 },
      ].forEach((b) => {
        const gusset = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.24), frameMat);
        gusset.position.set(wallX, b.y, b.z);
        flight.add(gusset);
      });

      const outerRailX = outerX - sideSign * 0.03;
      const innerRailX = innerX + sideSign * 0.03;

      buildRailingLine(flight, outerRailX, 0, stairBottomZ, outerRailX, H, landingZEnd, 1.10);
      buildRailingLine(flight, outerRailX, H, landingZEnd, outerRailX, H, gateZStart + 0.03, 1.10);
      buildRailingLine(flight, outerRailX, H, gateZStart + 0.03, innerRailX, H, gateZStart + 0.03, 1.10);
      buildRailingLine(flight, innerRailX, 0, stairBottomZ, innerRailX, H, landingZEnd, 1.10);

      this.stairsGroup.add(flight);
    };

    buildOneStaircase(-1); // West side (-X)
    buildOneStaircase(1); // East side (+X)
  }

  /**
   * 5. Modular Terrace Staging placed cleanly inside the 3 bays (no clipping through columns)
   */
  private buildRooftopFurniture(
    unitCount: number,
    singleW: number,
    L: number,
    H: number,
    config: StructureConfig
  ) {
    this.furnitureGroup.clear();
    if (config.staging === 'empty_showroom') return;

    const Y = H + 0.10;
    const metalBarMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.94, roughness: 0.22 });
    const metalTopMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.96, roughness: 0.12 });
    const fabricMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.82 });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.5 });
    const plantMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.65 });

    // Central bay (cx = 0): brushed-steel bar counter fitting inside 2.08m clear span
    const barW = Math.min(1.55, singleW * 0.65);
    const bar = new THREE.Mesh(new THREE.BoxGeometry(barW, 1.02, 0.70), metalBarMat);
    bar.position.set(0, Y + 0.51, 0.15);
    bar.castShadow = true;
    this.furnitureGroup.add(bar);

    const counter = new THREE.Mesh(new THREE.BoxGeometry(barW + 0.08, 0.05, 0.78), metalTopMat);
    counter.position.set(0, Y + 1.045, 0.15);
    counter.castShadow = true;
    this.furnitureGroup.add(counter);

    if (config.staging === 'lounge_bar') {
      // North lounge seating inside central bay
      const bench = new THREE.Mesh(new THREE.BoxGeometry(barW, 0.42, 0.62), fabricMat);
      bench.position.set(0, Y + 0.21, L / 2 - 0.52);
      bench.castShadow = true;
      this.furnitureGroup.add(bench);

      const coffeeTbl = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.30, 0.48), woodMat);
      coffeeTbl.position.set(0, Y + 0.15, L / 2 - 1.22);
      coffeeTbl.castShadow = true;
      this.furnitureGroup.add(coffeeTbl);

      // Planters centered inside left & right terrace bays (away from columns & gates)
      const sideX = ((unitCount - 1) / 2) * singleW; // ±2.438 m
      [-sideX, sideX].forEach((px) => {
        const pot = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.48, 0.36), metalBarMat);
        pot.position.set(px, Y + 0.24, L / 2 - 0.42);
        this.furnitureGroup.add(pot);

        const bush = new THREE.Mesh(new THREE.SphereGeometry(0.26, 10, 10), plantMat);
        bush.position.set(px, Y + 0.62, L / 2 - 0.42);
        this.furnitureGroup.add(bush);
      });
    } else if (config.staging === 'cocktail_minimal') {
      const tblGeo = new THREE.CylinderGeometry(0.28, 0.28, 1.05, 16);
      const sideX = ((unitCount - 1) / 2) * singleW;
      [
        [-sideX, 1.35],
        [sideX, 1.35],
        [0, -1.25],
      ].forEach(([px, pz]) => {
        const tbl = new THREE.Mesh(tblGeo, metalTopMat);
        tbl.position.set(px, Y + 0.525, pz);
        tbl.castShadow = true;
        this.furnitureGroup.add(tbl);
      });
    }
  }

  /**
   * 6. Four Structural Connecting Tubes
   * Linking the 4 outer corners of the 3-terrace roof to the upper shoulder of each Can Tower
   */
  private buildConnectingTubes(W: number, L: number, terraceRoofTopY: number, config: StructureConfig) {
    this.tubesGroup.clear();

    const halfPavilionW = config.totalWidth / 2 - config.towerDiameter / 2; // ±5.2 m
    const canTopConnectY = config.totalHeight - 0.42; // ~4.58 m
    const terraceCornerY = terraceRoofTopY - 0.08; // ~5.10 m

    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.92,
      roughness: 0.22,
    });

    const collarMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.94,
      roughness: 0.26,
    });

    const up = new THREE.Vector3(0, 1, 0);

    [
      [-1, 1], // NW
      [1, 1],  // NE
      [1, -1], // SE
      [-1, -1], // SW
    ].forEach(([sx, sz]) => {
      const start = new THREE.Vector3(
        sx * (W / 2 - 0.08),
        terraceCornerY,
        sz * (L / 2 - 0.08)
      );
      const end = new THREE.Vector3(
        sx * halfPavilionW,
        canTopConnectY,
        sz * halfPavilionW
      );

      const dir = new THREE.Vector3().subVectors(end, start);
      const len = dir.length();
      const unitDir = dir.clone().normalize();
      const quat = new THREE.Quaternion().setFromUnitVectors(up, unitDir);

      const pipeGeo = new THREE.CylinderGeometry(0.068, 0.068, len, 20);
      const pipe = new THREE.Mesh(pipeGeo, tubeMat);
      pipe.position.copy(start).addScaledVector(dir, 0.5);
      pipe.quaternion.copy(quat);
      pipe.castShadow = true;
      pipe.receiveShadow = true;
      this.tubesGroup.add(pipe);

      const startCollarGeo = new THREE.CylinderGeometry(0.105, 0.105, 0.16, 20);
      const startCollar = new THREE.Mesh(startCollarGeo, collarMat);
      startCollar.position.copy(start).addScaledVector(unitDir, 0.08);
      startCollar.quaternion.copy(quat);
      this.tubesGroup.add(startCollar);

      const canR = config.towerDiameter / 2;
      const horizDistToCenter = Math.hypot(end.x - start.x, end.z - start.z);
      const horizFrac = Math.max(0.1, 1 - canR / Math.max(0.1, horizDistToCenter));
      const shellHitPoint = new THREE.Vector3().lerpVectors(start, end, horizFrac);

      const endCollarGeo = new THREE.CylinderGeometry(0.115, 0.115, 0.18, 20);
      const endCollar = new THREE.Mesh(endCollarGeo, collarMat);
      endCollar.position.copy(shellHitPoint);
      endCollar.quaternion.copy(quat);
      this.tubesGroup.add(endCollar);
    });
  }

  public update(config: StructureConfig, maxAnisotropy: number) {
    this.config = config;
    const W = config.containerWidth;
    const L = config.containerLength;
    const H = config.containerHeight;
    const terraceH = config.terraceHeight || H;
    const unitCount = 3;
    const singleW = W / unitCount;

    this.buildBaseContainers(unitCount, singleW, L, H, config);
    this.buildRoofTerraces(unitCount, singleW, W, L, H, terraceH, config, maxAnisotropy);
    this.buildIronRailings(unitCount, singleW, W, L, H, config);
    this.buildSideStairs(W, L, H, maxAnisotropy);
    this.buildRooftopFurniture(unitCount, singleW, L, H, config);
    this.buildConnectingTubes(W, L, H + terraceH, config);
  }

  public setExplodedOffset(factor: number) {
    this.roofTerraceGroup.position.y = factor * 1.6;
    this.stairsGroup.position.y = factor * 0.7;
    this.tubesGroup.position.y = factor * 2.2;
  }

  public dispose() {
    this.group.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose());
        } else {
          mesh.material?.dispose();
        }
      }
    });
  }
}
