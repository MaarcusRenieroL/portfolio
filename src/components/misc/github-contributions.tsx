"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { GithubIcon } from "lucide-react";

import { Button } from "../ui/button";

const GitHubCalendar = dynamic(
  () =>
    import("react-github-calendar").then((mod) => mod.GitHubCalendar),
  { ssr: false }
);

export const GithubContributions = () => {
  return (
    <section className="flex w-full flex-col gap-4">
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xs font-semibold uppercase text-muted-foreground">
            github activity
          </h2>
          <p className="text-sm text-foreground">330 contributions in the last year</p>
        </div>

        <Button asChild size="icon" variant="ghost" className="size-8 rounded-none border border-border/60 bg-background/60 hover:border-primary/50 hover:bg-primary/10 hover:text-primary">
          <Link
            href="https://github.com/MaarcusRenieroL"
            target="_blank"
            rel="noreferrer"
            aria-label="Open GitHub profile"
          >
            <GithubIcon className="h-4 w-4" />
          </Link>
        </Button>
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
