import { Footer } from "~/components/layouts/footer";
import { Header } from "~/components/sections/header";
import { Projects } from "~/components/sections/projects";
import { WorkExperience } from "~/components/sections/work-experience";

export default function Home() {
  return (
    <main className="flex flex-col gap-10 w-full">
      <Header />
      <WorkExperience />
      <Projects />
      <Footer />
    </main>
  );
}
