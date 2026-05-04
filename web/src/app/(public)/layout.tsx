import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { Background } from '@/components/Background';
import { RealtimeMatches } from '@/components/RealtimeMatches';
import { ArcadeBlastFooter } from '@/components/ArcadeBlastFooter';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <Background>
      <RealtimeMatches />
      <SiteHeader />
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-14 relative flex-1">
        {children}
      </main>
      <SiteFooter />
      <ArcadeBlastFooter />
    </Background>
  );
}
