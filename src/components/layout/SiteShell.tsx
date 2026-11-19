import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { profile } from "../../content/profile";
import { routeTheme, SideNav, StarHome } from "../nav/SideNav";
import { SocialLinks } from "../profile/SocialLinks";

// Merges yourOwn's SplitPaneShell + SidebarProfileLayout: fixed sidebar on desktop, top bar on mobile.
// data-theme drives the shell colors (see .site-shell in index.css); the fade is delayed so it
// lands while the page sweep is finishing.
export const SiteShell = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  return (
  <div data-theme={routeTheme(pathname)} className="site-shell min-h-screen w-full md:flex md:h-screen md:overflow-hidden">
    {/* Mobile top bar */}
    <header className="md:hidden sticky top-0 z-30 shell-surface backdrop-blur border-b px-4 pt-3">
      <SideNav orientation="horizontal" />
    </header>

    {/* Desktop sidebar */}
    <aside className="hidden md:flex w-80 shrink-0 h-full flex-col shell-surface p-6 gap-8 border-r">
      {/* Star replaces the profile photo: links Home, tints per tab, spins on click */}
      <section className="flex items-center justify-center py-2">
        <StarHome />
      </section>

      <div className="min-h-[200px] flex-grow flex items-center shell-border border-t">
        <SideNav />
      </div>

      {/* Tall footer: divider sits higher, icons pushed toward the bottom edge */}
      <footer className="shell-border h-36 border-t flex items-end justify-center">
        <SocialLinks links={profile.links} className="!py-2" />
      </footer>
    </aside>

    {/* Pages are stacked inside <main> by PageTransition so old and new can overlap while animating */}
    <main className="flex min-w-0 flex-grow md:h-full">{children}</main>
  </div>
  );
};
