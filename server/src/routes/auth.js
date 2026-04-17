import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import PlayerState from '../models/PlayerState.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

function generateToken(user) {
  return jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
}

function createDefaultPlayerState(userId) {
  return PlayerState.create({
    userId,
    coins: 500,
    gems: 10,
    chefs: [
      { chefId: 'grill_helper',   slots: 3, maxSlots: 6, position: { x: 0, y: 0 } },
      { chefId: 'dough_helper',   slots: 3, maxSlots: 6, position: { x: 2, y: 0 } },
      { chefId: 'stove_helper',   slots: 3, maxSlots: 6, position: { x: 4, y: 0 } },
      { chefId: 'milk_helper',    slots: 3, maxSlots: 6, position: { x: 6, y: 0 } },
      { chefId: 'american_chef',  slots: 3, maxSlots: 5, position: { x: 8, y: 0 } },
    ],
    tables: [
      { tableId: 'table_1', position: { x: 1, y: 4 }, state: 'empty' },
      { tableId: 'table_2', position: { x: 4, y: 4 }, state: 'empty' },
      { tableId: 'table_3', position: { x: 1, y: 7 }, state: 'empty' },
      { tableId: 'table_4', position: { x: 4, y: 7 }, state: 'empty' },
    ],
    ingredientStorage: { beef: 5, flour: 5, milk: 3 }
  });
}

// POST /api/auth/register
router.post('/register',
  body('username')
    .trim()
    .isLength({ min: 2, max: 20 }).withMessage('Username must be 2–20 characters')
    .isAlphanumeric().withMessage('Username must be alphanumeric'),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
      }

      const { username, password } = req.body;

      const existing = await User.findOne({ username });
      if (existing) {
        return res.status(409).json({ error: 'Username already taken' });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const user = await User.create({ username, passwordHash });

      await createDefaultPlayerState(user._id);

      const token = generateToken(user);
      res.status(201).json({
        token,
        user: { id: user._id, username: user.username }
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/auth/login
router.post('/login',
  body('username').trim().notEmpty(),
  body('password').notEmpty(),
  async (req, res, next) => {
    try {
      const { username, password } = req.body;

      const user = await User.findOne({ username });
      if (!user) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      user.lastLoginAt = new Date();
      await user.save();

      const token = generateToken(user);
      res.json({
        token,
        user: { id: user._id, username: user.username }
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const playerState = await PlayerState.findOne({ userId: req.user.id });

    res.json({
      user: {
        id: user._id,
        username: user.username,
        settings: user.settings
      },
      playerState
    });
  } catch (err) {
    next(err);
  }
});

export default router;
