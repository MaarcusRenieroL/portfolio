import Link from "next/link";

import { GithubIcon, LinkIcon } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";

interface ProjectCardProps {
  title: string;
  description: string;
  techStacks: Array<string>;
  githubLink?: string;
  projectLink?: string;
  ongoing?: boolean;
}

const ProjectCard = ({
  title,
  description,
  techStacks,
  githubLink,
  projectLink,
  ongoing,
}: ProjectCardProps) => {
  return (
    <Card className="flex flex-col overflow-hidden border border-muted p-3">
      <CardHeader className="">
        <div className="space-y-1">
          <CardTitle className="text-base">
            {ongoing ? (
              <p>
                {title}
                <span className="pl-2 text-xs text-emerald-500">(Ongoing)</span>
              </p>
            ) : (
              title
            )}
          </CardTitle>
          <div className="hidden font-mono text-xs underline print:visible">
            {githubLink
              ?.replace("https://", "")
              .replace("www.", "")
              .replace("/", "")}
          </div>
          <CardDescription className="font-mono text-xs">
            {description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="mt-auto flex">
        <div className="mt-2 flex flex-wrap gap-1">
          {techStacks.map((tech) => (
            <Badge className="px-1 py-0 text-[10px]" key={tech}>
              {tech}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-5 space-x-3">
        {githubLink && (
          <Button variant="outline" className="h-8 w-8">
            <Link href={githubLink ?? ""}>
              <GithubIcon className="h-4 w-4" />
            </Link>
          </Button>
        )}
        {projectLink && (
          <Button variant="outline" className="h-8 w-8">
            <Link href={projectLink ?? ""}>
              <LinkIcon className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
