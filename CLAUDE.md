# BookSlot – Project Context

## What is this?
A Hebrew-language appointment booking SaaS for Lior Segev Beauty (liors_beauty on Instagram).
Lior handles services (gel nails, eyebrow design, lash lifting). Elroi runs the tech.

## Status
✅ Production – everything works. Only improvements and new features.

## Tech Stack
- **Frontend:** Next.js (React) – deployed on Railway
  - URL: `authentic-wisdom-production.up.railway.app`
  - Main file: `index.jsx`
- **Backend:** Node.js + Express – deployed on Railway
  - URL: `booking-saas-production-b9fd.up.railway.app`
- **Database:** PostgreSQL on Railway
- **Repo:** `elroisegev-sketch/booking-saas`
- **Notifications:** Telegram bot (@LiorBeautyBot) + WhatsApp flow

## Critical Rules – Never Break These
1. **Hebrew only** – all UI copy is Hebrew. No English text visible to users.
2. **RTL layout** – everything right-to-left. Never use LTR containers.
3. **No Stripe / no payments** – booking flow has no payment step.
4. **Timezone:** UTC+2 (Israel). Always display times in UTC+2, never UTC.
5. **Mobile-first** – Lior's clients book from mobile. Desktop is secondary.

## Known Pitfalls
- Hebrew strings in Python scripts can strip quotes – avoid Python file-editing scripts for Hebrew content
- `index.jsx` has many versions across sessions – always confirm which version is active before editing
- Slot generation is dynamic based on service duration – don't hardcode time slots

## Business Logic
- Services: gel nails, eyebrow design, lash lifting (each has its own duration + price)
- Multi-service selection is supported with price summary
- Admin dashboard is mobile-optimized for Lior to manage bookings
- Slots are generated dynamically based on service duration

## Notification Flow
- New booking → Telegram message to @LiorBeautyBot
- WhatsApp-based confirmation to client

## Deployment
- Both frontend and backend run on Railway
- Changes pushed via Git → auto-deploy on Railway
- No manual server management needed

## נגישות ומשפטי
האתר כולל AccessibilityWidget (IS 5568), LegalFooter, PrivacyPolicy, TermsOfService. רכזת נגישות: ליאור שגב, 0535249688.
