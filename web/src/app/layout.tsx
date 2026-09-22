import type { Metadata } from 'next';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import { EVENT } from '@/lib/event';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
  weight: ['500', '600', '700'],
});
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
  weight: ['500', '700', '800'],
});

const TITLE = `Throwball Hub — ${EVENT.name} · ${EVENT.dateLabel}`;
const DESCRIPTION =
  `Live schedule, standings and results for the ${EVENT.name} on ${EVENT.dateLabel} — ` +
  `Throwball Federation of Canada. Gold and Bronze divisions, ${EVENT.teams} teams, ${EVENT.courts} courts.`;

export const metadata: Metadata = {
  metadataBase: new URL('https://throwball-hub.netlify.app'),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    type: 'website',
    siteName: 'Throwball Hub',
    title: TITLE,
    description: DESCRIPTION,
    url: '/',
    locale: 'en_CA',
    images: [
      { url: '/og-banner.jpg', width: 1200, height: 630, alt: 'Throwball Federation of Canada — Aim High, Throw Hard' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/og-banner.jpg'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ink-900">
        {children}
      </body>
    </html>
  );
}
