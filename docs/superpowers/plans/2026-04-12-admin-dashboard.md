# Admin Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a read-only admin dashboard behind Supabase Auth so the organising committee can monitor registrations in real time, with CSV export.

**Architecture:** Supabase Auth with `@supabase/ssr` for cookie-based sessions in Next.js 15 App Router. A dedicated `/admin` route group with its own layout (no public Navbar/Footer). Server-side auth check in the admin layout redirects unauthenticated users to a login page. Dashboard queries registrations via the server client (SERVICE_ROLE_KEY) to bypass RLS.

**Tech Stack:** Next.js 15 (App Router), Supabase Auth + `@supabase/ssr`, next-intl, Tailwind CSS v4

---

## File Structure

```
src/
├── lib/supabase/
│   ├── server.ts              (existing — unchanged)
│   ├── client.ts              (existing — unchanged)
│   ├── auth-server.ts         (NEW — SSR auth client with cookies)
│   └── auth-client.ts         (NEW — browser auth client with cookies)
├── middleware.ts               (MODIFY — add auth session refresh)
├── app/[locale]/
│   ├── admin/
│   │   ├── layout.tsx          (NEW — auth-gated admin layout)
│   │   ├── page.tsx            (NEW — dashboard with stats + attendee table)
│   │   └── export/
│   │       └── route.ts        (NEW — CSV export API endpoint)
│   └── login/
│       └── page.tsx            (NEW — login page with magic link form)
├── app/api/auth/
│   └── callback/
│       └── route.ts            (NEW — Supabase auth callback handler)
messages/
├── fr.json                     (MODIFY — add admin + login keys)
└── en.json                     (MODIFY — add admin + login keys)
```

---

### Task 1: Install @supabase/ssr

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install the package**

```bash
cd /home/chomei/bomalab/resilience241 && npm install @supabase/ssr
```

- [ ] **Step 2: Verify installation**

```bash
npm ls @supabase/ssr
```

Expected: `@supabase/ssr@x.x.x` listed.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "deps: add @supabase/ssr for auth session management"
```

---

### Task 2: Create Supabase auth clients (server + browser)

**Files:**
- Create: `src/lib/supabase/auth-server.ts`
- Create: `src/lib/supabase/auth-client.ts`

- [ ] **Step 1: Create the server auth client**

Create `src/lib/supabase/auth-server.ts`:

```typescript
import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createAuthServerClient() {
  const cookieStore = await cookies();

  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        },
      },
    }
  );
}
```

- [ ] **Step 2: Create the browser auth client**

Create `src/lib/supabase/auth-client.ts`:

```typescript
import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";

