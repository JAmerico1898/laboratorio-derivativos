import Link from "next/link";
import { strings } from "@/lib/strings";

export function Footer() {
  return (
    <footer className="w-full py-12 border-t border-white/10 bg-primary">
      <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto px-8 gap-6">
        <div className="flex flex-col items-center md:items-start gap-4">
          <div className="text-xl font-heading font-bold text-white">{strings.siteTitle}</div>
          <div className="text-sm text-slate-300">{strings.footerCopyright1}</div>
          <div className="text-sm text-slate-300">{strings.footerCopyright2}</div>
        </div>
        <Link href="/contato" className="text-lg font-semibold text-slate-200 hover:text-emerald-400 transition-colors underline decoration-emerald-500/50 underline-offset-4">
          {strings.footerContact}
        </Link>
      </div>
    </footer>
  );
}
