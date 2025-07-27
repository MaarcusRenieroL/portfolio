import { NextResponse } from "next/server";

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const REDIRECT_URI = "http://localhost:3000/api/spotify/callback";

export async function GET() {
  if (!CLIENT_ID) {
    return NextResponse.json({ error: "SPOTIFY_CLIENT_ID not configured" });
  }

  const scopes = [
    "user-read-currently-playing",
    "user-read-playback-state",
    "user-read-private"
  ];

  const authUrl = new URL("https://accounts.spotify.com/authorize");
  authUrl.searchParams.append("client_id", CLIENT_ID);
  authUrl.searchParams.append("response_type", "code");
  authUrl.searchParams.append("redirect_uri", REDIRECT_URI);
  authUrl.searchParams.append("scope", scopes.join(" "));
  authUrl.searchParams.append("show_dialog", "true");

  return NextResponse.redirect(authUrl.toString());
} 