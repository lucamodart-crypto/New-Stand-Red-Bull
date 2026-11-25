import * as THREE from 'three';
import { StructureConfig } from '../types/config';
import { createGroundTileTexture } from './proceduralTextures';

/**
 * Procedural Ground Plaza & Overhead Canopy System spanning between the 4 Can Towers
 */
export class TerraceStructure {
  public group: THREE.Group;
  public groundGroup: THREE.Group;
  public roofGroup: THREE.Group;

  private louverMeshes: THREE.Mesh[] = [];

  constructor(public config: StructureConfig, maxAnisotropy = 8) {
    this.group = new THREE.Group();
    this.group.name = 'TerraceStructure';

    this.groundGroup = new THREE.Group();
    this.groundGroup.name = 'GroundGroup';

    this.roofGroup = new THREE.Group();
    this.roofGroup.name = 'RoofGroup';

    this.group.add(this.groundGroup);
    this.group.add(this.roofGroup);

    this.build(config, maxAnisotropy);
  }

  private build(config: StructureConfig, maxAnisotropy: number) {
    // 1. Ground Plaza Slab Base (12m x 12m foundation plaza)
    this.buildGroundSlab(config, maxAnisotropy);

    // 2. Roof & Canopy (Bioclimatic Louvers / Tensile Sail)
    this.buildRoof(config);
  }

  // 1. Ground Plaza Slab
  private buildGroundSlab(config: StructureConfig, maxAnisotropy: number) {
    this.groundGroup.clear();

    const W = config.totalWidth;
    const slabSize = W + 2.5; // extends gracefully around the 10m footprint
    const slabHeight = 0.16;

    const slabGeo = new THREE.BoxGeometry(slabSize, slabHeight, slabSize);
    const slabMat = new THREE.MeshStandardMaterial({
      map: createGroundTileTexture(maxAnisotropy),
      color: 0x334155,
      metalness: 0.3,
      roughness: 0.7,
    });
    const slab = new THREE.Mesh(slabGeo, slabMat);
    slab.position.y = -slabHeight / 2;
    slab.receiveShadow = true;
    this.groundGroup.add(slab);

    // Ground plaza beveled curb edge
    const curbGeo = new THREE.BoxGeometry(slabSize + 0.2, 0.08, slabSize + 0.2);
    const curbMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const curb = new THREE.Mesh(curbGeo, curbMat);
    curb.position.y = -slabHeight - 0.04;
    curb.receiveShadow = true;
    this.groundGroup.add(curb);
  }

  // 2. Overhead Roof & Canopy
  private buildRoof(config: StructureConfig) {
    this.roofGroup.clear();
    this.louverMeshes = [];

    if (config.roofType === 'none') {
      return;
    }

    const W = config.totalWidth;
    const H = config.totalHeight;
    const roofY = H - 0.22; // Flush near the top chimes of the 6m can towers
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.25,
    });

    // Outer Perimeter Header Truss Beams connecting the 4 can tower tops
    const span = W - config.towerDiameter * 0.7;
    const beamGeo = new THREE.BoxGeometry(span, 0.18, 0.14);

    const rBeamN = new THREE.Mesh(beamGeo, frameMat);
    rBeamN.position.set(0, roofY, span / 2);
    rBeamN.castShadow = true;
    this.roofGroup.add(rBeamN);

    const rBeamS = new THREE.Mesh(beamGeo, frameMat);
    rBeamS.position.set(0, roofY, -span / 2);
    rBeamS.castShadow = true;
    this.roofGroup.add(rBeamS);

    const beamEWGeo = new THREE.BoxGeometry(0.14, 0.18, span);
    const rBeamE = new THREE.Mesh(beamEWGeo, frameMat);
    rBeamE.position.set(span / 2, roofY, 0);
    rBeamE.castShadow = true;
    this.roofGroup.add(rBeamE);

    const rBeamW = new THREE.Mesh(beamEWGeo, frameMat);
    rBeamW.position.set(-span / 2, roofY, 0);
    rBeamW.castShadow = true;
    this.roofGroup.add(rBeamW);

    if (config.roofType === 'bioclimatic_pergola') {
      // Motorized Extruded Aluminum Louver Slats
      const louverMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        metalness: 0.85,
        roughness: 0.25,
      });

      const louverCount = 20;
      const louverWidth = span * 0.94;
      const louverDepth = 0.22;
      const louverThickness = 0.02;

      const louverGeo = new THREE.BoxGeometry(louverWidth, louverThickness, louverDepth);

      const rad = (config.louverAngle * Math.PI) / 180;

      for (let i = 0; i < louverCount; i++) {
        const louver = new THREE.Mesh(louverGeo, louverMat);
        const z = -span / 2 + 0.3 + (i / (louverCount - 1)) * (span - 0.6);
        louver.position.set(0, roofY, z);
        louver.rotation.x = rad;
        louver.castShadow = true;
        louver.receiveShadow = true;
        this.roofGroup.add(louver);
        this.louverMeshes.push(louver);
      }
    } else if (config.roofType === 'tensile_sail') {
      // Architectural Double-Curved Tensile Fabric Sail
      const sailGeo = new THREE.PlaneGeometry(span * 0.9, span * 0.9, 16, 16);
      const pos = sailGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const sag = 0.6 * ((x / span) ** 2 - (y / span) ** 2);
        pos.setZ(i, sag);
      }
      sailGeo.computeVertexNormals();

      const sailMat = new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        roughness: 0.7,
        metalness: 0.1,
        side: THREE.DoubleSide,
      });
      const sail = new THREE.Mesh(sailGeo, sailMat);
      sail.rotation.x = Math.PI / 2;
      sail.position.set(0, roofY, 0);
      sail.castShadow = true;
      this.roofGroup.add(sail);

      // Tension Cables
      const cableMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.1 });
      const cableGeo = new THREE.CylinderGeometry(0.01, 0.01, 1.2, 8);
      const corners = [
        [-span / 2, span / 2],
        [span / 2, span / 2],
        [span / 2, -span / 2],
        [-span / 2, -span / 2],
      ];
      for (const [cx, cz] of corners) {
        const cable = new THREE.Mesh(cableGeo, cableMat);
        cable.position.set(cx * 0.95, roofY + 0.1, cz * 0.95);
        this.roofGroup.add(cable);
      }
    } else {
      // Open Sky with warm string lights
      const wireMat = new THREE.MeshBasicMaterial({ color: 0x334155 });
      const bulbMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
      const bulbGeo = new THREE.SphereGeometry(0.04, 8, 8);

      for (let c = 0; c < 3; c++) {
        const z = -span / 3 + (c * span) / 3;
        const wire = new THREE.Mesh(new THREE.BoxGeometry(span, 0.01, 0.01), wireMat);
        wire.position.set(0, roofY, z);
        this.roofGroup.add(wire);

        for (let b = -4; b <= 4; b++) {
          const bulb = new THREE.Mesh(bulbGeo, bulbMat);
          bulb.position.set(b * 0.8, roofY - 0.12 - Math.abs(b) * 0.02, z);
          this.roofGroup.add(bulb);
        }
      }
    }
  }

  public update(config: StructureConfig, maxAnisotropy: number) {
    this.config = config;
    this.buildGroundSlab(config, maxAnisotropy);
    this.buildRoof(config);
  }

  public setLouverAngle(angle: number) {
    const rad = (angle * Math.PI) / 180;
    for (const louver of this.louverMeshes) {
      louver.rotation.x = rad;
    }
  }

  public setExplodedOffset(factor: number) {
    // Roof group lifts higher by factor * 3.6
    this.roofGroup.position.y = factor * 3.6;
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
