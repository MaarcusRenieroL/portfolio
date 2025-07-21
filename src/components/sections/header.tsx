import { Building2Icon, MapPinnedIcon } from "lucide-react";
import { FC } from "react";

export const Header: FC = () => {

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl font-bold">maarcus reniero l</h1>
        <div className="text-sm font-medium flex items-center gap-1">
          <span>
            <MapPinnedIcon className="h-4 w-4" />
          </span>
          <p>
            chennai, india
          </p>
        </div>
        <div className="text-sm font-medium flex items-center gap-1">
          <Building2Icon className="h-4 w-4" />
          <p>
            developer 1 - software engineering @ ust healthproof
          </p>
        </div>
      </div>

      <div>
        <p>
          I’m a 22-year-old developer from Chennai, a full-stack dev with a full-stack dream: to become the one guy who can run an entire IT firm, end to end. Yeah, sounds delusional. But I’ll get there. Off duty? You’ll find me chasing sunsets on two wheels, jamming on my guitar, or binging anime, films, and whatever my curiosity feeds on. In the process of becoming the jack of all trades - one repo, one rep, one revelation at a time.
        </p>
      </div>
    </div>
  )

}
