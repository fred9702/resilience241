"use client";

import { useTranslations, useLocale } from "next-intl";
import { SectionBadge } from "@/components/ui/SectionBadge";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

type MomentKey = "opening" | "presidential" | "firstLadies" | "lunch" | "panels" | "closing";

const MOMENT_KEYS: MomentKey[] = ["opening", "presidential", "firstLadies", "lunch", "panels", "closing"];

const DOT_COLORS: Record<MomentKey, string> = {
  opening: "bg-orange",
  presidential: "bg-crimson",
  firstLadies: "bg-green",
  lunch: "bg-brown",
  panels: "bg-navy",
  closing: "bg-orange",
};

export function ProgrammePreview() {
  const t = useTranslations("home.programme");
  const locale = useLocale();

  return (
    <section className="bg-light-beige py-16 md:py-24 overflow-hidden" aria-labelledby="programme-heading">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
            <div>
              <SectionBadge color="green">{t("badge")}</SectionBadge>
            </div>
            <Button href={`/${locale}/programme`} variant="secondary-dark">
              {t("viewFull")}
            </Button>
          </div>
        </ScrollReveal>

        {/* Desktop: horizontal timeline */}
        <div className="hidden lg:block relative">
          {/* Connecting line */}
          <div
            className="absolute top-[22px] left-0 right-0 h-0.5"
            style={{ background: "linear-gradient(to right, #E07B39, #9B1C37, #1F4E79)" }}
            aria-hidden="true"
          />
          <div className="grid grid-cols-6 gap-4">
            {MOMENT_KEYS.map((key, i) => (
              <ScrollReveal key={key} delay={i * 0.08}>
                <div className="flex flex-col items-center text-center">
                  {/* Numbered dot */}
                  <div
                    className={`relative z-10 w-11 h-11 rounded-full ${DOT_COLORS[key]} flex items-center justify-center text-white font-heading font-bold text-sm shadow-md mb-4`}
                    aria-hidden="true"
                  >
                    {i + 1}
                  </div>
                  {/* Time */}
                  <span className="font-heading text-xs font-semibold text-brown/70 uppercase tracking-wider mb-1">
                    {t(`moments.${key}.time`)}
                  </span>
                  {/* Title */}
                  <h3 className="font-heading text-sm font-semibold text-near-black leading-tight mb-1">
                    {t(`moments.${key}.title`)}
                  </h3>
                  {/* Description */}
                  <p className="font-body text-xs text-near-black/60 leading-snug">
                    {t(`moments.${key}.description`)}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* Mobile: vertical compact timeline */}
        <div className="lg:hidden space-y-0">
          {MOMENT_KEYS.map((key, i) => (
            <ScrollReveal key={key} delay={i * 0.06}>
              <div className="flex gap-4 items-start">
                {/* Left: dot + line */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className={`w-9 h-9 rounded-full ${DOT_COLORS[key]} flex items-center justify-center text-white font-heading font-bold text-xs shadow-sm`}
                    aria-hidden="true"
                  >
                    {i + 1}
                  </div>
                  {i < MOMENT_KEYS.length - 1 && (
                    <div className="w-0.5 flex-1 min-h-[32px] bg-near-black/10 my-1" aria-hidden="true" />
                  )}
                </div>
                {/* Right: content */}
                <div className={`pb-6 ${i === MOMENT_KEYS.length - 1 ? "" : ""}`}>
                  <span className="font-heading text-xs font-semibold text-brown/70 uppercase tracking-wider">
                    {t(`moments.${key}.time`)}
                  </span>
                  <h3 className="font-heading text-base font-semibold text-near-black mt-0.5">
                    {t(`moments.${key}.title`)}
                  </h3>
                  <p className="font-body text-sm text-near-black/60 leading-snug mt-0.5">
                    {t(`moments.${key}.description`)}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
