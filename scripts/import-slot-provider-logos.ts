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
    // Provided single-tile PNGs (Slots)
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_SL-AP-5a94b23d-6397-424e-aec8-0d28a3a87aca.png",
      outFile: "advantplay.png"
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_SL-HC-c3dd273b-89fb-4c97-90fa-74f612a0db6f.png",
      outFile: "hacksaw.png"
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_SL-CQ9-5227d40f-d5ba-4547-9466-89256dc6ed08.png",
      outFile: "cq9-gaming.png"
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_SL-ATG-7102d023-2586-4a19-9d0e-d439d6ebf187.png",
      outFile: "atg-games.png"
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_SL-FC-193ed5ce-9909-488f-aca2-d3476ab575c7.png",
      outFile: "fa-chai.png"
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_SL-JDB2-6e382ce5-0891-4c55-94d2-40358873b514.png",
      outFile: "jdb-slot.png"
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_SL-PP-25c948ac-5ce7-4d3a-99ad-01c94b3386d8.png",
      outFile: "pragmatic-play.png"
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_SL-GMN-17f76a68-30ee-48fc-9a3e-822dbdee0056.png",
      outFile: "xgemini.png"
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_SL-DS-97d0495a-1fc2-45c1-a841-d432f43051df.png",
      outFile: "dragoon-soft.png"
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_SL-DRG-c51269b5-11ae-49fe-a3a1-74b32d4da2a9.png",
      outFile: "dragon-gaming.png"
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_SL-PS-85ee98a9-3193-4349-8f9b-bd97af5f8b7c.png",
      outFile: "ps.png"
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_SL-FS-45a41519-dbf6-4843-a662-1b26448b7ca7.png",
      outFile: "fastspin.png"
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_SL-BTG-abd50d30-1db5-4ef9-98ae-c888d40c290c.png",
      outFile: "bt-gaming.png"
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_SL-JKR-af0a0031-f001-473c-bf2e-3f6c28bd468d.png",
      outFile: "joker.png"
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_SL-HB-de62f5de-2bc8-48b9-a7dd-3d20eee93cb7.png",
      outFile: "habanero.png"
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_SL-NS-59cc598c-09ed-422a-8e74-d4b5dab0036d.png",
      outFile: "nextspin.png"
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_SL-BNG-25ed7d64-ebc7-436e-9c8f-8826e1a5a882.png",
      outFile: "bng.png"
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_SL-NT-b7aae2aa-2e74-482a-bb2e-47f30127c8c9.png",
      outFile: "netent.png"
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_SL-JL-64e47bbc-0ff9-4a6b-b639-df9cc5e7b34b.png",
      outFile: "jili.png"
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_SL-MT-c773a653-aebd-4e70-9ec8-db3ea08d1f37.png",
      outFile: "mt.png"
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_SL-EP-5f387dee-0ea6-4829-9628-2bb0b9535122.png",
      outFile: "evoplay.png"
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_SL-MGP-e4d76537-fb41-4134-86eb-dcb35866ccc1.png",
      outFile: "microgaming.png"
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_SL-FG-efbe1933-e2cb-4fe9-9de7-e6f703bf2e1f.png",
      outFile: "funky-games.png"
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_SL-PT4-31b8fc40-f546-443a-a1f0-c38171c091c1.png",
      outFile: "playtech-slot.png"
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_SL-RG-2c35f576-45fc-4611-a00f-a0bb8b583286.png",
      outFile: "relax-gaming.png"
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_SL-NLC-80050ca7-efde-4f00-b216-e2619119e8c5.png",
      outFile: "nolimit-city.png"
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_SL-SW-a08a4bfe-64cc-4db4-b9a4-409a046f8ec4.png",
      outFile: "skywind-group.png"
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_SL-YGR-57d156d8-bc7e-4282-bf9e-70d573172c3f.png",
      outFile: "ygr.png"
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_SL-VP-c8bc999b-5b27-44fc-9b79-26382aafeb90.png",
      outFile: "v-power.png"
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_SL-R88-39aaad6e-7326-4bad-aa2f-1f7736421dc5.png",
      outFile: "r88.png"
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_SL-YB-6182f32a-8bf9-4b97-a8d1-68b5e4688828.png",
      outFile: "yellow-bat.png"
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_SL-EXS-85866f5a-19ef-469f-b115-bef437833b34.png",
      outFile: "xpans-studios.png"
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_SL-MEGA-497ce9e2-2322-430c-9546-247e700d06d6.png",
      outFile: "mega888.png"
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_SL-SG-94a20847-fe45-4bfb-98d3-6de4ed739d92.png",
      outFile: "spadegaming.png"
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_SL-RT2-566de675-835e-42c4-839a-a56f7f805afa.png",
      outFile: "red-tiger.png"
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_SL-YGG-5d050d4c-88f8-4756-82e3-747cd3545b45.png",
      outFile: "yggdrasil.png"
    },
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_SL-RSG-859f30b4-d3c4-4f38-81dd-9a6516a9890a.png",
      outFile: "royal-slot-gaming.png"
    },
    // Some providers already exist; keep your latest version by putting duplicates last if needed.
    {
      src: "C:/Users/Lee/.cursor/projects/c-Users-Lee-Desktop-Website/assets/c__Users_Lee_AppData_Roaming_Cursor_User_workspaceStorage_0c36e1b007aad2fa5e5de0895020fc13_images_SL-SCR2-4f8c0a3a-21b6-46de-84fb-ea78771d7c17.png",
      outFile: "918kiss.png"
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

  console.log(`slot-logo-import: created=${created.length} skipped_existing=${skipped.length} missing_src=${missing.length}`);
  if (created.length) console.log(`created: ${created.join(", ")}`);
  if (missing.length) console.log(`missing: ${missing.join(", ")}`);
}

main();

