import type { MetadataRoute } from "next";
import { CATEGORIES, categoryMeta, caseStudyMeta } from "@/lib/projects";
import { caseStudies } from "@/lib/caseStudies";

export const dynamic = "force-static";

const BASE = "https://jordandesigns.io";

// Every deploy is a build, so build time is the honest lastModified.
const lastModified = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`, lastModified, changeFrequency: "monthly", priority: 1 },
    {
      url: `${BASE}/work/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE}/work/${caseStudyMeta.slug}/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...CATEGORIES.map((c) => ({
      url: `${BASE}/work/category/${categoryMeta[c].slug}/`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...caseStudies.map((cs) => ({
      url: `${BASE}/work/${cs.slug}/`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
