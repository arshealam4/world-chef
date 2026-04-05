import { create } from 'zustand';
import axios from 'axios';

export const useTimerStore = create((set, get) => ({
  timers: [],
  ticks:  {},

  fetchTimers: async () => {
    try {
      const res = await axios.get('/api/cook/timers');
      const timers = res.data;
      const ticks = {};
      for (const t of timers) {
        ticks[t.timerId] = Math.max(0, new Date(t.finishesAt) - Date.now());
      }
      set({ timers, ticks });
    } catch {
      // Silently fail — will retry on next poll
    }
  },

  tick: () => {
    set(state => {
      const ticks = { ...state.ticks };
      for (const id in ticks) {
        ticks[id] = Math.max(0, ticks[id] - 1000);
      }
      return { ticks };
    });
  },

  getRemainingMs: (timerId) => get().ticks[timerId] ?? 0,
  isReady:        (timerId) => (get().ticks[timerId] ?? 1) <= 0,

  getTimerForSlot: (chefId, slotIndex) =>
    get().timers.find(t => t.chefId === chefId && t.slotIndex === slotIndex && !t.completed),
}));
