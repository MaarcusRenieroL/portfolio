import { Badge } from "./ui/badge";

const Skills = () => {
  const skills = [
    "Java",
    "JavaScript",
    "TypeScript",
    "Next.js",
    "React.js",
    "Tailwind CSS",
    "tRPC",
    "Prisma",
    "Mongo DB",
    "Postgre SQL",
    "Strapi",
    "Git",
    "Github",
    "Figma",
    "Postman",
    "Gitkraken",
    "Neovim",
    "VS Code",
    "Jetbrains",
  ];
  return (
    <section className="flex min-h-0 flex-col gap-y-3">
      <h2 className="text-xl font-bold print-force-new-page">Skills</h2>
      <div className="flex flex-wrap gap-1">
        {skills.map((skill) => (
          <Badge key={skill}>{skill}</Badge>
        ))}
      </div>
    </section>
  );
};

export default Skills;
