import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://maarcus.dev";
  const lastModified = new Date();

  return [
    {
      url: `${baseUrl}/`,
      lastModified,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified,
    },
    {
      url: `${baseUrl}/blogs`,
      lastModified,
    },
    {
      url: `${baseUrl}/resume`,
      lastModified,
    },
  ];
}
