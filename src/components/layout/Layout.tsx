import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ children, onOpenAi }: { children: ReactNode; onOpenAi: () => void }) {
  return (
    <div className="min-h-full flex flex-col">
      <Header onOpenAi={onOpenAi} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
