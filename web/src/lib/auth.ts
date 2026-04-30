// Tiny cookie-based auth for the 2 fixed admin accounts.
// HMAC-signed cookie via Web Crypto so it's middleware-safe (no Node-only APIs).

import { cookies } from 'next/headers';

const COOKIE = 'th_session';
const SESSION_HOURS = 8;

type Account = { user: string; pass: string };
type Session = { user: string; exp: number };

function accounts(): Account[] {
  const list: Account[] = [];
  if (process.env.ADMIN1_USER && process.env.ADMIN1_PASS)
    list.push({ user: process.env.ADMIN1_USER, pass: process.env.ADMIN1_PASS });
  if (process.env.ADMIN2_USER && process.env.ADMIN2_PASS)
    list.push({ user: process.env.ADMIN2_USER, pass: process.env.ADMIN2_PASS });
  return list;
}

function constantTimeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function hmac(payload: string, secret: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  return Buffer.from(new Uint8Array(sig)).toString('base64url');
}

function b64urlEncode(s: string) { return Buffer.from(s, 'utf8').toString('base64url'); }
function b64urlDecode(s: string) { return Buffer.from(s, 'base64url').toString('utf8'); }

async function signSession(s: Session): Promise<string> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('AUTH_SECRET is not set');
  const body = b64urlEncode(JSON.stringify(s));
  const sig = await hmac(body, secret);
  return `${body}.${sig}`;
}

export async function verifyToken(token: string | undefined): Promise<Session | null> {
  if (!token) return null;
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = await hmac(body, secret);
  if (!constantTimeEqual(sig, expected)) return null;
  try {
    const session = JSON.parse(b64urlDecode(body)) as Session;
    if (Date.now() > session.exp) return null;
    return session;
  } catch {
    return null;
  }
}

/* -------- public helpers (server-only) -------- */

export async function tryLogin(user: string, pass: string): Promise<boolean> {
  const accs = accounts();
  let matched = false;
  // walk all accounts so timing doesn't reveal the username
  for (const a of accs) {
    if (constantTimeEqual(a.user, user) && constantTimeEqual(a.pass, pass)) matched = true;
  }
  if (!matched) return false;

  const exp = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
  const token = await signSession({ user, exp });
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_HOURS * 60 * 60,
  });
  return true;
}

export async function logout() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  return verifyToken(jar.get(COOKIE)?.value);
}

export const COOKIE_NAME = COOKIE;
