# NALAM — Website (HTML/CSS/JS + Node backend)

Same app, same flow as the React and Flutter versions, rebuilt as a plain
website: vanilla HTML/CSS/JS frontend talking to a real Node/Express
backend API. This is the closest of the three prototypes to the actual
architecture in the NALAM spec (frontend ↔ API ↔ backend services ↔ data).

## Structure

```
nalam_web/
  backend/     Express API — doctors, appointments, records, medicine
               verification, and an AI assistant proxy
  frontend/    Plain HTML/CSS/JS single-page app (no build step, no
               framework)
```

## Logging in

The frontend now requires login. A demo account is pre-seeded so you can
sign in immediately without registering:

- **Email:** `meena@example.com`
- **Password:** `password123`

Or tap "Create an account" to sign up — since there's no SMS provider
wired up, the OTP for verification is shown directly in the UI (clearly
marked as demo-only).

## Setting the AI API key from the app

You no longer have to edit `.env` by hand. Once logged in, go to
**Profile → AI Assistant Settings** and paste your Anthropic API key
there — it's sent to the backend and held in memory for that session
(never stored in the browser). `.env` still works too, as a fallback if
no key has been set through the UI.

## Medicine photo scanning (OCR)

The scan icon next to each medicine field in **Check Medicine** now
actually works — tap it, take or choose a photo of the medicine package,
and Claude's vision reads the name and strength off the label and fills
the field in. Uses the same API key as NALAM AI (Profile → AI Assistant
Settings). If no key is set, it tells you so instead of failing silently.

## Hospital queue management

New: after booking, patients can **check in** from the Appointments
screen to get a digital token and see their **live queue position,
patients ahead, and estimated wait time** — polling every 6 seconds while
on that screen, with a toast the moment they're called.

Hospital staff get a separate dashboard at **`frontend/staff.html`** —
open it directly in a browser (`http://localhost:PORT/staff.html` if
you're serving the folder, or just open the file). It shows each
doctor's queue split into Waiting / Called / In Consultation columns,
with buttons to call the next patient, start a consultation, mark it
complete, or skip. This is deliberately a separate page from the patient
app, the same way the spec calls for a separate doctor/staff portal
later — it talks to the same backend and queue endpoints.

## Run the backend

```
cd backend
npm install
cp .env.example .env
```

Open `.env` and paste a real Anthropic API key (from
https://console.anthropic.com) into `ANTHROPIC_API_KEY` if you want the
NALAM AI chat to work. Everything else — doctors, booking, records,
medicine verification — works without a key.

```
npm start
```

This runs the API at `http://localhost:4000`.

## Run the frontend

The frontend has no build step — it's static files. Simplest option,
from the `frontend` folder:

```
npx serve .
```

or just open `frontend/index.html` directly in a browser (note: some
browsers block `fetch` from `file://` URLs — if that happens, use
`npx serve .` or VS Code's "Live Server" extension instead).

Then visit whatever URL it prints (usually `http://localhost:3000`).

If your backend runs on a different host/port, update `API_BASE` at the
top of `frontend/app.js`.

## Why a backend at all

Keeping the Anthropic API key in a backend `.env` file (instead of in
frontend JavaScript, like the earlier React demo) means the key never
ships to the browser — this is the pattern you'd actually use in
production. The backend also gives you a real place to plug in Postgres
later: `backend/data.js` holds the in-memory mock data now, but the
route handlers in `server.js` are written so you can swap that module for
real database queries without changing the API shape the frontend calls.

## What's here vs. what's next

This covers Phase 1–4 of the NALAM spec (patient app, records, medicine
verification, AI assistant) plus basic auth (register/login/OTP,
password hashing, session tokens) as a working full-stack demo with
in-memory data — no real database, file uploads, voice, or multilingual
UI translation yet. Those are the natural next steps once you're ready
to build them.

**Auth caveats worth knowing:** sessions are plain tokens held in a
server-side dictionary — they vanish on restart, there's no token
refresh/expiry, no rate limiting on login attempts, and no HTTPS
enforcement. This is fine for local development but should not be
treated as production-ready auth. The OTP for signup is returned
directly in the API response instead of sent by SMS, since there's no
SMS provider configured — swap in Twilio (or similar) before this goes
anywhere real.
