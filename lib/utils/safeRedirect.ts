export function safeRedirectUrl(raw: string | null | undefined): string | null {
  const s = (raw ?? "").trim();
  if (!s) return null;

  // Allow relative internal redirects.
  if (s.startsWith("/")) {
    // Disallow protocol-relative URLs like //evil.com
    if (s.startsWith("//")) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/c61c53b9-4e86-47a3-ab7a-2e00967a7a09',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'sec-audit-pre',hypothesisId:'H1',location:'lib/utils/safeRedirect.ts:12',message:'safeRedirectUrl reject protocol-relative',data:{kind:'protocol-relative'},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      return null;
    }
    // Disallow backslashes and control chars.
    if (/[\\\u0000-\u001f\u007f]/.test(s)) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/c61c53b9-4e86-47a3-ab7a-2e00967a7a09',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'sec-audit-pre',hypothesisId:'H1',location:'lib/utils/safeRedirect.ts:18',message:'safeRedirectUrl reject invalid-chars',data:{kind:'invalid-chars'},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      return null;
    }
    return s;
  }

  // Allow only http(s) absolute URLs.
  try {
    const u = new URL(s);
    if (u.protocol !== "http:" && u.protocol !== "https:") {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/c61c53b9-4e86-47a3-ab7a-2e00967a7a09',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'sec-audit-pre',hypothesisId:'H1',location:'lib/utils/safeRedirect.ts:29',message:'safeRedirectUrl reject bad-proto',data:{kind:'bad-proto'},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      return null;
    }
    if (!u.hostname) return null;
    return u.toString();
  } catch {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/c61c53b9-4e86-47a3-ab7a-2e00967a7a09',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'sec-audit-pre',hypothesisId:'H1',location:'lib/utils/safeRedirect.ts:37',message:'safeRedirectUrl reject parse-fail',data:{kind:'parse-fail'},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    return null;
  }
}

