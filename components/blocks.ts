import { z } from "zod";
import { blockSchema } from "@/lib/validators";

export type Block = z.infer<typeof blockSchema>;

export function normalizeBlocks(input: unknown): Block[] {
  const parsed = z.object({ blocks: z.array(blockSchema) }).safeParse(input);
  if (!parsed.success) return [];
  return parsed.data.blocks;
}
