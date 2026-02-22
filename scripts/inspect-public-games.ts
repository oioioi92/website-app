import "dotenv/config";
import { getActiveGamesForUi } from "@/lib/public/public-data";

async function main() {
  const limit = Number(process.argv[2] ?? 30) || 30;
  const list = await getActiveGamesForUi(limit);
  const slim = list.map((x, idx) => ({
    i: idx,
    name: x.name,
    code: x.code,
    logoUrl: x.logoUrl
  }));
  console.log(JSON.stringify({ limit, count: list.length, items: slim }, null, 2));
}

main().catch((e) => {
  console.error("INSPECT_ERROR", e instanceof Error ? e.message : String(e));
  process.exit(1);
});

