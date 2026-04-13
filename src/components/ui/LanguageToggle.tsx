"use client";

import { usePathname, useRouter } from "next/navigation";

export function LanguageToggle({ locale }: { locale: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const otherLocale = locale === "fr" ? "en" : "fr";

  function switchTo(target: string) {
    if (target === locale) return;
    const pathWithoutLocale = pathname.replace(/^\/(fr|en)/, "") || "/";
    router.push(`/${target}${pathWithoutLocale}`);
  }

  return (
    <div className="flex items-center rounded-full border border-brown/20 bg-warm-cream/50 p-0.5">
      <button
        onClick={() => switchTo("en")}
        className={`font-heading text-sm font-semibold min-h-[36px] px-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange ${
          locale === "en" ? "bg-orange text-white" : "text-brown hover:text-near-black"
        }`}
        aria-label="English"
        aria-current={locale === "en" ? "true" : undefined}
      >
        EN
      </button>
      <button
        onClick={() => switchTo("fr")}
        className={`font-heading text-sm font-semibold min-h-[36px] px-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange ${
          locale === "fr" ? "bg-orange text-white" : "text-brown hover:text-near-black"
        }`}
        aria-label="Français"
        aria-current={locale === "fr" ? "true" : undefined}
      >
        FR
      </button>
    </div>
  );
}
