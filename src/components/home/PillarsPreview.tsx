"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Heart,
  Users,
  Star,
  BookOpen,
  CaretDown,
  ArrowRight,
} from "@phosphor-icons/react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { SectionBadge } from "@/components/ui/SectionBadge";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

type PillarKey = "health" | "women" | "youth" | "education";

interface Pillar {
  key: PillarKey;
  icon: React.ElementType;
  borderColor: string;
  iconColor: string;
  badgeColor: "green" | "orange" | "crimson" | "navy";
}

const PILLARS: Pillar[] = [
  { key: "health", icon: Heart, borderColor: "border-green", iconColor: "text-green", badgeColor: "green" },
  { key: "women", icon: Users, borderColor: "border-orange", iconColor: "text-orange", badgeColor: "orange" },
  { key: "youth", icon: Star, borderColor: "border-crimson", iconColor: "text-crimson", badgeColor: "crimson" },
  { key: "education", icon: BookOpen, borderColor: "border-navy", iconColor: "text-navy", badgeColor: "navy" },
];

export function PillarsPreview() {
  const t = useTranslations("home.pillars");
  const locale = useLocale();
  const [expanded, setExpanded] = useState<PillarKey | null>(null);
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="bg-light-beige py-16 md:py-24" aria-label="Four pillars">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <SectionBadge color="orange">{t("badge")}</SectionBadge>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PILLARS.map(({ key, icon: Icon, borderColor, iconColor }, index) => {
            const isOpen = expanded === key;
            const bullets = t.raw(`${key}.bullets`) as string[];

            return (
              <ScrollReveal key={key} delay={index * 0.1}>
                <div
                  className={`relative bg-warm-cream rounded-2xl border-t-4 ${borderColor} shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden flex flex-col`}
                >
                  {/* Card header — always visible */}
                  <button
                    className="w-full text-left px-6 pt-6 pb-4 flex flex-col gap-3 focus:outline-none focus:ring-2 focus:ring-orange focus:ring-inset min-h-[44px]"
                    aria-expanded={isOpen}
                    onClick={() => setExpanded(isOpen ? null : key)}
                  >
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-light-beige shadow-sm">
                      <Icon size={28} weight="duotone" className={iconColor} />
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-heading text-lg font-semibold text-near-black">
                          {t(`${key}.name`)}
                        </h3>
                        <p className="font-body text-sm text-near-black/70 mt-1 leading-snug">
                          {t(`${key}.description`)}
                        </p>
                      </div>
                      <span
                        className={`flex-shrink-0 mt-1 text-near-black/40 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                        aria-hidden="true"
                      >
                        <CaretDown size={18} />
                      </span>
                    </div>
                  </button>

                  {/* Expandable bullets */}
                  {shouldReduceMotion ? (
                    isOpen && (
                      <div>
                        <ul className="px-6 pb-4 space-y-2">
                          {bullets.map((bullet: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 font-body text-sm text-near-black/75">
                              <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-current ${iconColor}`} aria-hidden="true" />
                              {bullet}
                            </li>
                          ))}
                        </ul>
                        <div className="px-6 pb-5">
                          <a
                            href={`/${locale}/cap-241`}
                            className={`inline-flex items-center gap-1.5 font-heading text-sm font-semibold ${iconColor} hover:underline focus:outline-none focus:underline`}
                          >
                            {t("learnMore")} <ArrowRight size={14} />
                          </a>
                        </div>
                      </div>
                    )
                  ) : (
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="bullets"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <ul className="px-6 pb-4 space-y-2">
                            {bullets.map((bullet: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 font-body text-sm text-near-black/75">
                                <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-current ${iconColor}`} aria-hidden="true" />
                                {bullet}
                              </li>
                            ))}
                          </ul>
                          <div className="px-6 pb-5">
                            <a
                              href={`/${locale}/cap-241`}
                              className={`inline-flex items-center gap-1.5 font-heading text-sm font-semibold ${iconColor} hover:underline focus:outline-none focus:underline`}
                            >
                              {t("learnMore")} <ArrowRight size={14} />
                            </a>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
