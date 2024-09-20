import { FC } from "react";
import { Button } from "../../../components/ui/button";
import { FaLaptop } from "react-icons/fa";

export const WorkExperience: FC = () => {
  return (
    <div>
      <div className="flex gap-5 items-center">
        <Button variant="outline" size="icon">
          <FaLaptop className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Work Experience</h1>
      </div>
      <div className="ml-4">
        <ol className="relative border-s border-gray-200 dark:border-gray-700">
          <br />
          <li className="mb-10 ms-4">
            <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-black dark:border-gray-900 dark:bg-gray-700"></div>
            <time className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
              Aug 2024 - Present
            </time>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              UST Global, Trivandrum
            </h3>
            <p className="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">
              Developer I - Software Engineering
            </p>
          </li>
          <li className="mb-10 ms-4">
            <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-black dark:border-gray-900 dark:bg-gray-700"></div>
            <time className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
              Jan 2024 - Feb 2024
            </time>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Matlync
            </h3>
            <p className="text-base font-normal text-gray-500 dark:text-gray-400">
              Full Stack Next.js Developer Intern
            </p>
          </li>
          <li className="ms-4">
            <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-black dark:border-gray-900 dark:bg-gray-700"></div>
            <time className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
              Aug 2023 - Dec 2023
            </time>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Steam Troops Innovation Labs
            </h3>
            <p className="text-base font-normal text-gray-500 dark:text-gray-400">
              Full Stack Next.js Developer Intern
            </p>
          </li>
        </ol>
      </div>
    </div>
  );
};
