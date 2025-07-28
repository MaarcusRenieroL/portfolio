import Link from "next/link"
import { LINKS } from "~/lib/constants"
import { DiscordStatus } from "../misc/discord-status"
import { SpotifyStatus } from "../misc/spotify-status"
import { ScrollFadeIn } from "../misc/scroll-fade"
import { ScrambleText } from "../misc/scramble-text"

export const Footer = () => {
  return (
    <ScrollFadeIn>
      <footer className="flex flex-col w-full gap-10">
        <h1 className="text-4xl font-bold">
          <ScrambleText text="links" />
        </h1>
        <div className="flex w-full gap-4">
          {LINKS.map((link) => (
            <Link key={link.name} href={link.url} target="_blank" className="hover:text-primary duration-500 transition-colors text-sm">
              {link.name}
            </Link>
          ))}
          <DiscordStatus />
          <SpotifyStatus />
          <Link href="" target="_blank" className="hover:text-primary duration-500 transition-colors text-sm">resume</Link>
        </div>
      </footer>
    </ScrollFadeIn>
  )
}
