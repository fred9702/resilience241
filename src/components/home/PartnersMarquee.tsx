"use client";

import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { useReducedMotion } from "framer-motion";
import { useState } from "react";
import { partners } from "@/data/partners";
import { SectionBadge } from "@/components/ui/SectionBadge";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const LOGO_PARTNERS = partners.filter((p) => p.logoPath);

export function PartnersMarquee() {
  const t = useTranslations("home.partners");
  const tPartners = useTranslations("partners");
  const locale = useLocale();
  const shouldReduceMotion = useReducedMotion();
  const [paused, setPaused] = useState(false);

  return (
    <section className="bg-warm-cream py-16 md:py-20" aria-label="Partners">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <SectionBadge color="brown">{t("badge")}</SectionBadge>
            <Button href={`/${locale}/partners`} variant="secondary-dark">
              {t("viewAll")}
            </Button>
          </div>
        </ScrollReveal>

        {/* Reduced motion: static grid */}
        {shouldReduceMotion ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-6 items-center justify-items-center">
            {LOGO_PARTNERS.map((partner) => (
              <div key={partner.id} className="w-24 h-16 relative flex items-center justify-center">
                <Image
                  src={partner.logoPath!}
                  alt={tPartners(`${partner.id}.name`)}
                  fill
                  className="object-contain"
                  sizes="96px"
                />
              </div>
            ))}
          </div>
        ) : (
          /* Marquee — infinite horizontal scroll */
          <div
            className="overflow-hidden"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
          >
            <div
              className="flex gap-12 items-center"
              style={{
                animation: `marquee 30s linear infinite`,
                animationPlayState: paused ? "paused" : "running",
                width: "max-content",
              }}
              aria-label={t("badge")}
            >
              {/* Duplicate items for seamless loop */}
              {[...LOGO_PARTNERS, ...LOGO_PARTNERS].map((partner, i) => (
                <div
                  key={`${partner.id}-${i}`}
                  className="relative w-28 h-16 flex-shrink-0 grayscale hover:grayscale-0 transition-all duration-300"
                  aria-hidden={i >= LOGO_PARTNERS.length}
                >
                  <Image
                    src={partner.logoPath!}
                    alt={i < LOGO_PARTNERS.length ? tPartners(`${partner.id}.name`) : ""}
                    fill
                    className="object-contain"
                    sizes="112px"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
