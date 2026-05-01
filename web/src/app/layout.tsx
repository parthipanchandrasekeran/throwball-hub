import type { Metadata } from 'next';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { Background } from '@/components/Background';

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

export const metadata: Metadata = {
  title: "Throwball Hub — Women's National Championship 2026",
  description:
    "Schedule, standings and results for the Throwball Federation of Canada Women's National Championship 2026.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ink-900">
        <Background>
          <SiteHeader />
          <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-14 relative flex-1">
            {children}
          </main>
          <SiteFooter />
        </Background>
      </body>
    </html>
  );
}
