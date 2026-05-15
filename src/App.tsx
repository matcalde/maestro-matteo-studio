import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "./components/layout/Layout";
import HomePage from "./pages/HomePage";
import SocraticPage from "./pages/SocraticPage";
import InterviewsPage from "./pages/InterviewsPage";
import InclusivePage from "./pages/InclusivePage";
import AboutPage from "./pages/AboutPage";
import ApiKeyDialog from "./components/ai/ApiKeyDialog";
import { useAiStore } from "./store/aiStore";

export default function App() {
  const hydrate = useAiStore((s) => s.hydrate);
  const kind = useAiStore((s) => s.kind);
  const [welcomeOpen, setWelcomeOpen] = useState(false);

  useEffect(() => {
    hydrate();
    const saved = localStorage.getItem("mm_theme");
    if (saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark");
    }
    // Primo accesso (mai configurato): apri dialog dopo brevissimo delay
    const seen = localStorage.getItem("mm_welcome_seen");
    if (!seen) {
      setTimeout(() => setWelcomeOpen(true), 600);
      localStorage.setItem("mm_welcome_seen", "1");
    }
  }, [hydrate]);

  void kind;

  return (
    <Layout onOpenAi={() => setWelcomeOpen(true)}>
      <Routes>
        <Route path="/" element={<HomePage onOpenAi={() => setWelcomeOpen(true)} />} />
        <Route path="/socratico" element={<SocraticPage />} />
        <Route path="/interviste" element={<InterviewsPage />} />
        <Route path="/inclusivai" element={<InclusivePage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
      <ApiKeyDialog open={welcomeOpen} onClose={() => setWelcomeOpen(false)} />
    </Layout>
  );
}
