import { NextResponse } from "next/server";
import { DISCORD_ACTIVITY } from "~/lib/types";

const DISCORD_STATUS_FETCH_URL = process.env.DISCORD_STATUS_FETCH_URL;

export async function GET() {
  try {
    if (!DISCORD_STATUS_FETCH_URL) {
      return NextResponse.json({
        error: "Discord API not configured",
        result: null,
      }, { status: 500 });
    }

    const response = await fetch(DISCORD_STATUS_FETCH_URL, {
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return NextResponse.json({
        error: `Discord API error: ${response.status}`,
        result: null,
      }, { status: response.status });
    }

    const data = await response.json();

    console.log(data)

    const { discord_status: status = "offline", activities = [], discord_user } = data.data;

    const filteredActivities = activities.filter((activity: DISCORD_ACTIVITY) =>
      activity.name !== "Spotify" && activity.name !== "Custom Status"
    );

    const user = {
      username: discord_user?.global_name,
      tag: discord_user?.username
        ? `${discord_user.username}#${discord_user.discriminator}`
        : null,
      avatar: discord_user?.avatar
        ? `https://cdn.discordapp.com/avatars/${discord_user.id}/${discord_user.avatar}.png`
        : null,
      guild: discord_user?.primary_guild.tag
    };

    return NextResponse.json({
      result: {
        status,
        user,
        activities: filteredActivities,
      },
    });

  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error occurred",
      result: null,
    }, { status: 500 });
  }
}
