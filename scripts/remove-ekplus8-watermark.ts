import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";

function readPng(filePath: string): PNG {
  return PNG.sync.read(fs.readFileSync(filePath));
}

function writePng(filePath: string, png: PNG) {
  fs.writeFileSync(filePath, PNG.sync.write(png));
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function getPixel(png: PNG, x: number, y: number) {
  const xx = clamp(x, 0, png.width - 1);
  const yy = clamp(y, 0, png.height - 1);
  const i = (yy * png.width + xx) << 2;
  return { r: png.data[i], g: png.data[i + 1], b: png.data[i + 2], a: png.data[i + 3] };
}

function setPixel(png: PNG, x: number, y: number, p: { r: number; g: number; b: number; a: number }) {
  const i = (y * png.width + x) << 2;
  png.data[i] = p.r;
  png.data[i + 1] = p.g;
  png.data[i + 2] = p.b;
  png.data[i + 3] = p.a;
}

function isLikelyNonGameUiAsset(name: string) {
  const key = name.toLowerCase();
  return ["history", "home-button", "promotion", "livechat", "setting", "placeholder"].some((k) => key.includes(k));
}

function isSheetLightBlue(p: { r: number; g: number; b: number; a: number }) {
  if (p.a === 0) return false;
  // This is the common sheet/background color used in the source tiles.
  const dr = p.r - 201;
  const dg = p.g - 241;
  const db = p.b - 250;
  return dr * dr + dg * dg + db * db < 40 * 40;
}

function removeEkplus8(png: PNG) {
  // Default behavior: make watermark pixels transparent (stable, no band artifacts).
  const labelBandH = 44;
  const w = png.width;
  const h = png.height;

  const x0 = clamp(Math.round(w * 0.18), 0, w - 1);
  const x1 = clamp(Math.round(w * 0.82), 0, w - 1);
  const y0 = clamp(Math.round(h * 0.55), 0, h - 1);
  const y1 = clamp(h - labelBandH - 2, 0, h - 1);
  if (x1 <= x0 || y1 <= y0) return { changed: 0, detected: false };

  let changed = 0;
  const mask = new Uint8Array(w * h);
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const p = getPixel(png, x, y);
      if (p.a === 0) continue;
      if (isSheetLightBlue(p)) continue;

      const l = (p.r + p.g + p.b) / 3;
      const span = Math.max(p.r, p.g, p.b) - Math.min(p.r, p.g, p.b);

      // Watermark cyan is quite saturated; keep thresholds strict to avoid punching holes in background gradients.
      const cyanLike = p.r < 180 && p.g > 140 && p.b > 150 && (p.g + p.b - p.r) > 220 && l > 95;
      // Capture the anti-aliased edges too (white/gray).
      const textEdgeLike = l > 155 && span < 125;

      if (cyanLike || textEdgeLike) mask[y * w + x] = 1;
    }
  }

  // Dilate 2px to remove outlines/AA edges.
  const dilated = new Uint8Array(mask.length);
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      if (mask[y * w + x] === 0) continue;
      for (let oy = -2; oy <= 2; oy++) {
        for (let ox = -2; ox <= 2; ox++) {
          const xx = x + ox;
          const yy = y + oy;
          if (xx < x0 || xx > x1 || yy < y0 || yy > y1) continue;
          dilated[yy * w + xx] = 1;
        }
      }
    }
  }

  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      if (dilated[y * w + x] === 0) continue;
      const p = getPixel(png, x, y);
      if (p.a === 0) continue;
      if (isSheetLightBlue(p)) continue;
      setPixel(png, x, y, { r: p.r, g: p.g, b: p.b, a: 0 });
      changed++;
    }
  }

  return { changed, detected: changed > 120 };
}

function main() {
  const root = process.cwd();
  const providersDir = path.join(root, "public", "assets", "providers");
  const backupDir = path.join(providersDir, "_bak_ekplus8");
  fs.mkdirSync(backupDir, { recursive: true });
  const restore = process.argv.includes("--restore");
  const fileArgIdx = process.argv.findIndex((x) => x === "--file");
  const onlyFile = fileArgIdx >= 0 ? process.argv[fileArgIdx + 1] : null;

  if (restore) {
    const bakFiles = fs.readdirSync(backupDir).filter((f) => f.toLowerCase().endsWith(".png"));
    for (const f of bakFiles) {
      const src = path.join(backupDir, f);
      const dst = path.join(providersDir, f);
      if (fs.existsSync(src)) fs.copyFileSync(src, dst);
    }
    console.log(`ekplus8: restored_from_backup files=${bakFiles.length}`);
  }

  const files = fs
    .readdirSync(providersDir)
    .filter((f) => f.toLowerCase().endsWith(".png"))
    .filter((f) => !f.startsWith("_"))
    .filter((f) => !isLikelyNonGameUiAsset(f));
  const targets = onlyFile ? files.filter((f) => f === onlyFile) : files;

  let processed = 0;
  let changedFiles = 0;
  for (const file of targets) {
    const full = path.join(providersDir, file);
    const png = readPng(full);
    if (png.width < 160 || png.height < 160) continue;

    const { changed, detected } = removeEkplus8(png);
    processed++;
    if (!detected || changed === 0) continue;

    const bak = path.join(backupDir, file);
    if (!fs.existsSync(bak)) fs.copyFileSync(full, bak);
    writePng(full, png);
    changedFiles++;
  }

  console.log(`ekplus8: processed=${processed} changed=${changedFiles} backup_dir=${backupDir}`);
}

main();

