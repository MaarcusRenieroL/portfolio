import { FC } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import Image from "next/image";
import { cn } from "~/lib/utils";

type Props = {
  name: string;
  companyName: string;
  description: string;
  logo: string;
  blackBg: boolean;
};

export const TestimonialCard: FC<Props> = ({
  name,
  description,
  companyName,
  logo,
  blackBg,
}) => {
  return (
    <Card className="md:max-w-[70%] lg:max-w-[60%] w-full flex-shrink-0">
      <div className="flex w-full justify-between">
        <CardHeader>
          <div className="flex gap-5 items-end">
            <div className={cn("p-4 rounded-xl", blackBg && "bg-black")}>
              <Image
                src={logo}
                alt="Maarcus Reniero L"
                width={100}
                height={100}
                className="h-14 w-14 object-cover rounded-full"
              />
            </div>
            <div>
              <CardTitle>{name}</CardTitle>
              <CardDescription>{companyName}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </div>
      <CardContent>{description}</CardContent>
    </Card>
  );
};
