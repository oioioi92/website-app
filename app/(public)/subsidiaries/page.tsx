import { redirect } from "next/navigation";

export default function SubsidiariesPage() {
  // Backward-compatible alias: the badge and docs now use /partnership
  redirect("/partnership");
}

