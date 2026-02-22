import "dotenv/config";
import { seedTestScenarios } from "../lib/test/seed-test-scenarios";

async function main() {
  const result = await seedTestScenarios();
  console.log(
    `SEED_TEST_OK: members=${result.members.length} promotions=${result.promotions.length} sheet=${result.sheetId} internal=${result.internalMode ? 1 : 0}`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
