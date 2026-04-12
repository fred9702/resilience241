# Secured Registration System — Design Proposal

**Project:** #BuildingResilience Campaign Platform (resilience241)
**Date:** 12 April 2026
**Event:** 17 April 2026, Libreville, Gabon
**Prepared by:** CHOMEI COMMERZ LTD (BOMALAB)

---

## 1. Objective

Restrict event registration so that only individuals who receive a QR code from the organising committee can register. Provide the committee with a read-only dashboard to monitor registrations in real time.

## 2. How It Works

### 2.1 Token-Gated Registration

The registration page is hidden from the public. It can only be accessed by scanning a QR code that contains a secret token in the URL:

```
https://resilience241.com/fr/register?t=<secret-token>
```

- **Without a valid token:** The page displays a branded message — *"Registration is by invitation only"* — in French and English. No registration form is shown.
- **With a valid token:** The registration form appears and functions as normal.
- **The token is verified server-side** on both page load and form submission, preventing any bypass.

Tokens are cryptographically random (32+ characters) and stored securely in the platform database.

### 2.2 Registration Time Window

Each token can optionally have an **opening date** and **closing date**:

- Before the opening date: registration is not yet available.
- After the closing date: registration is automatically closed.
- The committee can also **manually activate or deactivate** a token at any time for immediate control.

Both mechanisms work together — a token must be active AND within its time window to grant access.

### 2.3 Post-Event

After the event (17 April 2026), registration closes automatically via the closing date. Registration data is preserved and the dashboard remains accessible for post-event reporting and export.

## 3. QR Code Management

The committee has two options for managing QR codes:

### Option A: Self-Service (via Dashboard)

Committee members log into the dashboard and can:

- Create new tokens (a QR code is generated automatically)
- View and download QR codes for printing
- Set opening/closing dates on each token
- Activate or deactivate tokens instantly
- See a label on each token (e.g., "Main Event QR", "VIP Reception QR")

### Option B: Managed Service

BOMALAB manages tokens on the committee's behalf:

- BOMALAB creates and configures tokens as requested
- Printable QR codes are sent directly to the committee
- The committee focuses only on distribution and monitoring registrations

The committee may choose either option, or a combination of both.

## 4. Committee Dashboard

A protected administration area accessible only to authorised committee members.

### 4.1 Access & Authentication

- Each committee member receives a personal login (via magic link sent to their email — no password to remember)
- Built on Supabase Auth (industry-standard, no additional cost)
- No shared passwords — each member has their own credentials

### 4.2 Dashboard Features

All features are **read-only** — the dashboard is for oversight, not for editing registrations.

| Feature | Description |
|---|---|
| **Registration overview** | Total registrations, breakdown by category (government, partner, civil society, etc.), registrations over time |
| **Attendee list** | Searchable, filterable table showing name, email, organisation, category, language preference, registration date |
| **CSV export** | Download the full attendee list as a spreadsheet |
| **Token / QR code view** | See active tokens, their status, and download QR codes *(Option A only)* |

### 4.3 What the Dashboard Does Not Do

- No editing or deleting registrations
- No approval workflows (registration is instant upon form submission)
- No email communications to registrants (out of scope)

## 5. Question for the Committee

**Panel-level registration:** The event programme includes two discussion panels. Should the registration form ask attendees which panel(s) they plan to attend?

- **Yes:** Adds panel selection checkboxes to the form. The dashboard would show per-panel headcounts for capacity planning.
- **No:** A single event-level registration is sufficient.

This is a simple addition if desired and does not change the overall architecture.

## 6. Visibility & SEO

- The registration page is **removed from the site's public navigation and sitemap**
- Search engines will not index or discover the registration page
- The **only entry point** to registration is the QR code URL
- Visitors who navigate to `/register` directly (without a token) see the "invitation only" message

## 7. Security Summary

| Measure | Detail |
|---|---|
| Token validation | Server-side on page load AND form submission |
| Token format | Cryptographically random, 32+ characters |
| Authentication | Supabase Auth with individual committee accounts |
| Data access | Registration data readable only by authenticated committee members |
| GDPR | Consent tracking with timestamp (existing) |
| Auto-lockdown | Configurable closing date per token |

## 8. Timeline

Implementation can begin immediately upon approval. The system is designed to be operational well before the event date of 17 April 2026.

---

*This proposal is confidential and intended for the #BuildingResilience organising committee.*
