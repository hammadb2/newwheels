// Shared helper to authorize Vercel Cron invocations.
//
// Vercel Cron sends `Authorization: Bearer $CRON_SECRET` per Vercel docs. We
// also accept `x-cron-secret` for non-Vercel cron services.

export function authorizeCron(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production"; // dev convenience
  const auth = req.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;
  const xhdr = req.headers.get("x-cron-secret");
  return xhdr === secret;
}
