import { create } from 'zustand';
import axios from 'axios';

export const useConfigStore = create((set) => ({
  chefs:       [],
  dishes:      [],
  ingredients: [],
  loaded:      false,

  loadConfig: async () => {
    const [chefsRes, dishesRes, ingredientsRes] = await Promise.all([
      axios.get('/api/game/config/chefs'),
      axios.get('/api/game/config/dishes'),
      axios.get('/api/game/config/ingredients'),
    ]);
    set({
      chefs:       chefsRes.data,
      dishes:      dishesRes.data,
      ingredients: ingredientsRes.data,
      loaded:      true,
    });
  },

  getChef:       (id) => useConfigStore.getState().chefs.find(c => c.id === id),
  getDish:       (id) => useConfigStore.getState().dishes.find(d => d.id === id),
  getIngredient: (id) => useConfigStore.getState().ingredients.find(i => i.id === id),
}));
