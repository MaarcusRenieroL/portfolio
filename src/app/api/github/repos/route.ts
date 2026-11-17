import { NextResponse } from "next/server";
import { getGitHubRepos } from "~/lib/server/github-repos";

export type { GitHubRepo } from "~/lib/server/github-repos";

export const revalidate = 3600; // ISR cache for 1 hour

export async function GET() {
  const data = await getGitHubRepos();
  return NextResponse.json(data, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
}
