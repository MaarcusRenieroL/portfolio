import { FC } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { SKILLS } from "~/lib/constants";
import { SkillCard } from "./skills-card";
import { cn } from "~/lib/utils";
import { geistMono } from "~/lib/font";
import { motion } from "framer-motion";

export const Skills: FC = () => {
  SKILLS.sort((a, b) => a.title.localeCompare(b.title));

  return (
    <div>
      <motion.h1
        className={cn("text-2xl font-bold", geistMono.className)}
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        Skills
      </motion.h1>
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
          <motion.div
            className="grid grid-cols-2 md:grid-cols-6 gap-5"
            initial="hidden"
            whileInView="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                  duration: 2,
                  ease: "easeOut",
                },
              },
            }}
          >
            {SKILLS.map((skill, index) => (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 1.5 }}
              >
                <SkillCard skill={skill} />
              </motion.div>
            ))}
          </motion.div>
        </TabsContent>
        <TabsContent value="front-end" className="mt-5">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-6 gap-5"
            initial="hidden"
            whileInView="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                  duration: 2,
                  ease: "easeOut",
                },
              },
            }}
          >
            {SKILLS.filter(skill => skill.category === "Front End").map(
              (skill, index) => (
                <motion.div
                  key={skill.id}
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 1.5 }}
                >
                  <SkillCard skill={skill} />
                </motion.div>
              )
            )}
          </motion.div>
        </TabsContent>
        <TabsContent value="back-end" className="mt-5">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-6 gap-5"
            initial="hidden"
            whileInView="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                  duration: 2,
                  ease: "easeOut",
                },
              },
            }}
          >
            {SKILLS.filter(skill => skill.category === "Back End").map(
              (skill, index) => (
                <motion.div
                  key={skill.id}
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 2 }}
                >
                  <SkillCard skill={skill} />
                </motion.div>
              )
            )}
          </motion.div>
        </TabsContent>
        <TabsContent value="databases" className="mt-5">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-6 gap-5"
            initial="hidden"
            whileInView="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                  duration: 2,
                  ease: "easeOut",
                },
              },
            }}
          >
            {SKILLS.filter(skill => skill.category === "Database").map(
              (skill, index) => (
                <motion.div
                  key={skill.id}
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 2 }}
                >
                  <SkillCard skill={skill} />
                </motion.div>
              )
            )}
          </motion.div>
        </TabsContent>
        <TabsContent value="tools" className="mt-5">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-6 gap-5"
            initial="hidden"
            whileInView="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                  duration: 2,
                  ease: "easeOut",
                },
              },
            }}
          >
            {SKILLS.filter(skill => skill.category === "Tools").map(
              (skill, index) => (
                <motion.div
                  key={skill.id}
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 2 }}
                >
                  <SkillCard skill={skill} />
                </motion.div>
              )
            )}
          </motion.div>
        </TabsContent>
        <TabsContent value="misc" className="mt-5">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-6 gap-5"
            initial="hidden"
            whileInView="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                  duration: 2,
                  ease: "easeOut",
                },
              },
            }}
          >
            {SKILLS.filter(skill => skill.category === "Miscellaneous").map(
              (skill, index) => (
                <motion.div
                  key={skill.id}
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 2 }}
                >
                  <SkillCard skill={skill} />
                </motion.div>
              )
            )}
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
