import Link from "next/link"
import { LINKS } from "~/lib/constants"
import { DiscordStatus } from "../misc/discord-status"

export const Footer = () => {

  return (
    <div className="flex flex-col w-full gap-10">
      <h1 className="text-4xl font-bold">links</h1>
      <div className="flex w-full gap-4">
        {LINKS.map((link) => (
          <Link key={link.name} href={link.url} target="_blank" className="hover:text-primary duration-500 transition-colors text-sm">
            {link.name}
          </Link>
        ))}
        <DiscordStatus />
      </div>
    </div>
  )
}
