import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';

/**
 * Server-issued guest identity.
 *
 * Each browser receives a random UUID in an HttpOnly cookie signed with
 * SESSION_SECRET. The client cannot read, choose or forge it, so one guest
 * can no longer read, overwrite or reset another guest's progress by sending
 * a different header (the old `x-guest-uid` scheme).
 */

const COOKIE_NAME = 'fursan_gid';
const MAX_AGE_SECONDS = 365 * 24 * 60 * 60;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const isProduction = process.env.NODE_ENV === 'production';

function resolveSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 32) return secret;
  if (isProduction) {
    throw new Error('SESSION_SECRET must be set (at least 32 characters) in production.');
  }
  // Development only: a per-process secret. Guests reset when the dev server restarts.
  console.warn('[identity] SESSION_SECRET not set; using an ephemeral development secret.');
  return crypto.randomBytes(32).toString('hex');
}

let cachedSecret: string | null = null;
function secret(): string {
  return (cachedSecret ??= resolveSecret());
}

/** Fails fast at server startup instead of on the first request. */
export function assertIdentityConfig() {
  secret();
}

const SECURE_COOKIE = process.env.COOKIE_SECURE
  ? process.env.COOKIE_SECURE === 'true'
  : isProduction;

function sign(id: string): string {
  const mac = crypto.createHmac('sha256', secret()).update(id).digest('base64url');
  return `${id}.${mac}`;
}

function verify(value: string | undefined): string | null {
  if (!value) return null;
  const dot = value.lastIndexOf('.');
  if (dot <= 0) return null;
  const id = value.slice(0, dot);
  if (!UUID_RE.test(id)) return null;
  const expected = Buffer.from(sign(id));
  const received = Buffer.from(value);
  if (expected.length !== received.length) return null;
  return crypto.timingSafeEqual(expected, received) ? id : null;
}

function readCookie(req: Request, name: string): string | undefined {
  const header = req.headers.cookie;
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() === name) {
      try {
        return decodeURIComponent(part.slice(eq + 1).trim());
      } catch {
        return undefined;
      }
    }
  }
  return undefined;
}

export interface GuestRequest extends Request {
  guestId?: string;
}

/** Ensures every request carries a verified guest id, minting one when absent or invalid. Idempotent. */
export function guestIdentity(req: Request, res: Response, next: NextFunction) {
  const r = req as GuestRequest;
  if (r.guestId) return next();

  const existing = verify(readCookie(req, COOKIE_NAME));
  if (existing) {
    r.guestId = existing;
    return next();
  }

  const id = crypto.randomUUID();
  r.guestId = id;
  const attrs = [
    `${COOKIE_NAME}=${encodeURIComponent(sign(id))}`,
    'Path=/',
    `Max-Age=${MAX_AGE_SECONDS}`,
    'HttpOnly',
    'SameSite=Lax',
  ];
  if (SECURE_COOKIE) attrs.push('Secure');
  res.append('Set-Cookie', attrs.join('; '));
  next();
}
