export type Project = {
  id: string;
  title: string;
  description: string;
  githubLink?: string;
  hostedLink?: string;
  startDate: string;
  endDate: string;
  category: string;
  skills: string[];
};

export type Skill = {
  id: number;
  title: string;
  imageUrl: string;
  category: string;
};

export type Education = {
  time: string;
  name: string;
  degree: string;
};

export type WorkExperience = {
  time: string;
  companyName: string;
  role: string;
};
