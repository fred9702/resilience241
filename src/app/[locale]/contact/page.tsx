import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ComingSoonPage } from "@/components/ui/ComingSoonPage";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return { title: `${t("title")} | ${locale === "fr" ? "OPDAD" : "OAFLAD"} #BuildingResilience` };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ComingSoonPage namespace="contact" />;
}
