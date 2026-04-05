import { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { useConfigStore } from '../../store/useConfigStore';

export function StoragePanel() {
  const [tab, setTab] = useState('ingredients');
  const gameState = useGameStore(s => s.gameState);
  const ingredients = useConfigStore(s => s.ingredients);
  const dishes = useConfigStore(s => s.dishes);

  const ingStorage = gameState?.ingredientStorage || {};
  const dishStorageMap = gameState?.dishStorage || {};
  const ingCap = gameState?.ingredientStorageCap || 50;
  const dishCap = gameState?.dishStorageCap || 30;

  const ingEntries = Object.entries(ingStorage).filter(([, qty]) => qty > 0);
  const dishEntries = Object.entries(dishStorageMap).filter(([, qty]) => qty > 0);
  const ingTotal = ingEntries.reduce((a, [, q]) => a + q, 0);
  const dishTotal = dishEntries.reduce((a, [, q]) => a + q, 0);

  const capBarColor = (used, cap) => {
    const pct = used / cap;
    if (pct > 0.9) return 'bg-red-500';
    if (pct > 0.7) return 'bg-orange-500';
    return 'bg-green-500';
  };

  return (
    <div className="p-4">
      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-orange-100/80 rounded-2xl p-1.5 border border-orange-200/50">
        <button
          onClick={() => setTab('ingredients')}
          className={`flex-1 py-2 text-xs font-fredoka rounded-xl transition-all ${
            tab === 'ingredients' ? 'tab-pill-active' : 'tab-pill-inactive'
          }`}
        >
          Ingredients
        </button>
        <button
          onClick={() => setTab('dishes')}
          className={`flex-1 py-2 text-xs font-fredoka rounded-xl transition-all ${
            tab === 'dishes' ? 'tab-pill-active' : 'tab-pill-inactive'
          }`}
        >
          Dishes
        </button>
      </div>

      {tab === 'ingredients' && (
        <>
          {/* Cap bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs font-fredoka font-semibold text-wood-muted mb-1">
              <span>Storage</span>
              <span>{ingTotal} / {ingCap}</span>
            </div>
            <div className="w-full h-3 bg-orange-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${capBarColor(ingTotal, ingCap).replace('bg-red-500','progress-fill-red').replace('bg-orange-500','progress-fill-orange').replace('bg-green-500','progress-fill-green')}`}
                style={{ width: `${Math.min(100, (ingTotal / ingCap) * 100)}%` }}
              />
            </div>
          </div>

          {ingEntries.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">
              No items yet — buy from the market!
            </p>
          ) : (
            <div className="space-y-1">
              {ingEntries.map(([id, qty]) => {
                const def = ingredients.find(i => i.id === id);
                return (
                  <div key={id} className="flex items-center justify-between py-2.5 px-3 card-game">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">{def?.icon || '📦'}</span>
                      <span className="text-sm font-fredoka font-semibold text-wood">{def?.name || id}</span>
                    </div>
                    <span className="text-xs font-bold bg-primary/10 text-primary rounded-full px-2.5 py-0.5">x{qty}</span>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {tab === 'dishes' && (
        <>
          <div className="mb-3">
            <div className="flex justify-between text-xs font-fredoka font-semibold text-wood-muted mb-1">
              <span>Dishes</span>
              <span>{dishTotal} / {dishCap}</span>
            </div>
            <div className="w-full h-3 bg-orange-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${capBarColor(dishTotal, dishCap).replace('bg-red-500','progress-fill-red').replace('bg-orange-500','progress-fill-orange').replace('bg-green-500','progress-fill-green')}`}
                style={{ width: `${Math.min(100, (dishTotal / dishCap) * 100)}%` }}
              />
            </div>
          </div>

          {dishEntries.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">
              No cooked dishes yet — start cooking!
            </p>
          ) : (
            <div className="space-y-1">
              {dishEntries.map(([id, qty]) => {
                const def = dishes.find(d => d.id === id);
                return (
                  <div key={id} className="flex items-center justify-between py-2.5 px-3 card-game">
                    <div className="flex items-center gap-2">
                      <span>{def?.emoji || '🍽️'}</span>
                      <span className="text-sm text-gray-700">{def?.name || id}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-600">x{qty}</span>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
