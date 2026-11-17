/** One day in the contribution calendar. `level` is GitHub's own 0-4 bucket, the same one github.com colours by. */
export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface Contributions {
  total: number;
  /** Columns of 7 days (Sunday first); the first and last week can be partial. */
  weeks: ContributionDay[][];
}

const LEVELS = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 } as const;

const QUERY = `query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount contributionLevel } }
      }
    }
  }
}`;

type Calendar = {
  totalContributions: number;
  weeks: { contributionDays: { date: string; contributionCount: number; contributionLevel: keyof typeof LEVELS }[] }[];
};

/**
 * The last year of GitHub contributions, cached for an hour.
 * Returns null when there is no token or GitHub fails: the caller hides the
 * graph rather than showing anything that isn't real.
 */
export async function getContributions(): Promise<Contributions | null> {
  const token = process.env.GITHUB_TOKEN;
  const login = process.env.GITHUB_USERNAME;
  if (!token || !login) return null;

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: { Authorization: `bearer ${token}`, "Content-Type": "application/json", "User-Agent": "portfolio" },
      body: JSON.stringify({ query: QUERY, variables: { login } }),
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: { user?: { contributionsCollection?: { contributionCalendar?: Calendar } } } };
    const cal = json.data?.user?.contributionsCollection?.contributionCalendar;
    if (!cal?.weeks?.length) return null;
    return {
      total: cal.totalContributions,
      weeks: cal.weeks.map((w) =>
        w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount, level: LEVELS[d.contributionLevel] ?? 0 })),
      ),
    };
  } catch {
    return null;
  }
}
