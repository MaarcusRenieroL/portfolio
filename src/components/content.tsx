"use client";

import { FC, ReactNode } from "react";
import { UserInfo } from "~/components/navigation/user-info";
import { UserCard } from "~/components/navigation/user-card";
import { useMediaQuery } from "@mantine/hooks";
import { BottomBar } from "~/components/navigation/bottom-bar";
import { ScrollArea } from "./ui/scroll-area";
import { MidNav } from "./navigation/mid-nav";

type Props = {
  children?: ReactNode;
};

export const Content: FC<Props> = ({ children }) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <main className="max-w-[1200px] h-full lg:grid lg:grid-cols-4 gap-10 lg:py-20 md:py-10 py-4 w-full">
      <div className="h-full flex flex-col justify-between items-center w-full relative">
        <UserInfo />
        <div className="lg:hidden flex flex-col h-full lg:px-20 md:px-10 w-full ">
          <UserCard isMobile={isMobile ?? false} />
          <div className="w-full mt-5 px-4">
            <div className="border rounded-xl p-4 relative">
              {!isMobile && (
                <div className="absolute top-0 right-0">
                  <MidNav />
                </div>
              )}
              {children}
            </div>
          </div>
        </div>
        {isMobile && (
          <div className="bottom-0 right-0 left-0 sticky w-full">
            <BottomBar />
          </div>
        )}
      </div>
      <div className="col-span-3 lg:block hidden h-full border rounded-xl w-full max-w-full">
        <ScrollArea className="h-full max-w-full">
          <div className="relative">
            <div className="absolute top-0 right-0 w-3/5">
              <MidNav />
            </div>
          </div>
          <div className="p-8 max-w-full">{children}</div>
        </ScrollArea>
      </div>
    </main>
  );
};
