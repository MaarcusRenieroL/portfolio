import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Default Discord User ID (or configured via DISCORD_USER_ID)
const DEFAULT_USER_ID = "715494206584061982";

export async function GET() {
  const userId = process.env.DISCORD_USER_ID ?? DEFAULT_USER_ID;

  try {
    const res = await fetch(`https://api.lanyard.rest/v1/users/${userId}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      return NextResponse.json({
        status: "online",
        customStatus: "Developing in Zoro mode",
        activity: {
          name: "Visual Studio Code",
          details: "Editing portfolio · Next.js 16",
          state: "Workspace: portfolio",
        },
      });
    }

    const data = await res.json();
    const discord = data.data;

    const vsCodeActivity = discord.activities?.find(
      (a: { name: string }) =>
        a.name === "Visual Studio Code" || a.name === "Code" || a.name === "Neovim"
    );

    return NextResponse.json({
      status: discord.discord_status ?? "online",
      customStatus:
        discord.activities?.find((a: { type: number }) => a.type === 4)?.state ??
        "Coding high-performance systems",
      activity: vsCodeActivity
        ? {
            name: vsCodeActivity.name,
            details: vsCodeActivity.details,
            state: vsCodeActivity.state,
          }
        : discord.activities?.[0]
        ? {
            name: discord.activities[0].name,
            details: discord.activities[0].details,
            state: discord.activities[0].state,
          }
        : null,
    });
  } catch {
    return NextResponse.json({
      status: "online",
      customStatus: "Developing in Zoro mode",
      activity: {
        name: "Visual Studio Code",
        details: "Editing portfolio",
        state: "Workspace: portfolio",
      },
    });
  }
}
