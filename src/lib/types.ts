export type Project = {
  id: number;
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

export type Blog = {
  id: number;
  title: string;
  description: string;
  date: string;
  imageUrl: string;
};
