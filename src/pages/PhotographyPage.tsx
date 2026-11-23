import { useRef, useState } from "react";
import { profile } from "../content/profile";
import { collectionCover, collections, photosInCollection } from "../content/photos";
import { CollectionRow } from "../components/photography/CollectionRow";
import { ExpandedCollection } from "../components/photography/ExpandedCollection";
import insta from "../assets/insta.svg";

const instagramUrl = profile.links.instagram ?? "https://www.instagram.com/luz.altar/";

/**
 * Collections as alternating cover rows. Clicking a cover opens the rest of that
 * collection underneath it, one photo per row; the remaining collections continue
 * after the last photo. Only one collection is open at a time.
 */
export const PhotographyPage = () => {
  const [openId, setOpenId] = useState<string | null>(null);
  const coverRefs = useRef(new Map<string, HTMLButtonElement>());

  const toggle = (id: string) => {
    const opening = openId !== id;
    setOpenId(opening ? id : null);
    // Opening a collection below an open one shifts the page up when the first one closes;
    // keep the clicked cover where the user is looking.
    if (opening && openId) {
      requestAnimationFrame(() =>
        coverRefs.current.get(id)?.scrollIntoView({ block: "start", behavior: "smooth" }),
      );
    }
  };

  return (
    <div className="min-h-full w-full bg-ink">
      <div className="mx-auto flex max-w-6xl flex-col px-4 py-16 md:px-12 md:py-32">
        {collections.map((collection, i) => {
          const cover = collectionCover(collection);
          if (!cover) return null;
          const open = openId === collection.id;
          return (
            <section key={collection.id} className={i > 0 ? "mt-24 md:mt-40" : ""}>
              <CollectionRow
                ref={(el) => {
                  if (el) coverRefs.current.set(collection.id, el);
                  else coverRefs.current.delete(collection.id);
                }}
                collection={collection}
                cover={cover}
                flipped={i % 2 === 1}
                expanded={open}
                eager={i < 2}
                onToggle={() => toggle(collection.id)}
              />
              {open && (
                <ExpandedCollection
                  id={`collection-${collection.id}`}
                  photos={photosInCollection(collection.id).filter((p) => p.id !== cover.id)}
                />
              )}
            </section>
          );
        })}

        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="mx-auto mt-32 transition-transform duration-300 hover:-translate-y-1 hover:opacity-80"
        >
          <img src={insta} alt="" className="h-10 w-10 object-contain" />
        </a>
      </div>
    </div>
  );
};
