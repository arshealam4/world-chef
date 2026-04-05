import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { loadJSON } from '../utils/loadJSON.js';
import { addXPAndCheckLevel } from '../services/levelService.js';
import PlayerState from '../models/PlayerState.js';

const router = express.Router();
router.use(requireAuth);

// POST /api/customers/seat
router.post('/seat', async (req, res, next) => {
  try {
    const { tableId } = req.body;
    const state = await PlayerState.findOne({ userId: req.user.id });
    if (!state) return res.status(404).json({ error: 'No save found' });

    if (state.customerQueue.length === 0) {
      return res.status(400).json({ error: 'No customers waiting' });
    }

    const table = state.tables.find(t => t.tableId === tableId);
    if (!table) return res.status(400).json({ error: 'Table not found' });
    if (table.state !== 'empty') return res.status(400).json({ error: 'Table not empty' });

    const customer = state.customerQueue.shift();
    table.state       = 'occupied';
    table.customerId  = customer.customerId;
    table.orderedDish = customer.orderedDish;
    table.isVIP       = customer.isVIP;
    table.seatedAt    = new Date();

    await state.save();
    res.json({ state });
  } catch (err) { next(err); }
});

// POST /api/customers/serve
router.post('/serve', async (req, res, next) => {
  try {
    const { tableId, dishId } = req.body;
    const state = await PlayerState.findOne({ userId: req.user.id });
    if (!state) return res.status(404).json({ error: 'No save found' });

    const table = state.tables.find(t => t.tableId === tableId);
    if (!table) return res.status(400).json({ error: 'Table not found' });
    if (table.state !== 'occupied') return res.status(400).json({ error: 'Table not occupied' });

    // Check dish storage
    const dishQty = state.dishStorage.get(dishId) || 0;
    if (dishQty < 1) return res.status(400).json({ error: 'No dish in storage' });

    state.dishStorage.set(dishId, dishQty - 1);
    if (state.dishStorage.get(dishId) <= 0) state.dishStorage.delete(dishId);

    table.state = 'served';
    await state.save();
    res.json({ state });
  } catch (err) { next(err); }
});

// POST /api/customers/collect
router.post('/collect', async (req, res, next) => {
  try {
    const { tableId } = req.body;
    const state = await PlayerState.findOne({ userId: req.user.id });
    if (!state) return res.status(404).json({ error: 'No save found' });

    const table = state.tables.find(t => t.tableId === tableId);
    if (!table) return res.status(400).json({ error: 'Table not found' });
    if (table.state !== 'served') return res.status(400).json({ error: 'Table not served' });

    const dishes = loadJSON('dishes.json');
    const dishDef = dishes.find(d => d.id === table.orderedDish);
    const coinReward = dishDef ? Math.floor(dishDef.coinReward * (table.isVIP ? 1.5 : 1)) : 5;
    const xpReward = dishDef?.xpReward || 1;
    const popBoost = dishDef?.popularityBoost || 1;

    state.coins += coinReward;
    state.popularity += popBoost;

    const levelResult = addXPAndCheckLevel(state, xpReward);

    // Clear table
    table.state       = 'empty';
    table.customerId  = undefined;
    table.orderedDish = undefined;
    table.isVIP       = false;
    table.seatedAt    = undefined;

    await state.save();
    res.json({ state, coinsEarned: coinReward, xpEarned: xpReward, ...levelResult });
  } catch (err) { next(err); }
});

// POST /api/customers/dismiss
router.post('/dismiss', async (req, res, next) => {
  try {
    const { tableId } = req.body;
    const state = await PlayerState.findOne({ userId: req.user.id });
    if (!state) return res.status(404).json({ error: 'No save found' });

    const table = state.tables.find(t => t.tableId === tableId);
    if (!table) return res.status(400).json({ error: 'Table not found' });

    table.state       = 'empty';
    table.customerId  = undefined;
    table.orderedDish = undefined;
    table.isVIP       = false;
    table.seatedAt    = undefined;

    await state.save();
    res.json({ state });
  } catch (err) { next(err); }
});

export default router;
