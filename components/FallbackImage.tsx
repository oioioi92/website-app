"use client";

type Props = {
  src?: string | null;
  alt: string;
  className?: string;
  loading?: "eager" | "lazy";
};

export function FallbackImage({ src, alt, className, loading = "lazy" }: Props) {
  return (
    <img
      src={src || "/placeholder.svg"}
      alt={alt}
      className={className}
      loading={loading}
      onError={(e) => {
        e.currentTarget.src = "/placeholder.svg";
      }}
    />
  );
}
