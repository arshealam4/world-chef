import { create } from 'zustand';

export const useUIStore = create((set) => ({
  activePanel: null,
  activePanelData: {},
  notification: null,
  levelUpData: null,

  openPanel:  (panel, data = {}) => set({ activePanel: panel, activePanelData: data }),
  closePanel: ()                 => set({ activePanel: null,  activePanelData: {} }),

  showNotification: (message, type = 'info') => {
    set({ notification: { message, type } });
    setTimeout(() => set({ notification: null }), 3000);
  },

  showLevelUp: (data) => set({ levelUpData: data }),
  hideLevelUp: ()     => set({ levelUpData: null }),
}));
