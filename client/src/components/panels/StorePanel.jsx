import { useState, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { useConfigStore } from '../../store/useConfigStore';
import { useUIStore } from '../../store/useUIStore';
import { gameApi } from '../../api/gameApi';

export function StorePanel() {
  const [tab, setTab] = useState('ingredients');
  const [stock, setStock] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(false);
  const gameState = useGameStore(s => s.gameState);
  const buyIngredient = useGameStore(s => s.buyIngredient);
  const hireChef = useGameStore(s => s.hireChef);
  const chefs = useConfigStore(s => s.chefs);
  const showNotification = useUIStore(s => s.showNotification);

  useEffect(() => {
    gameApi.getMarketStock().then(setStock).catch(() => {});
  }, [gameState?.coins]);

  const handleBuy = async (ingredientId) => {
    const qty = quantities[ingredientId] || 1;
    setLoading(true);
    try {
      await buyIngredient(ingredientId, qty);
      showNotification(`Bought ${qty}!`, 'success');
      setQuantities(q => ({ ...q, [ingredientId]: 1 }));
      const newStock = await gameApi.getMarketStock();
      setStock(newStock);
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed', 'error');
    }
    setLoading(false);
  };

  const handleHire = async (chefId) => {
    setLoading(true);
    try {
      await hireChef(chefId);
      showNotification('Chef hired!', 'success');
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed', 'error');
    }
    setLoading(false);
  };

  const setQty = (id, val) => {
    const item = stock.find(s => s.id === id);
    const max = item ? item.maxQty - item.playerQty : 99;
    setQuantities(q => ({ ...q, [id]: Math.max(1, Math.min(val, max)) }));
  };

  const ownedChefIds = gameState?.chefs?.map(c => c.chefId) || [];

  return (
    <div className="p-4">
      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-orange-100/80 rounded-2xl p-1.5 border border-orange-200/50">
        {['ingredients', 'chefs', 'upgrades'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-xs font-fredoka rounded-xl capitalize transition-all ${
              tab === t ? 'tab-pill-active' : 'tab-pill-inactive'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Coins display */}
      <div className="inline-flex items-center gap-1.5 mb-3 px-3 py-1.5 rounded-full border border-yellow-300/50 shadow-card"
           style={{ background: 'linear-gradient(135deg, #FFF8E1, #FFFDE7)' }}>
        <span>🪙</span>
        <span className="font-fredoka font-bold text-amber-700">{gameState?.coins?.toLocaleString() || 0}</span>
      </div>

      {/* Ingredients tab */}
      {tab === 'ingredients' && (
        <div className="space-y-2">
          {stock.map(item => {
            const qty = quantities[item.id] || 1;
            const cost = qty * item.marketPrice;
            const canAfford = (gameState?.coins || 0) >= cost;
            const canBuy = item.playerQty + qty <= item.maxQty;

            return (
              <div key={item.id} className="card-game p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center">{item.icon}</span>
                    <span className="text-sm font-fredoka font-semibold text-wood">{item.name}</span>
                  </div>
                  <span className="text-xs font-bold bg-orange-100 text-primary rounded-full px-2 py-0.5">
                    {item.playerQty}/{item.maxQty}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setQty(item.id, qty - 1)}
                      className="w-8 h-8 rounded-full bg-white border-2 border-orange-200 text-primary text-sm font-bold active:scale-90 transition-transform"
                    >-</button>
                    <span className="w-8 text-center text-sm font-fredoka font-bold text-wood">{qty}</span>
                    <button
                      onClick={() => setQty(item.id, qty + 1)}
                      className="w-8 h-8 rounded-full bg-white border-2 border-orange-200 text-primary text-sm font-bold active:scale-90 transition-transform"
                    >+</button>
                  </div>
                  <button
                    onClick={() => handleBuy(item.id)}
                    disabled={loading || !canAfford || !canBuy}
                    className={`px-4 py-2 text-xs rounded-xl disabled:opacity-40 ${
                      canAfford && canBuy
                        ? 'btn-3d-gold'
                        : 'bg-gray-200 text-gray-500 font-semibold rounded-xl'
                    }`}
                  >
                    Buy {cost}🪙
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Chefs tab */}
      {tab === 'chefs' && (
        <div className="space-y-2">
          {chefs.filter(c => c.type === 'chef').map(chef => {
            const owned = ownedChefIds.includes(chef.id);
            const levelOk = (gameState?.level || 1) >= chef.unlockLevel;
            const canAfford = (gameState?.coins || 0) >= chef.cost;

            return (
              <div key={chef.id} className="card-game p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">{chef.emoji}</span>
                    <div>
                      <p className="text-sm font-fredoka font-semibold text-wood">{chef.name}</p>
                      <p className="text-xs text-wood-muted">{chef.nationality}</p>
                    </div>
                  </div>
                  {owned ? (
                    <span className="text-xs font-bold text-white px-3 py-1 rounded-full shadow-sm"
                          style={{ background: 'linear-gradient(135deg, #66BB6A, #4CAF50)' }}>
                      Owned
                    </span>
                  ) : !levelOk ? (
                    <span className="text-xs font-bold text-wood-muted bg-gray-100 px-2.5 py-1 rounded-full">
                      Lvl {chef.unlockLevel}
                    </span>
                  ) : (
                    <button
                      onClick={() => handleHire(chef.id)}
                      disabled={loading || !canAfford}
                      className={`px-4 py-2 text-xs rounded-xl disabled:opacity-40 ${
                        canAfford ? 'btn-3d-gold' : 'bg-gray-200 text-gray-500 font-semibold rounded-xl'
                      }`}
                    >
                      Hire {chef.cost}🪙
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upgrades tab */}
      {tab === 'upgrades' && (
        <div className="space-y-3">
          <div className="bg-orange-50 rounded-xl p-4 text-center">
            <p className="text-lg">📦</p>
            <p className="text-sm font-medium text-gray-700">Storage Upgrade</p>
            <p className="text-xs text-gray-400 mt-1">
              Ingredients: {gameState?.ingredientStorageCap || 50} slots
            </p>
            <p className="text-xs text-gray-400">
              Dishes: {gameState?.dishStorageCap || 30} slots
            </p>
            <p className="text-xs text-orange-400 mt-2">Coming soon</p>
          </div>
          <div className="bg-orange-50 rounded-xl p-4 text-center">
            <p className="text-lg">🏗️</p>
            <p className="text-sm font-medium text-gray-700">Expand Restaurant</p>
            <p className="text-xs text-gray-400 mt-1">
              Level {gameState?.expansionLevel || 1}
            </p>
            <p className="text-xs text-orange-400 mt-2">Coming soon</p>
          </div>
        </div>
      )}
    </div>
  );
}
