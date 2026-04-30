import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { getSession, logout } from '@/lib/auth';

async function logoutAction() {
  'use server';
  await logout();
  redirect('/admin/login');
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) return <>{children}</>;

  return (
    <div className="min-h-screen flex flex-col">
      <div className="border-b border-white/10 bg-ink-800/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3">
          <Link href="/admin" className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Image src="/tfc-logo.png" alt="" width={32} height={32} className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" />
            <div className="min-w-0">
              <div className="text-[9px] sm:text-[10px] uppercase tracking-widest text-ink-300 font-semibold leading-tight">Throwball Hub</div>
              <div className="text-sm font-bold text-ink-50 leading-tight">
                Admin
                <span className="hidden sm:inline text-ink-300 font-medium ml-1.5">· {session.user}</span>
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4 text-xs shrink-0">
            <Link href="/" className="hidden sm:inline text-ink-200 hover:text-ink-50 font-semibold" target="_blank">
              View public site →
            </Link>
            <form action={logoutAction}>
              <button type="submit" className="chip px-3 py-1.5 rounded-md font-semibold hover:bg-white/10">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}
