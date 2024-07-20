import { Header } from "~/components/header";
import { Education } from "~/components/resume/education";
import { Skills } from "~/components/resume/skills";
import { WorkExperience } from "~/components/resume/work-experience";

export default function ResumePage() {
  return (
    <div>
      <Header title="Resume" />
      <div className="space-y-10">
        <Education />
        <WorkExperience />
        <Skills />
      </div>
    </div>
  );
}
