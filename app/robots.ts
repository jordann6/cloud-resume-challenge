import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://jordandesigns.io/sitemap.xml",
    host: "https://jordandesigns.io",
  };
}
