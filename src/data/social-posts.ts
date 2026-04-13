export interface SocialPost {
  platform: "twitter" | "instagram" | "facebook";
  text: { en: string; fr: string };
  date: string;
  url: string;
}

export const socialPosts: SocialPost[] = [
  {
    platform: "twitter",
    text: {
      en: "19 First Ladies. 4 Pillars. 1 Day. The #BuildingResilience conference is coming to Libreville on April 17, 2026.",
      fr: "19 Premières Dames. 4 Piliers. 1 Jour. La conférence #RenforcerLaRésilience arrive à Libreville le 17 avril 2026.",
    },
    date: "2026-04-10",
    url: "https://x.com/resilience241",
  },
  {
    platform: "instagram",
    text: {
      en: "CAP 241 — A strategic framework for resilience. Health. Women. Youth. Education. #BuildingResilience #Resilience241",
      fr: "CAP 241 — Un cadre stratégique pour la résilience. Santé. Femmes. Jeunesse. Éducation. #RenforcerLaRésilience #Resilience241",
    },
    date: "2026-04-08",
    url: "https://instagram.com/resilience_241",
  },
  {
    platform: "facebook",
    text: {
      en: "Her Excellency Mrs. Zita Oligui Nguema invites African leaders to build resilience for women and girls across the continent.",
      fr: "Son Excellence Madame Zita Oligui Nguema invite les leaders africains à renforcer la résilience des femmes et des filles à travers le continent.",
    },
    date: "2026-04-05",
    url: "https://www.facebook.com/share/1B4pNuGHt7/",
  },
];
