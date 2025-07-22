"use client"

import Link from "next/link"
import { Button } from "../ui/button"
import { GithubIcon, GlobeIcon } from "lucide-react"
import { useState } from "react"
import { PROJECTS } from "~/lib/constants"
import { Badge } from "../ui/badge"

export const Projects = () => {

  const [hovered, setHovered] = useState<boolean>(false);

  const projects = PROJECTS.sort((a, b) => {
    const aDate = a.endDate === "Ongoing" ? new Date(3000, 0, 1) : new Date(a.endDate)
    const bDate = b.endDate === "Ongoing" ? new Date(3000, 0, 1) : new Date(b.endDate)
    return bDate.getTime() - aDate.getTime()
  })

  return (
    <div className="flex flex-col w-full gap-10">
      <h1 className="text-4xl font-bold">projects</h1>
      <div className="flex flex-col w-full gap-4">
        {projects.slice(0, 3).map((project) => (
          <div
            key={project.id}
            className="w-full flex flex-col gap-5 group transition-all duration-200 border p-6 hover:border-primary"
          >
            <h2 className="text-2xl font-semibold group-hover:text-primary transition-all duration-200">
              {project.title}
            </h2>
            <p className="text-sm">{project.description}</p>
            <div className="flex flex-col gap-2">
              <p className="text-md font-semibold">technologies</p>
              <div className="flex flex-wrap gap-2">
                {project.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary">{skill.toLowerCase()}</Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-end gap-4">
              <Link href={project.githubLink} target="_blank">
                <Button
                  size="icon"
                  variant="outline"
                  className="transition-all duration-200 group-hover:scale-105 group-hover:border-primary group-hover:text-primary"
                >
                  <GithubIcon className="h-4 w-4" />
                </Button>
              </Link>

              {project.hostedLink && (
                <Link href={project.hostedLink} target="_blank">
                  <Button
                    size="icon"
                    variant="outline"
                    className="transition-all duration-200 group-hover:scale-105 group-hover:border-primary group-hover:text-primary"
                  >
                    <GlobeIcon className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>

        ))}
      </div>
      <div className="flex items-center justify-end w-full">
        <Link href="/projects">
          <Button variant={hovered ? "default" : "outline"} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>View all</Button>
        </Link>
      </div>
    </div>
  )
}


