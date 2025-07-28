import { NextResponse } from "next/server";

const DISCORD_STATUS_FETCH_URL = process.env.DISCORD_STATUS_FETCH_URL;

export async function GET() {
  try {
    const envCheck = {
      DISCORD_STATUS_FETCH_URL: !!DISCORD_STATUS_FETCH_URL,
      url: DISCORD_STATUS_FETCH_URL || "Not set"
    };

    if (!DISCORD_STATUS_FETCH_URL) {
      return NextResponse.json({
        error: "DISCORD_STATUS_FETCH_URL not configured",
        envCheck,
        instructions: "Add DISCORD_STATUS_FETCH_URL to your .env.local file"
      });
    }

    const response = await fetch(DISCORD_STATUS_FETCH_URL, {
      headers: {
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(10000)
    });

    const responseData = await response.json();

    return NextResponse.json({
      envCheck,
      apiTest: {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        data: responseData
      }
    });

  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error",
      envCheck: {
        DISCORD_STATUS_FETCH_URL: !!DISCORD_STATUS_FETCH_URL,
        url: DISCORD_STATUS_FETCH_URL || "Not set"
      }
    });
  }
} 