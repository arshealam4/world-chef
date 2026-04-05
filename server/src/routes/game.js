import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { loadJSON } from '../utils/loadJSON.js';
import PlayerState from '../models/PlayerState.js';

const router = express.Router();

// Public config routes (no auth needed)
router.get('/config/chefs',       (req, res) => res.json(loadJSON('chefs.json')));
router.get('/config/dishes',      (req, res) => res.json(loadJSON('dishes.json')));
router.get('/config/ingredients', (req, res) => res.json(loadJSON('ingredients.json')));
router.get('/config/levels',      (req, res) => res.json(loadJSON('levels.json')));

// Auth-protected routes
router.use(requireAuth);

// GET /api/game/state — with customer spawning
router.get('/state', async (req, res, next) => {
  try {
    const state = await PlayerState.findOne({ userId: req.user.id });
    if (!state) return res.status(404).json({ error: 'No save found' });

    await maybeSpawnCustomer(state);
    await state.save();

    res.json(state);
  } catch (err) { next(err); }
});

// GET /api/game/storage
router.get('/storage', async (req, res, next) => {
  try {
    const state = await PlayerState.findOne({ userId: req.user.id });
    if (!state) return res.status(404).json({ error: 'No save found' });

    const ingredients = Object.fromEntries(state.ingredientStorage);
    const dishes = Object.fromEntries(state.dishStorage);
    const ingredientTotal = Array.from(state.ingredientStorage.values()).reduce((a, b) => a + b, 0);
    const dishTotal = Array.from(state.dishStorage.values()).reduce((a, b) => a + b, 0);

    res.json({
      ingredients,
      dishes,
      ingredientCap: state.ingredientStorageCap,
      dishCap: state.dishStorageCap,
      ingredientTotal,
      dishTotal
    });
  } catch (err) { next(err); }
});

// POST /api/game/save
router.post('/save', async (req, res, next) => {
  try {
    await PlayerState.findOneAndUpdate(
      { userId: req.user.id },
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    res.json({ ok: true });
  } catch (err) { next(err); }
});

async function maybeSpawnCustomer(state) {
  const emptyTables = state.tables.filter(t => t.state === 'empty');
  const queueLength = state.customerQueue.length;
  if (emptyTables.length === 0 || queueLength >= 2) return;

  const now = Date.now();
  const lastSpawn = state.lastCustomerSpawnAt?.getTime() || 0;
  const spawnIntervalMs = Math.max(15000, 45000 - (state.level * 1500));
  if (now - lastSpawn < spawnIntervalMs) return;

  const availableDishes = getAvailableDishes(state);
  if (availableDishes.length === 0) return;

  const dishId = availableDishes[Math.floor(Math.random() * availableDishes.length)];
  const isVIP = state.popularity > 30 && Math.random() < 0.12;

  state.customerQueue.push({
    customerId: `cust_${Date.now()}`,
    orderedDish: dishId,
    isVIP,
    arrivedAt: new Date()
  });
  state.lastCustomerSpawnAt = new Date();
}

function getAvailableDishes(state) {
  const dishes = loadJSON('dishes.json');
  const ownedChefIds = state.chefs.map(c => c.chefId);
  return dishes
    .filter(d => !d.isIngredient && ownedChefIds.includes(d.chefId))
    .map(d => d.id);
}

export default router;
