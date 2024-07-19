import { FC } from "react";

type Props = {
  title: string;
};

export const Header: FC<Props> = ({ title }) => {
  return (
    <div className="w-fit mb-10">
      <h1 className="text-3xl font-bold">{title}</h1>
      <hr className="w-10 h-2 bg-black rounded-full mt-3" />
    </div>
  );
};
