import { FC } from "react";
import { motion } from "framer-motion";

export const AboutMe: FC = () => {
  return (
    <motion.div
      className="space-y-5"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 2, ease: "easeOut" }}
    >
      <p>
        I&apos;m Maarcus. I am a Full Stack Web Developer based in Chennai,
        India. I finished my schooling in St.John&apos;s English School and
        Junior College and my Bachelors of Technology in Computer Science and
        Business Systems at Rajalakshmi Engineering College. I enjoy my time
        developing new full stack web applications and playing my guitar
      </p>
    </motion.div>
  );
};
