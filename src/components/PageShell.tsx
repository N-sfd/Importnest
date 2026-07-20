import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export function PageShell({
  children,
  width = "default",
  hideHeaderSearch = false,
}: {
  children: ReactNode;
  width?: "default" | "narrow" | "wide";
  hideHeaderSearch?: boolean;
}) {
  const maxWidth =
    width === "narrow" ? "max-w-3xl" : width === "wide" ? "max-w-[1320px]" : "max-w-[1200px]";

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-surface text-foreground">
      <Header hideSearch={hideHeaderSearch} />
      <main className={`mx-auto w-full flex-1 px-3 py-6 sm:px-4 sm:py-8 ${maxWidth}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
