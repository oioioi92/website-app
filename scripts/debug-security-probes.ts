import { safeRedirectUrl } from "@/lib/utils/safeRedirect";

function probeRedirect(raw: string) {
  const out = safeRedirectUrl(raw);
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/c61c53b9-4e86-47a3-ab7a-2e00967a7a09',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'sec-audit-pre',hypothesisId:'H1',location:'scripts/debug-security-probes.ts:6',message:'probe safeRedirectUrl',data:{inputKind:raw.startsWith("/")?"relative":"absolute",allowed:!!out,allowedIsRelative:!!out&&out.startsWith("/")},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
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

