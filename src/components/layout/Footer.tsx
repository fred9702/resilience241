"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import {
  FacebookLogo,
  TwitterLogo,
  InstagramLogo,
  YoutubeLogo,
} from "@phosphor-icons/react";

const FOOTER_LOGOS: Record<string, string> = {
  fr: "/images/fr/navbar-logo.png",
};
const FOOTER_LOGO_FALLBACK = "/images/common/mark.svg";

export function Footer() {
  const t = useTranslations("footer");
  const locale = useLocale();
  const footerLogo = FOOTER_LOGOS[locale] ?? FOOTER_LOGO_FALLBACK;

  return (
    <footer className="bg-brown text-white" role="contentinfo">
      {/* Decorative African geometric strip */}
      <div
        className="h-6 w-full opacity-15"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='24' viewBox='0 0 40 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolygon points='20,0 40,24 0,24' fill='white'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat-x",
          backgroundSize: "40px 24px",
        }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between md:items-start">
          {/* Logo + tagline */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <Image
              src={footerLogo}
              alt="OAFLAD logo"
              width={140}
              height={42}
              className="h-auto w-[140px] brightness-0 invert"
            />
            <p className="font-body text-sm text-white/90 text-center md:text-left max-w-xs">
              {t("tagline")}
            </p>
          </div>

          {/* Social icons */}
          <div className="flex gap-4">
            {[
              { icon: FacebookLogo, label: "Facebook", href: "#" },
              { icon: TwitterLogo, label: "Twitter / X", href: "#" },
              { icon: InstagramLogo, label: "Instagram", href: "#" },
              { icon: YoutubeLogo, label: "YouTube", href: "#" },
            ].map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="text-white hover:text-orange transition-colors focus:outline-none focus:ring-2 focus:ring-orange rounded p-1"
              >
                <Icon size={24} />
              </a>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-white/20 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <p className="font-body text-white/90">{t("copyright")}</p>
          <div className="flex gap-4 font-body">
            <Link
              href={`/${locale}`}
              className="text-white hover:text-orange transition-colors focus:outline-none focus:ring-2 focus:ring-orange rounded"
            >
              {t("privacy")}
            </Link>
            <Link
              href={`/${locale}`}
              className="text-white hover:text-orange transition-colors focus:outline-none focus:ring-2 focus:ring-orange rounded"
            >
              {t("terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
