# Token-Gated Registration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gate the registration page behind a secret URL token so only QR code holders can register, and remove registration from public navigation/sitemap.

**Architecture:** A `registration_tokens` table in Supabase stores tokens with active/inactive state and optional time windows. The `/register` page reads the `t` query param, validates it server-side, and either shows the form or an "invitation only" message. The API route also validates the token on submission. The register link is removed from the navbar and sitemap.

**Tech Stack:** Next.js 15 (App Router), Supabase, next-intl, Tailwind CSS v4

**Scope note:** This plan covers only the token gating and public visibility changes. The admin dashboard and Supabase Auth middleware are separate work that depends on committee approval of Option A vs B.

---

### Task 1: Create registration_tokens table in Supabase

**Files:**
- Modify: `supabase/schema.sql` (append after registrations table, before RLS policies section)

- [ ] **Step 1: Add the registration_tokens table and RLS policies to schema.sql**

Add this after the `media_items` table definition and before the `-- RLS Policies` comment:

```sql
-- 4. Registration tokens (QR code gating)
create table if not exists registration_tokens (
  id uuid primary key default gen_random_uuid(),
  token text unique not null,
  label text not null default 'Event QR Code',
  is_active boolean not null default true,
  opens_at timestamptz,
  closes_at timestamptz,
  created_at timestamptz default now()
);
```

Add these RLS policies after the existing media policies:

```sql
-- Registration tokens: only authenticated (admin) can manage
alter table registration_tokens enable row level security;

create policy "Admin can manage registration tokens"
  on registration_tokens for all
  to authenticated
  using (true)
  with check (true);

-- Anon can read active tokens (for validation)
create policy "Public can validate tokens"
  on registration_tokens for select
  to anon
  using (is_active = true);
```

- [ ] **Step 2: Run the SQL in Supabase**

Run the new SQL statements in the Supabase SQL Editor (or via `supabase db push` if using the CLI). Verify the table exists:

```sql
select * from registration_tokens;
```

Expected: empty result set, no errors.

- [ ] **Step 3: Insert a test token**

```sql
insert into registration_tokens (token, label, is_active)
values ('test-token-dev-2026', 'Dev Test Token', true);
```

- [ ] **Step 4: Commit**

```bash
git add supabase/schema.sql
git commit -m "feat: add registration_tokens table for QR code gating"
```

---

### Task 2: Add token validation helper

**Files:**
- Create: `src/lib/registration-token.ts`

- [ ] **Step 1: Create the token validation module**

```typescript
import { createClient } from "@supabase/supabase-js";

/**
 * Validates a registration token against Supabase.
 * Returns true if the token exists, is active, and within its time window.
 * Uses the anon key (RLS policy restricts to active tokens).
 */
export async function validateRegistrationToken(
  token: string | null
): Promise<boolean> {
  if (!token) return false;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from("registration_tokens")
    .select("is_active, opens_at, closes_at")
    .eq("token", token)
    .eq("is_active", true)
    .single();

  if (error || !data) return false;

  const now = new Date();
  if (data.opens_at && new Date(data.opens_at) > now) return false;
  if (data.closes_at && new Date(data.closes_at) < now) return false;

  return true;
}
```

- [ ] **Step 2: Verify the build**

```bash
cd /home/chomei/bomalab/resilience241 && npm run build 2>&1 | tail -5
```

Expected: build succeeds (the module is not imported yet, so no impact).

- [ ] **Step 3: Commit**

```bash
git add src/lib/registration-token.ts
git commit -m "feat: add registration token validation helper"
```

---

### Task 3: Gate the registration page with token validation

**Files:**
- Modify: `src/app/[locale]/register/page.tsx`
- Modify: `messages/fr.json`
- Modify: `messages/en.json`

- [ ] **Step 1: Add i18n keys for the invitation-only message**

In `messages/fr.json`, inside the `"register"` object, add:

```json
"invitationOnly": "Inscription sur invitation uniquement",
"invitationOnlyDescription": "L'inscription à cet événement est réservée aux personnes invitées. Si vous avez reçu un QR code, veuillez le scanner pour accéder au formulaire d'inscription."
```

In `messages/en.json`, inside the `"register"` object, add:

```json
"invitationOnly": "Registration by invitation only",
"invitationOnlyDescription": "Registration for this event is by invitation only. If you have received a QR code, please scan it to access the registration form."
```

- [ ] **Step 2: Update the register page to validate the token**

Replace the entire content of `src/app/[locale]/register/page.tsx` with:

```typescript
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
```

- [ ] **Step 3: Update RegisterForm to accept and send the token**

In `src/app/[locale]/register/RegisterForm.tsx`:

Update the component signature to accept a `token` prop:

```typescript
export function RegisterForm({ token }: { token: string }) {
```

Update the fetch body in `handleSubmit` to include the token. Change the `body` object (around line 79-89) to add the token:

