import { carsForListing } from "@/lib/data";
import { SITE } from "@/lib/site";

export default function sitemap() {
  const now = new Date();
  const cars = carsForListing().map((c) => ({
    url: `${SITE.url}/cars/${c.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: SITE.url,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE.url}/cars`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...cars,
  ];
}
