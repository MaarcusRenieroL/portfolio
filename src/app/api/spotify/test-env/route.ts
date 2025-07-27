import { NextResponse } from "next/server";

export async function GET() {
  const envVars = {
    SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID ? "Set" : "Missing",
    SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET ? "Set" : "Missing", 
    SPOTIFY_REFRESH_TOKEN: process.env.SPOTIFY_REFRESH_TOKEN ? "Set" : "Missing"
  };

  const allSet = Object.values(envVars).every(v => v === "Set");

  return NextResponse.json({
    environment: process.env.NODE_ENV,
    allVariablesSet: allSet,
    variables: envVars,
    instructions: allSet ? "All variables are set! Try the main API endpoint." : "Please set up your environment variables in .env.local file"
  });
} 