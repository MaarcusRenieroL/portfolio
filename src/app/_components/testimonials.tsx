import { FC } from "react";
import { motion } from "framer-motion";
import { Header } from "~/components/header";
import { TestimonialCard } from "./testimonial-card";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";

export const Testimonials: FC = () => {
  return (
    <div className="w-full">
      <Header title="Testimonials" />
      <div className="w-full">
        <ScrollArea className="w-full">
          <motion.div
            className="w-full flex space-x-10"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 2, ease: "easeOut" }}
          >
            <TestimonialCard
              name="Rajat Chowla"
              description="I hired Maarcus to handle the design part of our project, specifically using HTML, CSS, and JavaScript. The quality of the work was excellent, and they delivered the designs exactly as we envisioned. Deadlines were always met, and the project stayed within budget. Communication was smooth and effective, with weekly meetings ensuring we were always on the same page. I highly recommend Maarcus for any design needs, as they consistently deliver outstanding results."
              companyName="The Glam Model Agency"
              logo="/client-logos/glam-model.png"
              blackBg
            />
          </motion.div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
};
