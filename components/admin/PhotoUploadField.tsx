"use client";

import { useRef, useState } from "react";

type Props = {
  label: string;
  hint?: string;
  value: string;
  onChange: (url: string) => void;
  required?: boolean;
  /** 上传目录模块，如 "providers" 用于 game provider logo，未配置 R2 时保存到 public/uploads/providers/ */
  uploadModule?: string;
};

export function PhotoUploadField({ label, hint = "", value, onChange, required, uploadModule }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setUploadErr(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (uploadModule) fd.append("module", uploadModule);
      const res = await fetch("/api/admin/upload/image", { method: "POST", credentials: "include", body: fd });
      const json: Record<string, unknown> = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        setUploadErr(
          res.status === 413 ? "图片太大" : res.status === 503 ? "存储未配置（R2）" : json.error === "FILE_TOO_LARGE" ? "超过 5MB" : json.error === "INVALID_TYPE" ? "仅支持 JPG/PNG/WEBP/GIF" : json.error === "UNAUTHORIZED" ? "请重新登录" : json.error === "R2_NOT_CONFIGURED" ? "R2 未配置（已改用本地上传）" : "上传失败"
        );
      } else {
        onChange(String(json.url ?? ""));
      }
    } catch (err) {
      setUploadErr(err instanceof Error ? err.message : "上传失败");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-[var(--admin-text)]">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="URL 或点击上传"
          className="flex-1 min-w-0 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-panel2)] px-3 py-2 text-[13px]"
        />
        <button type="button" disabled={uploading} onClick={() => fileRef.current?.click()} className="admin-compact-btn admin-compact-btn-ghost text-[12px] py-2 px-3">
          {uploading ? "…" : "上传"}
        </button>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
      </div>
      {uploadErr && <p className="text-[11px] text-red-500">{uploadErr}</p>}
      {value && (
        <div className="relative rounded-lg overflow-hidden border border-[var(--admin-border)] mt-2" style={{ maxHeight: 120 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="w-full object-cover" style={{ maxHeight: 120 }} onError={(e) => (e.currentTarget.style.display = "none")} />
          <button type="button" onClick={() => onChange("")} className="absolute top-1 right-1 rounded bg-black/60 text-white text-[11px] px-1.5 py-0.5">✕</button>
        </div>
      )}
      {hint && <p className="text-[11px] text-[var(--admin-muted)]">{hint}</p>}
    </div>
  );
}
