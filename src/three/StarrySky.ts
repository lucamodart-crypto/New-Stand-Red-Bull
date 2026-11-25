import * as THREE from 'three';

/**
 * Creates a high-fidelity 360° Equirectangular Starry Sky Canvas Texture
 * with procedural stars, varied stellar temperatures, soft Milky Way galactic haze,
 * and prominent stars with delicate diffraction cross-flares.
 */
export function createStarrySkyTexture(): THREE.CanvasTexture {
  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // 1. Deep Cosmic Celestial Gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
  skyGrad.addColorStop(0.0, '#01030a'); // Deep cosmic zenith
  skyGrad.addColorStop(0.3, '#020617'); // Dark midnight indigo
  skyGrad.addColorStop(0.48, '#060d26'); // Atmospheric horizon glow
  skyGrad.addColorStop(0.52, '#040817'); // Ground horizon transition
  skyGrad.addColorStop(0.8, '#02040c'); // Lower celestial sphere
  skyGrad.addColorStop(1.0, '#010206'); // Nadir
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Soft Milky Way Galactic Dust Lane (diagonal sweeping galactic haze)
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  // Milky way path curves diagonally across the upper hemisphere
  const mwGrad = ctx.createLinearGradient(0, height * 0.45, width, height * 0.1);
  mwGrad.addColorStop(0.0, 'rgba(30, 58, 138, 0.0)');
  mwGrad.addColorStop(0.25, 'rgba(56, 189, 248, 0.08)'); // Cyan celestial dust
  mwGrad.addColorStop(0.5, 'rgba(129, 140, 248, 0.12)'); // Violet indigo haze
  mwGrad.addColorStop(0.75, 'rgba(236, 72, 153, 0.07)'); // Magenta cosmic nebula
  mwGrad.addColorStop(1.0, 'rgba(30, 58, 138, 0.0)');

  ctx.fillStyle = mwGrad;
  ctx.beginPath();
  ctx.moveTo(0, height * 0.4);
  ctx.bezierCurveTo(
    width * 0.3, height * 0.15,
    width * 0.7, height * 0.35,
    width, height * 0.05
  );
  ctx.lineTo(width, height * 0.25);
  ctx.bezierCurveTo(
    width * 0.7, height * 0.5,
    width * 0.3, height * 0.35,
    0, height * 0.55
  );
  ctx.closePath();
  ctx.fill();

  // Subtle nebula clouds along the galaxy
  const nebulaCenters = [
    { x: width * 0.28, y: height * 0.26, r: 180, col: 'rgba(56, 189, 248, 0.06)' },
    { x: width * 0.52, y: height * 0.30, r: 240, col: 'rgba(139, 92, 246, 0.07)' },
    { x: width * 0.78, y: height * 0.18, r: 160, col: 'rgba(244, 114, 182, 0.05)' },
    { x: width * 0.42, y: height * 0.22, r: 140, col: 'rgba(99, 102, 241, 0.06)' },
  ];

  nebulaCenters.forEach((neb) => {
    const radG = ctx.createRadialGradient(neb.x, neb.y, 0, neb.x, neb.y, neb.r);
    radG.addColorStop(0, neb.col);
    radG.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = radG;
    ctx.fillRect(neb.x - neb.r, neb.y - neb.r, neb.r * 2, neb.r * 2);
  });
  ctx.restore();

  // 3. Realistic Multi-Temperature Stars (Spherical projection aware)
  // Spectral colors: Blue-white (O/B), Diamond white (A), Warm yellow (G), Amber (K/M)
  const starColors = [
    '#ffffff', // Diamond white
    '#e0f2fe', // Icy cyan-white (Rigel/Vega)
    '#bae6fd', // Soft blue
    '#fef08a', // Warm gold (Sun/Capella)
    '#ffedd5', // Soft ivory
    '#fed7aa', // Amber orange (Betelgeuse)
  ];

  // Pseudo-random deterministic generator for consistent star placement
  let seed = 42;
  const pseudoRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  const totalStars = 2800;
  for (let i = 0; i < totalStars; i++) {
    // Equirectangular mapping: distribute with uniform spherical density
    const u = pseudoRandom();
    const v = pseudoRandom();

    // Bias toward the upper hemisphere (sky) rather than the ground
    // theta from 0 to 2*PI, phi from 0 (zenith) to PI (nadir)
    // Most stars above horizon (phi <= PI * 0.55)
    const phi = Math.acos(1 - 1.85 * v * (v > 0.85 ? 0.6 : 1.0));
    const theta = u * Math.PI * 2;

    const x = (theta / (Math.PI * 2)) * width;
    const y = (phi / Math.PI) * height;

    if (y > height * 0.58) continue; // Don't place stars deep underground

    const starColor = starColors[Math.floor(pseudoRandom() * starColors.length)];
    const brightness = Math.pow(pseudoRandom(), 2.8); // Most are faint, few are bright
    const size = 0.5 + brightness * 2.2;
    const alpha = 0.35 + brightness * 0.65;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = starColor;

    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();

    // Extra soft halo for brighter stars
    if (brightness > 0.75) {
      const haloGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 4.5);
      haloGrad.addColorStop(0, starColor);
      haloGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(x, y, size * 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Subtle 4-point cross diffraction flare on the 30 brightest stars
      if (brightness > 0.88) {
        ctx.strokeStyle = starColor;
        ctx.lineWidth = 0.75;
        const armLen = size * 5.0;

        ctx.beginPath();
        ctx.moveTo(x - armLen, y);
        ctx.lineTo(x + armLen, y);
        ctx.moveTo(x, y - armLen);
        ctx.lineTo(x, y + armLen);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // 4. Subtle Horizon Atmospheric Band (Haze blending with terrain)
  const horizonBand = ctx.createLinearGradient(0, height * 0.46, 0, height * 0.54);
  horizonBand.addColorStop(0.0, 'rgba(6, 13, 38, 0.0)');
  horizonBand.addColorStop(0.5, 'rgba(8, 16, 42, 0.75)');
  horizonBand.addColorStop(1.0, 'rgba(4, 8, 24, 0.95)');
  ctx.fillStyle = horizonBand;
  ctx.fillRect(0, height * 0.46, width, height * 0.08);

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/**
 * 3D Starfield Particle Dome with gentle twinkling for dynamic parallax depth
 */
export class StarfieldDome {
  public group: THREE.Group;
  private points: THREE.Points;
  private material: THREE.PointsMaterial;
  private geometry: THREE.BufferGeometry;
  private alphas: Float32Array;
  private baseAlphas: Float32Array;
  private twinkleSpeeds: Float32Array;

  constructor(count = 2200, radius = 130) {
    this.group = new THREE.Group();

    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    this.alphas = new Float32Array(count);
    this.baseAlphas = new Float32Array(count);
    this.twinkleSpeeds = new Float32Array(count);

    // Circular star sprite texture for smooth non-square points
    const spriteTex = this.createStarSprite();

    const colorPalette = [
      new THREE.Color(0xffffff), // Crisp white
      new THREE.Color(0xbae6fd), // Pale sky cyan
      new THREE.Color(0xe0f2fe), // Ice blue
      new THREE.Color(0xfef08a), // Golden yellow
      new THREE.Color(0xfed7aa), // Soft amber
    ];

    for (let i = 0; i < count; i++) {
      // Distribute randomly across the upper celestial hemisphere
      const theta = Math.random() * Math.PI * 2;
      // Elevation from horizon (0) up to zenith (PI/2)
      const phi = Math.acos(Math.random() * 0.95 + 0.05); // Keep above ground

      const r = radius * (0.9 + Math.random() * 0.2);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.cos(phi); // Above ground y > 0
      const z = r * Math.sin(phi) * Math.sin(theta);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const col = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;

      const alpha = 0.4 + Math.random() * 0.6;
      this.baseAlphas[i] = alpha;
      this.alphas[i] = alpha;
      this.twinkleSpeeds[i] = 1.0 + Math.random() * 3.5;
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    this.material = new THREE.PointsMaterial({
      size: 2.2,
      map: spriteTex,
      transparent: true,
      vertexColors: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.group.add(this.points);
    this.group.visible = false;
  }

  private createStarSprite(): THREE.CanvasTexture {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.25, 'rgba(240, 248, 255, 0.85)');
    grad.addColorStop(0.55, 'rgba(186, 230, 253, 0.35)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    return texture;
  }

  public setVisible(visible: boolean) {
    this.group.visible = visible;
  }

  public animate(time: number) {
    if (!this.group.visible) return;
    // Gentle slow cosmic rotation of the celestial sphere
    this.group.rotation.y = time * 0.00008;

    // Subtle twinkling pulse
    const t = time * 0.001;
    this.material.opacity = 0.85 + Math.sin(t * 1.5) * 0.12;
  }

  public dispose() {
    this.geometry.dispose();
    this.material.map?.dispose();
    this.material.dispose();
  }
}
