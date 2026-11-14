import { NextResponse } from "next/server";

export const revalidate = 3600; // ISR cache for 1 hour

export interface GitHubRepo {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  stars: number;
  forks: number;
  language: string | null;
  topics: string[];
  htmlUrl: string;
  homepage: string | null;
  updatedAt: string;
  isFork: boolean;
}

const GITHUB_USERNAME = "MaarcusRenierol";

export async function GET() {
  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "portfolio-github-sync",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=pushed&per_page=30`,
      { headers, next: { revalidate: 3600 } }
    );

    if (!res.ok) {
      // Fallback data when offline or rate-limited
      return NextResponse.json({
        repos: [
          {
            id: 1,
            name: "nyx",
            fullName: `${GITHUB_USERNAME}/nyx`,
            description: "A fast, modular and secure backend framework written in TypeScript and Go.",
            stars: 14,
            forks: 3,
            language: "TypeScript",
            topics: ["backend", "go", "typescript", "systems"],
            htmlUrl: `https://github.com/${GITHUB_USERNAME}/nyx`,
            homepage: "https://maarcus.dev",
            updatedAt: new Date().toISOString(),
            isFork: false,
          },
          {
            id: 2,
            name: "next-kit",
            fullName: `${GITHUB_USERNAME}/next-kit`,
            description: "High-performance production starter for Next.js 16 App Router.",
            stars: 28,
            forks: 7,
            language: "TypeScript",
            topics: ["nextjs", "react", "tailwindcss", "template"],
            htmlUrl: `https://github.com/${GITHUB_USERNAME}/next-kit`,
            homepage: "https://maarcus.dev",
            updatedAt: new Date().toISOString(),
            isFork: false,
          },
        ],
        totalStars: 42,
        cachedAt: new Date().toISOString(),
      });
    }

    const raw = (await res.json()) as Array<{
      id: number;
      name: string;
      full_name: string;
      description: string | null;
      stargazers_count: number;
      forks_count: number;
      language: string | null;
      topics?: string[];
      html_url: string;
      homepage: string | null;
      pushed_at: string;
      fork: boolean;
    }>;

    const repos: GitHubRepo[] = raw.map((r) => ({
      id: r.id,
      name: r.name,
      fullName: r.full_name,
      description: r.description,
      stars: r.stargazers_count,
      forks: r.forks_count,
      language: r.language,
      topics: r.topics ?? [],
      htmlUrl: r.html_url,
      homepage: r.homepage,
      updatedAt: r.pushed_at,
      isFork: r.fork,
    }));

    const totalStars = repos.reduce((acc, r) => acc + r.stars, 0);

    return NextResponse.json(
      {
        repos,
        totalStars,
        cachedAt: new Date().toISOString(),
      },
      {
        headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
      }
    );
  } catch {
    return NextResponse.json({
      repos: [],
      totalStars: 0,
      cachedAt: new Date().toISOString(),
    });
  }
}
