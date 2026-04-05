# World Chef — Claude Code Project Memory
> Read this at the start of EVERY session. Never ask the user to re-explain the project.

---

## What This Project Is
A mobile-first restaurant cooking game web app — personal clone of World Chef by Social Point.
Deployed on AWS EC2. Wife plays on phone browser, husband plays on laptop browser.

---

## Claude Code Skills Guide

Skills tell Claude Code HOW to approach different types of tasks in this project.
Before starting any task, check the table below and follow the matching approach.

| Task | Skill / Approach |
|---|---|
| Adding a React panel component | Follow the bottom-sheet pattern in Section: UI Patterns |
| Adding an Express route | Follow the route pattern in Section: Route Pattern |
| Modifying chef/dish data | Edit data/*.json only — never hardcode in components |
| Working with Pixi.js entities | Follow the Entity Class pattern in Section: Pixi Patterns |
| Debugging a timer issue | Read Section: Timer Architecture first |
| Editing an existing file | Use targeted str_replace — NEVER rewrite the whole file |
| Adding a new Zustand store | Copy the pattern from existing stores, keep it minimal |
| Handling a MongoDB Map field | Use .get()/.set() — never treat as plain JS object |
| Any task that touches auth | Always use req.user.id — never trust client-sent userId |

### Sub-agent efficiency rules
- Build features sequentially — complete and verify one before starting the next
- When debugging: fix the specific error, don't refactor surrounding code
- When adding a route: add only that route, don't reorganise the router
- Never re-read a file you just wrote in the same session
- Prefer targeted edits (str_replace) over full rewrites — saves tokens

---

## Stack (never change)

| Layer | Tech | Version |
|---|---|---|
| Frontend | React + Vite | 18.3 + 5.4 |
| Game renderer | Pixi.js | 7.4 |
| UI state | Zustand | 4.5 |
| Animations | Framer Motion | 11.3 |
| Styling | Tailwind CSS | 3.4 |
| HTTP | Axios | 1.7 |
| Backend | Node.js + Express | 20 + 5.x |
| Auth | JWT + bcrypt | 9.x + 5.x |
| Database | MongoDB + Mongoose | 7 + 8.x |
| Modules | ES Modules | everywhere — no require() |

Ports: Frontend :3000 · API :5000 · MongoDB :27017

---

## Phase Progress — update as each phase passes its acceptance test

- [ ] Phase 0 — Project setup (CLAUDE.md + settings.json + .gitignore)
- [ ] Phase 1 — Auth + Database
- [ ] Phase 2 — Responsive Game Shell
- [ ] Phase 3 — Restaurant Rendering (Pixi.js)
- [ ] Phase 4 — Cooking Loop
- [ ] Phase 5 — Market + Storage
- [ ] Phase 6 — Customers
- [ ] Phase 7 — Progression + Level Up
- [ ] Phase 8 — AWS EC2 Deployment

---

## Complete Chef List (from official worldchef.com — accurate)

```
HELPERS (produce ingredients):
  grill_helper    → Patty, Grilled Chicken, BBQ Ribs
  dough_helper    → Bun, Pizza Dough, Fresh Pasta, Rice Noodles
  stove_helper    → Tomato Sauce, Broth, Hot Sauce
  milk_helper     → Cheese

NATIONALITY CHEFS (serve dishes to customers):
  american_chef     → Hamburger, Steak Tartare, Surf and Turf
  antipasti_chef    → Caprese Salad, Breadsticks, Truffle Risotto, Spring Salad
  italian_chef      → Cheese Pizza, Pasta with Meat Sauce, Pasta Carbonara
  japanese_chef     → Nigiri Sushi, California Maki, Miso Soup, Udon Soup
  mexican_chef      → Nachos, Taco, Chili with Rice, Stuffed Peppers
  indian_chef       → Onion Samosa, Chicken Tikka, Beef Vindaloo
  spanish_chef      → Paella, Patatas Bravas, Tapas, Spanish Omelette
  arabian_chef      → Hummus, Falafel, Couscous, Courgette Dolma
  french_chef       → Crepe, Ratatouille, Filet Mignon, Lobster Bisque
  cupcake_chef      → Chocolate Cupcake, Strawberry Cupcake
  german_chef       → Bretzel, Potato Salad, Rote Grutze, Bratwurst
  vegetarian_chef   → Chickpea Burger, Tofu Scramble, Vegetarian Lasagna, Mushroom Soup
  chinese_chef      → Dumplings, Sweet and Sour Pork, Mapo Tofu, Fried Rice
  vietnam_chef      → Pho Bo, Summer Roll, Banh Mi, Banh Xeo
  scandinavian_chef → Pea Soup, Salmon Sandwich, Meatballs
  thai_chef         → Pad Thai, Spicy Shrimp Soup, Chicken Coconut, Thai Lobster Salad
  greek_chef        → Moussaka, Greek Salad, Tzatziki, Gyro
  korean_chef       → Kimchi Rice, Bulgogi, Bibimbap, Cold Noodles
  russian_chef      → Beef Stroganoff, Blini, Knish, Okroshka
  brazilian_chef    → Feijoada, Acaraje, Moqueca, Beijinho de Coco
  english_chef      → Fish & Chips, English Breakfast, Cottage Pie, Beef Wellington
```

**data/chefs.json schema** (one entry per chef):
```json
{
  "id": "american_chef",
  "name": "American Chef",
  "type": "chef",
  "nationality": "American",
  "unlockLevel": 1,
  "cost": 200,
  "maxSlots": 3,
  "startingSlots": 1,
  "emoji": "🍔",
  "dishes": ["hamburger", "steak_tartare", "surf_and_turf"]
}
```

**data/dishes.json schema** (two types):
```json
// Ingredient dish (isIngredient: true — goes to ingredientStorage)
{
  "id": "patty", "name": "Patty", "chefId": "grill_helper",
  "isIngredient": true, "requires": { "beef": 1 },
  "cookTimeSeconds": 120, "xpReward": 1, "coinReward": 0, "emoji": "🥩"
}

// Serving dish (isIngredient: false — goes to dishStorage, served to customers)
{
  "id": "hamburger", "name": "Hamburger", "chefId": "american_chef",
  "isIngredient": false, "requires": { "patty": 1, "bun": 1 },
  "cookTimeSeconds": 240, "eatTimeSeconds": 30,
  "xpReward": 3, "coinReward": 4, "popularityBoost": 1, "emoji": "🍔"
}
```

---

## Key Architecture (never change)

**Tile grid:** 10 cols × 14 rows, tileSize = 48px
- Wall zone: rows 0–1 (chef stations placed here)
- Floor zone: rows 2–13 (tables and decorations)
- Pixel conversion: `px = tile * 48`

**Auth:** JWT in localStorage (Zustand persist), axios interceptor attaches to all requests

**Timers:** `ActiveTimer.finishesAt` (MongoDB) is authoritative. Client polls every 10s, counts down locally every 1s. Collect validation: `new Date() >= timer.finishesAt` server-side.

**cookTimeMultiplier:** `User.settings.cookTimeMultiplier` (0.1–1.0, default 1.0). Applied: `finishesAt = Date.now() + (cookTimeSeconds * multiplier * 1000)`. Wife sets to 0.25 in Profile for 4× speed.

**Customer spawning:** Inside `GET /api/game/state`. Rate: `max(15000, 45000 - level*1500)` ms. Spawns only if empty tables exist AND queue < 2. Client auto-seats: watches customerQueue, calls `/api/customers/seat`.

**Auto-save:** 5s debounce on gameState change → `POST /api/game/save`.

**Responsive:** Phone (<768px): HUD + Canvas + BottomNav. Laptop (≥768px): HUD + LeftPanel(220px) + Canvas + RightPanel(280px).

---

## Route Pattern (follow exactly)

```javascript
// server/src/routes/example.js
import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import PlayerState from '../models/PlayerState.js';

const router = express.Router();
router.use(requireAuth); // applies to all routes in this file

router.post('/action', async (req, res, next) => {
  try {
    const state = await PlayerState.findOne({ userId: req.user.id });
    if (!state) return res.status(404).json({ error: 'Save not found' });

    // ... business logic ...

    await state.save();
    res.json({ state });
  } catch (err) {
    next(err); // always pass to errorHandler
  }
});

export default router;
```

---

## Pixi Patterns (follow exactly)

```javascript
// Entity class pattern
export class MyEntity {
  constructor(data, tileSize, onTap) {
    this.data = data;
    this.container = new PIXI.Container();
    this.container.interactive = true;
    this.container.on('pointertap', () => onTap(data.id)); // pointertap not click
    this.draw();
  }

  draw() { /* PIXI.Graphics drawing */ }

  updateState(newData) {
    this.data = newData;
    this.container.removeChildren();
    this.cleanupTickers();
    this.draw();
  }

  cleanupTickers() {
    if (this._ticker) {
      PIXI.Ticker.shared.remove(this._ticker);
      this._ticker = null;
    }
  }

  destroy() {
    this.cleanupTickers();
    this.container.destroy({ children: true });
  }
}
```

---

## UI Patterns (follow exactly)

**Bottom sheet (phone):**
```jsx
<AnimatePresence>
  {isOpen && (
    <>
      <motion.div
        className="fixed inset-0 bg-black/30 z-40"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={closePanel}
      />
      <motion.div
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50"
        style={{ maxHeight: '80vh', overflowY: 'auto' }}
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        <div className="w-10 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 mb-2" />
        {/* panel content */}
      </motion.div>
    </>
  )}
