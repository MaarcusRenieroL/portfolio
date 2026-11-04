"use client";

import { MotionConfig, motion } from "motion/react";

/** A template re-mounts on every navigation, so each page fades in. */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
        {children}
      </motion.div>
    </MotionConfig>
  );
}
