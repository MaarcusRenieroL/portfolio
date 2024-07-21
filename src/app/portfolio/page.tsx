import { Header } from "~/components/header";
import { ProjectCard } from "./_components/project-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { PROJECTS } from "~/lib/constants";

export default function PorfolioPage() {
  PROJECTS.sort((a, b) => {
    if (a.endDate === "Ongoing" && b.endDate !== "Ongoing") {
      return -1;
    }
    if (a.endDate !== "Ongoing" && b.endDate === "Ongoing") {
      return 1;
    }
    if (a.endDate === "Ongoing" && b.endDate === "Ongoing")
      return Number(new Date(a.startDate)) - Number(new Date(b.startDate));
    return (
      Number(new Date(b.endDate)) - Number(new Date(a.endDate)) ||
      Number(new Date(b.startDate)) - Number(new Date(a.startDate))
    );
  });

  return (
    <div className="w-full">
      <Header title="Portfolio" />
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="all" className="w-full">
            All
          </TabsTrigger>
          <TabsTrigger value="full-stack" className="w-full">
            Full Stack Applications
          </TabsTrigger>
          <TabsTrigger value="front-end" className="w-full">
            Front End Applications
          </TabsTrigger>
          <TabsTrigger value="freelance" className="w-full">
            Freelance
          </TabsTrigger>
          <TabsTrigger value="misc" className="w-full">
            Miscellaneous
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {PROJECTS.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="front-end" className="mt-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {PROJECTS.filter((project) => project.category === "Front End").map(
              (project) => (
                <ProjectCard key={project.id} project={project} />
              ),
            )}
          </div>
        </TabsContent>
        <TabsContent value="full-stack" className="mt-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {PROJECTS.filter(
              (project) => project.category === "Full Stack",
            ).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="freelance" className="mt-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {PROJECTS.filter((project) => project.category === "Freelance").map(
              (project) => (
                <ProjectCard key={project.id} project={project} />
              ),
            )}
          </div>
        </TabsContent>
        <TabsContent value="misc" className="mt-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {PROJECTS.filter(
              (project) => project.category === "Miscellaneous",
            ).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
