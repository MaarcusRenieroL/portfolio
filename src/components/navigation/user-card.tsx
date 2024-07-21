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

type Props = {
  isMobile: boolean;
};

export const UserCard: FC<Props> = ({ isMobile }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="px-4">
      <Card className="w-full relative rounded-xl">
        <div className="flex w-full justify-between">
          <CardHeader>
            <div className="flex gap-5 items-center">
              <Image
                src="/me.png"
                alt="Maarcus Reniero L"
                width={100}
                height={100}
                className="object-cover rounded-full"
              />
              <div>
                <CardTitle>Maarcus Reniero L</CardTitle>
                <CardDescription>Full Stack Developer</CardDescription>
              </div>
            </div>
          </CardHeader>
          <div
            className="absolute right-0 w-fit flex items-center justify-center border rounded-bl-xl rounded-tr-xl"
            onClick={() => setOpen(!open)}
          >
            {isMobile ? (
              <div className="p-4">
                {open ? <FaChevronUp /> : <FaChevronDown />}
              </div>
            ) : (
              <p className="px-4 py-2">Show Contacts</p>
            )}
          </div>
        </div>
        <div>
          {open && (
            <CardContent className="mt-5 space-y-5 transition-all duration-500">
              <hr className="w-full" />

              <ul className="space-y-4">
                <li className="flex items-center w-full gap-5">
                  <div className="p-2 flex items-center justify-center border border-black rounded-md">
                    <IoMailOutline fontSize={14} />
                  </div>
                  <div>
                    <p className="uppercase text-sm">Email</p>
                    <Link
                      href="mailto:maarcusreniero.l@gmail.com"
                      className="text-xs"
                    >
                      maarcusreniero.l@gmail.com
                    </Link>
                  </div>
                </li>

                <li className="flex items-center w-full gap-5">
                  <div className="p-2 flex items-center justify-center border border-black rounded-md">
                    <IoPhonePortraitOutline fontSize={14} />
                  </div>
                  <div>
                    <p className="uppercase text-sm">Phone</p>
                    <Link href="tel:+917299954472" className="text-xs">
                      +917299954472
                    </Link>
                  </div>
                </li>

                <li className="flex items-center w-full gap-5">
                  <div className="p-2 flex items-center justify-center border border-black rounded-md">
                    <IoLocationOutline fontSize={14} />
                  </div>
                  <div>
                    <p className="uppercase text-sm">Location</p>
                    <Link href="#" className="text-xs">
                      Chennai, India
                    </Link>
                  </div>
                </li>
              </ul>

              <hr />

              <ul className="flex items-center justify-center space-x-5">
                <li className="social-item">
                  <Link
                    href="https://github.com/MaarcusRenieroL"
                    className="social-link"
                  >
                    <FaGithub fontSize={14} />
                  </Link>
                </li>

                <li className="social-item">
                  <Link
                    href="https://www.linkedin.com/in/maarcus-reniero-l"
                    className="social-link"
                  >
                    <FaLinkedinIn fontSize={14} />
                  </Link>
                </li>
              </ul>
            </CardContent>
          )}
        </div>
        <CardFooter className="relative">
          <div className="absolute bottom-4 right-4">
            <ThemeToggle />
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
