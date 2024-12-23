import { FC } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { TbBrandGithub, TbWorldWww } from "react-icons/tb";
import { Badge } from "../../../components/ui/badge";
import Link from "next/link";
import { Project } from "~/lib/types";
import { cn } from "~/lib/utils";
import { geistMono } from "~/lib/font";

type Props = {
  project: Project;
};

export const ProjectCard: FC<Props> = ({ project }) => {
  return (
    <Card className="max-h-fit h-full flex flex-col items-start justify-between">
      <CardHeader>
        <CardTitle className={cn(geistMono.className)}>
          {project.title}
        </CardTitle>
        <CardDescription>
          {project.startDate + " - " + project.endDate}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div>{project.description}</div>
        <div className="mt-5">
          {project.skills.map(skill => (
            <Badge key={skill}>{skill}</Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="space-x-5 flex justify-end items-end w-full">
        <Link href={"https://github.com/MaarcusRenieroL/" + project.id}>
          <Button variant="outline">
            <TbBrandGithub className="h-4 w-4" />
          </Button>
        </Link>
        <Link href={"https://" + project.id + ".maarcus.dev"}>
          <Button variant="outline">
            <TbWorldWww className="h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
