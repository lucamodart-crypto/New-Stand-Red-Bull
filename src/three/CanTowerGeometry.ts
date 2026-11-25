import * as THREE from 'three';
import { CanFinish, StructureConfig } from '../types/config';
import { createCanLabelTexture, createCanLidTexture } from './proceduralTextures';

/**
 * Procedural Can Tower Generator
 * Assembles a realistic 3-12 part architectural can tower
 */

export class CanTower {
  public group: THREE.Group;
  private labelMesh!: THREE.Mesh;
  private lidMesh!: THREE.Mesh;
  private pullTabGroup!: THREE.Group;
  private spiralStairsGroup!: THREE.Group;
  private bodyMaterial!: THREE.MeshPhysicalMaterial;
  private rimMaterial!: THREE.MeshStandardMaterial;
  private beaconLight!: THREE.PointLight;
  private haloMat!: THREE.MeshBasicMaterial;
  private baseLedMat!: THREE.MeshBasicMaterial;
  private baseSpotLight!: THREE.SpotLight;

  constructor(
    public towerIndex: number, // 0: NW, 1: NE, 2: SE, 3: SW
    public config: StructureConfig,
    maxAnisotropy = 8
  ) {
    this.group = new THREE.Group();
    this.group.name = `CanTower_${towerIndex}`;
    this.build(config, maxAnisotropy);
  }

