import Image from "next/image";
import { FC } from "react";
import { Skill } from "~/lib/types";
import { Card } from "../ui/card";

type Props = {
  skill: Skill;
};

export const SkillCard: FC<Props> = ({ skill }) => {
  return (
    <Card className="flex flex-col items-center justify-between h-full w-full p-2">
      <div className="h-full flex items-center justify-center">
        <Image
          src={skill.imageUrl}
          alt={skill.title}
          width={100}
          height={100}
        />
      </div>
      <p className="mt-5">{skill.title}</p>
    </Card>
  );
};
