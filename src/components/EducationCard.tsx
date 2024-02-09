interface EducationCardProps {
  education: string;
  level: string;
  duration: string;
}

const EducationCard = ({ education, level, duration }: EducationCardProps) => {
  return (
    <>
      <div className="flex flex-col space-y-1.5">
        <div className="flex items-center justify-between text-base gap-x-2">
          <h3 className="font-semibold leading-none">{education}</h3>
          <div className="text-sm text-gray-500 tabular-nums">{duration}</div>
        </div>
      </div>
      <div className="text-pretty font-mono text-sm text-muted-foreground mt-2">
        {level}
      </div>
    </>
  );
};

export default EducationCard;
