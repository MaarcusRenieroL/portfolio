import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_ENDPOINT =
  "https://api.spotify.com/v1/me/player/currently-playing";
const RECENTLY_PLAYED_ENDPOINT =
  "https://api.spotify.com/v1/me/player/recently-played?limit=1";

type SpotifyItem = {
  name: string;
  artists?: { name: string }[];
  album?: { name?: string; images?: { url: string }[] };
  external_urls?: { spotify?: string };
};

const noStore = { "Cache-Control": "no-store" };

async function getAccessToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return null;
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(TOKEN_ENDPOINT, {
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

  if (!response.ok) {
    console.error("[spotify] token refresh failed:", response.status);
    return null;
  }

  const data = (await response.json()) as { access_token?: string };
  return data.access_token ?? null;
}

function normalize(item: SpotifyItem, isPlaying: boolean) {
  return {
    isPlaying,
    title: item.name,
    artist: item.artists?.map((artist) => artist.name).join(", ") ?? "",
    album: item.album?.name ?? "",
    albumImageUrl: item.album?.images?.[0]?.url ?? "",
    songUrl: item.external_urls?.spotify ?? "",
  };
}

export async function GET() {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return NextResponse.json({ isPlaying: false }, { headers: noStore });
  }

  const headers = { Authorization: `Bearer ${accessToken}` };

  const nowPlaying = await fetch(NOW_PLAYING_ENDPOINT, {
    headers,
    cache: "no-store",
  });

  if (nowPlaying.status === 200) {
    const data = (await nowPlaying.json()) as {
      item?: SpotifyItem;
      is_playing?: boolean;
    };

    if (data?.item) {
      return NextResponse.json(normalize(data.item, Boolean(data.is_playing)), {
        headers: noStore,
      });
    }
  }

  // nothing playing right now — fall back to the most recent track
  const recent = await fetch(RECENTLY_PLAYED_ENDPOINT, {
    headers,
    cache: "no-store",
  });

  if (recent.ok) {
    const data = (await recent.json()) as {
      items?: { track: SpotifyItem }[];
    };
    const track = data?.items?.[0]?.track;

    if (track) {
      return NextResponse.json(normalize(track, false), { headers: noStore });
    }
  }

  return NextResponse.json({ isPlaying: false }, { headers: noStore });
}
