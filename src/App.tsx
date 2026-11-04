import { BrowserRouter, Route, Routes } from "react-router-dom";
import { SiteShell } from "./components/layout/SiteShell";
import { HomePage } from "./pages/HomePage";
import { ExperiencesPage } from "./pages/ExperiencesPage";
import { ExperienceDetailPage } from "./pages/ExperienceDetailPage";
import { AboutPage } from "./pages/AboutPage";
import { PhotographyPage } from "./pages/PhotographyPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<SiteShell />}>
          <Route index element={<HomePage />} />
          <Route path="experiences" element={<ExperiencesPage />} />
          <Route path="experiences/:id" element={<ExperienceDetailPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="photography" element={<PhotographyPage />} />
          <Route path="*" element={<HomePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
