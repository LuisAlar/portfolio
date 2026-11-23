import type { CSSProperties } from "react";
import type { Photo } from "../../content/types";
import { pictureProps } from "../../lib/photos";

interface PictureProps {
  photo: Photo;
  /** `sizes` attribute: how wide the image renders, so the browser picks the right file */
  sizes: string;
  eager?: boolean;
  className?: string;
  style?: CSSProperties;
}

/** AVIF with WebP fallback, blurred placeholder underneath, reserved aspect ratio. */
export const Picture = ({ photo, sizes, eager, className = "", style }: PictureProps) => {
  const { sources, img, priority } = pictureProps(photo, sizes, { eager });
  return (
    <picture>
      {sources.map((s) => (
        <source key={s.type} {...s} />
      ))}
      <img
        {...img}
        {...priority}
        alt={img.alt || photo.title || ""}
        className={`block h-auto w-full ${className}`}
        style={{ ...img.style, ...style }}
      />
    </picture>
  );
};
