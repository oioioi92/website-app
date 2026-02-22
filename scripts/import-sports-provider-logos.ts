import fs from "node:fs";
import path from "node:path";

type Item = { src: string; outFile: string };

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

function main() {
  const outDir = path.join(process.cwd(), "public", "assets", "providers");
  ensureDir(outDir);
  const overwrite = process.argv.includes("--overwrite");

  const items: Item[] = [
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_S-BTI-2be2cbbd-ec4d-4fd5-94e0-0d9377bac800.png",
      outFile: "bti.png"
    },
    {
      // 图上是 SABA SPORTS（文件名里是 IBC）
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_S-IBC-ce4ef088-db0e-454b-aa1d-0120d178d1bb.png",
      outFile: "saba-sports.png"
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_S-CMD-0effc4f7-f323-4419-b22f-413c2c0a823f.png",
      outFile: "cmd368.png"
    },
    {
      // 图上是 M9BET（文件名里是 M8）
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_S-M8-85005737-a0d5-4427-9c74-262fc3d1f635.png",
      outFile: "m9bet.png"
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_S-SBO2-16e50b23-36bd-4194-816a-df81380d39f2.png",
      outFile: "sbobet.png"
    }
  ];

  const created: string[] = [];
  const skipped: string[] = [];
  const missing: string[] = [];

  for (const item of items) {
    const targetPath = path.join(outDir, item.outFile);
    if (!overwrite && fs.existsSync(targetPath)) {
      skipped.push(item.outFile);
      continue;
    }
    if (!fs.existsSync(item.src)) {
      missing.push(path.basename(item.src));
      continue;
    }
    fs.copyFileSync(item.src, targetPath);
    created.push(item.outFile);
  }

  console.log(`sports-logo-import: created=${created.length} skipped_existing=${skipped.length} missing_src=${missing.length}`);
  if (created.length) console.log(`created: ${created.join(", ")}`);
  if (missing.length) console.log(`missing: ${missing.join(", ")}`);
}

main();