export function createAuthBrowserClient() {
  return createSupabaseBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 3: Verify the build**

```bash
cd /home/chomei/bomalab/resilience241 && npm run build 2>&1 | tail -10
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/lib/supabase/auth-server.ts src/lib/supabase/auth-client.ts
git commit -m "feat: add Supabase SSR auth clients for cookie-based sessions"
```

---

### Task 3: Update middleware for auth session refresh

**Files:**
- Modify: `src/middleware.ts`

The middleware needs to refresh the Supabase auth session on every request (to keep cookies alive). It must compose with the existing next-intl middleware.

- [ ] **Step 1: Replace middleware.ts with composable version**

Replace the entire content of `src/middleware.ts`:

```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  // Run next-intl middleware first for locale routing
  const response = intlMiddleware(request);

  // Refresh Supabase auth session (keeps cookies alive)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
```

- [ ] **Step 2: Verify the build**

```bash
cd /home/chomei/bomalab/resilience241 && npm run build 2>&1 | tail -10
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/middleware.ts
git commit -m "feat: compose auth session refresh with i18n middleware"
```

---

### Task 4: Create auth callback route

**Files:**
- Create: `src/app/api/auth/callback/route.ts`

This handles the redirect from Supabase after a magic link is clicked.

- [ ] **Step 1: Create the callback route**

Create `src/app/api/auth/callback/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const locale = searchParams.get("locale") || "fr";

  if (code) {
    const response = NextResponse.redirect(`${origin}/${locale}/admin`);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.headers
              .get("cookie")
              ?.split("; ")
              .map((c) => {
                const [name, ...rest] = c.split("=");
                return { name, value: rest.join("=") };
              }) ?? [];
          },
          setAll(cookiesToSet) {
            for (const { name, value, options } of cookiesToSet) {
              response.cookies.set(name, value, options);
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return response;
    }
  }

  return NextResponse.redirect(`${origin}/${locale}/login?error=auth`);
}
```

- [ ] **Step 2: Verify the build**

```bash
cd /home/chomei/bomalab/resilience241 && npm run build 2>&1 | tail -10
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/auth/callback/route.ts
git commit -m "feat: add Supabase auth callback route for magic links"
```

---

### Task 5: Create login page

**Files:**
- Create: `src/app/[locale]/login/page.tsx`
- Modify: `messages/fr.json`
- Modify: `messages/en.json`

- [ ] **Step 1: Add i18n keys**

In `messages/fr.json`, add a top-level `"login"` object (after the existing top-level keys):

```json
"login": {
  "title": "Espace Comité",
  "subtitle": "Connectez-vous pour accéder au tableau de bord",
  "emailLabel": "Adresse e-mail",
  "emailPlaceholder": "votre@email.com",
  "submit": "Envoyer le lien de connexion",
  "success": "Un lien de connexion a été envoyé à votre adresse e-mail. Vérifiez votre boîte de réception.",
  "errorGeneric": "Une erreur est survenue. Veuillez réessayer.",
  "errorAuth": "Le lien de connexion a expiré ou est invalide. Veuillez réessayer.",
  "backHome": "Retour à l'accueil"
}
```

In `messages/en.json`, add the same structure:

```json
"login": {
  "title": "Committee Area",
  "subtitle": "Sign in to access the dashboard",
  "emailLabel": "Email address",
  "emailPlaceholder": "your@email.com",
  "submit": "Send login link",
  "success": "A login link has been sent to your email address. Check your inbox.",
  "errorGeneric": "An error occurred. Please try again.",
  "errorAuth": "The login link has expired or is invalid. Please try again.",
  "backHome": "Back to home"
}
```

- [ ] **Step 2: Create the login page**

Create `src/app/[locale]/login/page.tsx`:

```typescript
"use client";

import { useState, type FormEvent } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createAuthBrowserClient } from "@/lib/supabase/auth-client";

export default function LoginPage() {
  const t = useTranslations("login");
  const locale = useLocale();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "auth" ? t("errorAuth") : null
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const supabase = createAuthBrowserClient();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback?locale=${locale}`,
      },
    });

    setSubmitting(false);

    if (authError) {
      setError(t("errorGeneric"));
      return;
    }

    setSent(true);
  }

  return (
    <section className="py-16">
      <div className="mx-auto max-w-md px-4">
        <div className="bg-light-beige rounded-lg p-8 md:p-10 shadow-sm">
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-crimson text-center mb-2">
            {t("title")}
          </h1>
          <p className="font-body text-sm text-near-black/60 text-center mb-8">
            {t("subtitle")}
          </p>

          {error && (
            <div className="mb-6 rounded border border-crimson bg-crimson/10 p-3 text-crimson font-body text-sm" role="alert">
              {error}
            </div>
          )}

          {sent ? (
            <div className="text-center">
              <div className="mb-4">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mx-auto" aria-hidden="true">
                  <circle cx="24" cy="24" r="22" fill="#2D7B3F" />
                  <path d="M15 24L21 30L33 18" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="font-body text-base text-near-black/80">
                {t("success")}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <label htmlFor="email" className="block font-body text-sm font-semibold text-near-black mb-1">
                {t("emailLabel")}
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("emailPlaceholder")}
                className="w-full rounded border border-mid-grey bg-white px-4 py-2 font-body text-near-black focus:outline-none focus:ring-2 focus:ring-orange focus:border-orange mb-6"
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full font-heading font-semibold text-base text-white bg-crimson hover:bg-crimson/90 disabled:opacity-60 px-6 py-3 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-crimson focus:ring-offset-2"
              >
                {submitting ? "..." : t("submit")}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link href={`/${locale}`} className="font-body text-sm text-brown hover:text-crimson transition-colors">
              {t("backHome")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verify the build**

```bash
cd /home/chomei/bomalab/resilience241 && npm run build 2>&1 | tail -10
```

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/login/page.tsx messages/fr.json messages/en.json
git commit -m "feat: add magic link login page for committee members"
```

---

### Task 6: Create admin layout with auth gate

**Files:**
- Create: `src/app/[locale]/admin/layout.tsx`
- Modify: `messages/fr.json`
- Modify: `messages/en.json`

- [ ] **Step 1: Add admin i18n keys**

In `messages/fr.json`, add a top-level `"admin"` object:

```json
"admin": {
  "title": "Tableau de bord",
  "signOut": "Déconnexion",
  "totalRegistrations": "Total inscriptions",
  "byCategory": "Par catégorie",
  "recentRegistrations": "Inscriptions récentes",
  "exportCsv": "Exporter CSV",
  "searchPlaceholder": "Rechercher par nom, email ou organisation...",
  "noResults": "Aucune inscription trouvée",
  "tableHeaders": {
    "name": "Nom",
    "email": "E-mail",
    "organisation": "Organisation",
    "category": "Catégorie",
    "language": "Langue",
    "date": "Date"
  },
  "categories": {
    "opdad": "OPDAD",
    "government": "Gouvernement",
    "partner": "Partenaire",
    "civilSociety": "Société civile",
    "community": "Communauté",
    "other": "Autre"
  }
}
```

In `messages/en.json`, add the same structure:

```json
"admin": {
  "title": "Dashboard",
  "signOut": "Sign out",
  "totalRegistrations": "Total registrations",
  "byCategory": "By category",
  "recentRegistrations": "Recent registrations",
  "exportCsv": "Export CSV",
  "searchPlaceholder": "Search by name, email or organisation...",
  "noResults": "No registrations found",
  "tableHeaders": {
    "name": "Name",
    "email": "Email",
    "organisation": "Organisation",
    "category": "Category",
    "language": "Language",
    "date": "Date"
  },
  "categories": {
    "opdad": "OAFLAD",
    "government": "Government",
    "partner": "Partner",
    "civilSociety": "Civil Society",
    "community": "Community",
    "other": "Other"
  }
}
```

- [ ] **Step 2: Create the admin layout**

Create `src/app/[locale]/admin/layout.tsx`:

```typescript
import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { createAuthServerClient } from "@/lib/supabase/auth-server";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AdminLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createAuthServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  return (
    <div className="min-h-screen bg-warm-cream">
      <header className="bg-brown text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-heading text-lg font-bold">#BuildingResilience</span>
          <span className="text-white/50">|</span>
          <span className="font-body text-sm text-white/80">{user.email}</span>
        </div>
        <form action={`/api/auth/signout?locale=${locale}`} method="POST">
          <button
            type="submit"
            className="font-body text-sm text-white/80 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </form>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8">
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify the build**

```bash
cd /home/chomei/bomalab/resilience241 && npm run build 2>&1 | tail -10
```

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/admin/layout.tsx messages/fr.json messages/en.json
git commit -m "feat: add auth-gated admin layout with session check"
```

---

### Task 7: Create sign-out API route

**Files:**
- Create: `src/app/api/auth/signout/route.ts`

- [ ] **Step 1: Create the sign-out route**

Create `src/app/api/auth/signout/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function POST(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const locale = searchParams.get("locale") || "fr";

  const response = NextResponse.redirect(`${origin}/${locale}/login`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.headers
            .get("cookie")
            ?.split("; ")
            .map((c) => {
              const [name, ...rest] = c.split("=");
              return { name, value: rest.join("=") };
            }) ?? [];
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  await supabase.auth.signOut();

  return response;
}
```

- [ ] **Step 2: Verify the build**

```bash
cd /home/chomei/bomalab/resilience241 && npm run build 2>&1 | tail -10
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/auth/signout/route.ts
git commit -m "feat: add sign-out API route"
```

---

### Task 8: Create the admin dashboard page

**Files:**
- Create: `src/app/[locale]/admin/page.tsx`

This is the main dashboard — stats overview + searchable attendee table + CSV export link. Server component that queries Supabase directly.

- [ ] **Step 1: Create the dashboard page**

Create `src/app/[locale]/admin/page.tsx`:

```typescript
import { setRequestLocale, getTranslations } from "next-intl/server";
import { createServerClient } from "@/lib/supabase/server";
import { AdminDashboardClient } from "./AdminDashboardClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");

  const supabase = createServerClient();
  const { data: registrations } = await supabase
    .from("registrations")
    .select("id, first_name, last_name, email, organisation, category, language_pref, created_at")
    .order("created_at", { ascending: false });

  const rows = registrations ?? [];

  const categoryBreakdown: Record<string, number> = {};
  for (const r of rows) {
    categoryBreakdown[r.category] = (categoryBreakdown[r.category] || 0) + 1;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-crimson">
          {t("title")}
        </h1>
        <a
          href={`/api/admin/export?locale=${locale}`}
          className="font-heading text-sm font-semibold text-white bg-brown hover:bg-brown/90 px-4 py-2 rounded transition-colors"
        >
          {t("exportCsv")}
        </a>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-brown/10">
          <p className="font-body text-sm text-near-black/60 mb-1">{t("totalRegistrations")}</p>
          <p className="font-heading text-3xl font-extrabold text-crimson">{rows.length}</p>
        </div>

        {Object.entries(categoryBreakdown).map(([cat, count]) => (
          <div key={cat} className="bg-white rounded-lg p-6 shadow-sm border border-brown/10">
            <p className="font-body text-sm text-near-black/60 mb-1">{t(`categories.${cat}`)}</p>
            <p className="font-heading text-2xl font-bold text-brown">{count}</p>
          </div>
        ))}
      </div>

      {/* Client component for search + table */}
      <AdminDashboardClient
        registrations={rows}
        labels={{
          search: t("searchPlaceholder"),
          noResults: t("noResults"),
          recent: t("recentRegistrations"),
          name: t("tableHeaders.name"),
          email: t("tableHeaders.email"),
          organisation: t("tableHeaders.organisation"),
          category: t("tableHeaders.category"),
          language: t("tableHeaders.language"),
          date: t("tableHeaders.date"),
        }}
        categoryLabels={{
          opdad: t("categories.opdad"),
          government: t("categories.government"),
          partner: t("categories.partner"),
          civilSociety: t("categories.civilSociety"),
          community: t("categories.community"),
          other: t("categories.other"),
        }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Create the client component for search + table**

Create `src/app/[locale]/admin/AdminDashboardClient.tsx`:

```typescript
"use client";

import { useState } from "react";

type Registration = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  organisation: string | null;
  category: string;
  language_pref: string;
  created_at: string;
};

type Props = {
  registrations: Registration[];
  labels: {
    search: string;
    noResults: string;
    recent: string;
    name: string;
    email: string;
    organisation: string;
    category: string;
    language: string;
    date: string;
  };
  categoryLabels: Record<string, string>;
};

export function AdminDashboardClient({ registrations, labels, categoryLabels }: Props) {
  const [search, setSearch] = useState("");

  const filtered = registrations.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.first_name.toLowerCase().includes(q) ||
      r.last_name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      (r.organisation?.toLowerCase().includes(q) ?? false)
    );
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-lg font-bold text-brown">
          {labels.recent}
        </h2>
        <span className="font-body text-sm text-near-black/50">
          {filtered.length} / {registrations.length}
        </span>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={labels.search}
        className="w-full rounded border border-mid-grey bg-white px-4 py-2 font-body text-near-black text-sm focus:outline-none focus:ring-2 focus:ring-orange focus:border-orange mb-4"
      />

      <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-brown/10">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-brown/10 bg-brown/5">
              <th className="px-4 py-3 font-heading text-xs font-semibold text-brown uppercase tracking-wider">{labels.name}</th>
              <th className="px-4 py-3 font-heading text-xs font-semibold text-brown uppercase tracking-wider">{labels.email}</th>
              <th className="px-4 py-3 font-heading text-xs font-semibold text-brown uppercase tracking-wider hidden md:table-cell">{labels.organisation}</th>
              <th className="px-4 py-3 font-heading text-xs font-semibold text-brown uppercase tracking-wider hidden sm:table-cell">{labels.category}</th>
              <th className="px-4 py-3 font-heading text-xs font-semibold text-brown uppercase tracking-wider hidden lg:table-cell">{labels.language}</th>
              <th className="px-4 py-3 font-heading text-xs font-semibold text-brown uppercase tracking-wider hidden sm:table-cell">{labels.date}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center font-body text-sm text-near-black/50">
                  {labels.noResults}
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="border-b border-brown/5 hover:bg-warm-cream/50 transition-colors">
                  <td className="px-4 py-3 font-body text-sm text-near-black font-medium">
                    {r.first_name} {r.last_name}
                  </td>
                  <td className="px-4 py-3 font-body text-sm text-near-black/70">{r.email}</td>
                  <td className="px-4 py-3 font-body text-sm text-near-black/70 hidden md:table-cell">{r.organisation || "—"}</td>
                  <td className="px-4 py-3 font-body text-sm text-near-black/70 hidden sm:table-cell">
                    {categoryLabels[r.category] || r.category}
                  </td>
                  <td className="px-4 py-3 font-body text-sm text-near-black/70 hidden lg:table-cell">{r.language_pref.toUpperCase()}</td>
                  <td className="px-4 py-3 font-body text-sm text-near-black/50 hidden sm:table-cell">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify the build**

```bash
cd /home/chomei/bomalab/resilience241 && npm run build 2>&1 | tail -10
```

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/admin/page.tsx src/app/[locale]/admin/AdminDashboardClient.tsx
git commit -m "feat: add admin dashboard with stats and searchable attendee table"
```

---

### Task 9: Create CSV export endpoint

**Files:**
- Create: `src/app/api/admin/export/route.ts`

- [ ] **Step 1: Create the export route**

Create `src/app/api/admin/export/route.ts`:

```typescript
import { createAuthServerClient } from "@/lib/supabase/auth-server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
  // Verify the user is authenticated
  const authClient = await createAuthServerClient();
  const { data: { user } } = await authClient.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Use service role client to fetch all registrations
  const supabase = createServerClient();
  const { data: registrations, error } = await supabase
    .from("registrations")
    .select("first_name, last_name, email, phone, organisation, role, category, language_pref, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return new Response("Database error", { status: 500 });
  }

  const rows = registrations ?? [];

  const headers = ["First Name", "Last Name", "Email", "Phone", "Organisation", "Role", "Category", "Language", "Registered At"];

  const csvRows = [
    headers.join(","),
    ...rows.map((r) =>
      [
        escape(r.first_name),
        escape(r.last_name),
        escape(r.email),
        escape(r.phone || ""),
        escape(r.organisation || ""),
        escape(r.role || ""),
        r.category,
        r.language_pref,
        new Date(r.created_at).toISOString(),
      ].join(",")
    ),
  ];

  const csv = csvRows.join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="registrations-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}

function escape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
```

- [ ] **Step 2: Verify the build**

```bash
cd /home/chomei/bomalab/resilience241 && npm run build 2>&1 | tail -10
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/admin/export/route.ts
git commit -m "feat: add authenticated CSV export endpoint for registrations"
```

---

### Task 10: Create a committee member in Supabase Auth

This task is done via the Supabase CLI — no code changes.

- [ ] **Step 1: Create a test admin user**

Use the Supabase CLI to invite a user (this sends a magic link):

```bash
supabase db query --linked "
SELECT auth.create_user(
  '{}',
  'test@bomalab.com',
  '',
  '{\"email\": \"test@bomalab.com\"}',
  'email'
);"
```

Alternatively, create users via the Supabase dashboard (Authentication > Users > Invite user).

- [ ] **Step 2: Verify login flow**

1. Navigate to `http://localhost:3000/fr/login`
2. Enter the test email
3. Check email for magic link
4. Click link — should redirect to `/fr/admin`
5. Dashboard should load with registration data

---

### Task 11: Manual verification

- [ ] **Step 1: Verify unauthenticated access to /admin**

Navigate to `http://localhost:3000/fr/admin`

Expected: Redirected to `/fr/login`.

- [ ] **Step 2: Verify login page renders**

Navigate to `http://localhost:3000/fr/login`

Expected: Login form with email input and "Envoyer le lien de connexion" button.

- [ ] **Step 3: Verify English locale**

Navigate to `http://localhost:3000/en/login`

Expected: Login form in English.

- [ ] **Step 4: Verify dashboard after login**

After authenticating via magic link:

Expected: Dashboard shows stats cards, searchable attendee table, CSV export button.

- [ ] **Step 5: Verify CSV export**

Click "Exporter CSV" button.

Expected: CSV file downloads with registration data.

- [ ] **Step 6: Verify sign out**

Click "Déconnexion".

Expected: Redirected to login page. Visiting `/admin` redirects to login again.
