import { Header } from "~/components/header";
import { Education } from "~/app/resume/_components/education";
import { Skills } from "~/app/resume/_components/skills";
import { WorkExperience } from "~/app/resume/_components/work-experience";

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
