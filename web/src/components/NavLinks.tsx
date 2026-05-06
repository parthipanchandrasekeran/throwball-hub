'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/',          label: 'Schedule'  },
  { href: '/standings', label: 'Standings' },
  { href: '/bracket',   label: 'Bracket'   },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-0.5 sm:gap-1 shrink-0 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {LINKS.map(({ href, label }) => {
        const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={
              active
                ? 'px-2.5 sm:px-3 py-2 rounded-md font-semibold bg-white text-ink-900 shadow-[0_8px_22px_-15px_rgba(255,255,255,0.85)] whitespace-nowrap'
                : 'px-2.5 sm:px-3 py-2 rounded-md font-semibold text-ink-200 hover:bg-white/5 hover:text-ink-50 transition-colors whitespace-nowrap'
            }
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
