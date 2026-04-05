import { useState } from 'react';
import { useUIStore } from '../../store/useUIStore';
import { useGameStore } from '../../store/useGameStore';
import { useConfigStore } from '../../store/useConfigStore';

export function ServePanel() {
  const activePanelData = useUIStore(s => s.activePanelData);
  const closePanel = useUIStore(s => s.closePanel);
  const showNotification = useUIStore(s => s.showNotification);
  const gameState = useGameStore(s => s.gameState);
  const serveCustomer = useGameStore(s => s.serveCustomer);
  const collectPayment = useGameStore(s => s.collectPayment);
  const dismissCustomer = useGameStore(s => s.dismissCustomer);
  const dishes = useConfigStore(s => s.dishes);
  const [loading, setLoading] = useState(false);

  const { tableId } = activePanelData;
  const table = gameState?.tables?.find(t => t.tableId === tableId);
  if (!table) return null;

  const dishStorage = gameState?.dishStorage || {};
  const orderedDish = dishes.find(d => d.id === table.orderedDish);

  const handleServe = async (dishId) => {
    setLoading(true);
    try {
      await serveCustomer(tableId, dishId);
      showNotification('Dish served!', 'success');
      closePanel();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed', 'error');
    }
    setLoading(false);
  };

  const handleCollect = async () => {
    setLoading(true);
    try {
      const result = await collectPayment(tableId);
      showNotification(`+${result.coinsEarned} coins!`, 'success');
      closePanel();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed', 'error');
    }
    setLoading(false);
  };

  const handleDismiss = async () => {
    setLoading(true);
    try {
      await dismissCustomer(tableId);
      showNotification('Customer dismissed', 'info');
      closePanel();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed', 'error');
    }
    setLoading(false);
  };

  // Served state — collect payment
  if (table.state === 'served') {
    return (
      <div className="p-4">
        <h2 className="font-fredoka font-bold text-lg text-wood mb-2">
          {table.tableId.replace('_', ' ')} — Done eating!
        </h2>
        <p className="text-wood-muted text-sm mb-4 flex items-center gap-1">
          {table.isVIP && <span className="text-xs font-bold text-white px-2.5 py-0.5 rounded-full shadow-sm inline-flex items-center gap-1" style={{ background: 'linear-gradient(135deg, #FFC107, #FF9800)' }}>👑 VIP</span>}
          Ready to pay
        </p>
        <button
          onClick={handleCollect}
          disabled={loading}
          className="w-full py-3 btn-3d-gold text-base animate-pulse-soft"
        >
          Collect Payment 💰
        </button>
      </div>
    );
  }

  // Occupied state — serve dish
  if (table.state === 'occupied') {
    const availableDishes = Object.entries(dishStorage).filter(([, qty]) => qty > 0);

    return (
      <div className="p-4">
        <h2 className="font-fredoka font-bold text-lg text-wood mb-1">
          {table.tableId.replace('_', ' ')}
          {table.isVIP && <span className="ml-2 text-xs font-bold text-white px-2.5 py-0.5 rounded-full shadow-sm" style={{ background: 'linear-gradient(135deg, #FFC107, #FF9800)' }}>👑 VIP</span>}
        </h2>
        <div className="card-game p-3 mb-4">
          <p className="text-xs text-wood-muted uppercase tracking-wide mb-1 font-semibold">Order</p>
          <p className="text-sm font-fredoka font-bold text-wood">{orderedDish?.emoji} {orderedDish?.name || table.orderedDish}</p>
        </div>

        {availableDishes.length > 0 ? (
          <div className="space-y-2 mb-4">
            <h3 className="text-sm text-gray-600 font-medium">Your dishes:</h3>
            {availableDishes.map(([dishId, qty]) => {
              const dish = dishes.find(d => d.id === dishId);
              const isMatch = dishId === table.orderedDish;
              return (
                <button
                  key={dishId}
                  onClick={() => isMatch && handleServe(dishId)}
                  disabled={!isMatch || loading}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all active:scale-[0.98] ${
                    isMatch
                      ? 'card-game border-2 border-primary ring-2 ring-primary/20'
                      : 'bg-gray-50 border border-gray-200 opacity-40 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{dish?.emoji || '🍽️'}</span>
                    <span className={`text-sm font-medium ${isMatch ? 'text-orange-700' : 'text-gray-600'}`}>
                      {dish?.name || dishId}
                    </span>
                    <span className="text-xs text-gray-400">x{qty}</span>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    isMatch ? 'btn-3d-orange' : 'bg-gray-200 text-gray-600 rounded-full'
                  }`}>
                    Serve
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400 text-sm mb-4 text-center py-4">
            No cooked dishes available. Cook something first!
          </p>
        )}

        <button
          onClick={handleDismiss}
          disabled={loading}
          className="w-full py-2 text-red-400 text-sm hover:text-red-500 disabled:opacity-50"
        >
          Dismiss Customer
        </button>
      </div>
    );
  }

  // Empty table
  return (
    <div className="p-4 text-center py-8">
      <p className="text-4xl mb-2 opacity-30">🪑</p>
      <p className="text-wood-muted font-fredoka font-semibold">{table.tableId.replace('_', ' ')} — Empty</p>
      <p className="text-wood-muted/60 text-sm mt-1">Waiting for customers...</p>
    </div>
  );
}
