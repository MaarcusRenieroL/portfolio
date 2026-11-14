/** Uptime probes: always 200 with no-store, never touches anything that can fail. */
export function GET() {
  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
