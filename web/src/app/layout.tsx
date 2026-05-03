import type { Metadata } from 'next';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
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

const TITLE = "Throwball Hub — Women's National Championship 2026";
const DESCRIPTION =
  "Live schedule, standings and results for the Throwball Federation of Canada Women's National Championship — Toronto, 9 May 2026.";

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
