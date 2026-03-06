import { safeRedirectUrl } from "@/lib/utils/safeRedirect";

function probeRedirect(raw: string) {
  safeRedirectUrl(raw);
}

async function main() {
  probeRedirect("javascript:alert(1)");
  probeRedirect("//evil.example/path");
  probeRedirect("/good/path");
  probeRedirect("https://example.com/path");
  probeRedirect("file:///etc/passwd");
  console.log("probes ok");
}

void main();

