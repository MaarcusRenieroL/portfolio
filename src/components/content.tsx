"use client";

import { FC, ReactNode } from "react";
import { UserInfo } from "~/components/navigation/user-info";
import { UserCard } from "~/components/navigation/user-card";
import { useMediaQuery } from "@mantine/hooks";
import { BottomBar } from "~/components/navigation/bottom-bar";
import { ScrollArea } from "./ui/scroll-area";
import { MidNav } from "./navigation/mid-nav";
import { ThemeToggle } from "./themes/theme-toggle";

type Props = {
  children?: ReactNode;
};

export const Content: FC<Props> = ({ children }) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <main className="max-w-[1200px] h-full lg:grid lg:grid-cols-7 gap-10 lg:py-20 md:py-10 py-4 w-full">
      <div className="h-full flex flex-col justify-between items-center w-full col-span-2">
        <UserInfo />
        <div className="lg:hidden flex flex-col h-full lg:px-20 md:px-10 w-full">
          <UserCard isMobile={isMobile ?? false} />
          <div className="w-full mt-5 px-4 relative">
            <div className="border rounded-xl p-4 relative">
              {!isMobile && (
                <div className="grid grid-cols-5 gap-5 w-3/5 absolute top-0 right-0">
                  <div className="flex items-center justify-center w-full h-full">
                    <ThemeToggle />
                  </div>
                  <div className="col-span-4">
                    <MidNav />
                  </div>
                </div>
              )}
              {children}
            </div>
          </div>
          {isMobile && (
            <div className="bottom-0 right-0 left-0 sticky w-full mt-5">
              <BottomBar />
            </div>
          )}
        </div>
      </div>
      <div className="col-span-5 lg:block hidden h-full border rounded-xl w-full max-w-full overflow-hidden">
        <ScrollArea className="h-full">
          <div className="relative">
            <div className="grid grid-cols-5 gap-5 w-3/5 absolute top-0 right-0">
              <div className="flex items-center justify-center w-full h-full">
                <ThemeToggle />
              </div>
              <div className="col-span-4">
                <MidNav />
              </div>
            </div>
          </div>
          <div className="p-8 max-w-full">{children}</div>
        </ScrollArea>
      </div>
    </main>
  );
};
