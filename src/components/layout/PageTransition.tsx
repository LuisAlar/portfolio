import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useLocation, type Location } from "react-router-dom";
import { routeColor, routeOrder, routeTheme } from "../nav/SideNav";

/**
 * Page-to-page transitions.
 *
 * "diagonal" — the incoming page sweeps across on a slanted edge, led by a band in the
 *              destination tab's star color, while the old page drifts up underneath.
 *              Moving "forward" in the nav (Home → About → Photography) sweeps in from the
 *              right; moving back sweeps in from the left.
 * "lift"     — the current page slides straight up off the screen, revealing the next one.
 *
 * Try either without editing code: append ?transition=lift or ?transition=diagonal to the URL.
 */
export type TransitionVariant = "diagonal" | "lift";
export const DEFAULT_VARIANT: TransitionVariant = "diagonal";

// Tweak knobs
const DURATION = 900; // ms
const EASING = "cubic-bezier(0.76, 0, 0.24, 1)"; // slow-fast-slow
const SLANT = 30; // how far (in % of width) the top of the edge leads the bottom
const BAND = 7; // width of the colored leading band, in % of width
const OLD_PAGE_DRIFT = "-8%"; // how far the outgoing page drifts up in "diagonal"

interface Layer {
  location: Location;
  /** Set on the incoming layer only */
  enter?: { direction: 1 | -1; variant: TransitionVariant; color: string };
}

