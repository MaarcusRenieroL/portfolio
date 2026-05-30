import Link from "next/link"
import { LINKS } from "~/lib/constants"
import { DiscordStatus } from "../misc/discord-status"
import { SpotifyStatus } from "../misc/spotify-status"
import { ScrambleText } from "../misc/scramble-text"

export const Footer = () => {
  return (
    <footer className="flex w-full flex-col gap-8 border-t border-border/60 pt-10">
      <h1 className="text-3xl font-bold sm:text-4xl">
        <ScrambleText text="links" />
      </h1>
      <div className="flex w-full flex-wrap gap-x-5 gap-y-3">
        {LINKS.map((link) => (
          <Link
            key={link.name}
            href={link.url}
            target="_blank"
            className="text-sm text-foreground/90 transition-colors duration-300 hover:text-primary"
          >
            {link.name}
          </Link>
        ))}
        <DiscordStatus />
        <SpotifyStatus />
        <Link href="/resume" className="text-sm text-foreground/90 transition-colors duration-300 hover:text-primary">resume</Link>
      </div>
    </footer>
  )
}
