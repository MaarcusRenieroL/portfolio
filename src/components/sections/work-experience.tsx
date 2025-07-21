import Link from "next/link";
import { FC } from "react";

export const WorkExperience: FC = () => {

  const workExperience = [
    {
      id: 1,
      title: "hardware and network engineering intern",
      company: "systech",
      href: "https://systech.com",
      duration: "jan 2023 - feb 2023",
      description: "completed ccna and ccnp courses, applying theoretical knowledge to configure and troubleshoot network are tools, showcasing hands-on expertise in optimizing network performance."
    },

    {
      id: 2,
      title: "full stack developer intern",
      company: "steam troops innovation labs",
      href: "https://systech.com",
      duration: "aug 2023 - dec 2023",
      description: "played a pivotal role in the company's first product development using next.js, typescript, tailwind css and strapi by actively managing daily sprints, collaborating with a team."
    },

    {
      id: 3,
      title: "full stack developer intern",
      company: "matlync",
      href: "https://systech.com",
      duration: "jan 2024 - feb 2024",
      description: "co-ordinating with teams on multiple projects taken up by the organization, emphasizing on strapi cms, postbytz and next.js, testing and resolving issues iteratively."
    },

    {
      id: 4,
      title: "developer 1 - software engineering",
      company: "ust healthproof",
      href: "https://systech.com",
      duration: "jan 2025 - present",
      description: "currently engaged in building a new internal project from the ground up, collaborating with cross-functional teams to architect and implement scalable solutions."
    },

  ]

  return (

    <div className="flex flex-col gap-10">
      <h1 className="text-4xl font-bold">
        Work Experience
      </h1>

      <div className="flex flex-col gap-8">
        {workExperience.map((experience) => {
          return (
            <Link
              key={experience.id}
              target="_blank"
              href={experience.href}
              className="group block"
            >
              <h3 className="text-xl font-semibold mb-1 group-hover:text-green-500 transition-colors duration-200">
                {experience.company}
              </h3>
              <p className="text-sm mb-2">{experience.title} {"(" + experience.duration + ")"}</p>
              <p className="text-sm">{experience.description}</p>
            </Link>
          );
        })}
      </div>

    </div>
  )
}
