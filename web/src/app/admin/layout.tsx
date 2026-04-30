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
  // The login page renders without session (middleware lets it through).
  // Authed pages always have a session because middleware guarantees it.
  const session = await getSession();
  if (!session) return <>{children}</>;

  return (
    <div className="min-h-screen flex flex-col">
      <div className="border-b border-white/10 bg-ink-800/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3">
            <Image src="/tfc-logo.png" alt="" width={32} height={32} className="w-8 h-8" />
            <div>
              <div className="text-[10px] uppercase tracking-widest text-ink-300 font-semibold">Throwball Hub</div>
              <div className="text-sm font-bold text-ink-50">Admin</div>
            </div>
          </Link>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/" className="text-ink-200 hover:text-ink-50 font-semibold" target="_blank">
              View public site →
            </Link>
            <span className="text-ink-300">
              Signed in as <span className="text-ink-100 font-semibold">{session.user}</span>
            </span>
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
