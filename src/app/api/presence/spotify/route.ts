import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface SpotifyResponse {
  isPlaying: boolean;
  title?: string;
  artist?: string;
  album?: string;
  albumArt?: string;
  songUrl?: string;
}

export async function GET() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return NextResponse.json({ isPlaying: false });
  }

  try {
    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
      cache: "no-store",
    });

    if (!tokenRes.ok) throw new Error("Failed to refresh Spotify token");
    const { access_token } = (await tokenRes.json()) as { access_token: string };

    const playerRes = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
      headers: { Authorization: `Bearer ${access_token}` },
      cache: "no-store",
    });

    if (playerRes.status === 204 || playerRes.status > 400) {
      return NextResponse.json({ isPlaying: false });
    }

    const song = await playerRes.json();
    if (!song.item) {
      return NextResponse.json({ isPlaying: false });
    }

    const response: SpotifyResponse = {
      isPlaying: Boolean(song.is_playing),
      title: song.item.name,
      artist: song.item.artists?.map((a: { name: string }) => a.name).join(", "),
      album: song.item.album?.name,
      albumArt: song.item.album?.images?.[0]?.url,
      songUrl: song.item.external_urls?.spotify,
    };

    return NextResponse.json(response, {
      headers: { "Cache-Control": "public, s-maxage=10, stale-while-revalidate=5" },
    });
  } catch {
    return NextResponse.json({ isPlaying: false });
  }
}
