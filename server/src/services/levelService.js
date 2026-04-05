import { loadJSON } from '../utils/loadJSON.js';

export function addXPAndCheckLevel(state, xpAmount) {
  state.xp += xpAmount;
  const levels = loadJSON('levels.json');
  let leveledUp = false;
  let newUnlocks = [];
  let coinsReward = 0;
  let gemReward = 0;

  for (const lvl of levels) {
    if (lvl.level > state.level && state.xp >= lvl.xpRequired) {
      state.level += 1;
      state.coins += lvl.coinsReward;
      state.gems  += lvl.gemReward;
      coinsReward += lvl.coinsReward;
      gemReward   += lvl.gemReward;
      newUnlocks   = [...newUnlocks, ...lvl.unlocks];
      leveledUp    = true;
    }
  }

  return { leveledUp, newUnlocks, newLevel: state.level, coinsReward, gemReward };
}
