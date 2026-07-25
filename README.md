<div align="center">

# ♟️ ChessArena.org

### *The Open-Source Chess Tournament Platform*

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-tournament--hub--six.vercel.app-7ae22e?style=for-the-badge)](https://tournament-hub-six.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

<br/>

> **A free, feature-rich chess platform** with real-time multiplayer, AI opponents, tournaments, puzzles, and a beautiful Lichess-inspired dark UI. Built with Next.js, PostgreSQL, and Firebase.

<br/>

[🎮 Play Now](https://tournament-hub-six.vercel.app/game) · [🏆 Tournaments](https://tournament-hub-six.vercel.app/tournament) · [📊 Leaderboard](https://tournament-hub-six.vercel.app/leaderboard) · [🧩 Puzzles](https://tournament-hub-six.vercel.app/puzzle)

</div>

---

## ✨ Features

### 🎮 Game Modes
| Feature | Description |
|---------|-------------|
| **🤖 vs Computer AI** | Play against GM_Arjun_Mehta, an AI with tactical play and random color assignment |
| **⚔️ Online Matchmaking** | Queue-based matchmaking with random color assignment. Timer starts only when both players connect |
| **🔗 Invite a Friend** | Generate shareable invite links. Friend joins, colors assigned, game syncs in real-time |
| **♟️ Puzzles** | Tactical puzzle trainer with difficulty ratings and hint system |

### 🏗️ Platform Features
| Feature | Description |
|---------|-------------|
| **🏆 Tournament System** | Create and join tournaments with Swiss/Round Robin formats, brackets, and prize pools |
| **📊 ELO Rating System** | Dynamic ELO ratings updated after each game (+15/-15 per win/loss) |
| **📈 Leaderboard** | Global ranking of all players, sortable by rating |
| **💰 Wallet System** | Integrated wallet with Razorpay payment gateway for tournament entry fees |
| **👤 User Profiles** | Firebase authentication with Google Sign-In, profile pages with game history |
| **💬 Live Chat** | In-game chat during multiplayer matches |
| **⏱️ Chess Clock** | 5+0 blitz format with per-player countdown timers |
| **📜 Move History** | Full SAN notation move list with game replay capability |
| **🎨 Board Themes** | Beautiful SVG piece rendering with board orientation based on assigned color |

---

## 🛠️ Tech Stack

<div align="center">

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, TypeScript 5 |
| **Styling** | Tailwind CSS 4 with custom design system |
| **Chess Engine** | chess.js for move validation and game logic |
| **Database** | PostgreSQL (Neon Serverless) |
| **Authentication** | Firebase Auth (Google Sign-In + Email) |
| **Payments** | Razorpay Payment Gateway |
| **Deployment** | Vercel (Serverless Functions) |
| **API** | Next.js API Routes (catch-all handler) |

</div>

---

## 📁 Project Structure

```
ChessArena/
├── app/                          # Next.js App Router pages
│   ├── api/[...path]/route.ts    # Catch-all API handler (all backend logic)
│   ├── game/page.tsx             # Main chess game page (AI, Online, Friend)
│   ├── tournament/               # Tournament listing, creation, details
│   ├── leaderboard/page.tsx      # Global ELO leaderboard
│   ├── puzzle/page.tsx           # Tactical puzzle trainer
│   ├── wallet/page.tsx           # Wallet & payments (Razorpay)
│   ├── auth/                     # Login & signup pages
│   ├── dashboard/page.tsx        # User dashboard
│   ├── profile/[username]/       # Public player profiles
│   ├── learn/page.tsx            # Chess learning resources
│   └── about/page.tsx            # About page
├── components/                   # Reusable React components
│   ├── ChessBoard.tsx            # SVG chess board with piece rendering
│   ├── Navbar.tsx                # Global navigation bar
│   ├── Footer.tsx                # Site footer
│   ├── ThemeSwitcher.tsx         # Dark/light theme toggle
│   └── Puzzle*.tsx               # Puzzle-specific components
├── lib/                          # Shared utilities
│   ├── db-server.ts              # PostgreSQL connection pool & auth helpers
│   ├── axios.ts                  # API client with Firebase auth interceptor
│   └── firebase.ts               # Firebase client configuration
├── backend/                      # Python FastAPI backend (legacy reference)
│   └── app/
│       ├── main.py               # FastAPI application
│       ├── routers/              # API route handlers
│       ├── models/               # SQLAlchemy ORM models
│       └── dependencies/         # Auth & DB dependencies
├── services/                     # Frontend service layer
├── types/                        # TypeScript type definitions
└── public/                       # Static assets
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** database (or [Neon](https://neon.tech) for serverless)
- **Firebase** project (for authentication)

### 1. Clone the Repository

```bash
git clone https://github.com/shradul9728/ChessArena.git
cd ChessArena
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/chessarena

# Firebase (Client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id

# Firebase (Server-side)
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}

# Razorpay (Optional - for payments)
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### 4. Set Up the Database

Create the required tables in your PostgreSQL database:

```sql
CREATE TABLE users (
    id VARCHAR(128) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE,
    avatar VARCHAR(500),
    rating INTEGER DEFAULT 1200,
    role VARCHAR(20) DEFAULT 'player',
    wallet_balance FLOAT DEFAULT 0.0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE games (
    id VARCHAR(128) PRIMARY KEY,
    tournament_id VARCHAR(128) REFERENCES tournaments(id),
    white_player_id VARCHAR(128) REFERENCES users(id) NOT NULL,
    black_player_id VARCHAR(128) REFERENCES users(id) NOT NULL,
    clock_control VARCHAR(50) NOT NULL,
    fen VARCHAR(255) DEFAULT 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    moves TEXT DEFAULT '',
    status VARCHAR(50) DEFAULT 'active',
    chat TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tournaments (
    id VARCHAR(128) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    game_format VARCHAR(50) DEFAULT 'Swiss',
    max_participants INTEGER DEFAULT 8,
    prize_pool FLOAT DEFAULT 0,
    entry_fee FLOAT DEFAULT 0,
    organizer_id VARCHAR(128) REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'upcoming',
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 🌍 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

```bash
npx vercel --prod
```

---

## 🎯 How It Works

### Online Matchmaking Flow

```mermaid
sequenceDiagram
    participant P1 as Player 1
    participant API as API Server
    participant DB as PostgreSQL
    participant P2 as Player 2

    P1->>API: POST /api/games/matchmake
    API->>DB: Check for waiting games
    DB-->>API: No waiting games
    API->>DB: Create game (status: waiting, random color)
    API-->>P1: {id, status: "waiting", color: "w"}

    P1->>API: GET /api/games/{id} (polling)
    API-->>P1: {status: "waiting"}

    P2->>API: POST /api/games/matchmake
    API->>DB: Find waiting game
    DB-->>API: Found P1's game
    API->>DB: Update game (add P2, status: active)
    API-->>P2: {id, status: "active", color: "b"}

    P1->>API: GET /api/games/{id} (polling)
    API-->>P1: {status: "active", opponent: P2}
    Note over P1,P2: Game begins! Moves sync via polling
```

### Friend Invite Flow

```mermaid
sequenceDiagram
    participant Host as Host Player
    participant API as API Server
    participant Friend as Friend

    Host->>API: POST /api/games/invite
    API-->>Host: {id: "invite-xxx", color: "w"}
    Host->>Host: Generate link, copy to clipboard

    Friend->>API: POST /api/games/{id}/join
    API-->>Friend: {color: "b", status: "active"}

    Host->>API: GET /api/games/{id} (polling)
    API-->>Host: {status: "active", opponent: Friend}
    Note over Host,Friend: Game syncs via polling every 2s
```

---

## 🎨 Design Philosophy

ChessArena is inspired by [Lichess.org](https://lichess.org) — the world's best open-source chess platform. Our design principles:

- **🌙 Dark-first UI** — Easy on the eyes during long sessions
- **⚡ Performance** — Serverless architecture with cached DB connections
- **📱 Responsive** — Works on desktop, tablet, and mobile
- **🎯 Minimalist** — Focus on the game, not the chrome
- **♿ Accessible** — Semantic HTML with proper contrast ratios

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** this repository
2. **Create** your feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Ideas for Contributions
- [ ] WebSocket support for real-time game sync (replace polling)
- [ ] Stockfish integration for stronger AI
- [ ] Game analysis with engine evaluation
- [ ] Opening explorer
- [ ] Club/team system
- [ ] Mobile app (React Native)

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ by [Shradul Sharma](https://github.com/shradul9728)**

⭐ Star this repo if you found it useful!

[🎮 Play Now](https://tournament-hub-six.vercel.app) · [🐛 Report Bug](https://github.com/shradul9728/ChessArena/issues) · [💡 Request Feature](https://github.com/shradul9728/ChessArena/issues)

</div>
