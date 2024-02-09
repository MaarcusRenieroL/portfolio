import About from "@/components/About";
import Header from "@/components/Header";
import WorkExperience from "@/components/WorkExperience";
import Education from "@/components/Education";
import Skills from "@/components/Skills";
import Projects from "@/components/Projects";

export default function Home() {
  return (
    <>
      <Header />
      <About />
      <WorkExperience />
      <Education />
      <Skills />
      <Projects />
    </>
  );
}
