import Link from "next/link"
import { LINKS } from "~/lib/constants"
import { DiscordStatus } from "../misc/discord-status"
import { SpotifyStatus } from "../misc/spotify-status"
import { ScrambleText } from "../misc/scramble-text"

export const Footer = () => {
  return (
    <footer className="flex w-full flex-col gap-6 border-t border-border/60 py-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold sm:text-3xl">
          <ScrambleText text="links" />
        </h1>
        <span className="hidden text-xs uppercase text-muted-foreground sm:inline">
          keep in touch
        </span>
      </div>
      <div className="flex w-full flex-wrap gap-x-5 gap-y-3 border border-border/60 bg-card/35 p-4">
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
        <DiscordStatus />
        <SpotifyStatus />
        <Link href="/resume" className="text-sm text-muted-foreground transition-colors duration-300 hover:text-primary">resume</Link>
      </div>
    </footer>
  )
}
