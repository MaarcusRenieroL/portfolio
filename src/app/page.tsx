import { Blog } from "~/components/sections/blog"
import { Header } from "~/components/sections/header"
import { WorkExperience } from "~/components/sections/work-experience"

export default function Home() {

  return (
    <div className="flex flex-col w-full gap-10">
      <Header />
      <WorkExperience />
      <Blog />
      <p>projects</p>
    </div>
  );
}
