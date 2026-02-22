/**
 * maskPhoneTail4 单测。运行：npx tsx lib/utils/__tests__/mask.test.ts
 */
import { maskPhoneTail4 } from "../mask";

const cases: Array<[string | null | undefined, string]> = [
  ["+60 12-345 6789", "*******6789"],
  ["012 3456789", "*******6789"],
  ["123", "***123"],
  ["1", "***1"],
  ["", "****"],
  [null, "****"],
  [undefined, "****"],
  ["  1234  ", "*******1234"],
];

let passed = 0;
for (const [input, expected] of cases) {
  const got = maskPhoneTail4(input);
  if (got !== expected) {
    console.error(`FAIL maskPhoneTail4(${JSON.stringify(input)}) = ${JSON.stringify(got)}, expected ${JSON.stringify(expected)}`);
    process.exit(1);
  }
  passed++;
}
console.log(`maskPhoneTail4: ${passed} passed`);
