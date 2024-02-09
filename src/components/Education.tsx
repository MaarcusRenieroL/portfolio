import EducationCard from "./EducationCard";

const Education = () => {
  return (
    <section className="flex min-h-0 flex-col gap-y-3">
      <h2 className="text-xl font-bold">Education</h2>
      <div className="rounded-lg bg-card text-card-foreground space-y-2">
        <EducationCard
          education="Rajalakshmi Engineering College"
          level="Bachelors in Technology"
          duration="2020 - Present"
        />
        <EducationCard
          education="St. John's English School and Junior College"
          level="12th"
          duration="2019 - 2020"
        />
        <EducationCard
          education="St. John's English School and Junior College"
          level="10th"
          duration="2017 - 2018"
        />
      </div>
    </section>
  );
};

export default Education;
