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