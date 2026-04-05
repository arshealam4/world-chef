import { create } from 'zustand';
import { gameApi } from '../api/gameApi';
import { useTimerStore } from './useTimerStore';
import { useUIStore } from './useUIStore';

export const useGameStore = create((set, get) => ({
  gameState:  null,
  loading:    false,
  error:      null,

  loadGame: async () => {
    // Only show loading spinner on initial load, not periodic refreshes
    if (!get().gameState) set({ loading: true });
    try {
      const state = await gameApi.getState();
      set({ gameState: state, loading: false });
    } catch (err) {
      if (!get().gameState) set({ error: err.message, loading: false });
    }
  },

  setGameState: (state) => set({ gameState: state }),

  startCooking: async (chefId, slotIndex, dishId) => {
    const result = await gameApi.startCooking({ chefId, slotIndex, dishId });
    set({ gameState: result.state });
    await useTimerStore.getState().fetchTimers();
  },

  collectDish: async (timerId) => {
    const result = await gameApi.collectDish({ timerId });
    set({ gameState: result.state });
    await useTimerStore.getState().fetchTimers();
    if (result.leveledUp) {
      useUIStore.getState().showLevelUp({
        newLevel: result.newLevel,
        unlocks: result.newUnlocks,
        coinsReward: result.coinsReward,
        gemReward: result.gemReward
      });
    }
    return result;
  },

  skipWithGem: async (timerId) => {
    const result = await gameApi.skipWithGem({ timerId });
    set({ gameState: result.state });
    await useTimerStore.getState().fetchTimers();
    return result;
  },

  buyIngredient: async (ingredientId, quantity) => {
    const result = await gameApi.buyIngredient({ ingredientId, quantity });
    set({ gameState: result.state });
    return result;
  },

  seatCustomer: async (tableId) => {
    const result = await gameApi.seatCustomer({ tableId });
    set({ gameState: result.state });
  },

  serveCustomer: async (tableId, dishId) => {
    const result = await gameApi.serveCustomer({ tableId, dishId });
    set({ gameState: result.state });
  },

  collectPayment: async (tableId) => {
    const result = await gameApi.collectPayment({ tableId });
    set({ gameState: result.state });
    if (result.leveledUp) {
      useUIStore.getState().showLevelUp({
        newLevel: result.newLevel,
        unlocks: result.newUnlocks,
        coinsReward: result.coinsReward,
        gemReward: result.gemReward
      });
    }
    return result;
  },

  dismissCustomer: async (tableId) => {
    const result = await gameApi.dismissCustomer({ tableId });
    set({ gameState: result.state });
  },

  hireChef: async (chefId) => {
    const result = await gameApi.hireChef({ chefId });
    set({ gameState: result.state });
  },

  renameRestaurant: async (name) => {
    const result = await gameApi.renameRestaurant({ name });
    set({ gameState: result.state });
  },
}));
