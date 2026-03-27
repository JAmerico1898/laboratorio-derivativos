"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { strings } from "@/lib/strings";

const NAV_ITEMS = [
  { label: strings.navHome, href: "/" },
  { label: strings.navTermos, href: "/termos" },
  { label: strings.navFuturos, href: "/futuros" },
  { label: strings.navSwaps, href: "/swaps" },
  { label: strings.navOpcoes, href: "/opcoes" },
  { label: strings.navCredito, href: "/credito" },
  { label: strings.navEmbutidos, href: "/embutidos" },
] as const;

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-[0_12px_32px_rgba(25,28,29,0.06)]">
      <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between gap-6">
        <Link
          href="/"
          className="text-xl font-extrabold text-primary tracking-tighter font-heading shrink-0"
        >
          {strings.siteTitle}
        </Link>
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {NAV_ITEMS.filter((item) => item.href !== pathname).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-600 hover:text-primary hover:bg-primary-container/20 transition-colors whitespace-nowrap"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
