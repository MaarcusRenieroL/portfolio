import { FC } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { SKILLS } from "~/lib/constants";
import { SkillCard } from "./skills-card";

export const Skills: FC = () => {
  SKILLS.sort((a, b) => a.title.localeCompare(b.title));
  return (
    <div>
      <h1 className="text-2xl font-bold">Skills</h1>
      <Tabs defaultValue="all" className="w-full mt-5">
        <TabsList className="w-full">
          <TabsTrigger value="all" className="w-full">
            All
          </TabsTrigger>
          <TabsTrigger value="front-end" className="w-full">
            Front End
          </TabsTrigger>
          <TabsTrigger value="back-end" className="w-full">
            Back End
          </TabsTrigger>
          <TabsTrigger value="databases" className="w-full">
            Databases
          </TabsTrigger>
          <TabsTrigger value="tools" className="w-full">
            Tools
          </TabsTrigger>
          <TabsTrigger value="misc" className="w-full">
            Miscellaneous
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-5">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-5">
            {SKILLS.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="front-end" className="mt-5">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-5">
            {SKILLS.filter((skill) => skill.category === "Front End").map(
              (skill) => (
                <SkillCard key={skill.id} skill={skill} />
              ),
            )}
          </div>
        </TabsContent>
        <TabsContent value="back-end" className="mt-5">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-5">
            {SKILLS.filter((skill) => skill.category === "Back End").map(
              (skill) => (
                <SkillCard key={skill.id} skill={skill} />
              ),
            )}
          </div>
        </TabsContent>
        <TabsContent value="databases" className="mt-5">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-5">
            {SKILLS.filter((skill) => skill.category === "Database").map(
              (skill) => (
                <SkillCard key={skill.id} skill={skill} />
              ),
            )}
          </div>
        </TabsContent>
        <TabsContent value="tools" className="mt-5">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-5">
            {SKILLS.filter((skill) => skill.category === "Tools").map(
              (skill) => (
                <SkillCard key={skill.id} skill={skill} />
              ),
            )}
          </div>
        </TabsContent>
        <TabsContent value="misc" className="mt-5">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-5">
            {SKILLS.filter((skill) => skill.category === "Miscellaneous").map(
              (skill) => (
                <SkillCard key={skill.id} skill={skill} />
              ),
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
