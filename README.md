# Padmanabh Portfolio

A full-stack developer portfolio with a hidden admin panel, blog/project CMS, newsletter system, and contact form with email notifications.

**Stack:** Next.js 16 + React 19 | Express + MongoDB | Tailwind CSS 4 | TipTap Editor | Cloudinary | Nodemailer

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
- [Cloudinary Image Uploads](#cloudinary-image-uploads)
- [Email Notifications](#email-notifications)
- [Authentication](#authentication)
- [Theming & Design](#theming--design)
- [Deployment](#deployment)

---

## Architecture

```
Frontend (Next.js 16)          Backend (Express)
├── app/(site)/ — public       ├── routes/auth
├── app/admin/  — admin CMS    ├── routes/projects
├── components/                ├── routes/blogs
├── lib/api.ts  — data layer   ├── routes/uploads (Cloudinary)
└── proxy.ts    — auth guard   ├── routes/contact
                               ├── routes/subscribe
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
- (Optional) Gmail account with App Password for email notifications

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
| `JWT_SECRET` | Must match the backend `JWT_SECRET` — used to verify auth tokens in middleware |

### Backend (`server/.env`)

| Variable | Required | Description |
|---|---|---|
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | 32+ character secret for signing JWTs |
| `ADMIN_EMAIL` | Yes | Admin login email |
| `ADMIN_PASSWORD` | Yes | Admin login password (8+ chars, hashed with bcrypt on seed) |
| `GMAIL_APP_PASSWORD` | No | Gmail App Password for sending emails (requires 2FA on Gmail) |
| `CLOUDINARY_CLOUD_NAME` | No | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | No | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | No | Cloudinary API secret |
| `RENDER_EXTERNAL_URL` | No | Render provides this automatically — enables keep-alive self-ping |
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

Displays stats at a glance:
- Total projects
- Published / draft blog posts
- Total subscribers
- Unread contact submissions

### Admin Routes

| Route | Purpose |
|---|---|
| `/admin` | Dashboard with stats |
| `/admin/projects` | List, create, edit, delete projects |
| `/admin/projects/new` | New project form |
| `/admin/projects/[id]` | Edit existing project |
| `/admin/blog` | List, create, edit, delete blog posts |
| `/admin/blog/new` | New blog post form |
| `/admin/blog/[id]` | Edit existing blog post |
| `/admin/submissions` | View contact messages & manage subscribers |

All `/admin/*` routes are protected by `proxy.ts` middleware that validates the JWT cookie and redirects to the login page if invalid.

---

## Blog System

### Features

- **TipTap rich-text editor** with toolbar: bold, italic, headings (H2/H3), bullet/ordered lists, blockquote, code block, links, inline images, undo/redo
- **Cover image** upload via Cloudinary
- **Auto-generated slug** from the title
- **Tags** for categorization
- **Read time** field
- **Draft / Published** status — drafts are only visible in the admin panel
- **HTML sanitization** on the server (sanitize-html) to prevent XSS
- **Rate limiting** — 100 public requests per 15 minutes

### How It Works

1. Create/edit a post in the admin panel using the TipTap editor
2. Upload images inline or set a cover image (goes to Cloudinary)
3. Set status to "published" to make it public
4. When a draft is published, all newsletter subscribers receive an email notification
5. Posts are cached with 60-second ISR revalidation on the frontend

### Public Routes

- `/blog` — lists the featured post + recent 6
- `/blog/[slug]` — full blog post

---

## Project System

### Features

- Same **TipTap editor** as the blog for rich content
- **Cover image** upload via Cloudinary
- **Category** field with autocomplete from existing categories
- **Featured** toggle — featured projects appear on the homepage (max 3)
- **Auto-generated slug** from the title
- **Tags** for categorization
- All projects are public (no draft status)

### How It Works

1. Create/edit a project in the admin panel
2. Set a category (new categories are created on the fly)
3. Toggle "featured" to show on the homepage
4. Subscribers are notified via email when a new project is created

### Public Routes

- `/projects` — grid of all projects
- `/projects/[slug]` — project detail page

---

## Contact Form & Submissions

### Public Contact Page (`/contact`)

- Fields: name, email, subject (dropdown), message (5000 char max)
- Displays a live availability status (available 7-10pm IST, sleeping 10pm-7am, busy otherwise)
- Shows social links (GitHub, LinkedIn, Blog, Email)
- Rate-limited to 5 submissions per IP per hour

### Admin Submissions View (`/admin/submissions`)

- Lists all contact messages
- Mark messages as handled/unhandled
- Delete messages
- View and manage newsletter subscribers

---

## Newsletter / Subscribers

### How Users Subscribe

- A subscribe form appears in the site footer on every page
- Users enter their email and click subscribe
- Rate-limited to 10 subscriptions per IP per hour
- Max 49 subscribers (configurable in code via `MAX_SUBSCRIBERS`)

### How Users Unsubscribe

- Every notification email contains a personalized unsubscribe link
- Links are signed with HMAC-SHA256 (using `JWT_SECRET`) to prevent abuse
- Route: `/unsubscribe?email=...&token=...`

### When Notifications Are Sent

- A blog post changes from draft to published
- A new project is created

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

### Setup

1. Create a free Cloudinary account
2. Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` in `server/.env`
3. Add `res.cloudinary.com` to Next.js image domains (already configured in `next.config.ts`)

---

## Email Notifications

Uses **Nodemailer** with Gmail SMTP to send emails.

### What Gets Sent

- **New blog published** — all subscribers receive a notification with the post title, excerpt, and link
- **New project created** — all subscribers receive a notification
- Each email includes a personalized unsubscribe link

### Gmail Setup

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password: Google Account > Security > App Passwords
3. Set `GMAIL_APP_PASSWORD` in `server/.env`
4. The sender address is hardcoded as `updates.padmanabh@gmail.com` in the server code — change it in `server/src/routes/subscribe.ts` if forking

---

## Authentication

### Flow

1. User submits email + password to `POST /api/auth/login`
2. Server verifies against bcrypt-hashed password in MongoDB
3. Server issues a JWT (7-day expiry) as an httpOnly cookie (`pk_auth`)
4. Next.js middleware (`proxy.ts`) validates the JWT on every `/admin/*` request
5. Invalid/expired tokens redirect to `/padmanabh-login`

### Security

- Passwords hashed with bcryptjs (12 salt rounds)
- Cookies: httpOnly, secure (in production), sameSite: lax
- Login rate-limited to 10 attempts per 15 minutes
- Helmet for security headers
- CORS restricted to allowed origins

### Creating the Admin User

```bash
cd server
npm run seed:admin
```

This reads `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `server/.env` and upserts the user in MongoDB.

---

## Theming & Design

- **Font:** JetBrains Mono (monospace throughout for a terminal/developer aesthetic)
- **Color palette:** Green-tinted light theme with CSS custom properties (`--color-primary: #006C53`)
- **Animations:** Framer Motion for page transitions, typing animation, flickering grid background, marquee text, blinking cursor
- **Grayscale images:** Project/blog images use a grayscale CSS filter for visual consistency
- **Responsive:** Mobile-first Tailwind classes, grid layouts adapt from 1 to 3+ columns
- **Tailwind CSS 4** with `@theme` directive for custom tokens

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

The server includes a self-ping mechanism. Render automatically provides `RENDER_EXTERNAL_URL` as an environment variable — the server uses it to ping `/api/health` every 14 minutes, preventing the free-tier instance from spinning down.

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Set `COOKIE_DOMAIN` to your actual domain (e.g., `.yourdomain.com`)
- [ ] Set `CORS_ORIGIN` to your frontend URL
- [ ] Use a strong 32+ character `JWT_SECRET` (same in both frontend and backend)
- [ ] Run `npm run seed:admin` to create the admin user
- [ ] (Optional) Configure Cloudinary and Gmail credentials

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | No | Health check (used by keep-alive) |
| `POST` | `/api/auth/login` | No | Admin login |
| `POST` | `/api/auth/logout` | No | Admin logout |
| `GET` | `/api/auth/me` | Yes | Get current user |
| `GET` | `/api/projects` | No | List projects |
| `GET` | `/api/projects/categories` | No | List project categories |
| `GET` | `/api/projects/:idOrSlug` | No | Get project by ID or slug |
| `POST` | `/api/projects` | Yes | Create project |
| `PUT` | `/api/projects/:id` | Yes | Update project |
| `DELETE` | `/api/projects/:id` | Yes | Delete project |
| `GET` | `/api/blogs` | No | List published blogs (`?all=1` for drafts, requires auth) |
| `GET` | `/api/blogs/:idOrSlug` | No | Get blog by ID or slug |
| `POST` | `/api/blogs` | Yes | Create blog |
| `PUT` | `/api/blogs/:id` | Yes | Update blog |
| `DELETE` | `/api/blogs/:id` | Yes | Delete blog |
| `POST` | `/api/contact` | No | Submit contact form |
| `GET` | `/api/contact` | Yes | List submissions |
| `PATCH` | `/api/contact/:id` | Yes | Toggle handled status |
| `DELETE` | `/api/contact/:id` | Yes | Delete submission |
| `POST` | `/api/subscribe` | No | Subscribe to newsletter |
| `GET` | `/api/subscribe` | Yes | List subscribers |
| `DELETE` | `/api/subscribe/:id` | Yes | Delete subscriber |
| `GET` | `/api/uploads/signature` | Yes | Get Cloudinary upload signature |
