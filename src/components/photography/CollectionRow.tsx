import { forwardRef } from "react";
import type { Photo, PhotoCollection } from "../../content/types";
import { Picture } from "./Picture";

interface CollectionRowProps {
  collection: PhotoCollection;
  cover: Photo;
  /** Alternates the layout: image left / title right, then title left / image right */
  flipped: boolean;
  expanded: boolean;
  onToggle: () => void;
  /** First rows load eagerly so the page doesn't open on placeholders */
  eager?: boolean;
}

/** "Title (Year)" label, in the design's two-line format. */
export const CollectionTitle = ({ collection }: { collection: PhotoCollection }) => (
  <p className="font-didot text-base text-[#F3EFE6]">
    {collection.title}
    {collection.year && (
      <>
        <br />({collection.year})
      </>
    )}
  </p>
);

export const CollectionRow = forwardRef<HTMLButtonElement, CollectionRowProps>(
  ({ collection, cover, flipped, expanded, onToggle, eager }, ref) => (
    <div
      className={`flex flex-col gap-6 md:items-center md:gap-12 ${flipped ? "md:flex-row-reverse" : "md:flex-row"}`}
    >
      <button
        ref={ref}
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={`collection-${collection.id}`}
        aria-label={`${expanded ? "Close" : "Open"} ${collection.title}, ${collection.count} photos`}
        className={`group block shrink-0 cursor-pointer overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F3EFE6]/70 ${
          flipped ? "md:w-[64%]" : "md:w-[56%]"
        }`}
      >
        <Picture
          photo={cover}
          eager={eager}
          sizes="(min-width: 768px) 60vw, 100vw"
          className="transition-[transform,opacity] duration-700 ease-out group-hover:scale-[1.015] group-hover:opacity-90"
        />
      </button>

      <div className={`flex-1 ${flipped ? "md:pl-6" : ""}`}>
        <CollectionTitle collection={collection} />
      </div>
    </div>
  ),
);
CollectionRow.displayName = "CollectionRow";
