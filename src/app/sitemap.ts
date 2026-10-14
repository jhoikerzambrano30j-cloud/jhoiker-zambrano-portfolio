import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jhoiker-zambrano-portfolio.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/proyectos`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/servicios`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    {
      url: `${siteUrl}/infraestructura`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    { url: `${siteUrl}/sobre-mi`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/marca`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${siteUrl}/contacto`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
  ];

  try {
    const projects = await getProjects();
    return [
      ...staticRoutes,
      ...projects.map((p) => ({
        url: `${siteUrl}/proyectos/${p.slug}`,
        lastModified: new Date(p.updated_at),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
    ];
  } catch {
    return staticRoutes;
  }
}
