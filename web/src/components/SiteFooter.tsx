import Image from 'next/image';

export function SiteFooter() {
  return (
    <footer className="max-w-7xl mx-auto w-full px-4 sm:px-6 mt-20 pt-10 pb-10 border-t border-white/5">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-300">
        <div className="flex items-center gap-3">
          <Image src="/tfc-logo.png" alt="" width={32} height={32} className="w-8 h-8 opacity-80" />
          <div>
            <div className="font-bold text-ink-100">Throwball Hub</div>
            <div className="text-[11px]">© 2026 Throwball Federation of Canada</div>
          </div>
        </div>
        <div className="text-[11px] tracking-widest uppercase font-semibold gold-text">Aim High · Throw Hard</div>
      </div>
    </footer>
  );
}
