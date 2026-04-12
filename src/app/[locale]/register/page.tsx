import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { RegisterForm } from "./RegisterForm";
import { buildMetadata } from "@/lib/seo";
import { validateRegistrationToken } from "@/lib/registration-token";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata(locale, "register", "/register");
}

export default async function RegisterPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { t: token } = await searchParams;
  setRequestLocale(locale);
  const tr = await getTranslations("register");

  const tokenString = Array.isArray(token) ? token[0] : token ?? null;
  const isValid = await validateRegistrationToken(tokenString);

  if (!isValid) {
    return (
      <section className="py-16">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <div className="bg-light-beige rounded-lg p-10 md:p-16 shadow-sm">
            <h1 className="font-heading text-3xl md:text-4xl font-extrabold text-crimson mb-6">
              {tr("invitationOnly")}
            </h1>
            <p className="font-body text-base md:text-lg text-near-black/70 max-w-lg mx-auto">
              {tr("invitationOnlyDescription")}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="mx-auto max-w-2xl px-4">
        <h1 className="font-heading text-3xl md:text-4xl font-extrabold text-navy text-center mb-10">
          {tr("title")}
        </h1>
        <RegisterForm token={tokenString!} />
      </div>
    </section>
  );
}
