# Padmanabh Portfolio

A full-stack developer portfolio with a hidden admin panel, blog/project CMS, newsletter system, contact form with email reply, activity calendar, and daily digest with security monitoring.

**Stack:** Next.js 16 + React 19 | Express + MongoDB | Tailwind CSS 4 | TipTap Editor | Cloudinary | Resend | node-cron

---

## Table of Contents

- [Architecture](#architecture)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Admin Panel](#admin-panel)
- [Blog System](#blog-system)
- [Project System](#project-system)
- [Contact Form & Submissions](#contact-form--submissions)
- [Newsletter / Subscribers](#newsletter--subscribers)
- [Email Notifications](#email-notifications)
- [Daily Digest](#daily-digest)
- [Security Monitoring](#security-monitoring)
- [Activity Calendar](#activity-calendar)
- [Cloudinary Image Uploads](#cloudinary-image-uploads)
- [Authentication](#authentication)
- [Theming & Design](#theming--design)
- [Deployment](#deployment)
- [API Endpoints](#api-endpoints)

---

## Architecture

```
Frontend (Next.js 16)          Backend (Express)
├── app/(site)/ - public       ├── routes/auth
├── app/admin/  - admin CMS    ├── routes/projects
├── components/                ├── routes/blogs
├── lib/api.ts  - data layer   ├── routes/uploads (Cloudinary)
└── proxy.ts    - auth guard   ├── routes/contact
                               ├── routes/subscribe
                               ├── lib/email.ts
                               ├── lib/digest.ts
                               └── middleware/error
```

- Next.js rewrites `/api/*` to the Express backend (configured in `next.config.ts`)
- Server Components call the backend directly via `INTERNAL_API_URL` to skip the proxy hop
- Auth uses JWT stored in an httpOnly cookie (`pk_auth`)

---

## Setup

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- (Optional) Cloudinary account for image uploads
- (Optional) Gmail account with App Password for email features

### Install & Run

```bash
# 1. Install dependencies
npm install
cd server && npm install && cd ..

# 2. Configure environment
cp .env.example .env                    # frontend
cp server/.env.example server/.env      # backend
# Edit both .env files with your values

# 3. Create admin user
cd server && npm run seed:admin && cd ..

# 4. Start dev servers (two terminals)
npm run dev                             # frontend → http://localhost:3000
cd server && npm run dev                # backend  → http://localhost:4000
```

---

## Environment Variables

### Frontend (`.env`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend URL for client-side requests (default: `http://localhost:4000`) |
| `INTERNAL_API_URL` | Backend URL for Server Components (bypasses Next.js rewrite, faster) |
| `JWT_SECRET` | Must match the backend `JWT_SECRET` - used to verify auth tokens in middleware |
| `GITHUB_USERNAME` | GitHub username for activity calendar |
| `GITHUB_TOKEN` | GitHub personal access token (for contribution data) |
| `GITLAB_USERNAME` | GitLab username for activity calendar |
| `LEETCODE_USERNAME` | LeetCode username for activity calendar |
| `CODEFORCES_HANDLE` | Codeforces handle for activity calendar |
| `CODECHEF_USERNAME` | CodeChef username for activity calendar |
| `GFG_USERNAME` | GeeksForGeeks username for activity calendar |

### Backend (`server/.env`)

| Variable | Required | Description |
|---|---|---|
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | 32+ character secret for signing JWTs |
| `ADMIN_EMAIL` | Yes | Admin login email - daily digest is sent here |
| `ADMIN_PASSWORD` | Yes | Admin login password (8+ chars, hashed with bcrypt on seed) |
| `RESEND_API_KEY` | No | Resend API key for sending emails (get one at resend.com) |
| `CLOUDINARY_CLOUD_NAME` | No | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | No | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | No | Cloudinary API secret |
| `RENDER_EXTERNAL_URL` | No | Render provides this automatically - enables keep-alive self-ping |
| `CORS_ORIGIN` | No | Allowed origins, comma-separated (default: `http://localhost:3000`) |
| `COOKIE_DOMAIN` | No | Cookie domain (default: `localhost`, use `.yourdomain.com` in prod) |
| `NODE_ENV` | No | `development` / `production` (default: `development`) |
| `PORT` | No | Server port (default: `4000`) |

---

## Admin Panel

The admin panel is a hidden CMS accessible at `/padmanabh-login`. There is no link to it on the public site.

### Login

1. Navigate to `/padmanabh-login`
2. Enter the `ADMIN_EMAIL` and `ADMIN_PASSWORD` from your server `.env`
3. Login is rate-limited to 10 attempts per 15 minutes

### Dashboard (`/admin`)

Displays at a glance:
- Total projects, published/draft blog posts, total subscribers, unread contact submissions
- Recent unread contact messages
- Suspicious login attempts (if any) - with IP, email tried, user agent, and an Ignore button
- Latest projects and blog posts

### Admin Routes

| Route | Purpose |
|---|---|
| `/admin` | Dashboard with stats and security alerts |
| `/admin/projects` | List, create, edit, delete projects |
| `/admin/projects/new` | New project form |
| `/admin/projects/[id]` | Edit existing project |
| `/admin/blog` | List, create, edit, delete blog posts |
| `/admin/blog/new` | New blog post form |
| `/admin/blog/[id]` | Edit existing blog post |
| `/admin/submissions` | View contact messages, reply, and manage subscribers |

All `/admin/*` routes are protected by `proxy.ts` middleware that validates the JWT cookie and redirects to login if invalid.

---

## Blog System

### Features

- **TipTap rich-text editor** with toolbar: bold, italic, headings (H2/H3), bullet/ordered lists, blockquote, code block, links, inline images, undo/redo
- **Cover image** upload via Cloudinary
- **Auto-generated slug** from the title
- **Tags** for categorization
- **Read time** field
- **Draft / Published** status - drafts are only visible in the admin panel
- **HTML sanitization** on the server (sanitize-html) to prevent XSS

### Public Routes

- `/blog` - lists the featured post + recent 6
- `/blog/[slug]` - full blog post

---

## Project System

### Features

- Same **TipTap editor** as the blog for rich content
- **Cover image** upload via Cloudinary
- **Category** field with autocomplete from existing categories
- **Featured** toggle - featured projects appear on the homepage (max 3)
- **Auto-generated slug** from the title
- **Tags** for categorization

### Public Routes

- `/projects` - grid of all projects
- `/projects/[slug]` - project detail page

---

## Contact Form & Submissions

### Public Contact Page (`/contact`)

- Fields: name, email, subject (dropdown), message (5000 char max)
- Displays a live availability status (available 7–10pm IST, sleeping 10pm–7am, busy otherwise)
- Rate-limited to 3 submissions per IP per day
- Sender's IP address is recorded with each submission

### Admin Submissions View (`/admin/submissions`)

- Lists all contact messages with sender IP, timestamp, and full message
- **Reply** - opens a compose modal with a pre-filled branded email template (fixed greeting + editable body + fixed sign-off); sending auto-marks the message as handled
- **Mark Handled / Unhandled** toggle
- **Delete** message
- View and manage newsletter subscribers

### Email Reply Template

Replies are sent from `updates.padmanabh@gmail.com` with:
- The sender's original message quoted
- Your reply body
- Branded signature with site link, GitHub, and LinkedIn
- Plain-text fallback and proper `Re:` threading headers to reduce spam likelihood

---

## Newsletter / Subscribers

### How Users Subscribe

- A subscribe form appears in the site footer
- Rate-limited to 2 subscriptions per IP per day
- Max 49 subscribers (configurable via `MAX_SUBSCRIBERS` in `server/src/lib/email.ts`)

### How Users Unsubscribe

- Every notification email contains a personalized unsubscribe link
- Links are signed with HMAC-SHA256 (using `JWT_SECRET`) to prevent abuse
- Route: `/unsubscribe?email=...&token=...`

### When Notifications Are Sent

- A blog post changes from draft → published
- A new project is created

---

## Email Notifications

Uses **Resend** (HTTPS-based, works on Render free tier). All emails share a branded template - green dot-grid background, monospace font, and a consistent signature block.

### Emails Sent

| Trigger | Recipients | Content |
|---|---|---|
| Blog published | All subscribers | Title, excerpt, Read More button |
| Project created | All subscribers | Title, description, Read More button |
| Admin replies to contact | The contact's email | Quoted original message + reply body |
| Daily digest (11 PM IST) | `ADMIN_EMAIL` | New subscribers, unhandled messages, suspicious logins |

### Resend Setup

1. Sign up at [resend.com](https://resend.com) (free tier: 3,000 emails/month)
2. Add and verify your domain
3. Create an API key
4. Set `RESEND_API_KEY=re_xxxxxx` in `server/.env`
5. Update the `FROM` constant in `server/src/lib/email.ts` to match your verified domain

---

## Daily Digest

Every day at **11:00 PM IST** the server sends a summary email to `ADMIN_EMAIL`. The email is skipped entirely if there is nothing to report.

### What's Included

- **Suspicious login attempts** - any flagged attempts from that day (IP, email tried, user agent)
- **New subscribers** - emails that subscribed today
- **Unhandled contact messages** - all messages not yet marked as handled

The subject line summarises the counts, e.g.: `Daily Digest - ⚠ 2 suspicious, 3 subscribers, 1 unhandled`

---

## Security Monitoring

### Suspicious Login Detection

Failed login attempts are logged to the `LoginAttempt` collection. If the same IP fails **twice within 24 hours**, all attempts from that IP are flagged as suspicious.

Each record stores:
- IP address
- Email that was attempted
- User agent string
- Timestamp

### Admin Dashboard Alerts

Flagged attempts appear on the admin dashboard in a red-highlighted section. Each entry has an **Ignore** button - this dismisses it from the dashboard view while keeping the record in the database for audit purposes.

### Suspicious attempts are also included in the nightly digest email.

---

## Activity Calendar

A GitHub-style contribution heatmap on the public site, aggregating activity across multiple coding platforms.

### Supported Platforms

| Platform | Env Variable |
|---|---|
| GitHub | `GITHUB_USERNAME` + `GITHUB_TOKEN` |
| GitLab | `GITLAB_USERNAME` |
| LeetCode | `LEETCODE_USERNAME` |
| Codeforces | `CODEFORCES_HANDLE` |
| CodeChef | `CODECHEF_USERNAME` |
| GeeksForGeeks | `GFG_USERNAME` |

Configure only the platforms you use - unset variables are silently skipped. The calendar shows the last 52 weeks with per-day breakdowns visible on hover/tap.

---

## Cloudinary Image Uploads

Cloudinary is used for all image hosting (blog covers, project covers, inline editor images).

### How It Works

1. The admin panel requests a signed upload token from `GET /api/uploads/signature`
2. The frontend uploads the image directly to Cloudinary using the signed params
3. The returned Cloudinary URL is stored in the blog/project document

### Cloudinary Folders

| Folder | Usage |
|---|---|
| `portfolio/blog` | Blog cover images |
| `portfolio/projects` | Project cover images |
| `portfolio/inline` | Inline TipTap editor images |

---

## Authentication

### Flow

1. User submits email + password to `POST /api/auth/login`
2. Server verifies against bcrypt-hashed password in MongoDB
3. On success: JWT (7-day expiry) issued as an httpOnly cookie (`pk_auth`)
4. On failure: attempt is logged; 2+ failures from the same IP within 24h → flagged as suspicious
5. Next.js middleware (`proxy.ts`) validates the JWT on every `/admin/*` request

### Security

- Passwords hashed with bcryptjs (12 salt rounds)
- Cookies: httpOnly, secure (in production), sameSite: lax
- Login rate-limited to 10 attempts per 15 minutes
- Failed login attempts logged and monitored
- Helmet for security headers
- CORS restricted to allowed origins

### Creating the Admin User

```bash
cd server
npm run seed:admin
```

---

## Theming & Design

- **Font:** JetBrains Mono (monospace throughout for a terminal/developer aesthetic)
- **Color palette:** Green-tinted light theme with CSS custom properties (`--color-primary: #006C53`)
- **Animations:** Framer Motion for page transitions, typing animation, flickering grid background, marquee text, blinking cursor
- **Grayscale images:** Project/blog images use a grayscale CSS filter for visual consistency
- **Responsive:** Mobile-first Tailwind classes, grid layouts adapt from 1 to 3+ columns
- **Tailwind CSS 4** with `@theme` directive for custom tokens
- All dates and times displayed in **IST (Asia/Kolkata)**

---

## Deployment

### Frontend (Vercel / any Node.js host)

```bash
npm run build
npm start
```

Set `INTERNAL_API_URL` to your backend's URL.

### Backend (Render / any Node.js host)

```bash
cd server
npm run build
npm start
```

### Render Free Tier Keep-Alive

The server self-pings `/api/health` every 14 minutes when `RENDER_EXTERNAL_URL` is set, preventing the free-tier instance from spinning down.

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Set `COOKIE_DOMAIN` to your actual domain (e.g. `.yourdomain.com`)
- [ ] Set `CORS_ORIGIN` to your frontend URL
- [ ] Use a strong 32+ character `JWT_SECRET` (same in both `.env` files)
- [ ] Run `npm run seed:admin` to create the admin user
- [ ] Configure `RESEND_API_KEY` for email features
- [ ] (Optional) Configure Cloudinary credentials for image uploads
- [ ] (Optional) Configure coding platform usernames for the activity calendar

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | No | Health check |
| `POST` | `/api/auth/login` | No | Admin login |
| `POST` | `/api/auth/logout` | No | Admin logout |
| `GET` | `/api/auth/me` | Yes | Get current user |
| `GET` | `/api/auth/suspicious` | Yes | List suspicious login attempts |
| `PATCH` | `/api/auth/suspicious/:id/dismiss` | Yes | Dismiss a suspicious attempt |
| `GET` | `/api/projects` | No | List projects |
| `GET` | `/api/projects/categories` | No | List project categories |
| `GET` | `/api/projects/:idOrSlug` | No | Get project |
| `POST` | `/api/projects` | Yes | Create project |
| `PUT` | `/api/projects/:id` | Yes | Update project |
| `DELETE` | `/api/projects/:id` | Yes | Delete project |
| `GET` | `/api/blogs` | No | List published blogs (`?all=1` for all, requires auth) |
| `GET` | `/api/blogs/:idOrSlug` | No | Get blog post |
| `POST` | `/api/blogs` | Yes | Create blog post |
| `PUT` | `/api/blogs/:id` | Yes | Update blog post |
| `DELETE` | `/api/blogs/:id` | Yes | Delete blog post |
| `POST` | `/api/contact` | No | Submit contact form |
| `GET` | `/api/contact` | Yes | List contact submissions |
| `PATCH` | `/api/contact/:id` | Yes | Toggle handled status |
| `POST` | `/api/contact/:id/reply` | Yes | Send email reply to submission |
| `DELETE` | `/api/contact/:id` | Yes | Delete submission |
| `POST` | `/api/subscribe` | No | Subscribe to newsletter |
| `GET` | `/api/subscribe` | Yes | List subscribers |
| `DELETE` | `/api/subscribe/:id` | Yes | Delete subscriber |
| `GET` | `/api/uploads/signature` | Yes | Get Cloudinary upload signature |
| `GET` | `/api/activity` | No | Get aggregated coding activity (last 52 weeks) |
| `GET` | `/api/activity/:date` | No | Get per-platform breakdown for a specific date |
