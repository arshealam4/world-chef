import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import User from '../models/User.js';
import PlayerState from '../models/PlayerState.js';

const router = express.Router();
router.use(requireAuth);

// PATCH /api/profile/settings
router.patch('/settings', async (req, res, next) => {
  try {
    const updates = {};
    if (req.body.cookTimeMultiplier !== undefined) {
      const val = Math.max(0.1, Math.min(1.0, req.body.cookTimeMultiplier));
      updates['settings.cookTimeMultiplier'] = val;
    }
    if (req.body.soundEnabled !== undefined) {
      updates['settings.soundEnabled'] = !!req.body.soundEnabled;
    }
    if (req.body.musicEnabled !== undefined) {
      updates['settings.musicEnabled'] = !!req.body.musicEnabled;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true }
    );
    res.json({ settings: user.settings });
  } catch (err) { next(err); }
});

// PATCH /api/profile/restaurant-name
router.patch('/restaurant-name', async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || name.length < 1 || name.length > 30) {
      return res.status(400).json({ error: 'Name must be 1-30 characters' });
    }
    const state = await PlayerState.findOneAndUpdate(
      { userId: req.user.id },
      { restaurantName: name },
      { new: true }
    );
    res.json({ state });
  } catch (err) { next(err); }
});

export default router;
