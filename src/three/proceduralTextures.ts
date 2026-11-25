import * as THREE from 'three';
import { CanFinish } from '../types/config';

/**
 * Creates high-resolution procedural textures using HTML5 2D Canvas.
 * No external file dependencies.
 */

// Pure Rhombus Pattern Texture Generator (Deep Metallic Blue & Brushed Silver)
export function createRedBullCanTexture(
  _brandText = '',
  maxAnisotropy = 8
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d')!;

  const W = canvas.width;
  const H = canvas.height;

  // 1. Draw iconic 4-quadrant diagonal sections (alternating Royal Blue & Brushed Silver)
  // Two full repeats around cylinder circumference
  const numSectors = 2;
  const sectorW = W / numSectors;

  for (let s = 0; s < numSectors; s++) {
    const startX = s * sectorW;
    const endX = startX + sectorW;
    const midX = startX + sectorW / 2;
    const midY = H / 2;
    // Slanted diagonal passing through center (midX, midY), matching uploaded reference
    const slant = sectorW * 0.18; // ~15°-18° tilt

    // 1. Top-Left: Royal Blue Polygon
    // Bounds: (startX, 0) -> (midX + slant, 0) -> (midX, midY) -> (startX, midY)
    const tlGrad = ctx.createLinearGradient(startX, 0, midX + slant, midY);
    tlGrad.addColorStop(0, '#00186e');
    tlGrad.addColorStop(0.35, '#002fbe');
    tlGrad.addColorStop(0.7, '#0038c8');
    tlGrad.addColorStop(1, '#002084');
    ctx.fillStyle = tlGrad;
    ctx.beginPath();
    ctx.moveTo(startX, 0);
    ctx.lineTo(midX + slant, 0);
    ctx.lineTo(midX, midY);
    ctx.lineTo(startX, midY);
    ctx.closePath();
    ctx.fill();

    // 2. Top-Right: Brushed Aluminum Silver Polygon
    // Bounds: (midX + slant, 0) -> (endX, 0) -> (endX, midY) -> (midX, midY)
    const trGrad = ctx.createLinearGradient(midX + slant, 0, endX, midY);
    trGrad.addColorStop(0, '#cbd5e1');
    trGrad.addColorStop(0.3, '#f1f5f9');
    trGrad.addColorStop(0.7, '#e2e8f0');
    trGrad.addColorStop(1, '#94a3b8');
    ctx.fillStyle = trGrad;
    ctx.beginPath();
    ctx.moveTo(midX + slant, 0);
    ctx.lineTo(endX, 0);
    ctx.lineTo(endX, midY);
    ctx.lineTo(midX, midY);
    ctx.closePath();
    ctx.fill();

    // 3. Bottom-Left: Brushed Aluminum Silver Polygon
    // Bounds: (startX, midY) -> (midX, midY) -> (midX - slant, H) -> (startX, H)
    const blGrad = ctx.createLinearGradient(startX, midY, midX, H);
    blGrad.addColorStop(0, '#94a3b8');
    blGrad.addColorStop(0.4, '#e2e8f0');
    blGrad.addColorStop(0.7, '#f8fafc');
    blGrad.addColorStop(1, '#cbd5e1');
    ctx.fillStyle = blGrad;
    ctx.beginPath();
    ctx.moveTo(startX, midY);
    ctx.lineTo(midX, midY);
    ctx.lineTo(midX - slant, H);
    ctx.lineTo(startX, H);
    ctx.closePath();
    ctx.fill();

    // 4. Bottom-Right: Royal Blue Polygon
    // Bounds: (midX, midY) -> (endX, midY) -> (endX, H) -> (midX - slant, H)
    const brGrad = ctx.createLinearGradient(midX, midY, endX, H);
    brGrad.addColorStop(0, '#002084');
    brGrad.addColorStop(0.35, '#0038c8');
    brGrad.addColorStop(0.7, '#002fbe');
    brGrad.addColorStop(1, '#00186e');
    ctx.fillStyle = brGrad;
    ctx.beginPath();
    ctx.moveTo(midX, midY);
    ctx.lineTo(endX, midY);
    ctx.lineTo(endX, H);
    ctx.lineTo(midX - slant, H);
    ctx.closePath();
    ctx.fill();

    // Dividing Seams & Hairlines (Exactly matching photo):
    // A) Horizontal dividing line at midY
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(startX, midY);
    ctx.lineTo(endX, midY);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(0, 10, 40, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(startX, midY + 1.5);
    ctx.lineTo(endX, midY + 1.5);
    ctx.stroke();

    // B) Slanted diagonal line from (midX + slant, 0) through (midX, midY) to (midX - slant, H)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(midX + slant, 0);
    ctx.lineTo(midX - slant, H);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(0, 10, 40, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(midX + slant + 1.5, 0);
    ctx.lineTo(midX - slant + 1.5, H);
    ctx.stroke();

    // C) Vertical boundary seams between sectors
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(startX, 0);
    ctx.lineTo(startX, H);
    ctx.stroke();
  }

  // 2. Realistic brushed aluminum horizontal grain over the whole livery
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  for (let y = 0; y < H; y += 4) {
    if (Math.random() > 0.3) {
      ctx.fillRect(0, y, W, 1.5);
    }
  }
  ctx.fillStyle = 'rgba(15, 23, 42, 0.035)';
  for (let y = 2; y < H; y += 6) {
    if (Math.random() > 0.35) {
      ctx.fillRect(0, y, W, 1);
    }
  }

  // 3. Top and Bottom Bare Turned Aluminum Chimes (Can Rims)
  const chimeH = 110;
  const topChimeGrad = ctx.createLinearGradient(0, 0, 0, chimeH);
  topChimeGrad.addColorStop(0, '#e2e8f0');
  topChimeGrad.addColorStop(0.3, '#ffffff');
  topChimeGrad.addColorStop(0.7, '#cbd5e1');
  topChimeGrad.addColorStop(1, '#64748b');
  ctx.fillStyle = topChimeGrad;
  ctx.fillRect(0, 0, W, chimeH);

  const btmChimeGrad = ctx.createLinearGradient(0, H - chimeH, 0, H);
  btmChimeGrad.addColorStop(0, '#64748b');
  btmChimeGrad.addColorStop(0.3, '#94a3b8');
  btmChimeGrad.addColorStop(0.7, '#ffffff');
  btmChimeGrad.addColorStop(1, '#cbd5e1');
  ctx.fillStyle = btmChimeGrad;
  ctx.fillRect(0, H - chimeH, W, chimeH);

  // Turned aluminum groove lines
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillRect(0, chimeH - 6, W, 4);
  ctx.fillRect(0, H - chimeH + 2, W, 4);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(0, chimeH, W, 3);
  ctx.fillRect(0, H - chimeH - 3, W, 3);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// 1. Procedural Can Tower Label / Livery
export function createCanLabelTexture(
  brandText: string,
  finish: CanFinish,
  maxAnisotropy = 8
): THREE.CanvasTexture {
  // If finish is Red Bull, use the dedicated high-detail Red Bull texture
  if (finish === 'red_bull') {
    return createRedBullCanTexture(brandText, maxAnisotropy);
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Background base per finish
  let primaryColor = '#1e293b';
  let secondaryColor = '#0f172a';
  let accentColor = '#38bdf8';
  let textColor = '#ffffff';

  if (finish === 'brushed_aluminum') {
    primaryColor = '#cbd5e1';
    secondaryColor = '#94a3b8';
    accentColor = '#0284c7';
    textColor = '#0f172a';
  } else if (finish === 'carbon_black') {
    primaryColor = '#090d16';
    secondaryColor = '#171d2b';
    accentColor = '#22c55e';
    textColor = '#f8fafc';
  } else if (finish === 'crimson_beverage') {
    primaryColor = '#dc2626';
    secondaryColor = '#991b1b';
    accentColor = '#facc15';
    textColor = '#ffffff';
  } else if (finish === 'champagne_gold') {
    primaryColor = '#d4af37';
    secondaryColor = '#aa8012';
    accentColor = '#ffffff';
    textColor = '#2a2003';
  } else if (finish === 'titanium_white') {
    primaryColor = '#f1f5f9';
    secondaryColor = '#e2e8f0';
    accentColor = '#0ea5e9';
    textColor = '#1e293b';
  }

  // Vertical gradient base
  const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
  grad.addColorStop(0, primaryColor);
  grad.addColorStop(0.3, secondaryColor);
  grad.addColorStop(0.5, primaryColor);
  grad.addColorStop(0.7, secondaryColor);
  grad.addColorStop(1, primaryColor);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle metallic horizontal grain
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  for (let y = 0; y < canvas.height; y += 4) {
    if (Math.random() > 0.4) {
      ctx.fillRect(0, y, canvas.width, 1.5);
    }
  }

  // Top & bottom bare aluminum bands (classic can rim look)
  ctx.fillStyle = 'rgba(226, 232, 240, 0.85)';
  ctx.fillRect(0, 0, canvas.width, 70);
  ctx.fillRect(0, canvas.height - 70, canvas.width, 70);

  // Silver edge pinstripes
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.fillRect(0, 70, canvas.width, 6);
  ctx.fillRect(0, canvas.height - 76, canvas.width, 6);

  // Middle vertical graphic banner
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(-Math.PI / 2); // Rotated vertically like standard energy/drink can labels

  // Architectural Badge / Emblem
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.strokeRect(-280, -90, 560, 180);

  // Large Bold Brand Text
  ctx.fillStyle = textColor;
  ctx.font = 'bold 64px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = '4px';
  ctx.fillText(brandText.toUpperCase(), 0, -15);

  // Subtitle
  ctx.fillStyle = accentColor;
  ctx.font = '600 20px "JetBrains Mono", monospace';
  ctx.fillText('MODULAR TOWER · 5.0M TOWER UNIT', 0, 36);

  ctx.restore();

  // Additional realistic can label details:
  // Nutritional / Architectural specs panel on the back side (x = 800)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.fillRect(780, 250, 190, 480);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.strokeRect(780, 250, 190, 480);

  ctx.fillStyle = textColor;
  ctx.font = 'bold 14px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('STRUKTURA SPECS', 795, 280);
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.fillText('HEIGHT: 5.00 M', 795, 310);
  ctx.fillText('DIAMETER: 1.60 M', 795, 330);
  ctx.fillText('ALLOY: AL-6061-T6', 795, 350);
  ctx.fillText('FINISH: PBR COATED', 795, 370);
  ctx.fillText('LOAD: 450 KG/M²', 795, 390);
  ctx.fillText('WIND: 130 KM/H', 795, 410);

  // Barcode
  ctx.fillStyle = textColor;
  for (let bx = 795; bx < 950; bx += 5) {
    if (Math.random() > 0.3) {
      ctx.fillRect(bx, 640, Math.random() > 0.5 ? 3 : 2, 60);
    }
  }
  ctx.font = '9px "JetBrains Mono", monospace';
  ctx.fillText('8 012345 678901', 820, 715);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// 2. Procedural Can Top Lid Texture
export function createCanLidTexture(maxAnisotropy = 8): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const cx = 256;
  const cy = 256;

  // Aluminum circular lid gradient
  const lidGrad = ctx.createRadialGradient(cx, cy, 30, cx, cy, 250);
  lidGrad.addColorStop(0, '#f1f5f9');
  lidGrad.addColorStop(0.7, '#cbd5e1');
  lidGrad.addColorStop(0.95, '#94a3b8');
  lidGrad.addColorStop(1, '#64748b');
  ctx.fillStyle = lidGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 250, 0, Math.PI * 2);
  ctx.fill();

  // Stamped outer groove ring
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(cx, cy, 230, 0, Math.PI * 2);
  ctx.stroke();

  // Inner counter-sink groove
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx, cy, 200, 0, Math.PI * 2);
  ctx.stroke();

  // Drinking aperture score-line (teardrop mouth opening)
  ctx.fillStyle = '#64748b';
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 90, 48, 68, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Center rivet dot
  ctx.fillStyle = '#e2e8f0';
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  return texture;
}

// 3. Procedural Teak Wood Plank Deck Texture
export function createWoodDeckTexture(maxAnisotropy = 8): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Warm rich teak base
  ctx.fillStyle = '#8b5a2b';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Planks configuration
  const plankCount = 16;
  const plankHeight = canvas.height / plankCount;

  for (let i = 0; i < plankCount; i++) {
    const y = i * plankHeight;
    // Slight color tone variation per plank
    const toneVariation = (Math.random() - 0.5) * 20;
    const r = Math.min(255, Math.max(0, 150 + toneVariation));
    const g = Math.min(255, Math.max(0, 95 + toneVariation * 0.7));
    const b = Math.min(255, Math.max(0, 50 + toneVariation * 0.5));
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(0, y + 2, canvas.width, plankHeight - 4);

    // Subtle grain lines
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    for (let g = 0; g < 6; g++) {
      const gy = y + 4 + Math.random() * (plankHeight - 8);
      ctx.fillRect(0, gy, canvas.width, 1 + Math.random() * 1.5);
    }

    // Black caulking seam between planks
    ctx.fillStyle = '#1e140d';
    ctx.fillRect(0, y + plankHeight - 3, canvas.width, 3);

    // Fastener/screw dots at plank ends
    ctx.fillStyle = '#3a2717';
    ctx.beginPath();
    ctx.arc(40, y + plankHeight / 2, 2.5, 0, Math.PI * 2);
    ctx.arc(canvas.width - 40, y + plankHeight / 2, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

// 4. Procedural Polished Concrete / Terrazzo Texture
export function createConcreteTexture(maxAnisotropy = 8): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#64748b';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Random aggregate flecks
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = Math.random() * 2 + 0.5;
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.15)' : 'rgba(15,23,42,0.15)';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Expansion joint lines (4 tiles)
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.moveTo(0, canvas.height / 2);
  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

// 5. Procedural Ground Slab / Paving Texture
export function createGroundTileTexture(maxAnisotropy = 8): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Grid pavers
  const tileSize = 128;
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
  ctx.lineWidth = 2;

  for (let x = 0; x <= canvas.width; x += tileSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= canvas.height; y += tileSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Subtle paving noise
  ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
  for (let i = 0; i < 2000; i++) {
    ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

// Procedural Architectural Mirror Container Wall Texture
export function createContainerMirrorTexture(
  containerNumber: string,
  maxAnisotropy = 8
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Polished chrome mirror gradient
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, '#f8fafc');
  grad.addColorStop(0.2, '#cbd5e1');
  grad.addColorStop(0.45, '#e2e8f0');
  grad.addColorStop(0.7, '#94a3b8');
  grad.addColorStop(0.85, '#f1f5f9');
  grad.addColorStop(1, '#e2e8f0');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Factory Corrugated Sheet Metal (Lamiera Grecata) in Mirror Chrome
  const ribWidth = 32;
  for (let x = 0; x < canvas.width; x += ribWidth) {
    const ribGrad = ctx.createLinearGradient(x, 0, x + ribWidth, 0);
    ribGrad.addColorStop(0.0, '#64748b'); // Deep recess shadow
    ribGrad.addColorStop(0.2, '#94a3b8'); // Recess floor
    ribGrad.addColorStop(0.35, '#ffffff'); // Flute slope highlight
    ribGrad.addColorStop(0.5, '#f8fafc'); // Outer rib crest peak
    ribGrad.addColorStop(0.65, '#e2e8f0'); // Outer rib crest
    ribGrad.addColorStop(0.85, '#cbd5e1'); // Sloped down
    ribGrad.addColorStop(1.0, '#475569'); // Corner groove shadow

    ctx.fillStyle = ribGrad;
    ctx.fillRect(x, 0, ribWidth, canvas.height);

    // Fine specular ridge hairlines
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillRect(x + ribWidth * 0.48, 0, 1.5, canvas.height);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
    ctx.fillRect(x + 1, 0, 1.5, canvas.height);
  }

  // Top and bottom heavy horizontal container steel rail bands (factory welded)
  ctx.fillStyle = 'rgba(100, 116, 139, 0.35)';
  ctx.fillRect(0, 0, canvas.width, 22);
  ctx.fillRect(0, canvas.height - 22, canvas.width, 22);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.fillRect(0, 22, canvas.width, 2);
  ctx.fillRect(0, canvas.height - 24, canvas.width, 2);

  // Laser-etched technical ISO factory markings
  ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
  ctx.font = 'bold 16px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`${containerNumber} · ISO 22G1`, canvas.width - 35, 45);
  ctx.font = '11px "JetBrains Mono", monospace';
  ctx.fillText('FACTORY SPEC CORRUGATED MIRROR CHROME STEEL (SS-316L)', canvas.width - 35, 70);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  return texture;
}

// Procedural Architectural Mirror Container Door Texture
export function createContainerMirrorDoorTexture(
  containerNumber: string,
  maxAnisotropy = 8
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Mirror chrome base
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, '#e2e8f0');
  grad.addColorStop(0.3, '#f8fafc');
  grad.addColorStop(0.6, '#cbd5e1');
  grad.addColorStop(1, '#f1f5f9');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Central seam between the two mirror door leaves
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(252, 0, 8, canvas.height);

  // Two large mirror panels on each door leaf
  [0, 260].forEach((leftX) => {
    const leafW = 244;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 2;
    ctx.strokeRect(leftX + 6, 6, leafW - 12, canvas.height - 12);

    ctx.strokeStyle = 'rgba(30, 41, 59, 0.35)';
    ctx.lineWidth = 2;
    ctx.strokeRect(leftX + 4, 4, leafW - 8, canvas.height - 8);
  });

  // Vertical chrome locking rods
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(110, 0, 12, canvas.height);
  ctx.fillRect(180, 0, 12, canvas.height);
  ctx.fillRect(320, 0, 12, canvas.height);
  ctx.fillRect(390, 0, 12, canvas.height);

  // Chrome door handles & cams
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(100, 240, 32, 28);
  ctx.fillRect(310, 240, 32, 28);
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2;
  ctx.strokeRect(100, 240, 32, 28);
  ctx.strokeRect(310, 240, 32, 28);

  ctx.fillStyle = 'rgba(30, 41, 59, 0.75)';
  ctx.font = 'bold 15px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(containerNumber, 370, 70);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  return texture;
}

// 6. Procedural Corrugated Shipping Container Wall Texture
export function createContainerWallTexture(
  colorHex: string,
  containerNumber: string,
  maxAnisotropy = 8
): THREE.CanvasTexture {
  if (colorHex === 'mirror_chrome' || colorHex === '#e2e8f0') {
    return createContainerMirrorTexture(containerNumber, maxAnisotropy);
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Base background
  ctx.fillStyle = colorHex;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Corrugated vertical sheet metal ribs (light / shadow bands)
  const ribWidth = 32;
  for (let x = 0; x < canvas.width; x += ribWidth) {
    // Left shadow slope
    const grad = ctx.createLinearGradient(x, 0, x + ribWidth, 0);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
    grad.addColorStop(0.35, 'rgba(255, 255, 255, 0.15)');
    grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.25)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.35)');

    ctx.fillStyle = grad;
    ctx.fillRect(x, 0, ribWidth, canvas.height);

    // Bevel highlights
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.fillRect(x + 2, 0, 2, canvas.height);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(x + ribWidth - 2, 0, 2, canvas.height);
  }

  // Top and bottom heavy horizontal steel rail bands
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.fillRect(0, 0, canvas.width, 24);
  ctx.fillRect(0, canvas.height - 24, canvas.width, 24);

  // ISO Container Technical Markings
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.font = 'bold 22px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillText(containerNumber, canvas.width - 40, 60);

  ctx.font = '14px "JetBrains Mono", monospace';
  ctx.fillText('22G1 · ISO 20FT MODULAR UNIT', canvas.width - 40, 90);
  ctx.fillText('MAX GROSS: 30,480 KG', canvas.width - 40, 115);
  ctx.fillText('PAYLOAD: 28,300 KG', canvas.width - 40, 138);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  return texture;
}

// 7. Procedural Container End Doors Texture
export function createContainerDoorTexture(
  colorHex: string,
  containerNumber: string,
  maxAnisotropy = 8
): THREE.CanvasTexture {
  if (colorHex === 'mirror_chrome' || colorHex === '#e2e8f0') {
    return createContainerMirrorDoorTexture(containerNumber, maxAnisotropy);
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = colorHex;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Central seam between the two door leaves
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(252, 0, 8, canvas.height);

  // Door corrugations
  const ribW = 28;
  for (let x = 20; x < canvas.width - 20; x += ribW) {
    if (Math.abs(x - 256) < 30) continue; // skip seam
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(x, 15, ribW - 6, canvas.height - 30);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(x + 2, 15, 2, canvas.height - 30);
  }

  // Vertical locking bar tracks
  ctx.fillStyle = '#64748b';
  ctx.fillRect(110, 0, 12, canvas.height);
  ctx.fillRect(180, 0, 12, canvas.height);
  ctx.fillRect(320, 0, 12, canvas.height);
  ctx.fillRect(390, 0, 12, canvas.height);

  // Door Handles & Cams
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(100, 240, 32, 28);
  ctx.fillRect(310, 240, 32, 28);

  // Hazmat / Warning decals
  ctx.fillStyle = '#eab308';
  ctx.beginPath();
  ctx.moveTo(80, 80);
  ctx.lineTo(130, 80);
  ctx.lineTo(105, 40);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = 'bold 18px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(containerNumber, 370, 70);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  return texture;
}

// 8. Procedural Galvanized Checkered / Diamond-Plate Steel Texture for Stairs & Landing
export function createCheckeredSteelTexture(maxAnisotropy = 8): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const step = 32;
  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      const alt = ((x / step + y / step) % 2) === 0;
      ctx.save();
      ctx.translate(x + step / 2, y + step / 2);
      ctx.rotate(alt ? Math.PI / 4 : -Math.PI / 4);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.fillRect(-7, -2.5, 14, 5);
      ctx.fillStyle = 'rgba(51, 65, 85, 0.35)';
      ctx.fillRect(-7, 2.5, 14, 1.5);
      ctx.restore();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

