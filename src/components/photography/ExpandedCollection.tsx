import type { Photo } from "../../content/types";
import { EXPANDED_MAX_VH, EXPANDED_WIDTH_PCT, scatterEnabled, scatterTransform } from "./galleryConfig";
import { Picture } from "./Picture";

interface ExpandedCollectionProps {
  id: string;
  photos: Photo[];
}

/**
 * The rest of a collection, one photo per row (1×1), below its cover.
 * Each photo fades up as it scrolls into view; with SCATTER on, each sits slightly
 * off-center horizontally (see galleryConfig.ts).
 */
export const ExpandedCollection = ({ id, photos }: ExpandedCollectionProps) => {
  const scatter = scatterEnabled();
  return (
    <ul id={id} className="flex flex-col gap-20 py-16 md:gap-28 md:py-24">
      {photos.map((photo, i) => {
        // Width: a share of the column, but never so tall that a portrait shot overflows the screen.
        const width = `min(${EXPANDED_WIDTH_PCT}%, calc(${EXPANDED_MAX_VH}vh * ${photo.width / photo.height}))`;
        return (
          <li
            key={photo.id}
            className="photo-reveal flex justify-center"
            style={{ animationDelay: `${Math.min(i, 2) * 120}ms` }}
          >
            <figure
              style={{ width, transform: scatterTransform(photo.id, scatter) }}
            >
              <Picture photo={photo} sizes={`(min-width: 768px) ${EXPANDED_WIDTH_PCT}vw, 100vw`} />
              {photo.caption && (
                <figcaption className="mt-3 font-didot text-sm text-[#F3EFE6]/70">{photo.caption}</figcaption>
              )}
            </figure>
          </li>
        );
      })}
    </ul>
  );
};
