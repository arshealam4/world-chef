import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { loadJSON } from '../utils/loadJSON.js';
import PlayerState from '../models/PlayerState.js';

const router = express.Router();
router.use(requireAuth);

// POST /api/restaurant/hire-chef
router.post('/hire-chef', async (req, res, next) => {
  try {
    const { chefId } = req.body;
    const chefs = loadJSON('chefs.json');
    const chefDef = chefs.find(c => c.id === chefId);
    if (!chefDef) return res.status(400).json({ error: 'Unknown chef' });

    const state = await PlayerState.findOne({ userId: req.user.id });
    if (!state) return res.status(404).json({ error: 'No save found' });

    if (state.level < chefDef.unlockLevel) {
      return res.status(400).json({ error: `Requires level ${chefDef.unlockLevel}` });
    }

    if (state.chefs.find(c => c.chefId === chefId)) {
      return res.status(409).json({ error: 'Chef already hired' });
    }

    if (state.coins < chefDef.cost) {
      return res.status(400).json({ error: `Not enough coins (need ${chefDef.cost})` });
    }

    state.coins -= chefDef.cost;

    // Place new chef at next available position in wall area
    const usedX = new Set(state.chefs.map(c => c.position.x));
    let newX = 0;
    while (usedX.has(newX)) newX += 2;

    state.chefs.push({
      chefId,
      slots: chefDef.startingSlots,
      maxSlots: chefDef.maxSlots,
      position: { x: newX, y: 0 }
    });

    await state.save();
    res.json({ state });
  } catch (err) { next(err); }
});

export default router;
