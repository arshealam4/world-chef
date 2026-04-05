import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import PlayerState from '../models/PlayerState.js';

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await User.deleteMany({});
  await PlayerState.deleteMany({});

  const passwordHash = await bcrypt.hash('cooking123', 12);
  const user = await User.create({ username: 'wife', passwordHash });

  await PlayerState.create({
    userId: user._id,
    coins: 500,
    gems: 10,
    chefs: [
      { chefId: 'grill_helper', slots: 2, maxSlots: 4, position: { x: 0, y: 0 } },
      { chefId: 'dough_helper', slots: 2, maxSlots: 4, position: { x: 2, y: 0 } },
      { chefId: 'stove_helper', slots: 2, maxSlots: 3, position: { x: 4, y: 0 } },
      { chefId: 'american_chef', slots: 1, maxSlots: 3, position: { x: 6, y: 0 } },
    ],
    tables: [
      { tableId: 'table_1', position: { x: 1, y: 4 }, state: 'empty' },
      { tableId: 'table_2', position: { x: 4, y: 4 }, state: 'empty' },
      { tableId: 'table_3', position: { x: 1, y: 7 }, state: 'empty' },
      { tableId: 'table_4', position: { x: 4, y: 7 }, state: 'empty' },
    ],
    ingredientStorage: { beef: 5, flour: 5, milk: 3 }
  });

  console.log('Seed data created: user "wife" with default save');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
