<div align="center">

# 🌍 LocalLens

### *Discover Cities Through the Eyes of People Who Actually Live There*

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-locallens--web1.onrender.com-22c55e?style=for-the-badge)](https://locallens-web1.onrender.com)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?style=flat-square&logo=postgresql)](https://neon.tech)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-010101?style=flat-square&logo=socket.io)](https://socket.io)
[![Deployed on Render](https://img.shields.io/badge/Deployed_on-Render-46E3B7?style=flat-square&logo=render)](https://render.com)

</div>

---

## 📖 What is LocalLens?

**LocalLens** is a peer-to-peer local guide marketplace that connects travelers with verified locals who know their city deeply — the hidden street food stalls, secret rooftops, authentic cultural spots, and off-the-map experiences that no travel blog ever covers.

Travelers get genuine, personalised city experiences. Locals get a platform to monetise their knowledge and earn from what they already love about their city.

> Think Airbnb Experiences — but peer-to-peer, India-first, with live tracking, video reels, and group tours.

---

## 🔗 Live Deployment

| Service | URL |
|---------|-----|
| **Frontend** | [https://locallens-web1.onrender.com](https://locallens-web1.onrender.com) |
| **API Health Check** | [https://locallens-web1.onrender.com/health](https://locallens-web1.onrender.com/health) |
| **API Base URL** | `https://locallens-web1.onrender.com/api` |

> ⚠️ Hosted on Render's free tier — the server may take **30–60 seconds** to wake from sleep on first visit.

---

## ✨ Key Features

### For Travelers
| Feature | Description |
|---------|-------------|
| 🗺️ **Live Guide Map** | Browse available guides pinned on an interactive Leaflet map filtered by city |
| 🎬 **Guide Reels** | Scroll through short videos guides post showing hidden spots, food, and experiences |
| 📅 **Instant Booking** | Book a guide for 1 hour, half-day, or full day with a few taps |
| 👥 **Group Tours** | Join public tour slots — split costs with other solo travelers |
| 📍 **Live Tracking** | See your guide's real-time location on map during the tour (like Uber/Rapido) |
| 💬 **In-App Chat** | Direct messages + booking-specific chat with real-time delivery |
| 🆘 **SOS Button** | Emergency alert with GPS coordinates, available throughout the tour |
| 📸 **Photography Sessions** | Book guides who are also photographers for professional shots at hidden locations |

### For Guides
| Feature | Description |
|---------|-------------|
| 🧑‍💼 **Guide Dashboard** | Manage bookings, track earnings, set availability |
| 💰 **Wallet** | Earnings auto-credited on tour completion, withdraw anytime |
| 🎥 **Reel Uploads** | Post short videos of spots you cover to attract travelers |
| 💎 **Hidden Gems** | List secret locations (locked until traveler books you) |
| ⭐ **Verified Reviews** | Reviews only from completed bookings — builds trust organically |
| 📊 **Earnings Analytics** | Daily, weekly, monthly earnings breakdown on the dashboard |

---

## 🎨 UI & Design

LocalLens is built with a **mobile-first, dark-themed design system** using Tailwind CSS. Every screen is crafted to feel like a native app — smooth transitions, real-time feedback, and zero page reloads.

### 🖼️ Screen Breakdown

#### 🔐 Auth Screens
- **Login & Register** — Clean full-screen forms with green accent branding, inline validation, and a single-tap "Become a Guide" toggle on register
- **Forgot / Reset Password** — Minimal single-field flows with success state illustrations

#### 🏠 Traveler Dashboard (`/dashboard`)
- **City search bar** at the top with instant filtering
- **Featured guide cards** with avatar, city, rating stars, expertise tags, and an instant Book button
- **Horizontal scroll sections** — Top Rated Guides, New in Your City, Popular Group Tours
- **Upcoming booking banner** shows the next confirmed tour at a glance

#### 🔍 Explore Page (`/explore`)
- **Search + multi-filter bar** — filter by city, expertise tags, price range, availability, and photography capability
- **Guide cards in a responsive grid** — each card shows avatar, name, city, rating, hourly rate, expertise chips, and a quick-book CTA
- **Empty state illustration** when no guides match the filters

#### 🗺️ Map Page (`/map`)
- **Full-screen Leaflet map** with custom green pin markers for every available guide
- **Slide-up guide card** on pin tap — shows photo, name, rating, and a Book Now button without leaving the map
- **City search overlay** to jump the map to any Indian city instantly
- **Live location pulse** animation on the active guide pin during a tour

#### 🎬 Reels Page (`/reels`)
- **Full-screen vertical video feed** — swipe up/down between reels, exactly like Instagram Reels
- **Overlay UI** — guide name + city tag bottom-left, like/comment buttons on the right
- **Inline like and comment** without navigating away
- **"Book this Guide" CTA button** embedded in the reel overlay for direct conversion

#### 👥 Group Tours Page (`/group-tours`)
- **Tour cards** with cover image, title, city, date/time, price-per-person, and member avatars showing who's already joined
- **Seat progress bar** — visual indicator of spots remaining (e.g. 3/6 joined)
- **One-tap join** with instant confirmation toast

#### 👤 Guide Profile Page (`/guides/:id`)
- **Full hero header** — large cover photo, avatar, name, city, verified badge, rating, review count
- **Tab navigation** — About · Reels · Hidden Gems · Reviews
- **Hidden Gems tab** shows blurred/locked gem cards with a "Book to Unlock" prompt
- **Reels tab** plays guide's videos in a mini grid that expands full-screen on tap
- **Review cards** with star rating, traveler avatar, date, and guide response if any
- **Sticky "Book Now" bar** at the bottom with duration selector (1hr / Half Day / Full Day)

#### 📅 Booking Page (`/book/:guideId`)
- **Step-by-step booking flow** — Date → Duration → Meetup location → Special requests → Confirm
- **Interactive date picker** highlighting the guide's available slots
- **Map pin picker** for meetup location — traveler drops a pin on the map
- **Price breakdown card** showing base rate, duration, and total before confirming

#### 💬 Messages Page (`/messages`)
- **Conversation list** — avatar, name, last message preview, timestamp, unread badge
- **Chat window** — WhatsApp-style bubbles, sent/delivered/read ticks, typing indicator
- **Real-time delivery** via Socket.IO — no refresh needed

#### 🔔 Notifications Page (`/notifications`)
- **Grouped notifications** — Today · Yesterday · Earlier
- **Colour-coded icons** per type — booking (green), message (blue), review (yellow), system (grey)
- **Mark all read** button clears the nav badge instantly

#### 🧑‍💼 Guide Dashboard (`/guide-dashboard`)
- **Stats row** — Today's Earnings · This Week · Total Bookings · Average Rating
- **Booking management table** — filter by Pending / Confirmed / Active / Completed with one-tap Confirm, Start, Complete actions inline
- **Availability toggle** — flip online/offline from the dashboard header
- **Earnings chart** — weekly bar chart showing daily income at a glance
- **Reel manager** — upload new reels, view counts, delete old ones
- **Hidden Gems manager** — add/edit/remove gems with lock toggle per gem

#### 👤 Profile & Settings
- **Profile Page** — editable avatar, name, bio, phone; guide sub-profile section if applicable
- **Settings Page** — notification preferences and account management

### 🎨 Design System

| Token | Value |
|-------|-------|
| Primary accent | `#22c55e` (green-500) |
| Background | `#0f172a` (slate-900) |
| Card surface | `#1e293b` (slate-800) |
| Border | `#334155` (slate-700) |
| Danger / SOS | `#ef4444` (red-500) |
| Border radius | `rounded-xl` on cards, `rounded-full` on avatars and tags |
| Shadows | `shadow-lg` + green glow on active/focused elements |

### ⚡ UX Details
- **Toast notifications** — bottom-center slide-up toasts for every action (success / error / info)
- **Skeleton loaders** on every list and card while data fetches
- **Optimistic UI** — likes and read receipts update instantly without waiting for the server
- **Responsive layout** — sidebar nav on desktop collapses to a bottom tab bar on mobile
- **Protected routes** redirect to `/login` with the intended path saved for post-login redirect
- **Role-based nav** — guide-only items (Dashboard, Earnings) only appear if `user.role` is `GUIDE` or `BOTH`

---

## 🏗️ Project Structure

```
LocalLens/
├── backend/                  # Node.js + Express REST API
│   ├── src/
│   │   ├── index.js          # Server entry point, middleware, Socket.IO setup
│   │   ├── db.js             # PostgreSQL / JSON fallback data layer
│   │   ├── seed.js           # Demo data seeder
│   │   ├── middleware/
│   │   │   └── error.middleware.js   # Auth guard (protect), error handler
│   │   ├── routes/
│   │   │   ├── auth.routes.js        # Register, login, JWT refresh, password reset
│   │   │   ├── user.routes.js        # User profile CRUD
│   │   │   ├── guide.routes.js       # Guide profiles, dashboard stats, availability
│   │   │   ├── booking.routes.js     # Create/manage bookings, tour lifecycle
│   │   │   ├── reel.routes.js        # Upload, fetch, like, comment on reels
│   │   │   ├── map.routes.js         # Guide pins and location data for map
│   │   │   ├── groupTour.routes.js   # Group tour creation and joining
│   │   │   ├── chat.routes.js        # Message history fetch (REST)
│   │   │   ├── review.routes.js      # Post and fetch verified reviews
│   │   │   ├── notification.routes.js # Push notifications CRUD
│   │   │   ├── sos.routes.js         # SOS alert creation and resolution
│   │   │   ├── friends.routes.js     # Follow/friend system
│   │   │   ├── upload.routes.js      # Cloudinary media upload handler
│   │   │   └── all.routes.js         # Aggregated admin/debug routes
│   │   └── services/
│   │       └── socket.service.js     # Socket.IO: DMs, booking chat, live location
│   ├── prisma/
│   │   └── schema.prisma     # Full DB schema (15 models)
│   └── package.json
│
├── frontend/                 # React 18 + Vite SPA
│   ├── src/
│   │   ├── App.jsx           # All routes (public + protected + guide-only)
│   │   ├── main.jsx          # React root with context providers
│   │   ├── context/
│   │   │   ├── AuthContext.jsx       # JWT auth state, login/logout helpers
│   │   │   ├── SocketContext.jsx     # Socket.IO client, real-time events
│   │   │   └── ToastContext.jsx      # Global toast notification system
│   │   ├── lib/
│   │   │   ├── api.js                # Axios instance with auth headers
│   │   │   └── locationImages.js     # City-to-image mapping utility
│   │   ├── components/
│   │   │   └── shared/Layout.jsx     # App shell with nav, sidebar
│   │   └── pages/
│   │       ├── LoginPage.jsx
│   │       ├── RegisterPage.jsx
│   │       ├── ForgotPasswordPage.jsx
│   │       ├── ResetPasswordPage.jsx
│   │       ├── ReelsPage.jsx         # Instagram-style vertical reel feed
│   │       ├── MapPage.jsx           # Leaflet map with live guide pins
│   │       ├── MessagesPage.jsx      # DM inbox + real-time chat
│   │       ├── NotificationsPage.jsx
│   │       ├── FriendsPage.jsx       # Follow/social graph
│   │       ├── ProfilePage.jsx       # Own profile editor
│   │       ├── UserProfilePage.jsx   # Public user profile view
│   │       ├── GuideProfilePage.jsx  # Full guide profile + reviews + reels
│   │       ├── GuideRegisterPage.jsx # Become a guide onboarding flow
│   │       ├── SettingsPage.jsx
│   │       ├── guide/
│   │       │   └── GuideDashboard.jsx   # Bookings, earnings, availability, reels
│   │       └── traveler/
│   │           ├── TravelerDashboard.jsx # Home feed with recommended guides
│   │           ├── ExplorePage.jsx       # Search & filter guides by city/tags
│   │           ├── GroupToursPage.jsx    # Browse & join group tours
│   │           └── BookingPage.jsx       # Tour booking flow
│   └── package.json
│
├── render.yaml               # Render.com Blueprint deployment config
├── Dockerfile                # Docker build for VPS/Railway/Fly.io
└── start.sh                  # Local dev startup script
```

---

## 🔌 API Reference

All endpoints are prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`.

### Authentication — `/api/auth`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | ❌ | Register new user (TRAVELER or GUIDE role), auto-creates traveler profile |
| POST | `/login` | ❌ | Login with email + password, returns `accessToken` + `refreshToken` |
| POST | `/refresh` | ❌ | Exchange refresh token for new access token |
| POST | `/forgot-password` | ❌ | Sends password reset email (SMTP optional) |
| POST | `/reset-password` | ❌ | Validate JWT reset token and update password |

### Users — `/api/users`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/me` | ✅ | Get own full profile (with guide/traveler sub-profiles) |
| PATCH | `/me` | ✅ | Update own profile (name, avatar, phone, etc.) |
| GET | `/:id` | ✅ | Get any user's public profile |

### Guides — `/api/guides`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ❌ | List all guides (filter by `city`, `tags`, `page`, `limit`) |
| GET | `/dashboard/stats` | ✅ Guide | Earnings summary (today/week/month/total), booking counts, wallet balance |
| GET | `/:id` | ❌ | Guide profile with reviews, reels, hidden gems, completed bookings |
| POST | `/` | ✅ | Create guide profile (become a guide) |
| PATCH | `/:id` | ✅ Guide | Update guide profile (bio, rates, availability, location) |
| PATCH | `/:id/availability` | ✅ Guide | Toggle available/unavailable status |

### Bookings — `/api/bookings`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | ✅ | Create new booking |
| GET | `/` | ✅ | List own bookings (as traveler or guide) |
| GET | `/:id` | ✅ | Get booking detail |
| PATCH | `/:id/confirm` | ✅ Guide | Guide confirms a pending booking |
| PATCH | `/:id/start` | ✅ Guide | Guide starts the tour (sets `guideStartedAt`) |
| PATCH | `/:id/complete` | ✅ Guide | Mark tour complete (credits guide wallet) |
| PATCH | `/:id/cancel` | ✅ | Cancel booking |

### Reels — `/api/reels`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ❌ | Paginated reel feed (filter by `city`, `type`) |
| POST | `/` | ✅ | Upload new reel (video URL from Cloudinary) |
| GET | `/:id` | ❌ | Single reel detail |
| DELETE | `/:id` | ✅ | Delete own reel |
| POST | `/:id/like` | ✅ | Toggle like on a reel |
| POST | `/:id/comment` | ✅ | Add comment |
| GET | `/:id/comments` | ❌ | Get reel comments |

### Map — `/api/map`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/guides` | ❌ | All active guides with `latitude`, `longitude` for map pins |
| PATCH | `/location` | ✅ Guide | Update guide's GPS coordinates |

### Group Tours — `/api/group-tours`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ❌ | List active group tours (filter by `city`) |
| POST | `/` | ✅ Guide | Create a group tour slot |
| GET | `/:id` | ❌ | Group tour detail + member list |
| POST | `/:id/join` | ✅ | Traveler joins a group tour |
| PATCH | `/:id` | ✅ Guide | Update group tour details |

### Chat — `/api/chat`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/conversations` | ✅ | List all DM conversations with unread counts |
| GET | `/messages/:userId` | ✅ | Fetch message history with a specific user |

### Reviews — `/api/reviews`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | ✅ | Submit review for a completed booking |
| GET | `/guide/:guideId` | ❌ | All reviews for a guide |

### Notifications — `/api/notifications`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ✅ | Fetch own notifications |
| PATCH | `/:id/read` | ✅ | Mark notification as read |
| PATCH | `/read-all` | ✅ | Mark all notifications as read |

### SOS — `/api/sos`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | ✅ | Trigger SOS alert with GPS coordinates |
| GET | `/` | ✅ | Get own SOS alert history |

### Friends — `/api/friends`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/follow/:userId` | ✅ | Follow a user |
| DELETE | `/unfollow/:userId` | ✅ | Unfollow a user |
| GET | `/:userId/followers` | ✅ | Get followers list |
| GET | `/:userId/following` | ✅ | Get following list |

### Upload — `/api/upload`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | ✅ | Upload image/video to Cloudinary, returns URL |

---

## ⚡ Real-Time Events (Socket.IO)

Connect with a valid JWT: `socket.auth = { token: accessToken }`.

### Emitting (client → server)
| Event | Payload | Description |
|-------|---------|-------------|
| `send_direct_message` | `{ receiverId, content }` | Send a DM |
| `mark_read` | `{ contactId }` | Mark messages from contactId as read |
| `typing` | `{ receiverId }` | Notify recipient you're typing |
| `stop_typing` | `{ receiverId }` | Cancel typing indicator |
| `chat:join` | `{ bookingId }` | Join a booking-specific chat room |
| `chat:message` | `{ bookingId, receiverId, content }` | Send a booking-scoped message |
| `chat:mark-read` | `{ bookingId }` | Mark booking chat as read |
| `guide:location-update` | `{ latitude, longitude }` | Broadcast guide live location |

### Listening (server → client)
| Event | Payload | Description |
|-------|---------|-------------|
| `direct_message` | Message object | Incoming DM |
| `direct_message_sent` | Message object | Confirmation of sent DM |
| `user_typing` | `{ userId }` | Someone is typing to you |
| `user_stop_typing` | `{ userId }` | Typing stopped |
| `messages_read` | `{ by: userId }` | Your messages were read |
| `chat:new-message` | Message object | New booking chat message |
| `chat:messages-read` | `{ bookingId, userId }` | Booking chat read receipt |
| `guide:location-updated` | `{ guideId, latitude, longitude }` | Guide position update for live tracking |
| `user_online` | `{ userId }` | User came online |
| `user_offline` | `{ userId }` | User went offline |

---

## 🗄️ Database Schema

15 PostgreSQL models managed via **Prisma ORM** on **Neon** (serverless Postgres):

```
User ──────────────── GuideProfile
  │                       │
  ├── TravelerProfile      ├── HiddenGem
  │                       ├── GuideAvailability
  ├── Booking             └── GroupTour ── GroupTourMember
  │    ├── Message
  │    ├── Review
  │    └── Payment
  │
  ├── Reel ── ReelLike
  │         └── ReelComment
  │
  ├── Notification
  ├── WalletTransaction
  ├── SosAlert
  └── BucketListItem
```

**Key design decisions:**
- `HiddenGem` has `isLocked: true` by default — only revealed to travelers who have an active/completed booking with that guide
- `User.role` supports `TRAVELER`, `GUIDE`, `BOTH`, and `ADMIN` — a user can be both without creating a second account
- `Message` is scoped to a `Booking` for booking chat; direct messages use a separate `directMessages` layer in `db.js`

---

## 🧰 Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.3 | UI framework |
| Vite | 5.0 | Build tool + dev server |
| React Router DOM | 6.26 | Client-side routing (19 routes) |
| Tailwind CSS | 3.4 | Utility-first styling |
| Lucide React | 0.487 | Icon system |
| Leaflet + React Leaflet | 1.9 / 4.2 | Interactive maps |
| Socket.IO Client | 4.6 | Real-time messaging and live tracking |
| date-fns | 3.6 | Date formatting utilities |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 20.x | Runtime |
| Express.js | 4.18 | REST API framework |
| Socket.IO | 4.8 | WebSocket server |
| Prisma ORM | 5.10 | Type-safe DB access |
| PostgreSQL (Neon) | — | Primary database |
| bcryptjs | 2.4 | Password hashing |
| JSON Web Tokens | 9.0 | Access + refresh token auth |
| Cloudinary | 2.0 | Video and image storage |
| Multer | 1.4 | File upload middleware |
| Nodemailer | 6.10 | Password reset emails |
| Helmet | 7.2 | HTTP security headers |
| Morgan | 1.10 | Request logging |
| Zod | 3.22 | Input validation |
| express-rate-limit | 7.5 | API rate limiting |

---

## 🚀 Running Locally

### Prerequisites
- Node.js 20+
- A PostgreSQL database (free: [Neon](https://neon.tech))
- A [Cloudinary](https://cloudinary.com) account (free tier works)

### 1. Clone the repo
```bash
git clone <your-repo-url>
cd LocalLens
```

### 2. Set up the Backend
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# PostgreSQL — get from neon.tech
DATABASE_URL=postgresql://user:password@host/locallens?sslmode=require

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here

# Cloudinary (from cloudinary.com/console)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional: Email for password reset
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=LocalLens <your@gmail.com>
```

```bash
# Push Prisma schema to your database
npx prisma db push

# Start the backend
npm run dev
# → Running on http://localhost:5001
```

### 3. Set up the Frontend
```bash
cd ../frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5001
```

```bash
npm run dev
# → Running on http://localhost:5173
```

### 4. Open the app
Go to [http://localhost:5173](http://localhost:5173) — the database auto-seeds demo guides on first run.

---

## ☁️ Deploying to Render

This project includes a `render.yaml` Blueprint that auto-configures everything.

1. Push the project to a GitHub repository
2. Go to [render.com](https://render.com) → **New** → **Blueprint**
3. Connect your GitHub repo — Render reads `render.yaml` automatically
4. Set the following environment variables manually in the Render dashboard:
   - `DATABASE_URL`
   - `CLOUDINARY_CLOUD_NAME` + `CLOUDINARY_API_KEY` + `CLOUDINARY_API_SECRET`
5. Click **Apply** — Render deploys the backend, builds the frontend, and serves both

The `render.yaml` deploys:
- **`locallens-api`** — Node.js backend on port `10000`
- **`locallens-web`** — Static React frontend built with Vite
- **`locallens-db`** — PostgreSQL database (free tier)

The backend serves the built frontend from `frontend/dist` in production — a single Render service handles everything.

---

## 🔐 Authentication Flow

```
Register/Login → JWT accessToken (7d) + refreshToken (30d)
     ↓
All protected API calls: Authorization: Bearer <accessToken>
     ↓
Token expires → POST /api/auth/refresh → new accessToken
     ↓
Socket.IO: connect with { auth: { token: accessToken } }
```

Passwords are hashed with **bcrypt (12 rounds)**. Indian phone numbers are validated at registration (`+91` / `6-9XXXXXXXXX`). Blocked identifiers (email + phone) are checked at registration for moderation.

---

## 🛡️ Safety Features

- **SOS Button** — triggers `POST /api/sos` with GPS coordinates; visible during active tours
- **Live Tracking** — traveler sees guide's real-time location via `guide:location-updated` socket event
- **Verified Reviews** — reviews only possible after a `COMPLETED` booking (`bookingId @unique` on Review model)
- **Rate Limiting** — `express-rate-limit` applied on auth and sensitive endpoints
- **Helmet.js** — sets secure HTTP headers on all responses
- **JWT Validation** — Socket.IO middleware verifies token before any connection is established

---

## 📱 Pages & Routes

| Route | Component | Access |
|-------|-----------|--------|
| `/login` | LoginPage | Public |
| `/register` | RegisterPage | Public |
| `/forgot-password` | ForgotPasswordPage | Public |
| `/reset-password` | ResetPasswordPage | Public |
| `/dashboard` | TravelerDashboard | Auth |
| `/explore` | ExplorePage | Auth |
| `/group-tours` | GroupToursPage | Auth |
| `/reels` | ReelsPage | Auth |
| `/map` | MapPage | Auth |
| `/messages` | MessagesPage | Auth |
| `/notifications` | NotificationsPage | Auth |
| `/friends` | FriendsPage | Auth |
| `/profile` | ProfilePage | Auth |
| `/settings` | SettingsPage | Auth |
| `/guides/:id` | GuideProfilePage | Auth |
| `/book/:guideId` | BookingPage | Auth |
| `/users/:userId` | UserProfilePage | Auth |
| `/become-guide` | GuideRegisterPage | Auth |
| `/guide-dashboard` | GuideDashboard | Guide/Admin only |

---

## 🌱 Demo Data

On first boot with an empty database, the backend automatically seeds:
- Sample guide profiles across major Indian cities (Mumbai, Delhi, Bangalore, Goa, Jaipur, etc.)
- Sample reels linked to guides
- Sample hidden gems per guide
- Sample group tours

This allows immediate exploration without manual data entry.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes with clear commit messages
4. Push to your fork and open a Pull Request

Please keep PRs focused — one feature or fix per PR.

---

## 📄 License

This project is proprietary. All rights reserved © LocalLens.

---

<div align="center">

Built with ❤️ for travelers who want the real city, and locals who want to share it.

**[🌍 Try it live → locallens-web1.onrender.com](https://locallens-web1.onrender.com)**

</div>
