import type { Metadata } from "next";
import { ProjectsClient } from "~/components/site/projects-client";

export const metadata: Metadata = { title: "Projects", description: "A multi-tenant SaaS, a self-hosted personal OS, a launcher, a CLI and more." };

export default function ProjectsPage() {
  return (
    <div className="wrap page">
      <header className="stack g24">
        <h1 className="title">Projects</h1>
        <p className="lead">Eight things I built because I wanted to understand them end to end. Each links to the live site and the code.</p>
      </header>
      <ProjectsClient />
    </div>
  );
}
