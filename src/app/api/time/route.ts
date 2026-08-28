export const dynamic = "force-dynamic";

/**
 * Authoritative clock for the countdown gate. Reading the target off the
 * client's own Date() would let anyone walk in early just by changing their
 * system time, so the lock asks the server what time it is instead.
 */
export async function GET() {
  return Response.json(
    { now: Date.now() },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
