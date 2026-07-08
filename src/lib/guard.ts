// src/lib/guard.ts
// Lightweight security guards for server actions and API routes.
// - Per-IP sliding-window rate limiting (in-memory; per server instance)
// - Input size caps to prevent token-cost abuse on AI flows
//
// NOTE: in-memory limits reset on redeploy and are per-instance. For
// multi-instance production scale, swap `hit()` internals for a shared
// store (e.g. Upstash Redis) — the call sites won't need to change.

import { headers } from 'next/headers';

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

// periodic cleanup so the map doesn't grow unbounded
const CLEAN_INTERVAL = 5 * 60_000;
let lastClean = Date.now();
function cleanup() {
  const now = Date.now();
  if (now - lastClean < CLEAN_INTERVAL) return;
  lastClean = now;
  for (const [k, b] of buckets) if (b.resetAt < now) buckets.delete(k);
}

/** Records a hit for `key`. Returns true if within limit, false if rate-limited. */
export function hit(key: string, limit: number, windowMs: number): boolean {
  cleanup();
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  b.count++;
  return b.count <= limit;
}

/** Best-effort client IP from proxy headers (Vercel/most hosts set x-forwarded-for). */
export async function clientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    h.get('x-real-ip') ||
    'unknown'
  );
}

/** Same, but from a Request object (for route handlers). */
export function requestIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

export class RateLimitError extends Error {
  constructor() {
    super('Too many requests. Please slow down and try again in a minute.');
    this.name = 'RateLimitError';
  }
}

/**
 * Guard for AI server actions: rate-limits by IP and enforces a total
 * input character budget. Throws a user-safe Error on violation.
 *
 * Default: 10 AI calls per minute per IP, 16k chars max input.
 */
export async function guardAiCall(
  flowName: string,
  inputChars: number,
  opts: { limit?: number; windowMs?: number; maxChars?: number } = {}
): Promise<void> {
  const { limit = 10, windowMs = 60_000, maxChars = 16_000 } = opts;

  if (inputChars > maxChars) {
    throw new Error('Input is too long. Please shorten your message and try again.');
  }

  const ip = await clientIp();
  if (!hit(`ai:${flowName}:${ip}`, limit, windowMs)) {
    throw new RateLimitError();
  }
}

/** Rough char count of any serializable input. */
export function charCount(input: unknown): number {
  try {
    return JSON.stringify(input)?.length ?? 0;
  } catch {
    return Number.MAX_SAFE_INTEGER; // unserializable => reject via cap
  }
}
