import Link from "next/link";
import { FC } from "react";
import { WORK_EXPERIENCE } from "~/lib/constants";

export const WorkExperience: FC = () => {


  return (

    <div className="flex flex-col gap-10">
      <h1 className="text-4xl font-bold">
        work experience
      </h1>

      <div className="flex flex-col gap-8">
        {WORK_EXPERIENCE.map((experience) => {
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
