import { GithubContributions } from "~/components/misc/github-contributions";
import { Header } from "~/components/sections/header";
import { Projects } from "~/components/sections/projects";
import { WorkExperience } from "~/components/sections/work-experience";

export default function Home() {
  return (
    <main className="flex w-full flex-col gap-14">
      <Header />
      <GithubContributions />
      <WorkExperience />
      <Projects />
    </main>
  );
}
