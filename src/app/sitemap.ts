import { MetadataRoute } from "next";
import { getProjects } from "~/lib/data/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://maarcus.dev";
  const lastModified = new Date();

  const staticRoutes = [
    {
      url: `${baseUrl}/`,
      lastModified,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified,
    },
    {
      url: `${baseUrl}/about`,
      lastModified,
    },
    {
      url: `${baseUrl}/stack`,
      lastModified,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified,
    },
    {
      url: `${baseUrl}/resume`,
      lastModified,
    },
  ];

  const projectRoutes = getProjects().map((project) => ({
    url: `${baseUrl}/projects/${project.id}`,
    lastModified,
  }));

  return [...staticRoutes, ...projectRoutes];
}
