import { FC } from "react";

const About: FC = () => {
  return (
    <section className="flex min-h-0 flex-col gap-y-3">
      <h2 className="text-xl font-bold">About</h2>
      <p className="font-mono text-sm text-pretty text-muted-foreground">
        As a Full Stack Developer, I have taken up projects and built them from
        zero to production. I primarily work with T3 Stack (i. e., Next.js,
        Typescript, Tailwind CSS, tRPC). Apart from these some other libraries
        that I use for my projects are Next Auth (for authentication), ShadCN UI
        (for UI components), Prisma (for ORM), and many more
      </p>
    </section>
  );
};

export default About;
