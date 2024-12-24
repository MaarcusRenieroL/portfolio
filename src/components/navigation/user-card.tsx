"use client";

import { FC, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import Image from "next/image";
import {
  FaChevronDown,
  FaChevronUp,
  FaGithub,
  FaLinkedinIn,
} from "react-icons/fa";
import {
  IoLocationOutline,
  IoMailOutline,
  IoPhonePortraitOutline,
} from "react-icons/io5";
import Link from "next/link";
import { ThemeToggle } from "~/components/themes/theme-toggle";
import { cn } from "~/lib/utils";
import { geistMono } from "~/lib/font";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  isMobile: boolean;
};

export const UserCard: FC<Props> = ({ isMobile }) => {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      className="px-4"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
    >
      <Card className="w-full relative rounded-xl">
        <div className="flex w-full justify-between">
          <CardHeader>
            <div className="flex gap-5 items-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.5 }}
              >
                <Image
                  src="/me.png"
                  alt="Maarcus Reniero L"
                  width={100}
                  height={100}
                  className="object-cover rounded-full"
                />
              </motion.div>
              <div>
                <CardTitle className={cn(geistMono.className)}>
                  Maarcus Reniero L
                </CardTitle>
                <CardDescription>Full Stack Developer</CardDescription>
              </div>
            </div>
          </CardHeader>
          <motion.div
            className="absolute right-0 w-fit flex items-center justify-center border rounded-bl-xl rounded-tr-xl cursor-pointer"
            whileHover={{ scale: 1.1 }}
            onClick={() => setOpen(!open)}
          >
            {isMobile ? (
              <div className="p-4">
                {open ? <FaChevronUp /> : <FaChevronDown />}
              </div>
            ) : (
              <p className="px-4 py-2">Show Contacts</p>
            )}
          </motion.div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            >
              <CardContent className="mt-5 space-y-5">
                <hr className="w-full" />

                <ul className="space-y-4">
                  <motion.li
                    className="flex items-center w-full gap-5"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1.5, delay: 0.2 }}
                  >
                    <div className="p-2 flex items-center justify-center border border-black rounded-md">
                      <IoMailOutline fontSize={14} />
                    </div>
                    <div>
                      <p className={cn("uppercase", geistMono.className)}>
                        Email
                      </p>
                      <Link
                        href="mailto:maarcusreniero.l@gmail.com"
                        className="text-sm"
                      >
                        maarcusreniero.l@gmail.com
                      </Link>
                    </div>
                  </motion.li>

                  <motion.li
                    className="flex items-center w-full gap-5"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1.5, delay: 0.3 }}
                  >
                    <div className="p-2 flex items-center justify-center border border-black rounded-md">
                      <IoPhonePortraitOutline fontSize={14} />
                    </div>
                    <div>
                      <p className={cn("uppercase", geistMono.className)}>
                        Phone
                      </p>
                      <Link href="tel:+917299954472" className="text-sm">
                        +917299954472
                      </Link>
                    </div>
                  </motion.li>

                  <motion.li
                    className="flex items-center w-full gap-5"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1.5, delay: 0.4 }}
                  >
                    <div className="p-2 flex items-center justify-center border border-black rounded-md">
                      <IoLocationOutline fontSize={14} />
                    </div>
                    <div>
                      <p className={cn("uppercase", geistMono.className)}>
                        Location
                      </p>
                      <Link href="#" className="text-sm">
                        Chennai, India
                      </Link>
                    </div>
                  </motion.li>
                </ul>

                <hr />

                <motion.ul
                  className="flex items-center justify-center space-x-5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                >
                  <li className="social-item">
                    <Link
                      href="https://github.com/MaarcusRenieroL"
                      className="social-link"
                    >
                      <FaGithub fontSize={20} />
                    </Link>
                  </li>

                  <li className="social-item">
                    <Link
                      href="https://www.linkedin.com/in/maarcus-reniero-l"
                      className="social-link"
                    >
                      <FaLinkedinIn fontSize={20} />
                    </Link>
                  </li>
                </motion.ul>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>

        <CardFooter className="relative">
          <motion.div
            className="absolute bottom-4 right-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <ThemeToggle />
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
