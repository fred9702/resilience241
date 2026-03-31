"use client";

import { useTranslations, useLocale } from "next-intl";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/Button";
import {
  FacebookLogo,
  TwitterLogo,
  InstagramLogo,
} from "@phosphor-icons/react";

const SOCIALS = [
  { icon: FacebookLogo, label: "Facebook", href: "https://www.facebook.com/share/1B4pNuGHt7/?mibextid=wwXIfr" },
  { icon: TwitterLogo, label: "Twitter / X", href: "https://x.com/resilience241" },
  { icon: InstagramLogo, label: "Instagram", href: "https://instagram.com/resilience_241" },
] as const;

export function MediaSocials() {
  const t = useTranslations("media");
  const locale = useLocale();

  return (
    <section className="relative py-12 md:py-16 overflow-hidden bg-light-beige">
      <div className="relative mx-auto max-w-2xl px-4 text-center">
        <ScrollReveal>
          <p className="font-heading text-lg font-semibold text-near-black/80 mb-6">
            {t("followUs")}
          </p>
          <div className="flex justify-center gap-6 mb-8">
            {SOCIALS.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex items-center justify-center w-14 h-14 rounded-full bg-brown/10 text-brown hover:bg-orange hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange"
              >
                <Icon size={28} />
              </a>
            ))}
          </div>
          <Button href={`/${locale}/contact`} variant="secondary-dark">
            {t("contactCta")}
          </Button>
        </ScrollReveal>
      </div>
    </section>
  );
}
