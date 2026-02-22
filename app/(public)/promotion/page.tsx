import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// Keep existing /bonus route, but add /promotion tab alias as requested.
export default function PromotionTabPage() {
  redirect("/bonus");
}

