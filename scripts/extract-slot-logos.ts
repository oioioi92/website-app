import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";

type RowSpec = {
  src: string;
  // 4 columns max; use null for missing tile (last row only has 3)
  outFiles: Array<string | null>;
};

function readPng(filePath: string): PNG {
  const buf = fs.readFileSync(filePath);
  return PNG.sync.read(buf);
}

function cropPng(src: PNG, x0: number, y0: number, w: number, h: number): PNG {
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

function getPixel(png: PNG, x: number, y: number) {
  const xx = Math.max(0, Math.min(png.width - 1, x));
  const yy = Math.max(0, Math.min(png.height - 1, y));
  const i = (yy * png.width + xx) << 2;
  return {
    r: png.data[i],
    g: png.data[i + 1],
    b: png.data[i + 2],
    a: png.data[i + 3]
  };
}

function avgColor(samples: Array<{ r: number; g: number; b: number }>) {
  const sum = samples.reduce(
    (acc, s) => ({ r: acc.r + s.r, g: acc.g + s.g, b: acc.b + s.b }),
    { r: 0, g: 0, b: 0 }
  );
  const n = Math.max(1, samples.length);
  return { r: sum.r / n, g: sum.g / n, b: sum.b / n };
}

function keyOutBackgroundLightBlue(png: PNG) {
  // Sample a few "very likely background" points (bottom band area).
  const y = png.height - 4;
  const samples = [
    getPixel(png, 4, y),
    getPixel(png, Math.floor(png.width * 0.5), y),
    getPixel(png, png.width - 5, y),
    getPixel(png, 4, png.height - 10),
    getPixel(png, png.width - 5, png.height - 10)
  ]
    .filter((p) => p.a > 0)
    .map((p) => ({ r: p.r, g: p.g, b: p.b }));
  const key = avgColor(samples.length ? samples : [{ r: 210, g: 240, b: 250 }]);

  // Higher tolerance, but only for bright pixels (keeps dark label text).
  const tol = 62;
  const minBgLuma = 175;

  for (let i = 0; i < png.data.length; i += 4) {
    const a = png.data[i + 3];
    if (a === 0) continue;
    const luma = (png.data[i] + png.data[i + 1] + png.data[i + 2]) / 3;
    if (luma < minBgLuma) continue;
    const dr = png.data[i] - key.r;
    const dg = png.data[i + 1] - key.g;
    const db = png.data[i + 2] - key.b;
    const dist = Math.sqrt(dr * dr + dg * dg + db * db);
    if (dist <= tol) {
      png.data[i + 3] = 0;
    }
  }
}

function clearBrightBands(png: PNG, opts: { top: number; bottom: number }) {
  // The source sheet includes a light-blue background and a light-blue label band.
  // We keep the text (darker), but make the bright band pixels transparent.
  const minBgLuma = 185;

  const topH = Math.max(0, Math.min(png.height, opts.top));
  const bottomH = Math.max(0, Math.min(png.height, opts.bottom));

  for (let y = 0; y < topH; y++) {
    for (let x = 0; x < png.width; x++) {
      const i = (y * png.width + x) << 2;
      const a = png.data[i + 3];
      if (a === 0) continue;
      const luma = (png.data[i] + png.data[i + 1] + png.data[i + 2]) / 3;
      if (luma >= minBgLuma) png.data[i + 3] = 0;
    }
  }

  for (let y = png.height - bottomH; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const i = (y * png.width + x) << 2;
      const a = png.data[i + 3];
      if (a === 0) continue;
      const luma = (png.data[i] + png.data[i + 1] + png.data[i + 2]) / 3;
      if (luma >= minBgLuma) png.data[i + 3] = 0;
    }
  }
}

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

