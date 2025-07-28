"use client";

import { motion } from "motion/react";
import { useInView } from "react-intersection-observer";
import { ReactNode } from "react";

interface ScrollFadeInProps {
  children: ReactNode;
  delay?: number;
}

export const ScrollFadeIn = ({ children, delay = 0 }: ScrollFadeInProps) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  );
};
