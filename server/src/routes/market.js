import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { loadJSON } from '../utils/loadJSON.js';
import PlayerState from '../models/PlayerState.js';

const router = express.Router();
router.use(requireAuth);

// GET /api/market/stock
router.get('/stock', async (req, res, next) => {
  try {
    const ingredients = loadJSON('ingredients.json');
    const state = await PlayerState.findOne({ userId: req.user.id });
    if (!state) return res.status(404).json({ error: 'No save found' });

    const stock = ingredients.map(ing => ({
      ...ing,
      playerQty: state.ingredientStorage.get(ing.id) || 0,
      canBuy: (state.ingredientStorage.get(ing.id) || 0) < ing.maxQty
    }));

    res.json(stock);
  } catch (err) { next(err); }
});

// POST /api/market/buy
router.post('/buy', async (req, res, next) => {
  try {
    const { ingredientId, quantity } = req.body;
    if (!quantity || quantity < 1) return res.status(400).json({ error: 'Quantity must be >= 1' });

    const ingredients = loadJSON('ingredients.json');
    const ingDef = ingredients.find(i => i.id === ingredientId);
    if (!ingDef) return res.status(400).json({ error: 'Unknown ingredient' });

    const state = await PlayerState.findOne({ userId: req.user.id });
    if (!state) return res.status(404).json({ error: 'No save found' });

    const currentQty = state.ingredientStorage.get(ingredientId) || 0;
    if (currentQty + quantity > ingDef.maxQty) {
      return res.status(400).json({ error: `Would exceed max quantity (${ingDef.maxQty})` });
    }

    const totalCost = quantity * ingDef.marketPrice;
    if (state.coins < totalCost) {
      return res.status(400).json({ error: `Not enough coins (need ${totalCost}, have ${state.coins})` });
    }

    state.coins -= totalCost;
    state.ingredientStorage.set(ingredientId, currentQty + quantity);
    await state.save();

    res.json({ state, totalCost });
  } catch (err) { next(err); }
});

export default router;
