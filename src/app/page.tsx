"use client";

import { motion } from "framer-motion";
import { Header } from "~/components/header";
import { AboutMe } from "./_components/about-me";
import { Services } from "./_components/services";
import { Testimonials } from "./_components/testimonials";
import { Clients } from "./_components/clients";

export default function Home() {
  return (
    <div className="w-full">
      <Header title="About Me" />
      <div className="space-y-10 w-full">
        <Section>
          <AboutMe />
        </Section>
        <Section>
          <Services />
        </Section>
        <Section>
          <Testimonials />
        </Section>
        <Section>
          <Clients />
        </Section>
      </div>
    </div>
  );
}

const Section: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
