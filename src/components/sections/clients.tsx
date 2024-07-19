import { FC } from "react";
import { Header } from "../header";
import GlamModel from "../../../public/client-logos/glam-model.png";
import Image from "next/image";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";

export const Clients: FC = () => {
  return (
    <div className="w-full">
      <Header title="Clients" />
      <div className=" w-full">
        <ScrollArea className="w-full">
          <div className="w-full flex space-x-10">
            <Image
              src={GlamModel}
              alt="glam-model"
              width={100}
              height={100}
              className="bg-black"
            />
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
};