const readVariant = (search: string): TransitionVariant => {
  const v = new URLSearchParams(search).get("transition");
  if (v === "lift" || v === "diagonal") {
    try { sessionStorage.setItem("transition", v); } catch { /* ignore */ }
    return v;
  }
  try {
    const stored = sessionStorage.getItem("transition");
    if (stored === "lift" || stored === "diagonal") return stored;
  } catch { /* ignore */ }
  return DEFAULT_VARIANT;
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Clip-path for the incoming page. `p` is where the bottom of the slanted edge sits (in %).
 * Forward: page covers everything to the right of the edge, edge travels right → left.
 * Back:    page covers everything to the left of the edge, edge travels left → right.
 */
const edgeClip = (direction: 1 | -1, p: number) =>
  direction === 1
    ? `polygon(${p + SLANT}% 0%, 300% 0%, 300% 100%, ${p}% 100%)`
    : `polygon(-300% 0%, ${p + SLANT}% 0%, ${p}% 100%, -300% 100%)`;

// Start/end positions of the edge so the page goes from fully hidden to fully shown.
const edgeRange = (direction: 1 | -1, lead = 0): [number, number] =>
  direction === 1 ? [100 + lead, -SLANT - BAND] : [-SLANT - lead, 100 + BAND];

interface PageTransitionProps {
  /** Renders the page for a given location (so the outgoing page keeps its own params). */
  children: (location: Location) => ReactNode;
}

export const PageTransition = ({ children }: PageTransitionProps) => {
  const location = useLocation();
  const [layers, setLayers] = useState<Layer[]>([{ location }]);
  const current = layers[layers.length - 1];

  // Queue a transition whenever the path changes (render-time update avoids a flash of the old page).
  if (location.pathname !== current.location.pathname) {
    const from = routeOrder(current.location.pathname);
    const to = routeOrder(location.pathname);
    const reduced = prefersReducedMotion();
    setLayers([
      // Only the page currently on screen stays behind; anything mid-transition is dropped.
      ...(reduced ? [] : [{ location: current.location }]),
      {
        location,
        enter: reduced
          ? undefined
          : { direction: to >= from ? 1 : -1, variant: readVariant(location.search), color: routeColor(location.pathname) },
      },
    ]);
  } else if (location !== current.location) {
    // Same page, new search/hash: just keep the location fresh.
    setLayers((ls) => [...ls.slice(0, -1), { ...ls[ls.length - 1], location }]);
  }

  const finish = (key: string) =>
    setLayers((ls) => {
      const i = ls.findIndex((l) => l.location.key === key);
      return i < 0 ? ls : ls.slice(i).map((l) => (l.location.key === key ? { location: l.location } : l));
    });

  return (
    <div className="relative grid min-w-0 flex-grow md:h-full md:overflow-hidden">
      {layers.map((layer, i) => (
        <PageLayer
          key={layer.location.key}
          layer={layer}
          outgoing={i < layers.length - 1 ? layers[layers.length - 1].enter : undefined}
          onDone={() => finish(layer.location.key)}
        >
          {children(layer.location)}
        </PageLayer>
      ))}
    </div>
  );
};

interface PageLayerProps {
  layer: Layer;
  /** When set, this layer is leaving, and this describes the transition replacing it. */
  outgoing?: Layer["enter"];
  onDone: () => void;
  children: ReactNode;
}

const layerClass = "[grid-area:1/1] md:absolute md:inset-0 md:overflow-y-auto";
// Each page paints its own solid background so the colored band only shows as a thin
// leading stripe. Set inline (not via Tailwind) so the page can never render see-through.
const PAGE_THEME = {
  light: { backgroundColor: "#FCF3D9" },
  dark: { backgroundColor: "#0B0B0B", color: "#FFFFFF" },
} as const;

const PageLayer = ({ layer, outgoing, onDone, children }: PageLayerProps) => {
  const pageRef = useRef<HTMLDivElement>(null);
  const bandRef = useRef<HTMLDivElement>(null);
  const { enter } = layer;

  // Incoming page (and its leading band)
  useLayoutEffect(() => {
    const page = pageRef.current;
    if (!enter || !page) return;
    window.scrollTo({ top: 0 });
    const opts: KeyframeAnimationOptions = { duration: DURATION, easing: EASING, fill: "both" };
    const anims: Animation[] = [];

    if (enter.variant === "diagonal") {
      const [a, b] = edgeRange(enter.direction, BAND);
      anims.push(page.animate({ clipPath: [edgeClip(enter.direction, a), edgeClip(enter.direction, b)] }, opts));
      if (bandRef.current) {
        // The band runs a few % ahead of the page edge, so a stripe of color leads the sweep.
        const lead = enter.direction * -BAND;
        anims.push(
          bandRef.current.animate(
            { clipPath: [edgeClip(enter.direction, a + lead), edgeClip(enter.direction, b + lead)] },
            opts,
          ),
        );
      }
    }
    // "lift": the incoming page just sits underneath (see z-index below) while the old one leaves.

    const main = anims[0] ?? null;
    if (!main) {
      const t = window.setTimeout(onDone, DURATION);
      return () => window.clearTimeout(t);
    }
    main.onfinish = () => {
      anims.forEach((an) => an.cancel());
      onDone();
    };
    return () => anims.forEach((an) => an.cancel());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enter]);

  // Outgoing page
  useLayoutEffect(() => {
    const page = pageRef.current;
    if (!outgoing || !page) return;
    const opts: KeyframeAnimationOptions = { duration: DURATION, easing: EASING, fill: "forwards" };
    const anim =
      outgoing.variant === "lift"
        ? page.animate({ transform: ["translateY(0)", "translateY(-100%)"], boxShadow: ["0 0 0 rgba(0,0,0,0)", "0 30px 60px rgba(0,0,0,0.25)"] }, opts)
        : page.animate({ transform: ["translateY(0)", `translateY(${OLD_PAGE_DRIFT})`], filter: ["brightness(1)", "brightness(0.85)"] }, opts);
    return () => anim.cancel();
  }, [outgoing]);

  // In "lift" the leaving page must sit on top; otherwise the newest page is on top.
  const lifting = outgoing?.variant === "lift";
  const z = lifting ? 20 : enter ? 10 : 0;

  return (
    <>
      {enter?.variant === "diagonal" && (
        <div
          ref={bandRef}
          aria-hidden
          className="pointer-events-none [grid-area:1/1] md:absolute md:inset-0"
          style={{ backgroundColor: enter.color, zIndex: z }}
        />
      )}
      <div
        ref={pageRef}
        className={layerClass}
        style={{ ...PAGE_THEME[routeTheme(layer.location.pathname)], zIndex: z, pointerEvents: outgoing ? "none" : undefined }}
        aria-hidden={outgoing ? true : undefined}
      >
        {children}
      </div>
    </>
  );
};
