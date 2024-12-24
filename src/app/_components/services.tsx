import { FC } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Header } from "~/components/header";
import Image from "next/image";

export const Services: FC = () => {
  return (
    <motion.div
      className="space-y-5"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 2, ease: "easeOut" }}
    >
      <Header title="What I Am Doing?" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {[
          {
            title: "Web Design",
            icon: "/icon-design.svg",
            description:
              "The most modern and high-quality design made at a professional level.",
          },
          {
            title: "Full Stack Web Apps",
            icon: "/icon-dev.svg",
            description:
              "The most modern and high-quality design made at a professional level.",
          },
        ].map((service, index) => (
          <motion.div
            key={index}
            whileHover={{
              scale: 1.05,
              boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.2)",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <Card>
              <div className="w-full flex items-center gap-5 p-4">
                <Image
                  src={service.icon}
                  alt={service.title}
                  width={25}
                  height={25}
                />
                <CardHeader className="p-0">
                  <CardTitle>{service.title}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
