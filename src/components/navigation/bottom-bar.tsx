"use client";

import { FC } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";
import { geistMono } from "~/lib/font";
import { motion } from "framer-motion";

export const BottomBar: FC = () => {
  const pathname = usePathname();

  return (
    <motion.div
      className="flex w-full items-center justify-evenly text-sm h-14 border-t rounded-t-2xl bg-background"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
    >
      {["/", "/resume", "/portfolio", "/blog", "/contact"].map(route => {
        const isActive = pathname === route;
        const label = route === "/" ? "About" : route.replace("/", "");

        return (
          <motion.div
            key={route}
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <Link
              href={route}
              className={cn(
                isActive ? "underline underline-offset-4 font-bold" : "",
                geistMono.className
              )}
            >
              {label.charAt(0).toUpperCase() + label.slice(1)}
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
};
