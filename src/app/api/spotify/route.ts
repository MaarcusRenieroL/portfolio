import { NextResponse } from "next/server";
import { ARTIST } from "~/lib/types";

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SECRET_ID = process.env.SPOTIFY_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;
const basic = Buffer.from(`${CLIENT_ID}:${SECRET_ID}`).toString("base64")

const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token"
const NOW_PLAYING_ENDPOINT = "https://api.spotify.com/v1/me/player/currently-playing";
const PLAYBACK_STATE_ENDPOINT = "https://api.spotify.com/v1/me/player";

async function getAccessToken() {
  if (!CLIENT_ID || !SECRET_ID || !REFRESH_TOKEN) {
    throw new Error("Missing Spotify environment variables");
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
    throw new Error(`Failed to get access token: ${data.error_description || data.error || 'Unknown error'}`);
  }

  return data;
}

export async function GET() {
  try {
    const { access_token } = await getAccessToken();

    const playbackResponse = await fetch(PLAYBACK_STATE_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      }
    });

    if (playbackResponse.status === 200) {
      const playbackData = await playbackResponse.json();

      console.log("playback data: ")
      console.log(playbackData.item.artists)

      if (playbackData.is_playing && playbackData.item) {
        return NextResponse.json({
          isPlaying: true,
          title: playbackData.item.name,
          artist: playbackData.item.artists.map((artist: ARTIST) => artist.name).join(", "),
          album: playbackData.item.album.name,
          albumImageUrl: playbackData.item.album.images[0]?.url || "",
          songUrl: playbackData.item.external_urls.spotify,
          progress: playbackData.progress_ms || 0,
          duration: playbackData.item.duration_ms || 0
        });
      }
    }

    const response = await fetch(NOW_PLAYING_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      }
    });

    if (response.status === 204 || response.status > 400) {
      return NextResponse.json({
        isPlaying: false
      });
    }

    const song = await response.json();

    if (!song || !song.item) {
      return NextResponse.json({
        isPlaying: false
      });
    }

    return NextResponse.json({
      isPlaying: song.is_playing || false,
      title: song.item.name,
      artist: song.item.artists.map((artist: ARTIST) => artist.name).join(", "),
      album: song.item.album.name,
      albumImageUrl: song.item.album.images[0]?.url || "",
      songUrl: song.item.external_urls.spotify,
      progress: song.progress_ms || 0,
      duration: song.item.duration_ms || 0
    });
  } catch (error) {
    console.error("Error fetching Spotify data:", error);
    return NextResponse.json({
      isPlaying: false
    });
  }
}
