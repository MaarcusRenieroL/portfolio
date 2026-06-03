import { GithubContributions } from "~/components/misc/github-contributions";
import { Header } from "~/components/sections/header";
import { IdentityStrip } from "~/components/sections/identity-strip";
import { Projects } from "~/components/sections/projects";
import { WorkExperience } from "~/components/sections/work-experience";

export default async function Home() {
  return (
    <main className="flex w-full flex-col gap-12">
      <Header />
      <IdentityStrip />
      <GithubContributions />
      <WorkExperience />
      <Projects />
    </main>
  );
}
