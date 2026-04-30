import Image from 'next/image';
import { redirect } from 'next/navigation';
import { tryLogin, getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function loginAction(formData: FormData) {
  'use server';
  const user = String(formData.get('user') ?? '').trim();
  const pass = String(formData.get('pass') ?? '');
  const next = String(formData.get('next') ?? '/admin');

  const ok = await tryLogin(user, pass);
  if (!ok) redirect('/admin/login?error=1');
  redirect(next || '/admin');
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  // Already signed in? Skip the form.
  const session = await getSession();
  const sp = await searchParams;
  if (session) redirect(sp.next || '/admin');

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <form action={loginAction} className="w-full max-w-sm surface rounded-2xl p-8 shadow-card">
        <div className="flex items-center gap-3 mb-6">
          <Image src="/tfc-logo.png" alt="TFC" width={48} height={48} className="w-12 h-12" />
          <div>
            <div className="text-[10px] uppercase tracking-widest text-ink-300 font-semibold">Throwball Hub</div>
            <h1 className="display text-2xl font-bold">Admin sign in</h1>
          </div>
        </div>

        {sp.error && (
          <div className="mb-4 px-3 py-2 rounded-lg text-xs font-semibold pill-final">
            Invalid username or password
          </div>
        )}

        <input type="hidden" name="next" value={sp.next ?? '/admin'} />

        <label className="block mb-3">
          <span className="text-[11px] uppercase tracking-widest text-ink-200 font-semibold">Username</span>
          <input
            name="user"
            autoComplete="username"
            required
            autoFocus
            className="mt-1 w-full bg-ink-700/60 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/30"
          />
        </label>

        <label className="block mb-6">
          <span className="text-[11px] uppercase tracking-widest text-ink-200 font-semibold">Password</span>
          <input
            name="pass"
            type="password"
            autoComplete="current-password"
            required
            className="mt-1 w-full bg-ink-700/60 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/30"
          />
        </label>

        <button
          type="submit"
          className="w-full bg-brand-red hover:bg-brand-redDk transition-colors text-white font-bold py-2.5 rounded-lg text-sm"
        >
          Sign in
        </button>

        <div className="mt-6 text-center text-[11px] text-ink-300">
          For tournament officials only
        </div>
      </form>
    </div>
  );
}
