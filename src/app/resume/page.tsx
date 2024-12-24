"use client";

import { Header } from "~/components/header";
import { Education } from "~/app/resume/_components/education";
import { Skills } from "~/app/resume/_components/skills";
import { WorkExperience } from "~/app/resume/_components/work-experience";
import { FC } from "react";
import { motion } from "framer-motion";

export default function ResumePage() {
  return (
    <div>
      <Header title="Resume" />
      <div className="space-y-10">
        <Section>
          <Education />
        </Section>
        <Section>
          <WorkExperience />
        </Section>
        <Section>
          <Skills />
        </Section>
      </div>
    </div>
  );
}

const Section: FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 0 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ amount: 0.2 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};
