import { NextResponse } from "next/server";

/**
 * My Discord/Spotify presence, fetched from Lanyard by the server so visitors' browsers never
 * contact a third party (see /privacy). Trimmed to what the badge shows, cached 30 seconds.
 */
const USER_ID = process.env.LANYARD_USER_ID || "1363042192343699536";

type Raw = {
  discord_status?: string;
  listening_to_spotify?: boolean;
  spotify?: { song?: string; artist?: string; track_id?: string } | null;
  activities?: { name?: string; type?: number; details?: string; state?: string }[];
};

export async function GET() {
  try {
    const res = await fetch(`https://api.lanyard.rest/v1/users/${USER_ID}`, { next: { revalidate: 30 }, signal: AbortSignal.timeout(4000) });
    const json = (await res.json()) as { success?: boolean; data?: Raw };
    if (!json.success || !json.data) throw new Error("no data");
    const d = json.data;
    const body = {
      discord_status: (["online", "idle", "dnd", "offline"].includes(d.discord_status ?? "") ? d.discord_status : "offline") as "online" | "idle" | "dnd" | "offline",
      listening_to_spotify: Boolean(d.listening_to_spotify && d.spotify),
      spotify: d.listening_to_spotify && d.spotify ? { song: String(d.spotify.song ?? ""), artist: String(d.spotify.artist ?? ""), track_id: /^[A-Za-z0-9]+$/.test(d.spotify.track_id ?? "") ? d.spotify.track_id : undefined } : null,
      activities: (d.activities ?? []).slice(0, 5).map((a) => ({ name: String(a.name ?? ""), type: Number(a.type ?? 0), details: a.details ? String(a.details) : undefined, state: a.state ? String(a.state) : undefined })),
    };
    return NextResponse.json(body, { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } });
  } catch {
    return NextResponse.json(null, { status: 503, headers: { "Cache-Control": "public, s-maxage=30" } });
  }
}
