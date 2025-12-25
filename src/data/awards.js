export const awardsByYear = {
  "2025": [
    {
      name: "Abed Itani",
      role: "UI/UX Designer",
      joinedDate: "2025-01-15",
      id: "abed",
      customStats: [
        {
          label: "Commits",
          description: "",
          value: 312,
        },
      ],
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

export function findPerson(year, id) {
  const yearKey = String(year);
  const list = awardsByYear[yearKey];
  if (!list) return null;
  const targetId = id?.toLowerCase?.();
  return list.find((p) => p.id.toLowerCase() === targetId) || null;
}

export function getTotalAwards(id) {
  const targetId = id?.toLowerCase?.();
  if (!targetId) return 0;

  return Object.values(awardsByYear).reduce((total, list) => {
    const person = list.find((p) => p.id.toLowerCase() === targetId);
    if (!person) return total;
    return total + (person.awards?.length ?? 0);
  }, 0);
}
