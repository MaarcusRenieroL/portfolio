import Link from "next/link";

import { LINKS } from "~/lib/constants";
import { ScrambleText } from "../misc/scramble-text";
import { SpotifyNowPlaying } from "../misc/spotify-now-playing";
import { DiscordPresence } from "../misc/discord-presence";

export const Footer = () => {
  return (
    <footer className="flex w-full flex-col gap-5 border-t border-border/60 py-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold sm:text-3xl">
          <ScrambleText text="links" />
        </h1>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <DiscordPresence />
          <SpotifyNowPlaying />
        </div>
      </div>

      <div className="grid w-full grid-cols-2 gap-3 border border-border/60 bg-card/35 p-4 sm:flex sm:flex-wrap sm:gap-x-5 sm:gap-y-3">
        {LINKS.map((link) => (
          <Link
            key={link.name}
            href={link.url}
            target="_blank"
            className="text-sm text-muted-foreground transition-colors duration-300 hover:text-primary"
          >
            {link.name}
          </Link>
        ))}

        <Link
          href="/about"
          className="text-sm text-muted-foreground transition-colors duration-300 hover:text-primary"
        >
          about
        </Link>

        <Link
          href="/contact"
          className="text-sm text-muted-foreground transition-colors duration-300 hover:text-primary"
        >
          contact
        </Link>

        <Link
          href="/resume"
          className="text-sm text-muted-foreground transition-colors duration-300 hover:text-primary"
        >
          resume
        </Link>
      </div>
    </footer>
  );
};
