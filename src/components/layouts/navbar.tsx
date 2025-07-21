import Link from "next/link";
import { FC } from "react";

export const Navbar: FC = () => {

  const links: string[] = ["home", "blog", "projects"]

  return (
    <nav className="w-full flex items-center justify-start gap-5">
      {links.map((link) => {
        return (
          <Link key={link} href={`/${link === "home" ? "" : link}`} className="text-sm hover:text-green-500 transition-colors duration-500">{"[" + link.at(0) + "] " + link}</Link>
        )
      })}
    </nav >
  )
}
