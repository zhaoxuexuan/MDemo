import { GridLayer, type Coords } from 'leaflet';

interface OfflineTileLayerOptions {
  minZoom?: number;
  maxZoom?: number;
  tileSize?: number;
}

export class OfflineTileLayer extends GridLayer {
  private _cache: Map<string, HTMLCanvasElement> = new Map();
  private readonly MAX_CACHE_SIZE: number = 200;

  constructor(options: OfflineTileLayerOptions = {}) {
    super({
      ...options,
      minZoom: options.minZoom ?? 0,
      maxZoom: options.maxZoom ?? 18,
      tileSize: options.tileSize ?? 256,
    });
  }

  createTile(coords: Coords): HTMLElement {
    const tile = document.createElement('div');
    tile.style.width = '256px';
    tile.style.height = '256px';
    const key = `${coords.z}/${coords.x}/${coords.y}`;
    const cached = this._cache.get(key);
    if (cached) {
      tile.appendChild(cached);
      return tile;
    }
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    this._drawTile(ctx, coords);
    if (this._cache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this._cache.keys().next().value;
      if (firstKey) this._cache.delete(firstKey);
    }
    this._cache.set(key, canvas);
    tile.appendChild(canvas);
    return tile;
  }

  private _drawTile(ctx: CanvasRenderingContext2D, coords: Coords) {
    const { z, x, y } = coords;

    // Background
    ctx.fillStyle = '#1a1e24';
    ctx.fillRect(0, 0, 256, 256);

    // Subtle noise texture
    for (let i = 0; i < 800; i++) {
      const px = Math.random() * 256;
      const py = Math.random() * 256;
      const alpha = Math.random() * 0.04 + 0.01;
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fillRect(px, py, 1, 1);
    }

    // Major grid lines
    ctx.strokeStyle = 'rgba(100, 120, 140, 0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(128, 0); ctx.lineTo(128, 256);
    ctx.moveTo(0, 128); ctx.lineTo(256, 128);
    ctx.stroke();

    // Minor grid lines
    ctx.strokeStyle = 'rgba(100, 120, 140, 0.06)';
    ctx.lineWidth = 0.5;
    for (let i = 32; i < 256; i += 64) {
      if (i === 128) continue;
      ctx.beginPath();
      ctx.moveTo(i, 0); ctx.lineTo(i, 256);
      ctx.moveTo(0, i); ctx.lineTo(256, i);
      ctx.stroke();
    }

    // Coordinate labels at zoom >= 8
    if (z >= 8) {
      ctx.font = '10px monospace';
      ctx.fillStyle = 'rgba(139,149,109,0.4)';
      const lng = ((x * 360) / Math.pow(2, z)) - 180;
      const latRad = Math.atan(Math.sinh(Math.PI - (2 * Math.PI * y) / Math.pow(2, z)));
      const latDeg = latRad * (180 / Math.PI);
      ctx.fillText(`${lng.toFixed(2)}°`, 3, 12);
      ctx.fillText(`${latDeg.toFixed(2)}°`, 228, 245);
    }

    // Terrain hints based on coordinates
    const seed = this._hashCoords(x, y, z);
    const rng = this._seededRandom(seed);

    // Subtle terrain blobs
    for (let i = 0; i < 5; i++) {
      const tx = rng() * 256;
      const ty = rng() * 256;
      const tr = rng() * 40 + 15;
      const gradient = ctx.createRadialGradient(tx, ty, 0, tx, ty, tr);
      gradient.addColorStop(0, 'rgba(30,35,42,0.6)');
      gradient.addColorStop(1, 'rgba(26,30,36,0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(tx, ty, tr, 0, Math.PI * 2);
      ctx.fill();
    }

    // Road/route lines (subtle)
    if (rng() > 0.4) {
      ctx.strokeStyle = 'rgba(80,90,100,0.15)';
      ctx.lineWidth = rng() > 0.7 ? 2 : 1;
      ctx.beginPath();
      const sx = rng() * 256;
      const sy = rng() * 256;
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + (rng() - 0.5) * 180, sy + (rng() - 0.5) * 180);
      ctx.stroke();
    }

    // Water hint
    if (rng() > 0.85) {
      const wx = rng() * 200 + 28;
      const wy = rng() * 200 + 28;
      const wr = rng() * 50 + 20;
      const wGrad = ctx.createRadialGradient(wx, wy, 0, wx, wy, wr);
      wGrad.addColorStop(0, 'rgba(40,60,80,0.25)');
      wGrad.addColorStop(1, 'rgba(40,60,80,0)');
      ctx.fillStyle = wGrad;
      ctx.beginPath();
      ctx.ellipse(wx, wy, wr, wr * 0.6, rng() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }

    // Urban area hint
    if (rng() > 0.75) {
      const ux = rng() * 220 + 18;
      const uy = rng() * 220 + 18;
      const uw = rng() * 30 + 10;
      ctx.fillStyle = 'rgba(55,58,65,0.3)';
      for (let b = 0; b < 3; b++) {
        ctx.fillRect(
          ux + (rng() - 0.5) * uw,
          uy + (rng() - 0.5) * uw,
          rng() * 15 + 5,
          rng() * 15 + 5
        );
      }
    }

    // Tile border (very subtle)
    ctx.strokeStyle = 'rgba(70,80,90,0.08)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(0.5, 0.5, 255, 255);
  }

  private _hashCoords(x: number, y: number, z: number): number {
    let h = z * 31;
    h = (h * 17 + x) | 0;
    h = (h * 23 + y) | 0;
    return Math.abs(h);
  }

  private _seededRandom(seed: number): () => number {
    let s = seed;
    return () => {
      s = (s * 1664525 + 1013904223) & 0x7fffffff;
      return s / 0x7fffffff;
    };
  }
}