  private build(config: StructureConfig, maxAnisotropy: number) {
    const H = config.totalHeight;
    const D = config.towerDiameter;
    const R = D / 2;

    // 1. Materials setup
    this.createMaterials(config, maxAnisotropy);

    // 2. Foundation Plinth / Anchor Ring (flush on ground Y = 0)
    const plinthHeight = 0.15;
    const plinthGeo = new THREE.CylinderGeometry(R * 1.15, R * 1.22, plinthHeight, 24);
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.4,
    });
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.y = plinthHeight / 2;
    plinth.castShadow = true;
    plinth.receiveShadow = true;
    this.group.add(plinth);

    // Foundation anchor bolts (accent detail)
    const boltGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.06, 8);
    const boltMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    for (let b = 0; b < 8; b++) {
      const angle = (b / 8) * Math.PI * 2;
      const bolt = new THREE.Mesh(boltGeo, boltMat);
      bolt.position.set(Math.cos(angle) * (R * 1.12), plinthHeight + 0.02, Math.sin(angle) * (R * 1.12));
      this.group.add(bolt);
    }

    // Architectural Base LED Halo Ring
    const baseHaloGeo = new THREE.TorusGeometry(R * 1.14, 0.018, 8, 36);
    this.baseLedMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(config.towerSpotlightColor || '#38bdf8') });
    const baseHalo = new THREE.Mesh(baseHaloGeo, this.baseLedMat);
    baseHalo.rotation.x = Math.PI / 2;
    baseHalo.position.y = plinthHeight + 0.02;
    this.group.add(baseHalo);

    // Dedicated upward wash spotlight from base of tower
    const isNight = config.environmentMode === 'night';
    const initBaseIntensity = config.towerSpotlightEnabled
      ? (isNight ? (config.towerSpotlightIntensity || 3.5) * 1.8 : (config.towerSpotlightIntensity || 3.5) * 0.4)
      : 0;
    this.baseSpotLight = new THREE.SpotLight(
      new THREE.Color(config.towerSpotlightColor || '#38bdf8'),
      initBaseIntensity,
      H * 1.6,
      Math.PI / 3.8,
      0.65,
      1.1
    );
    this.baseSpotLight.position.set(0, plinthHeight + 0.15, 0);
    this.baseSpotLight.target.position.set(0, H * 0.55, 0);
    this.group.add(this.baseSpotLight.target);
    this.group.add(this.baseSpotLight);

    // 3. Bottom Can Inset (Tapered bottom dome of a beverage can)
    const bottomTaperHeight = 0.35;
    const bottomGeo = new THREE.CylinderGeometry(R, R * 0.88, bottomTaperHeight, 32);
    const bottomMesh = new THREE.Mesh(bottomGeo, this.rimMaterial);
    bottomMesh.position.y = plinthHeight + bottomTaperHeight / 2;
    bottomMesh.castShadow = true;
    bottomMesh.receiveShadow = true;
    this.group.add(bottomMesh);

    // Bottom chime ring
    const bottomRimGeo = new THREE.TorusGeometry(R * 0.96, 0.03, 12, 32);
    const bottomRim = new THREE.Mesh(bottomRimGeo, this.rimMaterial);
    bottomRim.rotation.x = Math.PI / 2;
    bottomRim.position.y = plinthHeight + 0.08;
    this.group.add(bottomRim);

    // 4. Main Can Cylinder Body
    const shoulderHeight = 0.45;
    const rimHeight = 0.08;
    const bodyHeight = H - plinthHeight - bottomTaperHeight - shoulderHeight - rimHeight;
    const bodyGeo = new THREE.CylinderGeometry(R, R, bodyHeight, 48, 1, false);

    // Orient UVs so the label faces outward
    const rotOffset = (this.towerIndex * Math.PI) / 2 + Math.PI / 4;
    bodyGeo.rotateY(rotOffset);

    this.labelMesh = new THREE.Mesh(bodyGeo, this.bodyMaterial);
    this.labelMesh.position.y = plinthHeight + bottomTaperHeight + bodyHeight / 2;
    this.labelMesh.castShadow = true;
    this.labelMesh.receiveShadow = true;
    this.group.add(this.labelMesh);

    // 5. Embossed Can Bead Rings (Structural reinforcement ribs)
    const beadGeo = new THREE.TorusGeometry(R * 1.008, 0.015, 8, 36);
    const beadY1 = plinthHeight + bottomTaperHeight + bodyHeight * 0.25;
    const beadY2 = plinthHeight + bottomTaperHeight + bodyHeight * 0.85;

    const bead1 = new THREE.Mesh(beadGeo, this.rimMaterial);
    bead1.rotation.x = Math.PI / 2;
    bead1.position.y = beadY1;
    this.group.add(bead1);

    const bead2 = new THREE.Mesh(beadGeo, this.rimMaterial);
    bead2.rotation.x = Math.PI / 2;
    bead2.position.y = beadY2;
    this.group.add(bead2);

    // 6. Upper Can Neck / Shoulder Taper (Beverage can characteristic neck-in)
    const topNeckRadius = R * 0.84;
    const shoulderGeo = new THREE.CylinderGeometry(topNeckRadius, R, shoulderHeight, 36);
    const shoulderMesh = new THREE.Mesh(shoulderGeo, this.rimMaterial);
    shoulderMesh.position.y = plinthHeight + bottomTaperHeight + bodyHeight + shoulderHeight / 2;
    shoulderMesh.castShadow = true;
    shoulderMesh.receiveShadow = true;
    this.group.add(shoulderMesh);

    // 7. Top Can Rim / Double Seam (High-polish aluminum lip)
    const topRimGeo = new THREE.TorusGeometry(topNeckRadius * 1.02, 0.035, 12, 36);
    const topRimMesh = new THREE.Mesh(topRimGeo, this.rimMaterial);
    topRimMesh.rotation.x = Math.PI / 2;
    topRimMesh.position.y = H - rimHeight / 2;
    topRimMesh.castShadow = true;
    this.group.add(topRimMesh);

    // 8. Recessed Can Top Lid
    const lidGeo = new THREE.CircleGeometry(topNeckRadius * 0.98, 32);
    const lidMat = new THREE.MeshStandardMaterial({
      map: createCanLidTexture(maxAnisotropy),
      metalness: 0.9,
      roughness: 0.22,
    });
    this.lidMesh = new THREE.Mesh(lidGeo, lidMat);
    this.lidMesh.rotation.x = -Math.PI / 2;
    this.lidMesh.position.y = H - 0.04;
    this.lidMesh.receiveShadow = true;
    this.group.add(this.lidMesh);

    // 9. Procedural 3D Pull-Tab (Classic stay-on tab ring!)
    this.pullTabGroup = new THREE.Group();
    this.buildPullTab(topNeckRadius);
    this.pullTabGroup.position.y = H - 0.03;
    this.pullTabGroup.rotation.y = rotOffset;
    this.pullTabGroup.visible = config.showPullTab;
    this.group.add(this.pullTabGroup);

    // 10. Architectural Spiral Staircase inside scenic window
    this.spiralStairsGroup = new THREE.Group();
    this.buildSpiralStairs(R, H, config.terraceHeight, rotOffset);
    this.spiralStairsGroup.visible = config.showSpiralStairs;
    this.group.add(this.spiralStairsGroup);

    // 11. Sleek Upper Structural Collar near top shoulder of Can Tower (H - 0.42) where connecting tubes attach
    const collarGeo = new THREE.CylinderGeometry(R * 0.99, R * 1.02, 0.10, 36);
    const collarMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.28,
    });
    const collar = new THREE.Mesh(collarGeo, collarMat);
    collar.position.y = H - 0.42;
    this.group.add(collar);

    // 12. Rooftop Beacon / Architectural Halo
    const haloGeo = new THREE.TorusGeometry(topNeckRadius * 0.9, 0.012, 8, 24);
    this.haloMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(config.towerSpotlightColor || '#38bdf8') });
    const halo = new THREE.Mesh(haloGeo, this.haloMat);
    halo.rotation.x = Math.PI / 2;
    halo.position.y = H + 0.01;
    this.group.add(halo);

    const initialIntensity = config.towerSpotlightEnabled ? (config.towerSpotlightIntensity / 3.5) : 0;
    this.beaconLight = new THREE.PointLight(new THREE.Color(config.towerSpotlightColor || '#38bdf8'), initialIntensity, 8);
    this.beaconLight.position.set(0, H + 0.2, 0);
    this.group.add(this.beaconLight);
  }

  private createMaterials(config: StructureConfig, maxAnisotropy: number) {
    const labelTex = createCanLabelTexture(config.canBrandText, config.canFinish, maxAnisotropy);

    // Calibrated PBR parameters per finish
    let color = 0xffffff;
    let metalness = 0.88;
    let roughness = 0.22;
    let clearcoat = 0.4;
    let clearcoatRoughness = 0.15;

    if (config.canFinish === 'red_bull') {
      color = 0xffffff;
      metalness = 0.90;
      roughness = 0.14;
      clearcoat = 0.95;
      clearcoatRoughness = 0.08;
    } else if (config.canFinish === 'brushed_aluminum') {
      color = 0xf8fafc;
      metalness = 0.92;
      roughness = 0.20;
      clearcoat = 0.3;
    } else if (config.canFinish === 'carbon_black') {
      color = 0x111827;
      metalness = 0.85;
      roughness = 0.25;
      clearcoat = 0.6;
    } else if (config.canFinish === 'crimson_beverage') {
      color = 0xffffff; // driven by texture
      metalness = 0.86;
      roughness = 0.18;
      clearcoat = 0.85;
      clearcoatRoughness = 0.1;
    } else if (config.canFinish === 'champagne_gold') {
      color = 0xfffbeb;
      metalness = 0.94;
      roughness = 0.18;
      clearcoat = 0.5;
    } else if (config.canFinish === 'titanium_white') {
      color = 0xf1f5f9;
      metalness = 0.55;
      roughness = 0.32;
      clearcoat = 0.7;
    }

    this.bodyMaterial = new THREE.MeshPhysicalMaterial({
      color,
      map: labelTex,
      metalness,
      roughness,
      clearcoat,
      clearcoatRoughness,
    });

    this.rimMaterial = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.15,
    });
  }

  private buildPullTab(neckR: number) {
    // 3D Pull-Tab Geometry: shaped lever with finger hole
    const shape = new THREE.Shape();
    const l = neckR * 0.45;
    const w = neckR * 0.25;

    shape.moveTo(-w / 2, 0);
    shape.lineTo(-w / 2, l * 0.7);
    shape.quadraticCurveTo(-w / 2, l, 0, l);
    shape.quadraticCurveTo(w / 2, l, w / 2, l * 0.7);
    shape.lineTo(w / 2, 0);
    shape.quadraticCurveTo(0, -w * 0.3, -w / 2, 0);

    // Finger loop hole
    const hole = new THREE.Path();
    const hl = l * 0.35;
    const hw = w * 0.32;
    hole.moveTo(-hw, l * 0.5);
    hole.lineTo(-hw, l * 0.75);
    hole.quadraticCurveTo(-hw, l * 0.88, 0, l * 0.88);
    hole.quadraticCurveTo(hw, l * 0.88, hw, l * 0.75);
    hole.lineTo(hw, l * 0.5);
    hole.quadraticCurveTo(0, l * 0.38, -hw, l * 0.5);
    shape.holes.push(hole);

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: 0.015,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.003,
      bevelThickness: 0.003,
    };

    const tabGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    tabGeo.center();
    const tabMat = new THREE.MeshStandardMaterial({
      color: 0xd1d5db,
      metalness: 0.96,
      roughness: 0.18,
    });
    const tabMesh = new THREE.Mesh(tabGeo, tabMat);
    tabMesh.rotation.x = Math.PI / 2;
    tabMesh.position.set(0, 0, neckR * 0.18);
    tabMesh.castShadow = true;
    this.pullTabGroup.add(tabMesh);

    // Center rivet stud
    const rivetGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.025, 12);
    const rivet = new THREE.Mesh(rivetGeo, tabMat);
    rivet.position.set(0, 0.01, 0);
    this.pullTabGroup.add(rivet);
  }

  private buildSpiralStairs(R: number, H: number, terraceH: number, _rotOffset: number) {
    // Architectural spiral staircase visible inside the tower
    const centralPoleGeo = new THREE.CylinderGeometry(0.06, 0.06, terraceH, 16);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
    const pole = new THREE.Mesh(centralPoleGeo, poleMat);
    pole.position.y = terraceH / 2;
    this.spiralStairsGroup.add(pole);

    // Spiral steps from ground to terrace
    const stepCount = 18;
    const stepGeo = new THREE.BoxGeometry(R * 0.75, 0.04, 0.18);
    stepGeo.translate(R * 0.38, 0, 0); // pivot at center pole
    const stepMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.25 });

    for (let i = 0; i < stepCount; i++) {
      const step = new THREE.Mesh(stepGeo, stepMat);
      const angle = (i / stepCount) * Math.PI * 3.5;
      step.position.y = (i / stepCount) * terraceH;
      step.rotation.y = angle;
      this.spiralStairsGroup.add(step);
    }

    // Scenic vertical glass view-strip on the tower facing inward
    const slotAngle = (this.towerIndex * Math.PI) / 2 + Math.PI; // faces center
    const slotGeo = new THREE.CylinderGeometry(R * 1.002, R * 1.002, terraceH, 16, 1, true, -0.35, 0.7);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x93c5fd,
      transmission: 0.9,
      roughness: 0.1,
      ior: 1.5,
      transparent: true,
      opacity: 0.4,
    });
    const glassSlot = new THREE.Mesh(slotGeo, glassMat);
    glassSlot.position.y = terraceH / 2;
    glassSlot.rotation.y = slotAngle;
    this.spiralStairsGroup.add(glassSlot);
  }

  public update(config: StructureConfig, maxAnisotropy: number) {
    // Re-create materials with new finish / brand text
    this.createMaterials(config, maxAnisotropy);
    this.labelMesh.material = this.bodyMaterial;
    this.pullTabGroup.visible = config.showPullTab;
    this.spiralStairsGroup.visible = config.showSpiralStairs;

    // Update architectural beacon, top halo, base LED ring and base spotlight
    const col = new THREE.Color(config.towerSpotlightColor || '#38bdf8');
    const isNight = config.environmentMode === 'night';

    if (this.beaconLight && this.haloMat) {
      this.beaconLight.color.copy(col);
      this.haloMat.color.copy(col);

      if (config.towerSpotlightEnabled) {
        const factor = (config.towerSpotlightIntensity ?? 3.5) / 3.5;
        const baseMode = isNight ? 5.0 : config.environmentMode === 'sunset' ? 1.4 : 0.4;
        this.beaconLight.intensity = baseMode * factor;
      } else {
        this.beaconLight.intensity = 0;
      }
    }

    if (this.baseLedMat && this.baseSpotLight) {
      this.baseLedMat.color.copy(col);
      this.baseSpotLight.color.copy(col);

      if (config.towerSpotlightEnabled) {
        const factor = (config.towerSpotlightIntensity ?? 3.5) / 3.5;
        const baseMode = isNight ? 6.5 : config.environmentMode === 'sunset' ? 1.8 : 0.5;
        this.baseSpotLight.intensity = baseMode * factor;
      } else {
        this.baseSpotLight.intensity = 0;
      }
    }
  }

  public setExplodedOffset(factor: number, outwardVector: THREE.Vector3) {
    // Towers slide outward radially when exploded
    const dist = factor * 1.8;
    this.group.position.x = outwardVector.x * dist;
    this.group.position.z = outwardVector.z * dist;
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
