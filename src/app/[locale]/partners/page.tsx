import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ComingSoonPage } from "@/components/ui/ComingSoonPage";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "partners" });
  return { title: `${t("title")} | ${locale === "fr" ? "OPDAD" : "OAFLAD"} #BuildingResilience` };
}

export default async function PartnersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ComingSoonPage namespace="partners" />;
}
