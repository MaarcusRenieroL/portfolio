import { FC } from "react";
import { FaBook } from "react-icons/fa";
import { Button } from "../../../components/ui/button";
import { cn } from "~/lib/utils";
import { geistMono } from "~/lib/font";
import { educationList } from "~/lib/constants";
import { Education as EducationType } from "~/lib/types";
import { motion } from "framer-motion";

export const Education: FC = () => {
  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 2, ease: "easeOut" }}
    >
      <div>
        <div className="flex gap-5 items-center">
          <Button variant="outline" size="icon">
            <FaBook className="h-4 w-4" />
          </Button>
          <h1 className={cn("text-2xl font-bold", geistMono.className)}>
            Education
          </h1>
        </div>
        <div className="ml-4">
          <ol className="relative border-s border-gray-200 dark:border-gray-700">
            <br />
            {educationList.map((education: EducationType) => (
              <li className="mb-10 ms-4" key={education.name}>
                <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-black dark:border-gray-900 dark:bg-gray-700"></div>
                <time className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                  {education.time}
                </time>
                <h3
                  className={cn(
                    "text-lg font-semibold text-gray-900 dark:text-white",
                    geistMono.className
                  )}
                >
                  {education.name}
                </h3>
                <p className="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">
                  {education.degree}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </motion.div>
  );
};
