import { FC } from "react";
import { motion } from "framer-motion";
import { Header } from "~/components/header";
import GlamModel from "../../../public/client-logos/glam-model.png";
import Image from "next/image";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";

export const Clients: FC = () => {
  return (
    <div className="w-full">
      <Header title="Clients" />
      <div className="w-full">
        <ScrollArea className="w-full">
          <motion.div
            className="w-full flex space-x-10"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 2, ease: "easeOut" }}
          >
            <Image
              src={GlamModel}
              alt="glam-model"
              width={100}
              height={100}
              className="bg-black"
            />
          </motion.div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
};
