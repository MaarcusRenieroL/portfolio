import { FC } from "react";
import WorkExperienceCard from "./WorkExperienceCard";

const WorkExperience: FC = () => {
  return (
    <section className="flex min-h-0 flex-col gap-y-3">
      <h2 className="text-xl font-bold">Work Experience</h2>
      <WorkExperienceCard
        companyName="Matlync"
        duration="Jan 2024 - Feb 2024"
        role="Full Stack Developer"
        workType="Remote"
        link="https://www.matlync.com"
        point="Co-ordinating with teams on multiple projects taken up by the organization, emphasizing on Strapi CMS,
Postbytz and Next JS, testing and resolving issues iteratively."
      />
      <WorkExperienceCard
        companyName="Steam Troops Innovation Labs"
        duration="Aug 2023 - Nov 2023"
        role="Full Stack Developer"
        workType="Hybrid"
        link="https://www.steamtroops.com"
        point="Played a pivotal role in the company's upcoming product development using Next.js, TypeScript, Tailwind CSS and Strapi by actively managing daily sprints, collaborating with a team"
      />
      <WorkExperienceCard
        companyName="Systech"
        duration="Aug 2023 - Nov 2023"
        role="Hardware and Networking"
        workType="On-site"
        link="https://www.systechgroup.in"
        point="Completed CCNA and CCNP courses, applying theoretical knowledge to configure and troubleshoot network
hardware tools, showcasing hands-on expertise in optimizing network performance."
      />
    </section>
  );
};

export default WorkExperience;