</AnimatePresence>
```

**Game button (raised style):**
```jsx
<button className="
  bg-orange-500 text-white font-fredoka font-semibold rounded-xl
  shadow-[0_4px_0_0_#c2410c] min-h-[48px] px-4
  active:translate-y-[2px] active:shadow-[0_2px_0_0_#c2410c]
  transition-all duration-75
">
  Cook Now
</button>
```

**Colors:** primary #FF6B35 · secondary #FFB347 · coins #F39C12 · gems #9B59B6 · success #4CAF50 · bg #FFF8F0

**Font:** Fredoka (loaded from Google Fonts in index.html)

---

## Environment Variables

**server/.env (dev):**
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/worldchef
JWT_SECRET=change-this-min-32-chars
JWT_EXPIRES_IN=30d
CLIENT_URL=http://localhost:3000
```

**server/.env (production on EC2):**
```
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb://127.0.0.1:27017/worldchef
JWT_SECRET=REAL_LONG_SECRET
JWT_EXPIRES_IN=30d
CLIENT_URL=https://YOUR_DOMAIN
```

---

## Common Commands

```bash
# Dev
npm run dev                           # both servers
cd server && npm run dev              # API only :5000
cd client && npm run dev              # frontend only :3000

# Install
npm run install:all
npm install                           # in server/ or client/

# Database
mongod --dbpath ~/data/db             # start MongoDB
mongosh worldchef                     # open shell
mongosh worldchef --eval "QUERY"

# Kill ports
lsof -ti:5000 | xargs kill -9
lsof -ti:3000 | xargs kill -9
npx kill-port 3000 5000

# Build + deploy
cd client && npm run build
./scripts/deploy.sh

# PM2 (on EC2)
pm2 status
pm2 logs world-chef-api
pm2 restart world-chef-api

# Test API
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"wife","password":"cooking123"}'
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Port 5000 in use | `lsof -ti:5000 \| xargs kill -9` |
| MongoDB refused | `mongod --dbpath ~/data/db` |
| Pixi canvas blank | Check gameState loaded before syncState(); check WebGL in console |
| JWT invalid signature | JWT_SECRET changed; users must re-login |
| Tailwind not working | Check content array in tailwind.config.js; restart Vite |
| Timer wrong after refresh | Use `new Date(timer.finishesAt) - Date.now()` — never client start time |
| Panel not animating | Wrap with `<AnimatePresence>`; ensure component has key prop |
| Map field error | Use `.get(key)` / `.set(key, val)` — not `state.ingredientStorage[key]` |

---

## Do NOT Do These

- `rm -rf` on any directory without confirming with user
- Change port numbers
- Use `require()` anywhere
- Use `on('click')` in Pixi (always `on('pointertap')`)
- Store Pixi objects in React state (use useRef)
- Hardcode chef/dish names in JSX (read from useConfigStore)
- Expose MongoDB port 27017 in AWS security group
- Commit server/.env to git
- Rewrite a whole file when fixing one bug (use str_replace)