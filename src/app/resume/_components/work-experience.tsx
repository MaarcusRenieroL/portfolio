import { FC } from "react";
import { Button } from "../../../components/ui/button";
import { FaLaptop } from "react-icons/fa";
import { cn } from "~/lib/utils";
import { geistMono } from "~/lib/font";
import { workExperienceList } from "~/lib/constants";
import { WorkExperience as WorkExperienceType } from "~/lib/types";

export const WorkExperience: FC = () => {
  return (
    <div>
      <div className="flex gap-5 items-center">
        <Button variant="outline" size="icon">
          <FaLaptop className="h-4 w-4" />
        </Button>
        <h1 className={cn("text-2xl font-bold", geistMono.className)}>
          Work Experience
        </h1>
      </div>
      <div className="ml-4">
        <ol className="relative border-s border-gray-200 dark:border-gray-700">
          <br />
          {workExperienceList.map((workExperience: WorkExperienceType) => (
            <li className="mb-10 ms-4" key={workExperience.companyName}>
              <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-black dark:border-gray-900 dark:bg-gray-700"></div>
              <time className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                {workExperience.time}
              </time>
              <h3
                className={cn(
                  "text-lg font-semibold text-gray-900 dark:text-white",
                  geistMono.className
                )}
              >
                {workExperience.companyName}
              </h3>
              <p className="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">
                {workExperience.role}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};
