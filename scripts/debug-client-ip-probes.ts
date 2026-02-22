import { getClientIp } from "@/lib/net/clientIp";

function mk(h: Record<string, string>) {
  return new Headers(h);
}

async function main() {
  // Expect: uses x-real-ip (no log emitted for that branch).
  void getClientIp(mk({ "x-real-ip": "203.0.113.9", "x-forwarded-for": "1.2.3.4, 5.6.7.8" }));

  // Expect: uses x-forwarded-for (log emitted, but no IP value is logged).
  void getClientIp(mk({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" }));

  // Expect: falls back to local (log emitted).
  void getClientIp(mk({}));

  console.log("ip probes ok");
}

void main();

