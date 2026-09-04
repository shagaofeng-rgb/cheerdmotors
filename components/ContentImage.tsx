"use client";

type Props = {
  src: string;
  alt: string;
  className?: string;
  eager?: boolean;
  fallback?: string;
};

const FALLBACK_IMAGE = "/volt-lab/products/xceed_transparent.png";

export default function ContentImage({ src, alt, className, eager = false, fallback = FALLBACK_IMAGE }: Props) {
  const productImage = (src || fallback).includes("/volt-lab/products/");
  return (
    <img
      className={[className, productImage ? "content-product-image" : ""].filter(Boolean).join(" ")}
      src={src || fallback}
      alt={alt}
      width={1600}
      height={900}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={(event) => {
        if (!event.currentTarget.src.endsWith(fallback)) {
          event.currentTarget.classList.add("content-product-image");
          event.currentTarget.src = fallback;
        }
      }}
    />
  );
}
