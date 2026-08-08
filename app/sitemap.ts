import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://csecommunity.org";
  const routes = [
    "",
    "/confessions",
    "/resources",
    "/opportunities",
    "/events",
    "/submit",
    "/rules",
    "/login",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "/confessions" ? "hourly" : "daily",
    priority: route === "" ? 1.0 : 0.8,
  }));
}
