import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/auth/", "/onboarding", "/upload"],
    },
    sitemap: "https://kunbase.space/sitemap.xml",
  }
}
