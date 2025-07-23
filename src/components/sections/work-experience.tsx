import Link from "next/link";
import { FC } from "react";
import { WORK_EXPERIENCE } from "~/lib/constants";
import { Button } from "../ui/button";
import { ArrowUpRightIcon } from "lucide-react";

export const WorkExperience: FC = () => {
  return (
    <section className="flex flex-col gap-16">
      <h1 className="text-4xl font-bold tracking-tight">work experience</h1>

      <div className="flex flex-col gap-8">
        {WORK_EXPERIENCE.map((experience) => (
          <div
            key={experience.id}
            className="group relative flex flex-col w-full gap-5 border p-6 transition-all duration-300 ease-in-out hover:border-primary"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold transition-colors duration-300 group-hover:text-green-500">
                {experience.company}
              </h3>

              {experience.href && (
                <Link
                  href={experience.href}
                  target="_blank"
                  className="opacity-0 group-hover:opacity-100 translate-x-0 group-hover:translate-x-1 transition-all duration-500 ease-out pointer-events-none group-hover:pointer-events-auto"
                >
                  <Button size="icon" variant="ghost" className="transition-transform hover:scale-105">
                    <ArrowUpRightIcon className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>

            <p className="text-sm text-muted-foreground mb-1">
              {experience.title} ({experience.duration})
            </p>

            <ul className="list-disc pl-5 text-sm space-y-2 text-foreground leading-relaxed">
              {experience.highlights.map((point, index) => (
                <li
                  key={index}
                  className="transition-all duration-300 ease-in-out"
                >
                  {point}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};
