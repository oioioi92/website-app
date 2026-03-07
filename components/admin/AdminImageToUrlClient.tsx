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
          res.status === 503 || json.error === "R2_NOT_CONFIGURED"
            ? "存储未配置（请配置 R2 环境变量）"
            : json.error === "INVALID_TYPE"
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
            <span>✅ 上传成功 — {result.filename}</span>
            {result.size > 0 && <span>（{(result.size / 1024).toFixed(1)} KB）</span>}
          </div>

          {/* 只展示 API 返回的地址，绝不使用当前页 origin，避免暴露后台域名 */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <label className="block text-xs font-semibold text-blue-700 mb-1">
              📋 图片地址（复制后粘贴到主题等后台各处）
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={result.url}
                className="flex-1 min-w-0 rounded-lg border border-blue-200 bg-white px-3 py-2 text-[13px] text-slate-800 font-mono"
              />
              <button
                type="button"
                onClick={() => copyToClipboard(result.url, "relative")}
                className="shrink-0 px-4 py-2 rounded-lg bg-blue-600 text-white text-[13px] font-medium hover:bg-blue-700"
              >
                {copied === "relative" ? "✓ 已复制" : "复制"}
              </button>
            </div>
            {result.url.startsWith("/") ? (
              <p className="mt-2 text-[11px] text-amber-700">
                生产环境请配置 R2 云存储，或在 .env 中设置 <strong>NEXT_PUBLIC_UPLOAD_PUBLIC_URL</strong> 为前台域名（如 https://admin1167.com），否则图片可能无法访问。
              </p>
            ) : (
              <p className="mt-2 text-[11px] text-blue-600">
                此地址可直接用于前台，不会暴露后台域名。
              </p>
            )}
          </div>

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
