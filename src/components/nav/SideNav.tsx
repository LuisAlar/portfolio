import { Link, NavLink, useLocation } from "react-router-dom";

export interface NavTab {
  label: string;
  to: string;
  /** Star color while this tab is active */
  starColor: string;
}

// Star color when no tab is active (e.g. Home)
const IDLE_STAR_COLOR = "#acc2a7";

export const NAV_TABS: NavTab[] = [
  // Experiences is hidden from nav for now (route still works); Photography took its slot.
  // { label: "Experiences", to: "/experiences", starColor: "#acc2a7" },
  { label: "A Bit About Me!", to: "/about", starColor: "#E8B92F" },
  { label: "Photography", to: "/photography", starColor: "#8B1E2B" },
];

interface SideNavProps {
  tabs?: NavTab[];
  /** Horizontal row for the mobile top bar */
  orientation?: "vertical" | "horizontal";
}

// Same path as assets/starr.svg, inlined so the fill can change per tab while keeping its outline.
const STAR_PATH =
  "M78.2665 70.9172L137.827 215.965L147.519 241.086L127.376 269.357L85.936 314.961C65.4424 336.734 20.2431 385.148 3.39522 404.625C-13.4526 424.101 63.7322 384.881 74.9619 376.956C105.877 355.226 118.245 350.263 128.396 345.672C138.546 341.081 161.525 335.638 164.197 341.892C166.868 348.146 159.774 423.809 159.774 423.809L156.149 541.842L196.656 444.551L228.819 358.699C228.819 358.699 264.34 372.043 273.555 387.158C282.77 402.274 308.353 459.794 311.268 468.146C314.183 476.497 341.619 527.605 342.664 526.673C356.522 541.214 364.197 543.064 377.764 540.061C365.349 530.508 345.287 480.67 338.952 454.161C328.53 407.833 316.665 332.831 321.032 321.812C323.228 316.268 336.525 301.138 356.981 290.865C367.855 284.554 383.961 270.642 407.637 256.355C439.209 235.784 446.352 239.668 446.829 227.553C448.418 220.098 380.458 215.798 334.659 211.803C314.101 210.009 298.436 208.643 296.344 207.774C293.924 206.768 295.08 192.384 296.752 171.586C298.417 150.876 300.593 123.806 300.259 97.2513C298.946 84.8204 300.015 71.1325 298.335 55.221L290.009 0.183437L279.739 55.2816L270.943 90.2913C270.943 90.2913 252.62 155.576 242.08 174.789C231.539 194.003 221.202 196.1 221.202 196.1L186.985 162.507L140.149 114.158L53.3303 6.17784L78.2665 70.9172Z";

const Star = ({ color, className }: { color: string; className: string }) => (
  <svg viewBox="0 0 448 543" aria-hidden className={`overflow-visible ${className}`}>
    <path d={STAR_PATH} fill={color} stroke="black" strokeWidth={2} className="transition-[fill] duration-500 ease-in-out" />
  </svg>
);

export const SideNav = ({ tabs = NAV_TABS, orientation = "vertical" }: SideNavProps) => {
  const { pathname } = useLocation();
  const activeTab = tabs.find((t) => pathname === t.to || pathname.startsWith(`${t.to}/`));
  const starColor = activeTab?.starColor ?? IDLE_STAR_COLOR;
  const vertical = orientation === "vertical";

  return (
    <nav className={vertical ? "w-full flex flex-col items-center gap-8 pt-4" : "w-full flex items-center justify-center gap-6 py-2"}>
      {/* Star doubles as the Home link and the active-tab indicator */}
      {/* key on pathname replays the hop each time the route changes */}
      <Link key={pathname} to="/" aria-label="Home" className="block animate-star-hop">
        <Star color={starColor} className={vertical ? "w-24 h-28" : "w-8 h-9"} />
      </Link>

      <ul className={vertical ? "flex flex-col items-center gap-6" : "flex flex-row items-center gap-5"}>
        {tabs.map((tab) => (
          <li key={tab.to}>
            <NavLink
              to={tab.to}
              className={`block text-center font-medium tracking-widest uppercase transition-colors duration-200 hover:text-[var(--nav-hover-color)] ${
                vertical ? "text-base" : "text-sm"
              }`}
              style={{ color: "var(--nav-text-color)" }}
            >
              {tab.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};