```typescript
      const body = {
        first_name: formData.get("firstName"),
        last_name: formData.get("lastName"),
        email: formData.get("email"),
        phone,
        organisation: formData.get("organisation") || null,
        role: formData.get("role") || null,
        category: formData.get("category"),
        language_pref: formData.get("languagePref") || "fr",
        gdpr_consent: true,
        token,
      };
```

- [ ] **Step 4: Verify the build**

```bash
cd /home/chomei/bomalab/resilience241 && npm run build 2>&1 | tail -10
```

Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/app/[locale]/register/page.tsx src/app/[locale]/register/RegisterForm.tsx messages/fr.json messages/en.json
git commit -m "feat: gate registration page behind token validation"
```

---

### Task 4: Validate token on API form submission

**Files:**
- Modify: `src/app/api/register/route.ts`

- [ ] **Step 1: Add token validation to the POST handler**

In `src/app/api/register/route.ts`, add the import at the top:

```typescript
import { validateRegistrationToken } from "@/lib/registration-token";
```

After destructuring `body` (after line 26), add token validation before the existing field validation:

```typescript
    const tokenValid = await validateRegistrationToken(body.token || null);
    if (!tokenValid) {
      return NextResponse.json(
        { error: "Invalid or expired registration token" },
        { status: 403 }
      );
    }
```

- [ ] **Step 2: Verify the build**

```bash
cd /home/chomei/bomalab/resilience241 && npm run build 2>&1 | tail -10
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/register/route.ts
git commit -m "feat: validate registration token on API submission"
```

---

### Task 5: Remove /register from sitemap

**Files:**
- Modify: `src/app/sitemap.ts`

- [ ] **Step 1: Remove /register from the routes array**

In `src/app/sitemap.ts`, remove `"/register"` from the `routes` array (line 15). The array should become:

```typescript
const routes = [
  "",
  "/about",
  "/cap-241",
  "/contact",
  "/media",
  "/partners",
  "/programme",
  "/speakers",
];
```

- [ ] **Step 2: Verify the build**

```bash
cd /home/chomei/bomalab/resilience241 && npm run build 2>&1 | tail -5
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/sitemap.ts
git commit -m "feat: remove /register from public sitemap"
```

---

### Task 6: Remove register CTA from navbar

**Files:**
- Modify: `src/components/layout/Navbar.tsx`

- [ ] **Step 1: Remove the desktop register CTA button**

In `src/components/layout/Navbar.tsx`, remove lines 171-177 (the desktop Register CTA link):

```typescript
          {/* Register CTA */}
          <Link
            href={`/${locale}/register`}
            className="font-heading text-base font-semibold text-white bg-orange hover:bg-orange/90 px-4 py-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-orange focus:ring-offset-2 focus:ring-offset-warm-cream"
          >
            {t("register")}
          </Link>
```

- [ ] **Step 2: Remove the mobile register CTA button**

In the same file, remove lines 241-248 (the mobile Register CTA link):

```typescript
          <Link
            href={`/${locale}/register`}
            onClick={() => setMenuOpen(false)}
            tabIndex={menuOpen ? 0 : -1}
            className="font-heading text-lg font-semibold text-white bg-orange hover:bg-orange/90 px-4 py-3 rounded text-center mt-4 focus:outline-none focus:ring-2 focus:ring-orange focus:ring-offset-2 focus:ring-offset-warm-cream"
          >
            {t("register")}
          </Link>
```

- [ ] **Step 3: Verify the build**

```bash
cd /home/chomei/bomalab/resilience241 && npm run build 2>&1 | tail -5
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/Navbar.tsx
git commit -m "feat: remove register CTA from public navbar"
```

---

### Task 7: Manual verification via dev server

- [ ] **Step 1: Start the dev server**

```bash
cd /home/chomei/bomalab/resilience241 && npm run dev
```

- [ ] **Step 2: Verify gated page — no token**

Navigate to `http://localhost:3000/fr/register`

Expected: See the "Inscription sur invitation uniquement" message. No form visible.

- [ ] **Step 3: Verify gated page — invalid token**

Navigate to `http://localhost:3000/fr/register?t=fake-token`

Expected: Same "invitation only" message.

- [ ] **Step 4: Verify gated page — valid token**

Navigate to `http://localhost:3000/fr/register?t=test-token-dev-2026`

Expected: Registration form appears and functions normally.

- [ ] **Step 5: Verify form submission with valid token**

Fill in the form with test data and submit.

Expected: Redirects to confirmation page (201 response from API).

- [ ] **Step 6: Verify navbar**

Check both desktop and mobile views.

Expected: No "S'inscrire" / "Register" CTA button in the navbar.

- [ ] **Step 7: Verify English locale**

Navigate to `http://localhost:3000/en/register`

Expected: "Registration by invitation only" message in English.

Navigate to `http://localhost:3000/en/register?t=test-token-dev-2026`

Expected: Form appears in English.
