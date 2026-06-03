import { GithubIcon } from "lucide-react";
import Link from "next/link";

type ContributionDay = {
  date: string;
  contributionCount: number;
  weekday: number;
};

type ContributionWeek = {
  contributionDays: ContributionDay[];
};

type GitHubContributionResponse = {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: {
          totalContributions: number;
          weeks: ContributionWeek[];
        };
      };
    };
  };
  errors?: Array<{ message: string }>;
};

const MONTHS = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];

async function getGithubContributions() {
  const token = process.env.GITHUB_TOKEN;
  const username = process.env.GITHUB_USERNAME ?? "MaarcusRenieroL";

  if (!token) {
    return null;
  }

  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                weekday
              }
            }
          }
        }
      }
    }
  `;

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables: {
        username,
      },
    }),
    next: {
      revalidate: 60 * 60 * 6,
    },
  });

  if (!response.ok) {
    return null;
  }

  const json = (await response.json()) as GitHubContributionResponse;

  if (json.errors?.length) {
    return null;
  }

  const calendar =
    json.data?.user?.contributionsCollection?.contributionCalendar;

  if (!calendar) {
    return null;
  }

  return {
    username,
    totalContributions: calendar.totalContributions,
    weeks: calendar.weeks,
  };
}

function getContributionLevel(count: number) {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 10) return 3;

  return 4;
}

const levelClassName: Record<number, string> = {
  0: "bg-muted/45",
  1: "bg-primary/20",
  2: "bg-primary/35",
  3: "bg-primary/55",
  4: "bg-primary/75",
};

function getMonthLabels(weeks: ContributionWeek[]) {
  return weeks
    .map((week, index) => {
      const firstDay = week.contributionDays[0];

      if (!firstDay) return null;

      const date = new Date(firstDay.date);
      const month = date.getMonth();

      const previousWeek = weeks[index - 1];
      const previousFirstDay = previousWeek?.contributionDays[0];

      if (!previousFirstDay) {
        return {
          label: MONTHS[month],
          weekIndex: index,
        };
      }

      const previousDate = new Date(previousFirstDay.date);
      const previousMonth = previousDate.getMonth();

      if (month === previousMonth) return null;

      return {
        label: MONTHS[month],
        weekIndex: index,
      };
    })
    .filter((item): item is { label: string; weekIndex: number } =>
      Boolean(item),
    );
}

export const GithubContributions = async () => {
  const data = await getGithubContributions();

  if (!data) {
    return null;
  }

  const monthLabels = getMonthLabels(data.weeks);

  return (
    <section className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold tracking-wide text-muted-foreground">
            github activity
          </h2>

          <p className="mt-2 text-sm text-foreground">
            {data.totalContributions} contributions in the last year
          </p>
        </div>

        <Link
          href={`https://github.com/${data.username}`}
          target="_blank"
          rel="noreferrer"
          className="grid size-10 place-items-center border border-border/70 bg-background/40 text-foreground transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
          aria-label="open github profile"
        >
          <GithubIcon className="size-5" />
        </Link>
      </div>

      <div className="border border-border/60 bg-background/40 p-4">
        <div className="space-y-3">
          <div className="relative h-5 pl-8 pr-2 text-xs text-muted-foreground">
            {monthLabels.map((month) => (
              <span
                key={`${month.label}-${month.weekIndex}`}
                className="absolute top-0"
                style={{
                  left: `calc(2rem + (${month.weekIndex} / ${data.weeks.length}) * (100% - 2.5rem))`,
                }}
              >
                {month.label}
              </span>
            ))}
          </div>

          <div
            className="grid grid-flow-col grid-rows-7 gap-[3px] overflow-hidden"
            style={{
              gridTemplateColumns: `repeat(${data.weeks.length}, minmax(0, 1fr))`,
            }}
          >
            {data.weeks.map((week, weekIndex) => {
              const daysByWeekday = new Map(
                week.contributionDays.map((day) => [day.weekday, day]),
              );

              return Array.from({ length: 7 }).map((_, weekday) => {
                const day = daysByWeekday.get(weekday);

                if (!day) {
                  return (
                    <span
                      key={`${weekIndex}-${weekday}-empty`}
                      className="aspect-square w-full rounded-[2px] bg-transparent"
                    />
                  );
                }

                const level = getContributionLevel(day.contributionCount);

                return (
                  <span
                    key={day.date}
                    className={`aspect-square w-full rounded-[2px] ${levelClassName[level]}`}
                    title={`${day.contributionCount} contributions on ${day.date}`}
                  />
                );
              });
            })}
          </div>

          <div className="flex items-center justify-between gap-4 pt-1">
            <p className="text-sm text-foreground">
              {data.totalContributions} contributions in the last year
            </p>

            <div className="flex items-center gap-1.5 text-sm text-foreground">
              <span>less</span>

              {[0, 1, 2, 3, 4].map((level) => (
                <span
                  key={level}
                  className={`size-3 rounded-[2px] ${levelClassName[level]}`}
                />
              ))}

              <span>more</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
