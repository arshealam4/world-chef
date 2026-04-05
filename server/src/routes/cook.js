import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth } from '../middleware/auth.js';
import { loadJSON } from '../utils/loadJSON.js';
import { addXPAndCheckLevel } from '../services/levelService.js';
import PlayerState from '../models/PlayerState.js';
import ActiveTimer from '../models/ActiveTimer.js';
import User from '../models/User.js';

const router = express.Router();
router.use(requireAuth);

// POST /api/cook/start
router.post('/start', async (req, res, next) => {
  try {
    const { chefId, slotIndex, dishId } = req.body;
    const dishes = loadJSON('dishes.json');
    const dishDef = dishes.find(d => d.id === dishId);

    if (!dishDef) return res.status(400).json({ error: 'Unknown dish' });
    if (dishDef.chefId !== chefId) return res.status(400).json({ error: 'Dish does not belong to this chef' });

    const state = await PlayerState.findOne({ userId: req.user.id });
    if (!state) return res.status(404).json({ error: 'No save found' });

    const chef = state.chefs.find(c => c.chefId === chefId);
    if (!chef) return res.status(400).json({ error: 'Chef not owned' });
    if (slotIndex >= chef.slots) return res.status(400).json({ error: 'Invalid slot' });

    // Check no active timer for this slot
    const existing = await ActiveTimer.findOne({
      userId: req.user.id, chefId, slotIndex, completed: false
    });
    if (existing) return res.status(409).json({ error: 'Slot already cooking' });

    // Check ingredients
    const storage = state.ingredientStorage;
    for (const [ingId, qty] of Object.entries(dishDef.requires)) {
      const have = storage.get(ingId) || 0;
      if (have < qty) {
        return res.status(400).json({ error: `Not enough ${ingId} (need ${qty}, have ${have})` });
      }
    }

    // Deduct ingredients
    for (const [ingId, qty] of Object.entries(dishDef.requires)) {
      storage.set(ingId, (storage.get(ingId) || 0) - qty);
    }

    // Get cook time multiplier
    const user = await User.findById(req.user.id);
    const multiplier = user?.settings?.cookTimeMultiplier ?? 1.0;

    const timer = await ActiveTimer.create({
      userId: req.user.id,
      timerId: uuidv4(),
      type: 'cooking',
      chefId,
      slotIndex,
      dishId,
      finishesAt: new Date(Date.now() + dishDef.cookTimeSeconds * multiplier * 1000)
    });

    await state.save();
    res.json({ timer, state });
  } catch (err) { next(err); }
});

// GET /api/cook/timers
router.get('/timers', async (req, res, next) => {
  try {
    const timers = await ActiveTimer.find({ userId: req.user.id, completed: false });
    res.json(timers);
  } catch (err) { next(err); }
});

// POST /api/cook/collect
router.post('/collect', async (req, res, next) => {
  try {
    const { timerId } = req.body;
    const timer = await ActiveTimer.findOne({ timerId, userId: req.user.id });
    if (!timer) return res.status(404).json({ error: 'Timer not found' });
    if (timer.completed) return res.status(400).json({ error: 'Already collected' });
    if (new Date() < timer.finishesAt) return res.status(400).json({ error: 'Not ready yet' });

    const dishes = loadJSON('dishes.json');
    const dishDef = dishes.find(d => d.id === timer.dishId);
    if (!dishDef) return res.status(400).json({ error: 'Unknown dish' });

    const state = await PlayerState.findOne({ userId: req.user.id });

    // Add to appropriate storage
    if (dishDef.isIngredient) {
      const total = Array.from(state.ingredientStorage.values()).reduce((a, b) => a + b, 0);
      if (total >= state.ingredientStorageCap) {
        return res.status(409).json({ error: 'Ingredient storage full' });
      }
      state.ingredientStorage.set(timer.dishId, (state.ingredientStorage.get(timer.dishId) || 0) + 1);
    } else {
      const total = Array.from(state.dishStorage.values()).reduce((a, b) => a + b, 0);
      if (total >= state.dishStorageCap) {
        return res.status(409).json({ error: 'Dish storage full' });
      }
      state.dishStorage.set(timer.dishId, (state.dishStorage.get(timer.dishId) || 0) + 1);
    }

    // Add XP and check level
    const levelResult = addXPAndCheckLevel(state, dishDef.xpReward);

    timer.completed = true;
    await timer.save();
    await state.save();

    res.json({
      state,
      xpGained: dishDef.xpReward,
      ...levelResult
    });
  } catch (err) { next(err); }
});

// POST /api/cook/skip-gem
router.post('/skip-gem', async (req, res, next) => {
  try {
    const { timerId } = req.body;
    const timer = await ActiveTimer.findOne({ timerId, userId: req.user.id });
    if (!timer) return res.status(404).json({ error: 'Timer not found' });
    if (timer.completed) return res.status(400).json({ error: 'Already completed' });

    const remainingMs = Math.max(0, timer.finishesAt - Date.now());
    const remainingSecs = Math.ceil(remainingMs / 1000);
    const gemCost = Math.max(1, Math.ceil(remainingSecs / 60));

    const state = await PlayerState.findOne({ userId: req.user.id });
    if (state.gems < gemCost) {
      return res.status(400).json({ error: `Need ${gemCost} gems, have ${state.gems}` });
    }

    state.gems -= gemCost;
    timer.finishesAt = new Date();
    await timer.save();
    await state.save();

    res.json({ gemCost, timer, state });
  } catch (err) { next(err); }
});

export default router;
