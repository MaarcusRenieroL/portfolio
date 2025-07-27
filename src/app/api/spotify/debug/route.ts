import { NextResponse } from "next/server";

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SECRET_ID = process.env.SPOTIFY_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

export async function GET() {
  try {
    // Check environment variables
    const envCheck = {
      CLIENT_ID: !!CLIENT_ID,
      SECRET_ID: !!SECRET_ID,
      REFRESH_TOKEN: !!REFRESH_TOKEN,
    };

    console.log("Environment variables check:", envCheck);

    if (!CLIENT_ID || !SECRET_ID || !REFRESH_TOKEN) {
      return NextResponse.json({
        error: "Missing environment variables",
        envCheck
      });
    }

    // Test token endpoint
    const basic = Buffer.from(`${CLIENT_ID}:${SECRET_ID}`).toString("base64");
    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
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

    const tokenData = await tokenResponse.json();
    console.log("Token response:", tokenData);

    if (!tokenData.access_token) {
      return NextResponse.json({
        error: "Failed to get access token",
        tokenData
      });
    }

    // Test different Spotify endpoints
    const endpoints = [
      "https://api.spotify.com/v1/me/player",
      "https://api.spotify.com/v1/me/player/currently-playing",
      "https://api.spotify.com/v1/me"
    ];

    const results = {};

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
          }
        });

        const data = await response.json();
        results[endpoint] = {
          status: response.status,
          data: data
        };
      } catch (error) {
        results[endpoint] = {
          error: error.message
        };
      }
    }

    return NextResponse.json({
      envCheck,
      tokenData: {
        access_token: tokenData.access_token ? "Present" : "Missing",
        expires_in: tokenData.expires_in,
        token_type: tokenData.token_type
      },
      endpoints: results
    });

  } catch (error) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json({
      error: error.message
    });
  }
} 