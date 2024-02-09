interface WorkExperienceCardProps {
  companyName: string;
  workType: string;
  duration: string;
  role: string;
  point: string;
  link: string;
}

const WorkExperienceCard = ({
  companyName,
  workType,
  duration,
  role,
  point,
  link,
}: WorkExperienceCardProps) => {
  return (
    <div className="rounded-lg bg-card text-card-foreground">
      <div className="flex flex-col space-y-1.5">
        <div className="flex items-center justify-between text-base gap-x-2">
          <h3 className="inline-flex items-center justify-center font-semibold leading-none gap-x-1">
            <a className="hover:underline" href={link} target="_blank">
              {companyName}
            </a>
            <span className="inline-flex gap-x-1">
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs align-middle">
                {workType}
              </div>
            </span>
          </h3>
          <div className="text-sm text-gray-500 tabular-nums">{duration}</div>
        </div>
        <h4 className="font-mono text-sm leading-none">{role}</h4>
      </div>
      <div className="text-pretty font-mono text-muted-foreground flex flex-col mt-2 space-y-1 text-xs">
        <li className="flex gap-2">
          <p>{point}</p>
        </li>
      </div>
    </div>
  );
};

export default WorkExperienceCard;
