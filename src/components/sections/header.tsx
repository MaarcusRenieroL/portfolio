import { Building2Icon, MapPinnedIcon } from "lucide-react";
import { FC } from "react";

export const Header: FC = () => {
  return (
    <div className="flex flex-col gap-10">
      {/* Top Section: Name, Location, Title */}
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl font-bold tracking-tight">
          maarcus reniero l
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

      {/* Bio Section */}
      <div>
        <p className="text-md leading-relaxed text-foreground">
          I’m a 22-year-old full-stack dev from Chennai with a full-stack dream: to run an entire IT firm end to end. Sounds delusional? Maybe. But I’ll get there. Off duty, I’m chasing sunsets on two wheels, strumming riffs on my guitar, or diving into anime, films, and rabbit holes my curiosity finds. Becoming the jack of all trades — one repo, one rep, one revelation at a time.
        </p>
      </div>
    </div>
  );
};
