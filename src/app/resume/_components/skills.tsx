import { FC } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { SKILLS } from "~/lib/constants";
import { SkillCard } from "./skills-card";
import { cn } from "~/lib/utils";
import { geistMono } from "~/lib/font";

export const Skills: FC = () => {
  SKILLS.sort((a, b) => a.title.localeCompare(b.title));
  return (
    <div>
      <h1 className={cn("text-2xl font-bold", geistMono.className)}>Skills</h1>
      <Tabs defaultValue="all" className="w-full mt-5">
        <div className="relative rounded-sm overflow-x-scroll h-10 bg-muted">
          <TabsList className="w-full absolute flex flex-row justify-stretch">
            <TabsTrigger value="all" className="md:w-full">
              All
            </TabsTrigger>
            <TabsTrigger value="front-end" className="md:w-full">
              Front End
            </TabsTrigger>
            <TabsTrigger value="back-end" className="md:w-full">
              Back End
            </TabsTrigger>
            <TabsTrigger value="databases" className="md:w-full">
              Databases
            </TabsTrigger>
            <TabsTrigger value="tools" className="md:w-full">
              Tools
            </TabsTrigger>
            <TabsTrigger value="misc" className="md:w-full">
              Miscellaneous
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="all" className="mt-5">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-5">
            {SKILLS.map(skill => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="front-end" className="mt-5">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-5">
            {SKILLS.filter(skill => skill.category === "Front End").map(
              skill => (
                <SkillCard key={skill.id} skill={skill} />
              )
            )}
          </div>
        </TabsContent>
        <TabsContent value="back-end" className="mt-5">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-5">
            {SKILLS.filter(skill => skill.category === "Back End").map(
              skill => (
                <SkillCard key={skill.id} skill={skill} />
              )
            )}
          </div>
        </TabsContent>
        <TabsContent value="databases" className="mt-5">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-5">
            {SKILLS.filter(skill => skill.category === "Database").map(
              skill => (
                <SkillCard key={skill.id} skill={skill} />
              )
            )}
          </div>
        </TabsContent>
        <TabsContent value="tools" className="mt-5">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-5">
            {SKILLS.filter(skill => skill.category === "Tools").map(skill => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="misc" className="mt-5">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-5">
            {SKILLS.filter(skill => skill.category === "Miscellaneous").map(
              skill => (
                <SkillCard key={skill.id} skill={skill} />
              )
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
