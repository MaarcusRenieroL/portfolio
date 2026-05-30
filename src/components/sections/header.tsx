import { Building2Icon, MapPinnedIcon } from "lucide-react";
import { FC } from "react";
import { ScrambleText } from "../misc/scramble-text";

export const Header: FC = () => {
  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          <ScrambleText text="maarcus reniero l" />
        </h1>

        <div className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
          <MapPinnedIcon className="h-4 w-4" />
          <span>chennai, india</span>
        </div>

        <div className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
          <Building2Icon className="h-4 w-4" />
          <span>developer 1 — software engineering @ ust healthproof</span>
        </div>
      </div>

      <div>
        <p className="max-w-3xl text-sm leading-7 text-foreground/90 sm:text-base">
          I’m a 22-year-old full-stack dev from Chennai with a full-stack dream: to run an entire IT firm end to end. Off duty, I’m chasing sunsets on two wheels, strumming riffs on my guitar, or diving into anime, films, and rabbit holes my curiosity finds. Becoming the jack of all trades — one repo, one rep, one revelation at a time.
        </p>
      </div>
    </section>
  );
};
