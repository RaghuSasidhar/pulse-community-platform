# Pulse — Frontend Build Plan

A complete, clickable front end for Pulse using the uploaded blue/indigo palette. No real backend: sign-in is faked in the browser, and all map, report and AI content comes from realistic sample data.

## Colour and look

Taken straight from the palette image:

- Royal Nightfall `#0B173D` — main dark surface and text
- Royal Sapphire `#1E42AC` — primary buttons and links
- Soft Blue `#CDD6EE`, Soft Indigo `#D6CDEE`, Soft Purple `#E6CDEE` — soft panels and tints
- Bright Grey `#EBECF0` — page background

Severity scale for the map runs from soft blue (low) through indigo and purple to sapphire and nightfall (critical). Clean, data-dashboard feel: crisp cards, mono numerals, generous spacing, no gradients-on-white cliché.

## Pages

**Public**
1. Home / Dashboard — live heatmap of zones, severity legend, zone list, "Report an issue in your area" button top-right.
2. Zone detail — severity, what's clustering, trend, plain-language AI summary, hedged "possible reason", precautions.
3. About Pulse — what it is, what it is not (no diagnosis, not a replacement for official reporting).
4. Privacy & how reports are used.
5. FAQ.

**Sign-in flow (dummy)**
6. Role picker — Citizen / Doctor / Volunteer / Lab / Pharmacy.
7. Citizen OTP screen — enter phone, enter any 6 digits, accepted.
8. Professional verification — license / ID number entry, accepted with any value.

**Reporting (after fake sign-in)**
9. Citizen report — symptom checkboxes (cold, cough, fever, body pains, stomach upset, headache, eye redness, skin rashes, vomiting, pneumonia); each ticked item reveals a severity slider.
10. Doctor report — subtype tabs: GP (presumptive case + syndromic counts + vaccination), hospital backend (admissions, ICU, cultures, beds, mortality), OPD (triage counts, symptom clusters), private practice (notifiable diseases, condition trends).
11. Volunteer report — surge alerts / rumours / unusual illness or animal deaths, plus household tallies and stock logs.
12. Lab report — pathogen panels, smears, culture results.
13. Pharmacy report — OTC sales volume by symptom category (marked as a draft form, since the spec is still open).
14. Report submitted confirmation.
15. My reports — list of what this dummy session submitted.

**Official view (dummy role switch)**
16. Officials console — early raw signal table, zones pending threshold, anomaly-flagged zones for review.

Plus a 404 page.

Language switcher in the header (English + two sample languages) swapping UI labels, so the multilingual requirement is visible.

## Behaviour without a backend

- Sample zones with severity, report mix and AI summaries baked in as local data.
- Submitting a report updates the in-browser store, so the zone counts and "My reports" change immediately; it resets on reload.
- Location permission prompt is simulated: asking centres the map on a sample "your area" zone.
- Every screen carries the non-diagnostic disclaimer.

## Technical notes

- TanStack Start file routes, one route file per page above; sign-in state in a React context backed by session storage, gated by a `_authenticated` layout that redirects to the role picker.
- Palette added as oklch tokens in `src/styles.css` (background, primary, severity-1..5, soft surfaces) and used only through semantic classes.
- Heatmap: Leaflet + leaflet.heat, loaded only in the browser behind a client-only boundary, with a static zone-grid fallback while it loads.
- Mock data and the report store live in `src/data/` and `src/lib/`, shaped so they can be swapped for real API calls later.
- Each route gets its own title/description/social metadata.

## Not in this pass

Real authentication, database, AI generation, translation service, anti-fraud logic — all represented by sample content and clearly marked as demo.
