"use client";

import { useLocale } from "next-intl";
import { TwitterLogo, InstagramLogo, FacebookLogo } from "@phosphor-icons/react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { socialPosts, type SocialPost } from "@/data/social-posts";

const PLATFORM_META = {
  twitter: { icon: TwitterLogo, label: "Twitter / X", color: "#2D2D2D" },
  instagram: { icon: InstagramLogo, label: "Instagram", color: "#9B1C37" },
  facebook: { icon: FacebookLogo, label: "Facebook", color: "#1F4E79" },
} as const;

function SocialCard({ post, delay, locale }: { post: SocialPost; delay: number; locale: string }) {
  const meta = PLATFORM_META[post.platform];
  const Icon = meta.icon;
  const text = post.text[locale as "en" | "fr"] ?? post.text.en;
  const dateStr = new Date(post.date).toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <ScrollReveal delay={delay}>
      <a
        href={post.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-xl border border-brown/10 bg-white p-5 hover:shadow-md transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-orange h-full"
        aria-label={`${meta.label}: ${text}`}
      >
        <div className="flex items-center gap-2 mb-3">
          <Icon size={22} style={{ color: meta.color }} aria-hidden="true" />
          <span className="font-heading text-xs font-semibold uppercase tracking-wide text-mid-grey">
            {meta.label}
          </span>
          <span className="ml-auto font-body text-xs text-mid-grey">
            {dateStr}
          </span>
        </div>
        <p className="font-body text-sm text-near-black leading-relaxed line-clamp-3">
          {text}
        </p>
      </a>
    </ScrollReveal>
  );
}

export function SocialFeed() {
  const locale = useLocale();

  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
      {socialPosts.map((post, i) => (
        <SocialCard key={post.url} post={post} delay={i * 0.1} locale={locale} />
      ))}
    </div>
  );
}
