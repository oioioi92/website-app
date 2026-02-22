import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";

type GridSpec = {
  src: string;
  // Rows -> Cols, use null for empty tiles (if any).
  out: Array<Array<string | null>>;
};

function readPng(filePath: string): PNG {
  const buf = fs.readFileSync(filePath);
  return PNG.sync.read(buf);
}

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

function isBackgroundWhite(png: PNG, x: number, y: number) {
  const xx = Math.max(0, Math.min(png.width - 1, x));
  const yy = Math.max(0, Math.min(png.height - 1, y));
  const i = (yy * png.width + xx) << 2;
  const r = png.data[i];
  const g = png.data[i + 1];
  const b = png.data[i + 2];
  const a = png.data[i + 3];
  if (a === 0) return true;
  return r > 245 && g > 245 && b > 245;
}

function segmentsByProjection(arr: number[], threshold: number) {
  const seg: Array<[number, number]> = [];
  let inSeg = false;
  let start = 0;
  for (let i = 0; i < arr.length; i++) {
    const on = arr[i] > threshold;
    if (on && !inSeg) {
      inSeg = true;
      start = i;
    }
    if (!on && inSeg) {
      inSeg = false;
      seg.push([start, i - 1]);
    }
  }
  if (inSeg) seg.push([start, arr.length - 1]);
  return seg;
}

function detectTileSegments(png: PNG) {
  const w = png.width;
  const h = png.height;

  // Projection (count non-background pixels) to find 3 columns / N rows.
  const col = Array(w).fill(0);
  for (let y = 20; y < h - 20; y++) {
    for (let x = 0; x < w; x++) {
      if (!isBackgroundWhite(png, x, y)) col[x]++;
    }
  }

  const row = Array(h).fill(0);
  for (let y = 0; y < h; y++) {
    for (let x = 20; x < w - 20; x++) {
      if (!isBackgroundWhite(png, x, y)) row[y]++;
    }
  }

  // These thresholds are tuned for the 690x813 screenshots you provided.
  const colSeg = segmentsByProjection(col, 80);
  const rowSeg = segmentsByProjection(row, 120);

  return { colSeg, rowSeg };
}

function cropPng(src: PNG, x0: number, y0: number, x1: number, y1: number): PNG {
  const w = Math.max(1, x1 - x0 + 1);
  const h = Math.max(1, y1 - y0 + 1);
  const out = new PNG({ width: w, height: h });

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const si = ((y0 + y) * src.width + (x0 + x)) << 2;
      const di = (y * w + x) << 2;
      out.data[di] = src.data[si];
      out.data[di + 1] = src.data[si + 1];
      out.data[di + 2] = src.data[si + 2];
      out.data[di + 3] = src.data[si + 3];
    }
  }

  return out;
}

function main() {
  const outDir = path.join(process.cwd(), "public", "assets", "providers");
  ensureDir(outDir);

  const overwrite = process.argv.includes("--overwrite");

  const sheets: GridSpec[] = [
    {
      // Screenshot #2 (Slots page 1)
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_image-7c4938b3-ef0b-4714-a0b0-118deb26df09.png",
      out: [
        ["nextspin.png", "spadegaming.png", "pragmatic-play.png"],
        ["jili.png", "fa-chai.png", "ps.png"],
        ["ygr.png", "microgaming.png", "joker.png"]
      ]
    },
    {
      // Screenshot #3 (Slots page 2)
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_image-a661e516-1f55-416c-b0ff-6d3db63d091f.png",
      out: [
        ["funky-games.png", "habanero.png", "mega888.png"],
        ["fastspin.png", "advantplay.png", "918kiss.png"],
        ["netent.png", "goldenbay.png", "mt.png"]
      ]
    },
    {
      // Screenshot #4 (Slots page 3)
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_image-d6e975fb-269f-469c-b382-7931d44b74ad.png",
      out: [
        ["xpans-studios.png", "nolimit-city.png", "skywind-group.png"],
        ["jdb-slot.png", "r88.png", "hacksaw.png"],
        ["xgemini.png", "dng.png", "bt-gaming.png"]
      ]
    },
    {
      // Screenshot #5 (Slots page 4)
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_image-f963ada5-64da-4173-812c-90056227223a.png",
      out: [["red-tiger.png", "royal-slot-gaming.png", "atg-games.png"]]
    }
  ];

  const created: string[] = [];
  const skipped: string[] = [];

  for (const sheet of sheets) {
    const srcPng = readPng(sheet.src);
    const { colSeg, rowSeg } = detectTileSegments(srcPng);

    for (let r = 0; r < sheet.out.length; r++) {
      const row = sheet.out[r];
      const ys = rowSeg[r];
      if (!ys) continue;
      const [y0, y1] = ys;

      for (let c = 0; c < row.length; c++) {
        const fileName = row[c] ?? null;
        if (!fileName) continue;
        const xs = colSeg[c];
        if (!xs) continue;
        const [x0, x1] = xs;

        const targetPath = path.join(outDir, fileName);
        if (!overwrite && fs.existsSync(targetPath)) {
          skipped.push(fileName);
          continue;
        }

        const tile = cropPng(srcPng, x0, y0, x1, y1);
        fs.writeFileSync(targetPath, PNG.sync.write(tile));
        created.push(fileName);
      }
    }
  }

  console.log(`slot-logos-v2: created=${created.length} skipped_existing=${skipped.length}`);
  if (created.length) console.log(`created: ${created.join(", ")}`);
  if (skipped.length) console.log(`skipped: ${skipped.slice(0, 25).join(", ")}${skipped.length > 25 ? ", ..." : ""}`);
}

main();

