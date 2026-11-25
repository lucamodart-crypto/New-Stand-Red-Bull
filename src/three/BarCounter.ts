import * as THREE from 'three';
import { BarCounterFinish, StructureConfig } from '../types/config';

/**
 * Procedural 8.0m x 0.80m x 1.10m Bar Counters positioned between the Can Towers
 */
export class BarCounterCluster {
  public group: THREE.Group;
  private counters: THREE.Group[] = [];

  constructor(public config: StructureConfig) {
    this.group = new THREE.Group();
    this.group.name = 'BarCounterCluster';
    this.build(config);
  }

  private build(config: StructureConfig) {
    this.group.clear();
    this.counters = [];

    if (!config.showBarCounters) return;

    const L = config.barCounterLength; // 8.0m
    const D = config.barCounterDepth; // 0.80m
    const H = config.barCounterHeight; // 1.10m
    const W = config.totalWidth; // 10.0m

    // Distance from center to outer edge of can towers
    const offsetZ = W / 2 - D / 2 - 0.2; // ~4.6m (fits cleanly between can towers)

    if (config.barCounterPlacement === 'front_and_back') {
      // Front Bar Counter (South, facing outward +Z)
      const frontBar = this.createSingleBar(L, D, H, config, 0);
      frontBar.position.set(0, 0, offsetZ);
      this.group.add(frontBar);
      this.counters.push(frontBar);

      // Back Bar Counter (North, facing outward -Z)
      const backBar = this.createSingleBar(L, D, H, config, Math.PI);
      backBar.position.set(0, 0, -offsetZ);
      this.group.add(backBar);
      this.counters.push(backBar);
    } else if (config.barCounterPlacement === 'front_only') {
      const frontBar = this.createSingleBar(L, D, H, config, 0);
      frontBar.position.set(0, 0, offsetZ);
      this.group.add(frontBar);
      this.counters.push(frontBar);
    } else if (config.barCounterPlacement === 'four_sides') {
      // 4 Station Bars on all 4 sides (South, North, East, West)
      // Front Bar (South, facing outward +Z)
      const frontBar = this.createSingleBar(L, D, H, config, 0, 'STATION 1 · SOUTH');
      frontBar.position.set(0, 0, offsetZ);
      this.group.add(frontBar);
      this.counters.push(frontBar);

      // Back Bar (North, facing outward -Z)
      const backBar = this.createSingleBar(L, D, H, config, Math.PI, 'STATION 2 · NORTH');
      backBar.position.set(0, 0, -offsetZ);
      this.group.add(backBar);
      this.counters.push(backBar);

      // East Bar (facing outward +X, stairs positioned right behind it!)
      const eastBar = this.createSingleBar(L, D, H, config, Math.PI / 2, 'STATION 3 · EAST');
      eastBar.position.set(offsetZ, 0, 0);
      this.group.add(eastBar);
      this.counters.push(eastBar);

      // West Bar (facing outward -X, stairs positioned right behind it!)
      const westBar = this.createSingleBar(L, D, H, config, -Math.PI / 2, 'STATION 4 · WEST');
      westBar.position.set(-offsetZ, 0, 0);
      this.group.add(westBar);
      this.counters.push(westBar);
    }
  }

  private createSingleBar(
    length: number,
    depth: number,
    height: number,
    config: StructureConfig,
    rotationY: number,
    label?: string
  ): THREE.Group {
    const bar = new THREE.Group();
    bar.name = label || 'BarCounter';
    bar.rotation.y = rotationY;

    // Materials per finish
    const { frontMat, topMat, metalTrimMat, kickMat } = this.getMaterials(config.barCounterFinish);

    // 1. Recessed Base Kickplate (Toe-kick)
    const kickH = 0.09;
    const kickD = depth - 0.12;
    const kickGeo = new THREE.BoxGeometry(length - 0.1, kickH, kickD);
    const kick = new THREE.Mesh(kickGeo, kickMat);
    kick.position.set(0, kickH / 2, 0.04);
    kick.receiveShadow = true;
    bar.add(kick);

    // 2. Main Counter Body / Front Fascia
    const bodyH = height - kickH - 0.05;
    const bodyGeo = new THREE.BoxGeometry(length, bodyH, depth - 0.06);
    const body = new THREE.Mesh(bodyGeo, frontMat);
    body.position.set(0, kickH + bodyH / 2, 0);
    body.castShadow = true;
    body.receiveShadow = true;
    bar.add(body);

    // Vertical architectural joint grooves along the 8-meter length (every 1.0m)
    const jointGeo = new THREE.BoxGeometry(0.015, bodyH, 0.02);
    for (let x = -length / 2 + 1.0; x < length / 2; x += 1.0) {
      const joint = new THREE.Mesh(jointGeo, metalTrimMat);
      joint.position.set(x, kickH + bodyH / 2, depth / 2 - 0.02);
      bar.add(joint);
    }

    // 3. Countertop Surface (8.04m x 0.84m with overhang)
    const topThickness = 0.05;
    const topGeo = new THREE.BoxGeometry(length + 0.06, topThickness, depth + 0.06);
    const topMesh = new THREE.Mesh(topGeo, topMat);
    topMesh.position.set(0, height - topThickness / 2, 0);
    topMesh.castShadow = true;
    topMesh.receiveShadow = true;
    bar.add(topMesh);

    // Countertop Beveled Drip Edge Trim in Brushed Aluminum
    const edgeTrimGeo = new THREE.BoxGeometry(length + 0.08, 0.02, 0.015);
    const edgeTrim = new THREE.Mesh(edgeTrimGeo, metalTrimMat);
    edgeTrim.position.set(0, height - 0.01, depth / 2 + 0.035);
    bar.add(edgeTrim);

    // 4. Back / Service Side Features (facing inside towards containers)
    // Lower worktop shelf (prep level Y = 0.85m)
    const prepShelfGeo = new THREE.BoxGeometry(length - 0.2, 0.03, 0.35);
    const prepShelf = new THREE.Mesh(prepShelfGeo, metalTrimMat);
    prepShelf.position.set(0, 0.85, -depth / 2 + 0.18);
    prepShelf.castShadow = true;
    bar.add(prepShelf);

    // Speed rail / bottle wells on the service side
    const railWellGeo = new THREE.BoxGeometry(length - 0.4, 0.12, 0.14);
    const railWell = new THREE.Mesh(railWellGeo, kickMat);
    railWell.position.set(0, 0.68, -depth / 2 + 0.1);
    bar.add(railWell);

    // 5. Front Customer Footrest Tubular Rail (at Y = 0.20m)
    const footrestLength = length - 0.4;
    const footrestGeo = new THREE.CylinderGeometry(0.025, 0.025, footrestLength, 16);
    const footrest = new THREE.Mesh(footrestGeo, metalTrimMat);
    footrest.rotation.z = Math.PI / 2;
    footrest.position.set(0, 0.2, depth / 2 + 0.12);
    bar.add(footrest);

    // Footrest support brackets every 1.5m
    const bracketGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.14, 8);
    for (let x = -footrestLength / 2 + 0.3; x <= footrestLength / 2; x += 1.4) {
      const bracket = new THREE.Mesh(bracketGeo, metalTrimMat);
      bracket.rotation.x = Math.PI / 2;
      bracket.position.set(x, 0.2, depth / 2 + 0.05);
      bar.add(bracket);
    }

