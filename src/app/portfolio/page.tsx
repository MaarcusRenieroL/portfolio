"use client";

import { Header } from "~/components/header";
import { ProjectCard } from "./_components/project-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { PROJECTS } from "~/lib/constants";
import { motion } from "framer-motion";

export default function PortfolioPage() {
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
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="w-full"
      >
        <Tabs defaultValue="all" className="w-full">
          <div className="relative rounded-sm overflow-x-scroll h-10 bg-muted">
            <TabsList className="w-full absolute flex flex-row justify-stretch">
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
          </div>
          <TabsContent value="all" className="mt-5">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
              initial="hidden"
              whileInView="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.2,
                    duration: 1.5,
                    ease: "easeOut",
                  },
                },
              }}
            >
              {PROJECTS.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 1.5 }}
                >
                  <ProjectCard project={project} />
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>
          <TabsContent value="front-end" className="mt-5">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
              initial="hidden"
              whileInView="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.2,
                    duration: 1.5,
                    ease: "easeOut",
                  },
                },
              }}
            >
              {PROJECTS.filter(project => project.category === "Front End").map(
                (project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 1.5 }}
                  >
                    <ProjectCard project={project} />
                  </motion.div>
                )
              )}
            </motion.div>
          </TabsContent>
          <TabsContent value="full-stack" className="mt-5">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
              initial="hidden"
              whileInView="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.2,
                    duration: 1.5,
                    ease: "easeOut",
                  },
                },
              }}
            >
              {PROJECTS.filter(
                project => project.category === "Full Stack"
              ).map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 1.5 }}
                >
                  <ProjectCard project={project} />
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>
          <TabsContent value="freelance" className="mt-5">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
              initial="hidden"
              whileInView="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.2,
                    duration: 1.5,
                    ease: "easeOut",
                  },
                },
              }}
            >
              {PROJECTS.filter(project => project.category === "Freelance").map(
                (project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 1.5 }}
                  >
                    <ProjectCard project={project} />
                  </motion.div>
                )
              )}
            </motion.div>
          </TabsContent>
          <TabsContent value="misc" className="mt-5">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
              initial="hidden"
              whileInView="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.2,
                    duration: 1.5,
                    ease: "easeOut",
                  },
                },
              }}
            >
              {PROJECTS.filter(
                project => project.category === "Miscellaneous"
              ).map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 1.5 }}
                >
                  <ProjectCard project={project} />
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
