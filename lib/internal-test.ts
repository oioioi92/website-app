import { NextResponse } from "next/server";

export function ensureInternalTestMode() {
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/c61c53b9-4e86-47a3-ab7a-2e00967a7a09',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'sec-audit-pre',hypothesisId:'H4',location:'lib/internal-test.ts:5',message:'ensureInternalTestMode checked',data:{enabled:(process.env.INTERNAL_TEST_MODE??"0")==="1"},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  if ((process.env.INTERNAL_TEST_MODE ?? "0") !== "1") {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  return null;
}
