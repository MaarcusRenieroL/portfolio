import {
  Building2Icon,
  Code2Icon,
  MapPinnedIcon,
  SparklesIcon,
  TerminalIcon,
} from "lucide-react";
import { FC } from "react";
import { ScrambleText } from "../misc/scramble-text";

export const Header: FC = () => {
  return (
    <section className="relative overflow-hidden border border-border/60 bg-card/35 p-5 sm:p-7">
      <div className="absolute inset-x-0 top-0 h-px bg-primary/60" />

      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-3">
            <div className="text-xs font-medium uppercase text-primary">
              available for focused builds
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
              <ScrambleText text="maarcus reniero l" />
            </h1>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground sm:text-right">
            <div className="border border-border/60 bg-background/40 px-3 py-2">
              <span className="block text-foreground">full-stack</span>
              <span>focus</span>
            </div>
            <div className="border border-border/60 bg-background/40 px-3 py-2">
              <span className="block text-foreground">chennai</span>
              <span>base</span>
            </div>
          </div>
        </div>

        <div className="grid gap-3 border-y border-border/60 py-4 md:grid-cols-[1fr_auto] md:items-center">
          <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <MapPinnedIcon className="h-4 w-4 text-primary" />
            <span>chennai, india</span>
          </div>

          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Building2Icon className="h-4 w-4 text-primary" />
            <span>developer 1 - software engineering @ ust healthproof</span>
          </div>
          </div>

          <div className="grid grid-cols-3 border border-border/60 bg-background/40 text-xs">
            <div className="flex flex-col gap-1 border-r border-border/60 p-3">
              <TerminalIcon className="h-4 w-4 text-primary" />
              <span className="text-foreground">next</span>
              <span className="text-muted-foreground">daily</span>
            </div>
            <div className="flex flex-col gap-1 border-r border-border/60 p-3">
              <Code2Icon className="h-4 w-4 text-primary" />
              <span className="text-foreground">spring</span>
              <span className="text-muted-foreground">work</span>
            </div>
            <div className="flex flex-col gap-1 p-3">
              <SparklesIcon className="h-4 w-4 text-primary" />
              <span className="text-foreground">zentro</span>
              <span className="text-muted-foreground">now</span>
            </div>
          </div>
        </div>

        <p className="max-w-3xl text-sm leading-7 text-foreground/90 sm:text-base">
          I’m a 22-year-old full-stack dev from Chennai with a full-stack dream: to run an entire IT firm end to end. Off duty, I’m chasing sunsets on two wheels, strumming riffs on my guitar, or diving into anime, films, and rabbit holes my curiosity finds. Becoming the jack of all trades, one repo, one rep, one revelation at a time.
        </p>
      </div>
    </section>
  );
};
