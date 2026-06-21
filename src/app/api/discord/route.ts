import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store" };

type LanyardActivity = {
  type: number;
  name: string;
  state?: string;
  details?: string;
};

type LanyardData = {
  discord_user: {
    id: string;
    username: string;
    global_name?: string | null;
    avatar?: string | null;
  };
  discord_status: "online" | "idle" | "dnd" | "offline";
  activities?: LanyardActivity[];
};

const offline = () =>
  NextResponse.json({ status: "offline" as const }, { headers: noStore });

export async function GET() {
  const url = process.env.DISCORD_STATUS_FETCH_URL;

  if (!url) {
    return offline();
  }

  try {
    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      console.error("[discord] lanyard fetch failed:", response.status);
      return offline();
    }

    const json = (await response.json()) as {
      success: boolean;
      data?: LanyardData;
    };

    if (!json.success || !json.data) {
      return offline();
    }

    const { discord_user: user, discord_status, activities } = json.data;

    const avatarUrl = user.avatar
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${
          user.avatar.startsWith("a_") ? "gif" : "png"
        }?size=128`
      : "";

    // skip the "custom status" entry (type 4) to surface a real activity
    const activity = activities?.find((item) => item.type !== 4);

    return NextResponse.json(
      {
        status: discord_status,
        username: user.username,
        displayName: user.global_name || user.username,
        avatarUrl,
        activity: activity
          ? {
              name: activity.name,
              details: activity.details ?? "",
              state: activity.state ?? "",
            }
          : null,
      },
      { headers: noStore },
    );
  } catch (err) {
    console.error("[discord] unexpected error:", err);
    return offline();
  }
}