    // 6. Under-Counter Linear LED Glow Strip
    const ledStripGeo = new THREE.BoxGeometry(length - 0.1, 0.015, 0.02);
    const ledStripMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(config.underglowLedColor),
    });
    const ledStrip = new THREE.Mesh(ledStripGeo, ledStripMat);
    ledStrip.position.set(0, height - topThickness - 0.01, depth / 2 + 0.01);
    bar.add(ledStrip);

    // 7. Optional Modern High Bar Stools (6 stools along the 8 meters)
    if (config.showBarStools) {
      const stoolCount = 6;
      const stoolSpacing = (length - 1.2) / (stoolCount - 1);
      const stoolMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
      const stoolLegMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 });

      for (let s = 0; s < stoolCount; s++) {
        const sx = -length / 2 + 0.6 + s * stoolSpacing;
        const stoolGroup = new THREE.Group();
        stoolGroup.position.set(sx, 0, depth / 2 + 0.55);

        // Seat Cushion (H 0.78m)
        const seatGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.07, 16);
        const seat = new THREE.Mesh(seatGeo, stoolMat);
        seat.position.y = 0.78;
        seat.castShadow = true;
        stoolGroup.add(seat);

        // Center Stem & Base
        const stemGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.74, 12);
        const stem = new THREE.Mesh(stemGeo, stoolLegMat);
        stem.position.y = 0.74 / 2;
        stoolGroup.add(stem);

        const baseGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.02, 16);
        const base = new THREE.Mesh(baseGeo, stoolLegMat);
        base.position.y = 0.01;
        stoolGroup.add(base);

        bar.add(stoolGroup);
      }
    }

    return bar;
  }

  private getMaterials(finish: BarCounterFinish) {
    const metalTrimMat = new THREE.MeshStandardMaterial({
      color: 0xc8d1dc,
      metalness: 0.98,
      roughness: 0.14,
    });

    const kickMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.92,
      roughness: 0.22,
    });

    let frontMat: THREE.Material;
    let topMat: THREE.Material;

    if (finish === 'brushed_steel') {
      frontMat = new THREE.MeshStandardMaterial({
        color: 0xdbeafe,
        metalness: 0.96,
        roughness: 0.18,
      });
      topMat = new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        metalness: 0.98,
        roughness: 0.08,
      });
    } else if (finish === 'industrial_black') {
      frontMat = new THREE.MeshStandardMaterial({
        color: 0x111827,
        metalness: 0.88,
        roughness: 0.28,
      });
      topMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.92,
        roughness: 0.16,
      });
    } else if (finish === 'backlit_wood') {
      frontMat = new THREE.MeshStandardMaterial({
        color: 0x9a3412, // Rich teak wood tone
        metalness: 0.1,
        roughness: 0.5,
      });
      topMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.85,
        roughness: 0.2,
      });
    } else {
      // translucent_led
      frontMat = new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        transmission: 0.6,
        roughness: 0.2,
        transparent: true,
        opacity: 0.9,
      });
      topMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        metalness: 0.92,
        roughness: 0.15,
      });
    }

    return { frontMat, topMat, metalTrimMat, kickMat };
  }

  public update(config: StructureConfig) {
    this.config = config;
    this.build(config);
  }

  public setExplodedOffset(factor: number) {
    const baseOffset = this.config.totalWidth / 2 - this.config.barCounterDepth / 2 - 0.2;
    this.counters.forEach((c) => {
      if (Math.abs(c.position.z) > Math.abs(c.position.x)) {
        const sign = Math.sign(c.position.z) || 1;
        c.position.z = sign * (baseOffset + factor * 0.9);
      } else {
        const sign = Math.sign(c.position.x) || 1;
        c.position.x = sign * (baseOffset + factor * 0.9);
      }
    });
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