function main() {
  const outDir = path.join(process.cwd(), "public", "assets", "providers");
  ensureDir(outDir);
  const overwrite = process.argv.includes("--overwrite");

  const rows: RowSpec[] = [
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images__C0C8C930-11CE-4A55-B707-5B64864E3CCA_-2e4e5021-0d96-433c-9623-972cd1adebc8.png",
      outFiles: ["epic-win.png", "rich-gaming.png", "jili.png", "megah5.png"]
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_image-ba0dd759-1c2f-4220-b5e1-04f7d525997b.png",
      outFiles: ["v-power.png", "918kiss-h5.png", "meta-gaming.png", "cp-games.png"]
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_image-86d86eaf-fcec-4126-a770-5fbe6737b625.png",
      outFiles: ["vplus.png", "jdb-slot.png", "acewin.png", "playtech-slot.png"]
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_image-8c3514d7-afe4-4e3f-b022-0342b58fd770.png",
      outFiles: ["fa-chai.png", "rich-gaming.png", "i-bex.png", "wf-gaming.png"]
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_image-2ee5e6f7-dc65-4763-af7d-d0d63ce16035.png",
      outFiles: ["croco-gaming.png", "clotplay.png", "pussy888.png", "bt-gaming.png"]
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_image-14635b35-89cf-4eff-97f0-208e545b2ad5.png",
      outFiles: ["pussy888.png", "918kiss.png", "evo888h5.png", "918kiss.png"]
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_image-b45dd1c1-c4bd-4d4b-a061-e8c8733bb682.png",
      outFiles: ["mega888.png", "mega888.png", "monkey888.png", "spadegaming.png"]
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_image-0a15b848-bb4b-47b4-a09a-5bf526ede046.png",
      outFiles: ["ygr.png", "ka-gaming.png", "playstar.png", "bigpot-gaming.png"]
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_image-778d4188-7e7d-4a85-9d44-f9b6b79e95b9.png",
      outFiles: ["rich88.png", "live22.png", "uu-slots.png", "dragoon-soft.png"]
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_image-cce38af9-46df-44b1-b94a-3a7b047088ae.png",
      outFiles: ["lucky365.png", "3win8.png", "918kiss-html5.png", "lion-king.png"]
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_image-e8281448-81b8-4e5b-9810-b8d9b5695631.png",
      outFiles: ["hacksaw.png", "microgaming.png", "epic-win.png", "relax-gaming.png"]
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_image-13b5401f-976b-44b5-ba8e-bfe87a412ab8.png",
      outFiles: ["funta-gaming.png", "joker.png", "pegasus.png", "ace333.png"]
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_image-66bd39dc-62bd-4182-9848-2cde3598a49e.png",
      outFiles: ["nextspin.png", "habanero.png", "royal-slot-gaming.png", null]
    },
    // LIVE set (2 rows)
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_image-3b3fafda-d38a-4141-b6f6-516aba0c5163.png",
      outFiles: ["king855.png", "yeebet.png", "playtech-live.png", "dream-gaming.png"]
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_image-3b65a41d-86b4-4de0-8f3c-f91ea678a4ea.png",
      outFiles: ["pragmatic-play-live.png", "wm-casino.png", "evolution-gaming.png", "ebet.png"]
    },
    // FISHING set (2 rows)
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_image-bf248b47-7170-487e-8e27-ad40ea477668.png",
      outFiles: ["playstar.png", "joker.png", "jdb-fishing.png", null]
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_image-85c08bf2-618a-427e-9a26-2bb352e374c2.png",
      outFiles: ["jili.png", "jdb-fishing.png", "yl-fishing.png", "spadegaming.png"]
    },
    // SPORTBOOK set
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_image-ad44c73f-e099-4708-b097-5b6ec7130d05.png",
      outFiles: ["maxbet.png", "obet33.png", "m8bet.png", "sbobet.png"]
    },
    // OTHER set (3 tiles)
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_image-f44d10a3-4377-4d04-889e-04a40e896ff0.png",
      outFiles: ["sv388.png", "rcb988.png", "e1sport.png", null]
    }
  ];

  const cols = 4;
  const created: string[] = [];
  const skipped: string[] = [];

  for (const row of rows) {
    const srcPng = readPng(row.src);
    for (let col = 0; col < cols; col++) {
      const fileName = row.outFiles[col] ?? null;
      if (!fileName) continue;
      const targetPath = path.join(outDir, fileName);
      if (!overwrite && fs.existsSync(targetPath)) {
        skipped.push(fileName);
        continue;
      }

      // Robust slicing even when width isn't divisible by 4 (e.g. 1023px).
      const x0 = Math.round((col * srcPng.width) / cols);
      const x1 = Math.round(((col + 1) * srcPng.width) / cols);
      const tile = cropPng(srcPng, x0, 0, x1 - x0, srcPng.height);

      // Remove the light-blue sheet background (keep card + label).
      keyOutBackgroundLightBlue(tile);
      // Also clear the top spill from previous row and the label band background.
      clearBrightBands(tile, { top: 14, bottom: 44 });

      fs.writeFileSync(targetPath, PNG.sync.write(tile));
      created.push(fileName);
    }
  }

  // Keep output short but useful.
  console.log(`slot-logos: created=${created.length} skipped_existing=${skipped.length}`);
  if (created.length) console.log(`created: ${created.join(", ")}`);
}

main();

