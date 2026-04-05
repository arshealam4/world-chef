import { useState } from 'react';
import { useUIStore } from '../../store/useUIStore';
import { useGameStore } from '../../store/useGameStore';
import { useConfigStore } from '../../store/useConfigStore';
import { useTimerStore } from '../../store/useTimerStore';

function formatTime(ms) {
  if (ms <= 0) return 'Ready!';
  const totalSecs = Math.ceil(ms / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
}

export function ChefPanel() {
  const activePanelData = useUIStore(s => s.activePanelData);
  const openPanel = useUIStore(s => s.openPanel);
  const showNotification = useUIStore(s => s.showNotification);
  const gameState = useGameStore(s => s.gameState);
  const startCooking = useGameStore(s => s.startCooking);
  const collectDish = useGameStore(s => s.collectDish);
  const skipWithGem = useGameStore(s => s.skipWithGem);
  const chefs = useConfigStore(s => s.chefs);
  const dishes = useConfigStore(s => s.dishes);
  const timers = useTimerStore(s => s.timers);
  const ticks = useTimerStore(s => s.ticks);
  const [loading, setLoading] = useState(false);

  const { chefId } = activePanelData;
  const chefDef = chefs.find(c => c.id === chefId);
  const chefData = gameState?.chefs?.find(c => c.chefId === chefId);

  // No specific chef selected — show owned chef list
  if (!chefDef || !chefData) {
    const ownedChefs = (gameState?.chefs || []).map(c => ({
      ...c,
      def: chefs.find(d => d.id === c.chefId)
    })).filter(c => c.def);

    const getActiveTimerCount = (cId) =>
      timers.filter(t => t.chefId === cId && !t.completed).length;

    return (
      <div className="p-4">
        <h2 className="font-fredoka font-semibold text-lg text-gray-800 mb-3">Your Chefs</h2>
        <div className="space-y-2">
          {ownedChefs.map(c => {
            const activeCount = getActiveTimerCount(c.chefId);
            return (
              <button
                key={c.chefId}
                onClick={() => openPanel('chef', { chefId: c.chefId })}
                className="w-full flex items-center gap-3 p-3.5 card-game hover:shadow-card-lg text-left transition-all border-l-4 border-l-primary active:scale-[0.98]"
              >
                <span className="text-2xl w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">{c.def.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-fredoka font-semibold text-wood truncate">{c.def.name}</p>
                  <p className="text-xs text-wood-muted">
                    {c.slots} slot{c.slots > 1 ? 's' : ''}
                    {activeCount > 0 && <span className="text-primary font-bold ml-1">· {activeCount} cooking</span>}
                  </p>
                </div>
                <span className="text-primary text-lg font-bold">›</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const chefDishes = dishes.filter(d => d.chefId === chefId);
  const storage = gameState?.ingredientStorage || {};

  const canCookDish = (dish) => {
    for (const [ingId, qty] of Object.entries(dish.requires)) {
      if ((storage[ingId] || 0) < qty) return false;
    }
    return true;
  };

  const getSlotTimer = (slotIndex) =>
    timers.find(t => t.chefId === chefId && t.slotIndex === slotIndex && !t.completed);

  const handleStartCooking = async (dishId, slotIndex) => {
    setLoading(true);
    try {
      await startCooking(chefId, slotIndex, dishId);
      showNotification('Cooking started!', 'success');
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed', 'error');
    }
    setLoading(false);
  };

  const handleCollect = async (timerId) => {
    setLoading(true);
    try {
      await collectDish(timerId);
      showNotification('Collected!', 'success');
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed', 'error');
    }
    setLoading(false);
  };

  const handleSkip = async (timerId) => {
    setLoading(true);
    try {
      await skipWithGem(timerId);
      showNotification('Skipped with gems!', 'success');
    } catch (err) {
      showNotification(err.response?.data?.error || 'Not enough gems', 'error');
    }
    setLoading(false);
  };

  // Find first empty slot
  const emptySlots = [];
  for (let i = 0; i < chefData.slots; i++) {
    if (!getSlotTimer(i)) emptySlots.push(i);
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl w-11 h-11 bg-orange-100 rounded-2xl flex items-center justify-center shadow-card">{chefDef.emoji}</span>
        <h2 className="font-fredoka font-bold text-lg text-wood">{chefDef.name}</h2>
      </div>

      {/* Slots */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {Array.from({ length: chefData.slots }, (_, i) => {
          const timer = getSlotTimer(i);
          if (!timer) {
            return (
              <div key={i} className="border-2 border-dashed border-orange-200/50 rounded-2xl p-3 text-center" style={{ background: 'linear-gradient(135deg, rgba(255,248,240,0.5), rgba(255,255,255,0.3))' }}>
                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-300 flex items-center justify-center mx-auto mb-1 text-lg font-bold">+</div>
                <p className="text-wood-muted text-xs">Slot {i + 1}</p>
              </div>
            );
          }

          const dish = dishes.find(d => d.id === timer.dishId);
          const remaining = ticks[timer.timerId] ?? 0;
          const total = new Date(timer.finishesAt) - new Date(timer.startedAt);
          const progress = total > 0 ? Math.min(1, 1 - remaining / total) : 1;
          const ready = remaining <= 0;
          const gemCost = Math.max(1, Math.ceil(remaining / 60000));

          return (
            <div key={i} className="card-game p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <span>{dish?.emoji || '🍽️'}</span>
                <span className="text-sm font-fredoka font-semibold text-wood truncate">{dish?.name || timer.dishId}</span>
              </div>
              <p className={`text-xs font-bold ${ready ? 'text-success' : 'text-primary'}`}>
                {formatTime(remaining)}
              </p>
              <div className="w-full h-2.5 bg-orange-100 rounded-full mt-1 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${ready ? 'progress-fill-green' : 'progress-fill-orange'}`}
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              {ready ? (
                <button
                  onClick={() => handleCollect(timer.timerId)}
                  disabled={loading}
                  className="w-full mt-2 py-2 btn-3d-green text-xs"
                >
                  Collect
                </button>
              ) : (
                <button
                  onClick={() => handleSkip(timer.timerId)}
                  disabled={loading}
                  className="w-full mt-2 py-2 btn-3d-purple text-xs"
                >
                  Skip {gemCost}💎
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Available dishes */}
      {emptySlots.length > 0 && (
        <>
          <h3 className="font-fredoka font-semibold text-sm text-wood-muted mb-2">Available dishes:</h3>
          <div className="space-y-2">
            {chefDishes.map(dish => {
              const canCook = canCookDish(dish);
              return (
                <button
                  key={dish.id}
                  onClick={() => canCook && handleStartCooking(dish.id, emptySlots[0])}
                  disabled={!canCook || loading}
                  className={`w-full flex items-center gap-2.5 p-3 rounded-2xl text-left transition-all active:scale-[0.98] ${
                    canCook
                      ? 'card-game hover:shadow-card-lg'
                      : 'bg-gray-50 border border-gray-100 opacity-40'
                  }`}
                >
                  <span className="text-xl w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center">{dish.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-fredoka font-semibold text-wood truncate">{dish.name}</p>
                    <p className="text-xs text-wood-muted">
                      {Object.entries(dish.requires).map(([k, v]) => `${k}×${v}`).join(', ')}
                    </p>
                  </div>
                  <span className="text-xs font-bold bg-orange-100 text-primary rounded-full px-2 py-0.5">{formatTime(dish.cookTimeSeconds * 1000)}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
