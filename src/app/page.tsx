import { Blog } from "~/components/sections/blog"
import { Header } from "~/components/sections/header"
import { Projects } from "~/components/sections/projects";
import { WorkExperience } from "~/components/sections/work-experience"

export default function Home() {

  return (
    <div className="flex flex-col w-full gap-10">
      <Header />
      <WorkExperience />
      <Blog />
      <Projects />
    </div>
  );
}
