"use client";

import { useRef, useState } from "react";

type PhotoUploadFieldProps = {
  label: string;
  hint?: string;
  value: string;
  onChange: (url: string) => void;
  required?: boolean;
};

/** 单行：URL 输入 + 上传（FormData file → POST /api/admin/upload/image）+ 预览 + 清空。与 PromotionEditFormLines 内 PhotoUploadRow 行为一致。 */
export function PhotoUploadField({ label, hint = "", value, onChange, required }: PhotoUploadFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setUploadErr(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload/image", { method: "POST", credentials: "include", body: fd });
      const json: Record<string, unknown> = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        setUploadErr(
          res.status === 413
            ? "图片太大被服务器拒绝（413）"
            : json.error === "FILE_TOO_LARGE"
              ? "文件超过 5MB 限制"
              : json.error === "INVALID_TYPE"
                ? "仅支持 JPG/PNG/WEBP/GIF"
                : json.error === "UNAUTHORIZED"
                  ? "请重新登录"
                  : (json.error as string) || `上传失败（${res.status}）`
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
        {required && <span className="text-[var(--admin-danger)] ml-0.5">*</span>}
      </label>
      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="粘贴图片 URL 或点击右侧上传"
          className="flex-1 min-w-0 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-panel2)] px-3 py-2 text-[13px] text-[var(--admin-text)]"
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="admin-compact-btn admin-compact-btn-ghost shrink-0 text-[12px] py-2 px-3 border border-[var(--admin-border)]"
        >
          {uploading ? "上传中…" : "上传"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
      </div>
      {uploadErr && <p className="text-[11px] text-red-500">{uploadErr}</p>}
      {value && (
        <div className="relative rounded-lg overflow-hidden border border-[var(--admin-border)] bg-black/10 mt-2" style={{ maxHeight: 120 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="w-full object-cover" style={{ maxHeight: 120 }} onError={(e) => (e.currentTarget.style.display = "none")} />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-1 right-1 rounded-full bg-black/60 text-white text-[11px] px-1.5 py-0.5 hover:bg-red-600"
            title="移除"
          >
            ✕
          </button>
        </div>
      )}
      {hint && <p className="text-[11px] text-[var(--admin-muted)]">{hint}</p>}
    </div>
  );
}
