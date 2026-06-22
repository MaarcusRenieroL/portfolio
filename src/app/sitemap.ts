import { MetadataRoute } from "next";
import { getProjects } from "~/lib/data/projects";
import { getPosts } from "~/lib/data/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://maarcus.dev";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    {
      url: `${baseUrl}/projects`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/stack`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/resume`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  const projectRoutes: MetadataRoute.Sitemap = getProjects().map((project) => {
    const lastModified = project.isOngoing
      ? now
      : new Date(project.endDate ?? project.startDate);

    return {
      url: `${baseUrl}/projects/${project.id}`,
      lastModified,
      changeFrequency: "monthly",
      priority: project.highlight ? 0.8 : 0.6,
    };
  });

  const blogRoutes: MetadataRoute.Sitemap = getPosts().map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.date ? new Date(post.date) : now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...projectRoutes, ...blogRoutes];
}
