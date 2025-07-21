import { Navbar } from "~/components/layouts/navbar"
import { Header } from "~/components/sections/header"
import { WorkExperience } from "~/components/sections/work-experience"

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-10 p-5 md:p-10">
      <Navbar />
      <Header />
      <WorkExperience />
      <p>blog</p>
      <p>projects</p>
      <p>footer</p>
    </div>
  );
}
