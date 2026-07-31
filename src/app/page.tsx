import { Header } from "~/components/sections/header";
import { Projects } from "~/components/sections/projects";
import { RecruiterBrief } from "~/components/sections/recruiter-brief";
import { WorkExperience } from "~/components/sections/work-experience";

export default async function Home() {
  return (
    <main className="flex w-full flex-col gap-24">
      <Header />
      <RecruiterBrief />
      <Projects />
      <WorkExperience />
    </main>
  );
}
