import ProjectCard from "./ProjectCard";

const Projects = () => {
  const projects = [
    {
      id: 1,
      title: "Secure Track",
      description:
        "Integrated solution for fleet management and tracking. The application stack consists of fleet, route, crew and passenger (students, employees, etc) information for overall fleet optimization and tracking.",
      techStacks: [
        "Next.js",
        "TypeScript",
        "Tailwind CSS",
        "tRPC",
        "Prisma",
        "Mongo DB",
        "Google Maps API",
        "Next Auth",
        "React Hook Form",
      ],
      githubLink: "https://github.com/MaarcusRenieroL/secure-track",
      projectLink: "securetrack.vercel.app",
      ongoing: true,
    },
    {
      id: 2,
      title: "Portfolio",
      description:
        "My Personal Portfolio built using Next.js, Tailwind CSS and TypeScript",
      techStacks: ["Next.js", "TypeScript", "Tailwind CSS"],
      githubLink: "https://github.com/MaarcusRenieroL/portfolio",
      projectLink: "maarcus-reniero-l.vercel.app",
      ongoing: false,
    },
    {
      id: 3,
      title: "Real Time Chat Application",
      description:
        "Next.js-based real-time chat app leveraging Redis for seamless communication and scalability",
      techStacks: [
        "Next.js",
        "TypeScript",
        "Tailwind CSS",
        "Redis",
        "React Hook Form",
      ],
      githubLink: "https://github.com/MaarcusRenieroL/realtime-chat-app",
      ongoing: true,
    },
    {
      id: 4,
      title: "HealthX",
      description:
        "Complete process flow for registration, unique ID assignment, test, clinical details, invoice and billing for IP and OP visits. Delivering information to patients and archiving of visit data.",
      techStacks: ["React.js", "Firebase"],
      githubLink: "https://github.com/MaarcusRenieroL/healthX",
    },
  ];
  return (
    <section className="flex min-h-0 flex-col gap-y-3 scroll-mb-16">
      <h2 className="text-xl font-bold">Projects</h2>
      <div className="grid grid-cols-1 gap-3 -mx-3 md:grid-cols-3">
        {projects.map((project) => (
          <div key={project.id}>
            <ProjectCard
              title={project.title}
              description={project.description}
              techStacks={project.techStacks}
              githubLink={project.githubLink}
              projectLink={project.projectLink}
              ongoing={project.ongoing}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default Projects;
