import { FC } from "react";
import { FaBook } from "react-icons/fa";
import { Button } from "../ui/button";

export const Education: FC = () => {
  return (
    <div>
      <div className="flex gap-5 items-center">
        <Button variant="outline" size="icon">
          <FaBook className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Education</h1>
      </div>
      <div className="ml-4">
        <ol className="relative border-s border-gray-200 dark:border-gray-700">
          <br />
          <li className="mb-10 ms-4">
            <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-black dark:border-gray-900 dark:bg-gray-700"></div>
            <time className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
              Nov 2020 - May 2024
            </time>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Rajalakshmi Engineering College
            </h3>
            <p className="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">
              Bachelors in Computer Science and Business Systems (CGPA - 7.9)
            </p>
          </li>
          <li className="mb-10 ms-4">
            <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-black dark:border-gray-900 dark:bg-gray-700"></div>
            <time className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
              Apr 2019 - Apr 2020
            </time>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              St. John&apos;s English School and Junior College
            </h3>
            <p className="text-base font-normal text-gray-500 dark:text-gray-400">
              HSLC (CGPA - 6.03)
            </p>
          </li>
          <li className="ms-4">
            <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-black dark:border-gray-900 dark:bg-gray-700"></div>
            <time className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
              Apr 2017 - Apr 2018
            </time>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              St. John&apos;s English School and Junior College
            </h3>
            <p className="text-base font-normal text-gray-500 dark:text-gray-400">
              SSLC (CGPA - 7.04)
            </p>
          </li>
        </ol>
      </div>
    </div>
  );
};
