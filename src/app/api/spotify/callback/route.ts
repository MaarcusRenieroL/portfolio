import { NextResponse } from "next/server";

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:3000/api/spotify/callback";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.json({ error: `Authorization failed: ${error}` });
  }

  if (!code) {
    return NextResponse.json({ error: "No authorization code received" });
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return NextResponse.json({ error: "Spotify credentials not configured" });
  }

  try {
    const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
    
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ 
        error: "Failed to exchange code for tokens",
        details: data 
      });
    }

    // Return the tokens (in production, you'd want to store these securely)
    return NextResponse.json({
      success: true,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      message: "Copy the refresh_token value and update your .env file with SPOTIFY_REFRESH_TOKEN=<this_value>"
    });

  } catch (error) {
    console.error("Token exchange error:", error);
    return NextResponse.json({ 
      error: "Failed to exchange authorization code",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
} 