"use client";

import { useState, useRef } from "react";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_MB = 5;

type Result = { url: string; filename: string; size: number };

export function AdminImageToUrlClient() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState<"relative" | "full" | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setResult(null);
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("仅支持 JPG、PNG、WEBP、GIF 格式");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`文件不能超过 ${MAX_MB}MB`);
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload/image", {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          json.error === "INVALID_TYPE"
            ? "仅支持 JPG/PNG/WEBP/GIF"
            : json.error === "FILE_TOO_LARGE"
              ? `文件超过 ${MAX_MB}MB 限制`
              : json.error === "UNAUTHORIZED"
                ? "请重新登录"
                : json.error ? String(json.error) : `上传失败（${res.status}）`
        );
        return;
      }
      if (json.ok && json.url) {
        setResult({ url: json.url, filename: json.filename ?? "", size: json.size ?? 0 });
      } else {
        setError("服务器未返回网址");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "上传失败，请检查网络");
    } finally {
      setUploading(false);
    }
  }

  function copyToClipboard(text: string, kind: "relative" | "full") {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(kind);
        setTimeout(() => setCopied(null), 2000);
      },
      () => setError("复制失败")
    );
  }

  const fullUrl = result && typeof window !== "undefined" ? `${window.location.origin}${result.url}` : null;

  return (
    <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-panel)] p-6 max-w-2xl">
      <h2 className="text-base font-semibold text-[var(--admin-text)] mb-1">上传图片 → 获取网址</h2>
      <p className="text-[13px] text-[var(--admin-muted)] mb-4">
        支持 JPG / PNG / WEBP / GIF，单张最大 {MAX_MB}MB。上传后得到可填到后台各处的图片链接。
      </p>

      <div
        className={
          uploading
            ? "border-2 border-dashed border-blue-400 rounded-lg p-8 text-center bg-blue-500/10 pointer-events-none"
            : "border-2 border-dashed border-[var(--admin-border)] rounded-lg p-8 text-center hover:border-blue-400 cursor-pointer transition-colors"
        }
        onClick={() => !uploading && fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const f = e.dataTransfer.files[0];
          if (f) handleFile(f);
        }}
      >
        <input
          ref={fileRef}
          type="file"
          accept={ALLOWED_TYPES.join(",")}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
        {uploading ? (
          <p className="text-[var(--admin-text)]">上传中…</p>
        ) : (
          <>
            <span className="text-4xl block mb-2">🖼️</span>
            <p className="text-[var(--admin-text)]">点击选择或拖拽图片到此处</p>
            <p className="text-[12px] text-[var(--admin-muted)] mt-1">JPG / PNG / WEBP / GIF，最大 {MAX_MB}MB</p>
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 text-[13px]">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-2 text-[12px] text-[var(--admin-muted)]">
            <span>文件名：{result.filename}</span>
            {result.size > 0 && <span>（{(result.size / 1024).toFixed(1)} KB）</span>}
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--admin-muted)] mb-1">站内路径（用于后台粘贴）</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={result.url}
                className="flex-1 min-w-0 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-panel2)] px-3 py-2 text-[13px] text-[var(--admin-text)]"
              />
              <button
                type="button"
                onClick={() => copyToClipboard(result.url, "relative")}
                className="shrink-0 px-4 py-2 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-panel2)] text-[13px] text-[var(--admin-text)] hover:bg-[var(--admin-hover)]"
              >
                {copied === "relative" ? "已复制" : "复制"}
              </button>
            </div>
          </div>

          {fullUrl && (
            <div>
              <label className="block text-xs font-medium text-[var(--admin-muted)] mb-1">完整网址（用于外部分享）</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={fullUrl}
                  className="flex-1 min-w-0 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-panel2)] px-3 py-2 text-[13px] text-[var(--admin-text)]"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(fullUrl, "full")}
                  className="shrink-0 px-4 py-2 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-panel2)] text-[13px] text-[var(--admin-text)] hover:bg-[var(--admin-hover)]"
                >
                  {copied === "full" ? "已复制" : "复制"}
                </button>
              </div>
            </div>
          )}

          {result.url && (
            <div className="pt-2">
              <label className="block text-xs font-medium text-[var(--admin-muted)] mb-1">预览</label>
              <div className="rounded-lg overflow-hidden border border-[var(--admin-border)] inline-block max-w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={result.url} alt={result.filename} className="max-h-40 object-contain" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
