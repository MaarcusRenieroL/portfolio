"use client";

import dynamic from "next/dynamic";

const GitHubCalendar = dynamic(
  () =>
    import("react-github-calendar").then((mod) => mod.GitHubCalendar),
  { ssr: false }
);

export const GithubContributions = () => {
  return (
    <section className="flex w-full flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xs font-semibold uppercase text-muted-foreground">
          github activity
        </h2>
      </div>

      <div className="w-full overflow-x-auto border border-border/60 bg-card/45 p-4">
        <GitHubCalendar
          username="MaarcusRenieroL"
          blockSize={12}
          blockMargin={4}
          fontSize={14}
          theme={{
            dark: [
              "#161616",
              "#2a2a2a",
              "#3a3a3a",
              "#5a5a5a",
              "#8a8a8a",
            ],
          }}
        />
      </div>
    </section>
  );
};
