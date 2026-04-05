# World Chef

A mobile-first restaurant cooking game web app. Build your restaurant empire — hire chefs, cook dishes, serve customers, and level up!

![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)

---

## Gameplay

| Feature | Description |
|---|---|
| **Cook** | Tap a chef station, pick a dish, and watch the timer count down |
| **Market** | Buy raw ingredients (beef, flour, milk, etc.) with coins |
| **Serve** | Customers arrive, sit at tables, and order dishes — serve them to earn coins |
| **Level Up** | Earn XP from cooking and serving to unlock new chefs and cuisines |
| **Hire Chefs** | 25 chefs spanning 15+ nationalities — American, Italian, Japanese, Mexican, Indian, French, and more |
| **VIP Customers** | High-popularity restaurants attract VIP customers who pay 1.5x |

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js 20, Express 5, Mongoose 8 |
| Frontend | React 18, Vite 5, Tailwind CSS 3, Pixi.js 7 |
| Database | MongoDB 7 |
| Auth | JWT (jsonwebtoken 9) + bcrypt 5 |
| State | Zustand 4 (client), Framer Motion 11 (animations) |
| Module System | ES Modules throughout |

## Project Structure

```
world-chef/
├── client/                     # React frontend
│   ├── src/
│   │   ├── api/                # API client (gameApi.js)
│   │   ├── components/
│   │   │   ├── game/           # ChefStationStrip
│   │   │   ├── layout/         # HUD, BottomNav, Notification
│   │   │   └── panels/         # ChefPanel, ServePanel, StorePanel,
│   │   │                         StoragePanel, ProfilePanel, LevelUpModal
│   │   ├── game/
│   │   │   ├── entities/       # Table, ChefStation, CoinFloat, Customer
│   │   │   └── scenes/         # RestaurantScene (Pixi.js)
│   │   ├── hooks/              # useResponsiveCanvas, useAutoSave
│   │   ├── pages/              # LoginPage, GamePage
│   │   └── store/              # useAuthStore, useGameStore, useUIStore,
│   │                             useTimerStore, useConfigStore
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/                     # Express API
│   ├── src/
│   │   ├── middleware/         # auth.js (JWT), errorHandler.js
│   │   ├── models/             # User, PlayerState, ActiveTimer
│   │   ├── routes/             # auth, game, cook, market, customers,
│   │   │                         restaurant, profile
│   │   ├── services/           # levelService.js
│   │   └── utils/              # loadJSON.js, seedData.js
│   └── .env
├── data/                       # Game config (JSON)
│   ├── chefs.json              # 25 chefs with dishes and unlock levels
│   ├── dishes.json             # 80+ dishes with recipes and rewards
│   ├── ingredients.json        # 13 base ingredients
│   └── levels.json             # 22 levels with XP thresholds and unlocks
└── package.json                # Root workspace scripts
```

## Getting Started

### Prerequisites

- **Node.js** >= 20
- **MongoDB** >= 7 (running locally)

### Installation

```bash
# Clone the repo
git clone <repo-url> world-chef
cd world-chef

# Install all dependencies (root + server + client)
npm run install:all
```

### Configuration

Create `server/.env` (or edit the existing one):

```env
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/worldchef
JWT_SECRET=your-secret-key-min-32-characters
JWT_EXPIRES_IN=30d
CLIENT_URL=http://localhost:3000
```

### Running

```bash
# Start MongoDB (in a separate terminal)
mongod --dbpath ~/data/db

# Start both server and client
npm run dev
```

- **Client:** http://localhost:3000
- **Server:** http://localhost:5001

### Seed Data (optional)

```bash
cd server && npm run seed
```

Creates a test user `wife` / `cooking123` with a default restaurant save.

## API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account (username, password) |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Current user + player state |

### Game
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/game/state` | Full player state (auto-spawns customers) |
| GET | `/api/game/storage` | Ingredient + dish inventory |
| POST | `/api/game/save` | Autosave player state |
| GET | `/api/game/config/*` | Static game data (chefs, dishes, ingredients, levels) |

### Cooking
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/cook/start` | Start cooking a dish (deducts ingredients) |
| GET | `/api/cook/timers` | Active cooking timers |
| POST | `/api/cook/collect` | Collect finished dish into storage |
| POST | `/api/cook/skip-gem` | Skip timer with gems |

### Market
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/market/stock` | All ingredients with prices and player quantities |
| POST | `/api/market/buy` | Buy ingredients with coins |

### Customers
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/customers/seat` | Seat a queued customer at a table |
| POST | `/api/customers/serve` | Serve a dish to an occupied table |
| POST | `/api/customers/collect` | Collect payment from served table |
| POST | `/api/customers/dismiss` | Dismiss a customer (no reward) |

### Restaurant & Profile
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/restaurant/hire-chef` | Hire a new chef (deducts coins) |
| PATCH | `/api/profile/settings` | Update cook speed, sound, music |
| PATCH | `/api/profile/restaurant-name` | Rename restaurant |

## Game Design

### Default Save
New players start with:
- **500 coins**, **10 gems**
- **4 chef stations:** Grill Helper, Dough Helper, Stove Helper, American Chef
- **4 tables** on the restaurant floor
- **Starter ingredients:** beef x5, flour x5, milk x3

### Cooking Flow
```
Buy ingredients (Market)
  → Assign to chef slot (Cook)
    → Wait for timer (or skip with gems)
      → Collect to storage
        → Serve to customer
          → Collect coins + XP
```

### Cook Speed Multiplier
Players can set cook speed from 1x to 4x in Profile settings. This is stored as `cookTimeMultiplier` (inverted: 4x speed = 0.25 multiplier) and applied server-side to all new timers.

### Responsive Layout
| Viewport | Layout |
|---|---|
| < 768px (phone) | HUD + ChefStrip + Canvas + BottomNav, panels as bottom sheets |
| >= 768px (desktop) | HUD + ChefStrip + 3-column (left sidebar, canvas, right sidebar) |

## License

Private project — not open source.
