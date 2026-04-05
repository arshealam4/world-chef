import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import { gameApi } from '../api/gameApi';

export function useAutoSave() {
  const gameState = useGameStore(s => s.gameState);
  const timerRef  = useRef(null);

  useEffect(() => {
    if (!gameState) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        await gameApi.saveState(gameState);
      } catch (err) {
        console.error('Autosave failed:', err);
      }
    }, 5000);
    return () => clearTimeout(timerRef.current);
  }, [gameState]);
}
