"use client";

type Props = {
  src: string;
  alt: string;
  className?: string;
  eager?: boolean;
};

const FALLBACK_IMAGE = "/volt-lab/products/xceed_transparent.png";

export default function ContentImage({ src, alt, className, eager = false }: Props) {
  return (
    <img
      className={className}
      src={src || FALLBACK_IMAGE}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={(event) => {
        if (!event.currentTarget.src.endsWith(FALLBACK_IMAGE)) event.currentTarget.src = FALLBACK_IMAGE;
      }}
    />
  );
}
