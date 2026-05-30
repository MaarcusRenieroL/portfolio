import { NextResponse } from "next/server";
import { Artist } from "~/lib/types";

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SECRET_ID = process.env.SPOTIFY_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;
const basic = Buffer.from(`${CLIENT_ID}:${SECRET_ID}`).toString("base64");

const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_ENDPOINT = "https://api.spotify.com/v1/me/player/currently-playing";
const PLAYBACK_STATE_ENDPOINT = "https://api.spotify.com/v1/me/player";

type SpotifyTrack = {
  name: string;
  artists: Artist[];
  album: {
    name: string;
    images: { url: string }[];
  };
  external_urls: {
    spotify: string;
  };
  duration_ms: number;
};

type SpotifyPlayback = {
  is_playing?: boolean;
  item?: SpotifyTrack | null;
  progress_ms?: number;
};

type CachedToken = {
  accessToken: string;
  expiresAt: number;
};

let cachedToken: CachedToken | null = null;

async function getAccessToken(): Promise<string> {
  if (!CLIENT_ID || !SECRET_ID || !REFRESH_TOKEN) {
    throw new Error("missing spotify environment variables");
  }

  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.accessToken;
  }

  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: REFRESH_TOKEN,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`failed to get access token: ${data.error_description || data.error || "unknown error"}`);
  }

  cachedToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + ((data.expires_in ?? 3600) - 60) * 1000,
  };

  return cachedToken.accessToken;
}

function toSpotifyStatus(playback: SpotifyPlayback) {
  if (!playback?.is_playing || !playback.item) {
    return { isPlaying: false };
  }

  return {
    isPlaying: true,
    title: playback.item.name,
    artist: playback.item.artists.map((artist) => artist.name).join(", "),
    album: playback.item.album.name,
    albumImageUrl: playback.item.album.images[0]?.url || "",
    songUrl: playback.item.external_urls.spotify,
    progress: playback.progress_ms || 0,
    duration: playback.item.duration_ms || 0,
  };
}

export async function GET() {
  try {
    const accessToken = await getAccessToken();

    const playbackResponse = await fetch(PLAYBACK_STATE_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      next: { revalidate: 5 },
    });

    if (playbackResponse.status === 200) {
      const playbackData = await playbackResponse.json() as SpotifyPlayback;

      if (playbackData.is_playing && playbackData.item) {
        return NextResponse.json(toSpotifyStatus(playbackData));
      }
    }

    const response = await fetch(NOW_PLAYING_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      next: { revalidate: 5 },
    });

    if (response.status === 204 || response.status > 400) {
      return NextResponse.json({
        isPlaying: false
      });
    }

    const song = await response.json() as SpotifyPlayback;

    if (!song || !song.item) {
      return NextResponse.json({
        isPlaying: false
      });
    }

    return NextResponse.json(toSpotifyStatus(song));
  } catch (error) {
    console.error("error fetching spotify data:", error);
    return NextResponse.json({
      isPlaying: false
    });
  }
}
