"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useReducedMotion } from "framer-motion";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

type StatKey = "stat1" | "stat2" | "stat3" | "stat4";
const STAT_KEYS: StatKey[] = ["stat1", "stat2", "stat3", "stat4"];

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function AnimatedCounter({ target, duration = 1600 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = null;
    setCount(0);

    function tick(ts: number) {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.round(easeOutCubic(progress) * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return <>{count}</>;
}

function StatCard({ statKey }: { statKey: StatKey }) {
  const t = useTranslations("home.impact");
  const shouldReduceMotion = useReducedMotion();
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const value = t(`${statKey}.value`);
  const label = t(`${statKey}.label`);
  const subtitle = t(`${statKey}.subtitle`);
  const numericValue = parseInt(value, 10);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="flex flex-col items-center text-center p-6">
      <div className="font-heading text-5xl md:text-6xl font-extrabold text-orange tabular-nums">
        {shouldReduceMotion || !inView ? numericValue : (
          inView ? <AnimatedCounter target={numericValue} /> : 0
        )}
      </div>
      <div className="mt-2 font-heading text-lg font-semibold text-warm-cream uppercase tracking-wide">
        {label}
      </div>
      <div className="mt-1 font-body text-sm text-warm-cream/60">
        {subtitle}
      </div>
    </div>
  );
}

export function ImpactNumbers() {
  return (
    <section
      className="relative overflow-hidden py-16 md:py-24"
      style={{ background: "linear-gradient(135deg, #6B3417 0%, #4a2410 50%, #6B3417 100%)" }}
      aria-labelledby="impact-heading"
    >
      {/* Subtle texture overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, #FBF0E6 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
        <ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-warm-cream/10">
            {STAT_KEYS.map((key) => (
              <StatCard key={key} statKey={key} />
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
