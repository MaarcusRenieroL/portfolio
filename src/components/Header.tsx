import { FC } from "react";
import {
  GithubIcon,
  GlobeIcon,
  LinkedinIcon,
  MailIcon,
  PhoneIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

const Header: FC = () => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1 space-y-1.5">
        <h1 className="text-2xl font-bold">Maarcus Reniero L</h1>
        <p className="max-w-md font-mono text-sm text-pretty text-muted-foreground">
          A full stack developer, student and an intern based in Chennai, India.
          Learning, mastering and implementing new technologies day by day and
          hope to become the a well known developer in the world
        </p>
        <p className="items-center max-w-md font-mono text-xs text-pretty text-muted-foreground">
          <Link
            className="inline-flex gap-x-1.5 align-baseline leading-none hover:underline"
            href="https://www.google.com/maps/place/Chennai"
            target="_blank"
          >
            <GlobeIcon className="h-3 w-3" />
            Chennai, India
          </Link>
        </p>
        <div className="flex items-center space-x-3 pt-1 font-mono text-sm gap-x-1 text-muted-foreground ">
          <Button variant="outline" className="h-8 w-8">
            <Link href="mailto:maarcusreniero.l@gmail.com">
              <MailIcon className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" className="h-8 w-8">
            <Link href="tel:+917299954472">
              <PhoneIcon className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" className="h-8 w-8">
            <Link href="https://github.com/MaarcusRenieroL">
              <GithubIcon className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" className="h-8 w-8">
            <Link href="https://www.linkedin.com/in/maarcus-reniero-l/">
              <LinkedinIcon className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="flex-col hidden font-mono text-sm gap-x-1 text-muted-foreground">
          <Link href="mailto:maarcusreniero.l@gmail.com">
            <span className="underline">maarcusreniero.l@gmail.com</span>
          </Link>
          <Link href="tel:+917299954472">
            <span className="underline">+917299954472</span>
          </Link>
        </div>
      </div>
      <span className="relative flex shrink-0 overflow-hidden rounded-full h-28 w-28">
        <Image
          className="aspect-square h-full w-full object-cover"
          alt="Maarcus Reniero L"
          src="/zoro.jpg"
          width={100}
          height={100}
        />
      </span>
    </div>
  );
};

export default Header;
