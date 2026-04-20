# 🎓 VoiceRank AI — Intelligent Student Grievance Prioritization System

> A full-stack platform where students post complaints, vote on issues, and AI automatically prioritizes them for college authorities.

![VoiceRank AI](https://img.shields.io/badge/VoiceRank-AI%20Powered-6366f1?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Node](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)

---

## ✨ Features

### 👨‍🎓 Student Features
- Register / Login (JWT Auth)
- Post complaints (with optional anonymous mode)
- AI auto-categorizes & prioritizes instantly
- Upvote / Downvote complaints
- Search, filter, and paginate feed
- Real-time updates via Socket.io
- Dark mode toggle

### 🛡 Admin Features
- Dashboard with stats (total, resolved, pending, high priority)
- Sort complaints by votes & AI priority score
- Update complaint status (Pending → In Progress → Resolved)
- Charts (category pie, status bar) via Recharts
- Email notification on resolution

### 🤖 AI Features (OpenAI GPT / Local Fallback)
- Auto-categorization: Academic, Infrastructure, Safety, Other
- Priority Score (0–100) + Priority Level (Low / Medium / High / Critical)
- Critical keyword detection: ragging, harassment, danger, violence → instant Critical
- One-sentence complaint summary

---

## 🗂 Project Structure

```
voicerank/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── components/      # Layout, shared components
│   │   ├── context/         # AuthContext, ThemeContext
│   │   ├── pages/           # All page components
│   │   └── index.css        # Tailwind + custom styles
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── server/                  # Node.js + Express backend
    ├── config/              # MongoDB connection
    ├── controllers/         # Route handlers
    ├── middleware/          # JWT auth middleware
    ├── models/              # Mongoose schemas
    ├── routes/              # Express routers
    ├── utils/               # AI analyzer, mailer
    ├── .env.example
    ├── package.json
    └── server.js
```

---

## 🚀 Quick Setup Guide

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier)
- Git

---

### Step 1 — Clone & Install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

---

### Step 2 — Configure Environment Variables

**Server** — copy `.env.example` to `.env`:
```bash
cd server
cp .env.example .env
```

Fill in your values:
```env
PORT=5000
MONGO_URI=mongodb+srv://...          # from MongoDB Atlas
JWT_SECRET=your_secret_key_here
OPENAI_API_KEY=sk-...                # optional, has local fallback
EMAIL_USER=your@gmail.com            # optional
EMAIL_PASS=your_app_password         # Gmail App Password
CLIENT_URL=http://localhost:5173
```

**Client** — copy `.env.example` to `.env`:
```bash
cd client
cp .env.example .env
```

---

### Step 3 — Set Up MongoDB Atlas

1. Go to https://cloud.mongodb.com
2. Create a free cluster
3. Add a database user
4. Whitelist your IP (0.0.0.0/0 for development)
5. Copy the connection string into `MONGO_URI`

---

### Step 4 — Run the Application

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
# Server running on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
# App running on http://localhost:5173
```

---

### Step 5 — Create Admin Account

Register normally at `/register`, then manually update the role in MongoDB:

```javascript
// In MongoDB Atlas > Collections > users
// Find your user and update:
{ $set: { role: "admin" } }
```

Or use MongoDB Compass / mongosh:
```bash
db.users.updateOne({ email: "admin@demo.com" }, { $set: { role: "admin" } })
```

---

## 🔗 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login & get JWT |
| GET | `/api/auth/me` | Get current user |

### Complaints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/complaints` | ✅ | Get all (with filters) |
| POST | `/api/complaints` | ✅ | Submit new complaint |
| GET | `/api/complaints/:id` | ✅ | Get single complaint |
| PUT | `/api/complaints/:id/status` | Admin | Update status |
| GET | `/api/complaints/stats` | Admin | Dashboard stats |

### Votes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/votes` | ✅ | Cast/toggle vote |

### AI
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/ai/analyze` | ✅ | Analyze complaint text |

---

## 🚀 Deployment

### Frontend → Vercel
```bash
cd client
npm run build
# Push to GitHub, import on vercel.com
# Set env: VITE_API_URL=https://your-backend.onrender.com
```

### Backend → Render
1. Push `server/` to GitHub
2. Create new Web Service on render.com
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add all env variables in Render dashboard

### Database → MongoDB Atlas
- Already cloud-hosted, just use the connection string

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Routing | React Router v6 |
| HTTP | Axios |
| Charts | Recharts |
| Real-time | Socket.io |
| Notifications | react-hot-toast |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT + bcryptjs |
| AI | OpenAI GPT-3.5 (+ local fallback) |
| Email | Nodemailer (Gmail) |
| Icons | Lucide React |
| Fonts | Outfit + DM Sans (Google Fonts) |

---

## 🔐 Security Notes

- Passwords hashed with bcryptjs (12 rounds)
- JWT tokens expire in 30 days
- Role-based middleware on all sensitive routes
- Anonymous complaints hide user identity in UI
- Never commit `.env` to version control

---

## 📝 License

MIT License — Free to use for educational purposes.

---

**Built with ❤️ for students who deserve to be heard.**
