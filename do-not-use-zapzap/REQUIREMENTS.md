# ZapZap Webapp – Complete Requirements

## 1. Purpose & Scope

**Product name:** ZapZap (company name and app name).

**Type:** Single-page web application (SPA).

**Purpose:** A telecom customer dashboard that demonstrates:
- In-app display of **personalized offers** in a carousel to drive engagement.
- **User switching** (e.g. support/admin view) to see different customer data and offers.
- Foundation for **RT-CDP** (Real-Time Customer Data Platform) use cases: display, click, and dismissal events that can later be used for enrichment and offer ranking.

**Scope:** One page only. No authentication, no backend, no persistence. Data is static (e.g. in `data.js`). The app is a demo/POC for the described use case.

---

## 2. Business Context (Use Case)

The app aligns with the following goals:

| Goal | How the app supports it |
|------|--------------------------|
| Drive traffic through in-app push | Carousel is the in-app surface where offers are shown (push would drive users here). |
| Present personalized offers in carousel | Carousel shows a **per-user** list of offers; order and set can differ by user. |
| Follow-up on interest through app-inbox | (Future) “Show more” / click can feed into app-inbox follow-up; current app focuses on display + click + dismiss. |
| Collect real-time interaction data (RT-CDP) | Display = offer shown in carousel; Click = “Show more”; Dismiss = “Dismiss”. Events can be sent to RT-CDP later. |
| Enrich profile from click, dismissal, display | Same events (display, click, dismiss) are the inputs for profile enrichment. |
| Adjust offer in real-time / rank with AI (AJO) | Per-user offer list and order can reflect “ranking” (e.g. AJO); current app uses static per-user lists. |
| Limit to ~50 offers, no discounts | Offer types are value bundles (e.g. Voor Jou, TV&E, Roam Easy), not discount codes. |
| Value: higher display rates, higher clicks, better personalization | Carousel increases visibility; “Show more” and “Dismiss” give clear interaction signals. |

---

## 3. Functional Requirements

### 3.1 User Switching

- **FR-1.1** A **dropdown at the top** of the page allows switching between multiple users (fixed set; default **5 users**).
- **FR-1.2** On change of selection, the **entire dashboard and carousel** update to show that user’s data and offers.
- **FR-1.3** No login; the dropdown is the only “identity” control (simulates “view as” different customers).

### 3.2 Dashboard (Logged-in User View)

- **FR-2.1** Display **usage for the selected user**:
  - Data (e.g. in GB)
  - Minutes (voice)
  - SMS
- **FR-2.2** Display **current plan** name.
- **FR-2.3** Display **subscriptions** (add-ons, e.g. Spotify, Cloud Storage, TV). If none, show “None” or equivalent.

### 3.3 Offers Carousel

- **FR-3.1** A **horizontal carousel** shows **offer cards** for the selected user.
- **FR-3.2** Each card shows:
  - Offer **title**
  - Short **description** (one line or short text).
- **FR-3.3** Each card has two actions:
  - **“Show more”** – opens a **modal** with full offer details (longer description).
  - **“Dismiss”** – removes that offer card from the carousel for the **current user in the current session** (no server persistence).
- **FR-3.4** Carousel has **previous** and **next** controls to scroll horizontally (e.g. by a fixed step).
- **FR-3.5** Offer list and order are **per user** (different users can have different offers and order, to reflect “personalization” and ranking).

### 3.4 Offer Detail Modal

- **FR-4.1** “Show more” opens a **modal** (overlay).
- **FR-4.2** Modal shows:
  - Offer **title** (e.g. in header)
  - **Full description** (detailed text).
- **FR-4.3** Modal can be closed by:
  - Close button
  - Clicking the overlay (outside the modal)
  - **Escape** key.

### 3.5 Data Model (Static)

- **FR-5.1** At least **5 users**, each with:
  - Unique **id**
  - **Name** (display in dropdown)
  - **Usage**: data (GB), minutes, SMS
  - **Plan** (string)
  - **Subscriptions** (list of strings)
  - **Offers** (ordered list; order can represent ranking).
- **FR-5.2** Each **offer** has:
  - **id** (unique per offer instance)
  - **title**
  - **shortDesc** (for card)
  - **fullDescription** (for modal).
- **FR-5.3** Offers are **value-oriented** (e.g. “Voor Jou”, “TV & Entertainment”, “Roam Easy”); no discount codes or pricing required in the POC.

---

## 4. User Interface Requirements

- **UI-1** Single page: header + main content; no navigation to other pages.
- **UI-2** Header: app name “ZapZap” and user dropdown (e.g. “View as: [dropdown]”).
- **UI-3** Main: one **dashboard** section (usage, plan, subscriptions), then one **offers** section (heading + carousel).
- **UI-4** Carousel: scrollable row of cards with previous/next buttons; layout works on small screens (e.g. responsive).
- **UI-5** Modal: centered, with title, body text, and close control; overlay dims the rest of the page.
- **UI-6** Accessible: e.g. `aria-label` on controls, `aria-modal` and `role="dialog"` on modal, focus management (e.g. focus on close when modal opens).

---

## 5. Technical Requirements

- **TR-1** **Vanilla JavaScript** only (no React/Vue/etc.).
- **TR-2** **No backend**; no server, no API calls. All data from a client-side source (e.g. `data.js`).
- **TR-3** **No persistence**: dismissed state is in-memory only; refresh or switch user resets/varies state as implemented (e.g. dismiss per user in session).
- **TR-4** **Static hosting**: app must run as static files (e.g. GitHub Pages); entry point `zapzap/index.html`.
- **TR-5** **Browser support**: modern browsers (ES6+); no IE requirement.

---

## 6. Out of Scope (Current Version)

- Real authentication / login.
- Backend or database; APIs for usage or offers.
- Persisting dismissed/click state to server or RT-CDP.
- App-inbox UI or push notifications.
- More than 5 users (configurable list is acceptable; 5 is the default requirement).
- Discounts, pricing, or checkout.
- Localization / multi-language.

---

## 7. Summary Checklist

| Requirement | Description |
|-------------|-------------|
| Single-page app | One HTML page; dashboard + carousel + modal. |
| User dropdown | Top of page; switch among 5 users. |
| Dashboard | Usage (data, minutes, SMS), plan, subscriptions. |
| Carousel | Horizontal; offer cards with title + short description. |
| Show more | Opens modal with full offer description. |
| Dismiss | Hides offer card for current user (session-only). |
| Carousel controls | Previous / next buttons; scroll. |
| Modal close | Button, overlay click, Escape. |
| Per-user data | Different usage, plan, subscriptions, and offer set/order per user. |
| Vanilla JS | No frameworks. |
| Static data | e.g. `data.js` with 5 users and their offers. |

This document describes the **complete requirement** of the ZapZap webapp as implemented and as a baseline for future extensions (e.g. RT-CDP events, app-inbox, backend).
