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
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_F-MT-db3a1c39-305a-4ae6-a2e2-0918b7722b4f.png",
      outFile: "mt.png"
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_F-JL-76d7ec5f-89ce-4b04-82fc-31dd7998a9cf.png",
      outFile: "jili.png"
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_F-SG2-097cfa17-c96a-453a-a0d8-51d110150ed0.png",
      outFile: "spadegaming.png"
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_F-YB-e0124fb0-bdda-418f-ab8d-ec231d4d11e0.png",
      outFile: "yellow-bat.png"
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_F-YGR-936abd80-8c7c-4d68-84f1-d9eb198a8fb6.png",
      outFile: "ygr.png"
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_F-CQ9-093f2b81-43ff-4353-9824-3add90c39df7.png",
      outFile: "cq9-gaming.png"
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_F-JKR-8a2c19eb-6b45-43e8-b087-646d463e2646.png",
      outFile: "joker.png"
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_F-FC-28c687da-c243-4bef-9d4d-fbb43cd09475.png",
      outFile: "fa-chai.png"
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

  console.log(`fishing-logo-import: created=${created.length} skipped_existing=${skipped.length} missing_src=${missing.length}`);
  if (created.length) console.log(`created: ${created.join(", ")}`);
  if (missing.length) console.log(`missing: ${missing.join(", ")}`);
}

main();

