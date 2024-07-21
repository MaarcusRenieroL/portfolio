import { FC } from "react";
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
    <div className="space-y-5">
      <Header title="What I Am Doing?" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <Card>
          <div className="w-full flex items-center gap-5 p-4">
            <Image src="/icon-design.svg" alt="design" width={25} height={25} />
            <CardHeader className="p-0">
              <CardTitle>Web Design</CardTitle>
              <CardDescription>
                The most modern and high-quality design made at a professional
                level.
              </CardDescription>
            </CardHeader>
          </div>
        </Card>
        <Card>
          <div className="w-full flex items-center gap-5 p-4">
            <Image src="/icon-dev.svg" alt="design" width={25} height={25} />
            <CardHeader className="p-0">
              <CardTitle>Full Stack Web Apps</CardTitle>
              <CardDescription>
                The most modern and high-quality design made at a professional
                level.
              </CardDescription>
            </CardHeader>
          </div>
        </Card>
      </div>
    </div>
  );
};
