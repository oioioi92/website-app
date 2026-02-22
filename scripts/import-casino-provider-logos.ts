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
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_C-SA-561edc69-2a2c-47a3-a491-18fbb58867c1.png",
      outFile: "sa-gaming.png"
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_C-UG-4fc3da28-5b64-42df-8df6-10fa99f402fe.png",
      outFile: "sexy-baccarat.png"
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_C-WM-976f0ba8-f360-4ba6-8777-7f3e978d88ce.png",
      outFile: "wm-casino.png"
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_C-AG2-d46de57f-763c-461c-b346-644837245116.png",
      outFile: "playace.png"
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_C-DG-fb7170d7-d301-42cf-8a9d-5b7a1e1f7cca.png",
      outFile: "dream-gaming.png"
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_C-EZ-80ad9bf6-3e0c-4c4e-9410-7322c52bdf83.png",
      outFile: "ezugi.png"
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_C-PPL-c8514f50-bbfb-48a3-9956-fd2be697d422.png",
      outFile: "pragmatic-play-live.png"
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_C-EVO-ccc53e18-9ee9-451a-ba83-8736126478e3.png",
      outFile: "evolution-gaming.png"
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_C-MTL-08e12c68-0950-4921-84cb-4e68cefb5c5f.png",
      outFile: "mt-live.png"
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

  console.log(`casino-logo-import: created=${created.length} skipped_existing=${skipped.length} missing_src=${missing.length}`);
  if (created.length) console.log(`created: ${created.join(", ")}`);
  if (missing.length) console.log(`missing: ${missing.join(", ")}`);
}

main();

