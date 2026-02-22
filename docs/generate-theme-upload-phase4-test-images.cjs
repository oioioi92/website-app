#!/usr/bin/env node
// Generate Phase 4 upload test files under docs/test-images/.
//
// This generator avoids manual prep of >2MB files and >4096px images.
// It only uses dependencies already present in this repo (pngjs).

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "docs", "test-images");

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function writeTextIfMissing(p, content) {
  if (fs.existsSync(p)) return;
  fs.writeFileSync(p, content, "utf8");
}

async function writePngIfMissing(p, w, h) {
  if (fs.existsSync(p)) return;
  const { PNG } = require("pngjs");
  const png = new PNG({ width: w, height: h });
  // Fill with a simple gradient to ensure it is valid.
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (w * y + x) << 2;
      png.data[idx] = x % 256; // R
      png.data[idx + 1] = y % 256; // G
      png.data[idx + 2] = 120; // B
      png.data[idx + 3] = 255; // A
    }
  }
  const buf = PNG.sync.write(png);
  fs.writeFileSync(p, buf);
}

function writeBigJpgIfMissing(p, minBytes) {
  if (fs.existsSync(p)) {
    const s = fs.statSync(p).size;
    if (s >= minBytes) return;
  }
  // This file does NOT need to be a valid jpeg; the API should reject by size first.
  // We still name it .jpg to let curl set image/jpeg by default when needed.
  const size = minBytes + 16 * 1024;
  const buf = Buffer.alloc(size, 0x41); // 'A'
  fs.writeFileSync(p, buf);
}

async function main() {
  ensureDir(outDir);

  await writePngIfMissing(path.join(outDir, "ok.png"), 64, 64);
  await writePngIfMissing(path.join(outDir, "too-large-dimension.png"), 5000, 1); // width > 4096

  writeTextIfMissing(
    path.join(outDir, "bad.svg"),
    `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="10" y="50">BAD</text></svg>\n`
  );

  // Fake png (declared as image/png in curl but not decodable).
  writeTextIfMissing(path.join(outDir, "fake.png"), "NOT_A_REAL_PNG\n");

  writeBigJpgIfMissing(path.join(outDir, "too-big.jpg"), 2 * 1024 * 1024);

  console.log(JSON.stringify({ ok: true, outDir }, null, 2));
  console.log("Generated files:");
  for (const f of ["ok.png", "bad.svg", "fake.png", "too-big.jpg", "too-large-dimension.png"]) {
    const fp = path.join(outDir, f);
    const st = fs.statSync(fp);
    console.log(`- ${fp} (${st.size} bytes)`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

