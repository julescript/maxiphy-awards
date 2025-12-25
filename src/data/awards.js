export const awardsByYear = {
  "2025": [
    {
      name: "Abed Itani",
      role: "UI/UX Designer",
      slug: "abed",
      awards: [
        {
          title: "The Meeting Time Traveler Award",
          subtitle: "Present one moment, vanished the next. Can someone catch him up?",
          image: "/default-award.jpg",
        },
        {
          title: "The App Slayer Award",
          subtitle: "Present one moment, vanished the next. Can someone catch him up?",
          image: "/default-award.jpg",
        },
      ],
    },
  ],
};

export const years = Object.keys(awardsByYear)
  .map(Number)
  .sort((a, b) => b - a);

export function findPerson(year, slug) {
  const yearKey = String(year);
  const list = awardsByYear[yearKey];
  if (!list) return null;
  const targetSlug = slug?.toLowerCase?.();
  return list.find((p) => p.slug.toLowerCase() === targetSlug) || null;
}
