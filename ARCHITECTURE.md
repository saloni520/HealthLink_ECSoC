# HealthLink — Architecture Overview

This document gives a beginner-friendly, high-level overview of how HealthLink is built and how its
pieces fit together. It reflects the code as it currently exists in the `HealthLink/` directory of
this repository.

## 1. Tech Stack

| Layer          | Technology                                              |
|----------------|-----------------------------------------------------------|
| Frontend       | Static HTML/CSS/JavaScript (`public/`) + server-rendered EJS templates (`views/`) |
| Backend        | Node.js + Express.js (`server.js`)                        |
| Database       | MongoDB (via Mongoose ODM), typically MongoDB Atlas       |
| Authentication | JWT stored in an HTTP-only cookie, passwords hashed with bcryptjs |
| AI Integration | OpenAI API (`openai` SDK) for the chatbot; a Hugging Face inference call for report "analysis" |
| Hosting        | Render.com (per the project README's live demo link)      |

There is a single Node.js application — there is no separate backend service or API gateway. The
Express server both serves static/rendered pages and exposes the JSON/API-style endpoints the
frontend JavaScript calls.

## 2. High-Level Component Diagram

```
                        ┌─────────────────────────────┐
                        │            Browser           │
                        │  (public/*.html, EJS views,   │
                        │   public/js/*.js, public/css) │
                        └───────────────┬───────────────┘
                                        │ HTTP (page loads, form
                                        │ posts, fetch() calls)
                                        ▼
                        ┌─────────────────────────────┐
                        │        Express Server         │
                        │        (HealthLink/server.js) │
                        │                                │
                        │  • Middleware: cookie-parser,  │
                        │    body-parser, cors,          │
                        │    method-override             │
                        │  • requireAuth / checkLoggedIn │
                        │    JWT middleware               │
                        │  • Route handlers (auth,        │
                        │    dashboard, doctors,          │
                        │    appointments, AI, contact)   │
                        │  • EJS view rendering           │
                        └───────┬───────────┬─────────────┘
                                │           │
             Mongoose queries   │           │  Outbound API calls
                                ▼           ▼
                  ┌───────────────────┐  ┌───────────────────────────┐
                  │   MongoDB (Atlas)  │  │  OpenAI API /              │
                  │  Collections:       │  │  Hugging Face Inference API│
                  │   - users           │  │  (chat + "analyze" report) │
                  │   - appointments    │  └───────────────────────────┘
                  └───────────────────┘
```

## 3. Directory Structure

```
HealthLink/
├── server.js              # Single Express entry point — app setup, DB connection, all routes
├── models/
│   ├── User.js             # Mongoose schema: name, email, password (hashed), role, doctor fields
│   └── Appointment.js       # Mongoose schema: patient/doctor refs, symptoms, date, status
├── routes/
│   ├── authRoutes.js        # Standalone signup/login router (see note in §6)
│   └── dashboardRoutes.js   # Standalone patient/doctor dashboard router (see note in §6)
├── views/                   # EJS templates rendered server-side
│   ├── login.ejs, signup.ejs
│   ├── dashboard.ejs
│   ├── doctors.ejs, doctorProfile.ejs, doctorAppointments.ejs
│   ├── contactus.ejs, ourteam.ejs
├── public/                  # Static assets served directly by Express
│   ├── index.html            # Landing page (3D hero built with Three.js)
│   ├── healthlinkAI.html      # AI chat/report-analysis page
│   ├── css/                   # One stylesheet per page/feature
│   └── js/                    # Client-side scripts (index.js, dashboard.js, doctors.js, healthlinkAI.js)
└── package.json
```

## 4. Backend: `server.js`

Everything runs through a single Express app defined in `HealthLink/server.js`. On startup it:

1. Loads environment variables via `dotenv` (`MONGO_URL`, `JWT_SECRET`, `OPENAI_API_KEY`, `PORT`).
2. Registers global middleware: `express.json()`, `cookie-parser`, `cors`, `express.urlencoded`,
   `body-parser`, and `method-override`.
3. Sets `ejs` as the view engine and `views/` as the templates directory, and serves `public/` as
   static files.
4. Connects to MongoDB with Mongoose (`mongoose.connect(process.env.MONGO_URL, ...)`).
5. Defines two auth-related middleware functions used to guard routes:
   - `requireAuth` — reads the `token` cookie, verifies it with `jsonwebtoken`, loads the user via
     `User.findById`, and attaches it to `req.user`. Redirects to `/login` if missing/invalid.
   - `checkLoggedIn` — the inverse: if a valid token cookie is already present, redirects an
     already-authenticated user away from `/login` and `/signup` to `/dashboard`.
6. Declares every route directly in `server.js` (see §5 for the full list). There is no router
   module split for the routes actually in use — see §6 for the unused `routes/` files.

## 5. Routes & Data Flow

All routes below are defined inline in `server.js`.

| Route | Method | Auth | Purpose |
|---|---|---|---|
| `/` | GET | — | Serves the static landing page |
| `/signup` | GET/POST | `checkLoggedIn` (GET) | Renders signup form / creates a `User` doc with a bcrypt-hashed password |
| `/login` | GET/POST | `checkLoggedIn` (GET) | Renders login form / verifies credentials, issues a JWT in an HTTP-only cookie |
| `/logout` | GET | — | Clears the auth cookie |
| `/dashboard` | GET | `requireAuth` | Renders the dashboard; for patients, loads their `Appointment` docs |
| `/doctors` | GET | `requireAuth` | Lists all users with `role: "doctor"` |
| `/doctor/:id` | GET | `requireAuth` | Shows a single doctor's profile |
| `/appointment/:doctorId` | POST | `requireAuth` (patient only) | Creates an `Appointment` document linking patient and doctor |
| `/view-appointments` | GET | `requireAuth` (doctor only) | Lists appointments booked with the logged-in doctor |
| `/contactus`, `/contact` | GET/POST | — | Renders contact form / logs the message to the server console (no persistence, no email sending) |
| `/healthlinkAI` | GET | — | Serves `public/healthlinkAI.html` |
| `/analyze-health` | POST | — | Forwards a message to a Hugging Face inference endpoint and returns the generated text |
| `/chat` | POST | — | Forwards a message to the OpenAI Chat Completions API (`gpt-3.5-turbo`) and returns the reply |

### Typical request/data flow

**Signup → Login → Dashboard**
1. Browser posts the signup form to `/signup`.
2. Server hashes the password (`bcryptjs`) and saves a new `User` document via Mongoose to MongoDB.
3. On `/login`, the server verifies the password hash, signs a JWT (`user id` + `role`) and sets it
   as an HTTP-only `token` cookie.
4. Subsequent requests to protected routes (`/dashboard`, `/doctors`, etc.) pass through `requireAuth`,
   which verifies the cookie and loads the user from MongoDB before rendering the EJS view.

**Booking an appointment**
1. A logged-in patient submits the appointment form on a doctor's profile page.
2. `POST /appointment/:doctorId` creates an `Appointment` document referencing both the `patient`
   and `doctor` `User` ids.
3. The doctor sees it later via `GET /view-appointments`, which queries `Appointment.find({ doctor: req.user._id })`.

**AI Chatbot / Health Analysis**
1. `public/js/healthlinkAI.js` and `public/js/dashboard.js` call `fetch("/analyze-health")` and
   `POST /chat` respectively from the browser.
2. The server forwards the message to an external AI provider (OpenAI for `/chat`, a Hugging Face
   model endpoint for `/analyze-health`) and returns the generated text as JSON.
3. No user report/content is persisted to the database — these are stateless, request/response only.

## 6. Notes on the current code (for new contributors)

These are factual observations about the existing code, useful context if you're picking up a
related issue — no application code was changed as part of this documentation update:

- **`routes/authRoutes.js` and `routes/dashboardRoutes.js` are not wired into `server.js`.**
  `server.js` does not `require()` either file; all active auth/dashboard logic is duplicated
  directly inside `server.js`. The `routes/` versions also use a hardcoded JWT secret
  (`"your_secret_key"`) instead of `process.env.JWT_SECRET`, and reference `patientDashboard`/
  `doctorDashboard` EJS views that don't exist in `views/`. Treat `routes/` as currently dead code.
- **`GET /` references a missing file.** `server.js` calls
  `res.sendFile(path.join(__dirname, "views", "index.html"))`, but `views/` has no `index.html` —
  the actual landing page markup lives at `public/index.html`. Worth verifying which file is
  intended to be served when working on the landing page.
- **`/analyze-health` sends `OPENAI_API_KEY` as the bearer token to a Hugging Face endpoint**
  (`api-inference.huggingface.co`), not an OpenAI endpoint. This looks like it needs its own
  Hugging Face token rather than reusing the OpenAI key.
- **The contact form (`POST /contact`) does not persist or send messages** — it only logs the
  submission to the server console and returns a static confirmation string.

## 7. Environment Variables

The app expects a `.env` file (not committed) with at least:

- `MONGO_URL` — MongoDB connection string
- `JWT_SECRET` — secret used to sign/verify auth JWTs
- `OPENAI_API_KEY` — used for both the `/chat` (OpenAI) and `/analyze-health` (Hugging Face) calls
- `PORT` — optional, defaults to `5000`
