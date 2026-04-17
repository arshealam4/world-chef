import { useEffect, useCallback } from 'react';
import { audioManager } from '../utils/audioManager';
import { useGameStore } from '../store/useGameStore';
import { useConfigStore } from '../store/useConfigStore';
import { useTimerStore } from '../store/useTimerStore';
import { useUIStore } from '../store/useUIStore';
import { useResponsiveCanvas } from '../hooks/useResponsiveCanvas';
import { useAutoSave } from '../hooks/useAutoSave';
import { gameApi } from '../api/gameApi';
import { HUD } from '../components/layout/HUD';
import { BottomNav } from '../components/layout/BottomNav';
import { Notification } from '../components/layout/Notification';
import { GameCanvas } from '../game/GameCanvas';
import { PanelOverlay } from '../components/panels/PanelOverlay';
import { LevelUpModal } from '../components/panels/LevelUpModal';
import { ChefPanel } from '../components/panels/ChefPanel';
import { StoragePanel } from '../components/panels/StoragePanel';
import { StorePanel } from '../components/panels/StorePanel';
import { ProfilePanel } from '../components/panels/ProfilePanel';
import { ServePanel } from '../components/panels/ServePanel';
import { ChefStationStrip } from '../components/game/ChefStationStrip';

export function GamePage() {
  const loadGame     = useGameStore(s => s.loadGame);
  const loading      = useGameStore(s => s.loading);
  const gameState    = useGameStore(s => s.gameState);
  const setGameState = useGameStore(s => s.setGameState);
  const seatCustomer = useGameStore(s => s.seatCustomer);
  const loadConfig   = useConfigStore(s => s.loadConfig);
  const configLoaded = useConfigStore(s => s.loaded);
  const fetchTimers  = useTimerStore(s => s.fetchTimers);
  const tickTimers   = useTimerStore(s => s.tick);
  const activePanel     = useUIStore(s => s.activePanel);
  const activePanelData = useUIStore(s => s.activePanelData);
  const { isPhone, leftPanelWidth, rightPanelWidth } = useResponsiveCanvas();

  useAutoSave();

  // Initial load
  useEffect(() => { loadGame(); loadConfig(); }, []);

  // Timer polling
  useEffect(() => {
    fetchTimers();
    const pollInterval = setInterval(fetchTimers, 10000);
    const tickInterval = setInterval(tickTimers, 1000);
    return () => { clearInterval(pollInterval); clearInterval(tickInterval); };
  }, []);

  // Periodically refresh game state for customer spawning
  useEffect(() => {
    const interval = setInterval(() => { loadGame(); }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Auto-seat customers from queue
  useEffect(() => {
    if (!gameState) return;
    const hasQueue = gameState.customerQueue?.length > 0;
    const emptyTable = gameState.tables?.find(t => t.state === 'empty');
    if (hasQueue && emptyTable) {
      seatCustomer(emptyTable.tableId);
    }
  }, [gameState?.customerQueue?.length]);

  if (loading || !gameState || !configLoaded) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-amber-50">
        <div className="text-center">
          <div className="text-5xl animate-bounce mb-4">🍳</div>
          <p className="text-orange-400 font-fredoka text-xl">Opening your restaurant…</p>
        </div>
      </div>
    );
  }

  // Get the right panel component for desktop sidebar
  const panelKey = `${activePanel}-${activePanelData?.chefId || activePanelData?.tableId || ''}`;
  const getSidebarPanel = (panelId) => {
    switch (panelId) {
      case 'chef':    return <ChefPanel key={panelKey} />;
      case 'serve':   return <ServePanel key={panelKey} />;
      case 'store':   return <StorePanel />;
      case 'storage': return <StoragePanel />;
      case 'profile': return <ProfilePanel />;
      default:        return null;
    }
  };

  // ── PHONE LAYOUT ──
  if (isPhone) {
    return (
      <div className="flex flex-col bg-amber-50 overflow-hidden"
           style={{ height: '100dvh', width: '100vw' }}
           onClick={audioManager.unlock.bind(audioManager)}>
        <HUD />
        <ChefStationStrip />
        <div className="flex-1 relative overflow-hidden">
          <GameCanvas />
        </div>
        <BottomNav />
        <PanelOverlay />
        <LevelUpModal />
        <Notification />
      </div>
    );
  }

  // ── LAPTOP LAYOUT ──
  return (
    <div className="flex flex-col bg-amber-50 overflow-hidden"
         style={{ height: '100dvh', width: '100vw' }}
         onClick={audioManager.unlock.bind(audioManager)}>
      <HUD />
      <ChefStationStrip />
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <div className="bg-orange-50 border-r border-orange-200 overflow-y-auto flex-shrink-0"
             style={{ width: leftPanelWidth }}>
          {activePanel === 'chef' || activePanel === 'serve' ? (
            getSidebarPanel(activePanel)
          ) : (
            <div className="p-3">
              <p className="text-orange-400 font-fredoka text-sm text-center mt-8">
                Tap a chef station or table
              </p>
            </div>
          )}
        </div>

        {/* Center — game canvas */}
        <div className="flex-1 relative overflow-hidden bg-amber-100">
          <GameCanvas />
        </div>

        {/* Right sidebar */}
        <div className="bg-orange-50 border-l border-orange-200 overflow-y-auto flex-shrink-0"
             style={{ width: rightPanelWidth }}>
          {activePanel === 'storage' || activePanel === 'store' || activePanel === 'profile' ? (
            getSidebarPanel(activePanel)
          ) : (
            <StoragePanel />
          )}
        </div>
      </div>
      <LevelUpModal />
      <Notification />
    </div>
  );
}
