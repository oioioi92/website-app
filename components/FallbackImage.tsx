"use client";

import type { CSSProperties } from "react";

type Props = {
  src?: string | null;
  alt: string;
  className?: string;
  loading?: "eager" | "lazy";
  style?: CSSProperties;
};

export function FallbackImage({ src, alt, className, loading = "lazy", style }: Props) {
  return (
    <img
      src={src || "/placeholder.svg"}
      alt={alt}
      className={className}
      style={style}
      loading={loading}
      onError={(e) => {
        e.currentTarget.src = "/placeholder.svg";
      }}
    />
  );
}
