/** Public repositories from GitHub, cached for an hour. Nothing invented: on any failure the list is empty. */

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

export type GitHubData = { repos: GitHubRepo[]; totalStars: number; cachedAt: string };

const login = () => process.env.GITHUB_USERNAME || "MaarcusRenieroL";

export async function getGitHubRepos(): Promise<GitHubData> {
  const empty: GitHubData = { repos: [], totalStars: 0, cachedAt: new Date().toISOString() };
  const headers: Record<string, string> = { Accept: "application/vnd.github.v3+json", "User-Agent": "portfolio-github-sync" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  try {
    const res = await fetch(`https://api.github.com/users/${login()}/repos?sort=pushed&per_page=30`, {
      headers,
      next: { revalidate: 3600 },
      // A slow GitHub must never hold a page open.
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return empty;
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
    return { repos, totalStars: repos.reduce((a, r) => a + r.stars, 0), cachedAt: new Date().toISOString() };
  } catch {
    return empty;
  }
}
