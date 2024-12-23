import { FC } from "react";
import { geistMono } from "~/lib/font";
import { cn } from "~/lib/utils";

type Props = {
  title: string;
};

export const Header: FC<Props> = ({ title }) => {
  return (
    <div className="w-fit mb-10">
      <h1 className={cn("text-3xl font-bold", geistMono.className)}>{title}</h1>
      <hr className="w-10 h-2 bg-black dark:bg-white rounded-full mt-3" />
    </div>
  );
};
