import { Link, NavLink } from "react-router-dom";
import { Moon, Sun, Settings2, Brain } from "lucide-react";
import { useState, useEffect } from "react";
import AIStatusBadge from "@/components/ai/AIStatusBadge";

const nav = [
  { to: "/socratico", label: "🦉 Socratico" },
  { to: "/interviste", label: "🎭 Interviste" },
  { to: "/inclusivai", label: "♿ InclusivAI" },
  { to: "/about", label: "About" },
];

export default function Header({ onOpenAi }: { onOpenAi: () => void }) {
  const [dark, setDark] = useState<boolean>(document.documentElement.classList.contains("dark"));
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("mm_theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-bg-light/80 dark:bg-bg-dark/80 border-b border-neutral-200/60 dark:border-neutral-800">
      <div className="max-w-app mx-auto px-4 h-14 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 font-bold">
          <Brain className="w-5 h-5 text-primary" />
          <span>Maestro Matteo Studio</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1 ml-4">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-sm ${isActive ? "bg-neutral-100 dark:bg-neutral-800" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"}`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex-1" />
        <AIStatusBadge />
        <button className="btn btn-ghost" onClick={onOpenAi} aria-label="Configura AI">
          <Settings2 className="w-4 h-4" /> <span className="hidden sm:inline">AI</span>
        </button>
        <button className="btn btn-ghost" onClick={() => setDark(!dark)} aria-label="Toggle tema">
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
