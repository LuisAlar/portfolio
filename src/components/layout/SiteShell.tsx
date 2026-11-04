import { Outlet } from "react-router-dom";
import { profile } from "../../content/profile";
import { SideNav } from "../nav/SideNav";
import { ProfileIdentity } from "../profile/ProfileIdentity";
import { SocialLinks } from "../profile/SocialLinks";

// Merges yourOwn's SplitPaneShell + SidebarProfileLayout: fixed sidebar on desktop, top bar on mobile.
export const SiteShell = () => (
  <div className="min-h-screen w-full bg-cream md:flex md:h-screen md:overflow-hidden">
    {/* Mobile top bar */}
    <header className="md:hidden sticky top-0 z-30 bg-cream/95 backdrop-blur border-b border-sage-light/40 px-4 pt-3">
      <ProfileIdentity profile={profile} compact />
      <SideNav orientation="horizontal" />
    </header>

    {/* Desktop sidebar */}
    <aside className="hidden md:flex w-80 shrink-0 h-full flex-col bg-cream p-6 gap-8 border-r border-sage-light/40">
      <section className="flex items-center justify-center py-2">
        <ProfileIdentity profile={profile} />
      </section>

      <div className="min-h-[200px] flex-grow flex items-start border-t border-sage-light/30">
        <SideNav />
      </div>

      {/* Tall footer: divider sits higher, icons pushed toward the bottom edge */}
      <footer className="h-36 border-t border-sage-light/40 flex items-end justify-center">
        <SocialLinks links={profile.links} className="!py-2" />
      </footer>
    </aside>

    <main className="flex-grow md:overflow-y-auto">
      <Outlet />
    </main>
  </div>
);
