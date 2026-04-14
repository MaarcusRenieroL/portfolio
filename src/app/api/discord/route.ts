import { NextResponse } from "next/server";
import { DISCORD_ACTIVITY } from "~/lib/types";

const DISCORD_STATUS_FETCH_URL = process.env.DISCORD_STATUS_FETCH_URL;

export async function GET() {
  try {
    if (!DISCORD_STATUS_FETCH_URL) {
      return NextResponse.json(
        { error: "Discord API not configured", result: null },
        { status: 500 }
      );
    }

    const response = await fetch(DISCORD_STATUS_FETCH_URL, {
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(10000),
      next: { revalidate: 15 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Discord API error: ${response.status}`, result: null },
        { status: response.status }
      );
    }

    const data = await response.json();
    const payload = data?.data ?? {};

    const status = payload.discord_status ?? "offline";
    const activities = Array.isArray(payload.activities) ? payload.activities : [];
    const discord_user = payload.discord_user ?? {};

    const filteredActivities =
      activities?.filter?.(
        (activity: DISCORD_ACTIVITY) =>
          activity?.name !== "Spotify" &&
          activity?.name !== "Custom Status"
      ) ?? [];

    const user = {
      username:
        discord_user?.global_name ??
        discord_user?.username ??
        null,
      tag: discord_user?.username
        ? `${discord_user.username}#${discord_user.discriminator}`
        : null,
      avatar: discord_user?.avatar
        ? `https://cdn.discordapp.com/avatars/${discord_user.id}/${discord_user.avatar}.png`
        : null,
      guild: discord_user?.primary_guild?.tag ?? null,
    };

    return NextResponse.json({
      result: {
        status,
        user,
        activities: filteredActivities,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown error occurred",
        result: null,
      },
      { status: 500 }
    );
  }
}
