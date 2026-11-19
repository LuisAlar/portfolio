import { BrowserRouter, Route, Routes, type Location } from "react-router-dom";
import { SiteShell } from "./components/layout/SiteShell";
import { PageTransition } from "./components/layout/PageTransition";
import { HomePage } from "./pages/HomePage";
import { ExperienceDetailPage } from "./pages/ExperienceDetailPage";
import { AboutPage } from "./pages/AboutPage";
import { PhotographyPage } from "./pages/PhotographyPage";

// Rendered once per on-screen page, each with its own location, so a page that is
// animating out keeps showing its own content (and route params) instead of the new route's.
const PageRoutes = ({ location }: { location: Location }) => (
  <Routes location={location}>
    <Route index element={<HomePage />} />
    <Route path="experiences/:id" element={<ExperienceDetailPage />} />
    <Route path="about" element={<AboutPage />} />
    <Route path="photography" element={<PhotographyPage />} />
    <Route path="*" element={<HomePage />} />
  </Routes>
);

export default function App() {
  return (
    <BrowserRouter>
      <SiteShell>
        <PageTransition>{(location) => <PageRoutes location={location} />}</PageTransition>
      </SiteShell>
    </BrowserRouter>
  );
}
