import { useGameStore } from '../../store/useGameStore';

const XP_THRESHOLDS = [0, 50, 150, 300, 500, 800, 1200, 1800, 2700, 4000];

function getXpPercent(xp, level) {
  const idx = Math.min(level, XP_THRESHOLDS.length - 1);
  const prev = XP_THRESHOLDS[idx - 1] || 0;
  const next = XP_THRESHOLDS[idx] || XP_THRESHOLDS[XP_THRESHOLDS.length - 1];
  if (next <= prev) return 100;
  return Math.min(((xp - prev) / (next - prev)) * 100, 100);
}

export function HUD() {
  const gameState = useGameStore(s => s.gameState);
  if (!gameState) return null;

  const { coins = 0, gems = 0, level = 1, xp = 0, restaurantName = 'My Restaurant' } = gameState;
  const xpPercent = getXpPercent(xp, level);

  return (
    <div className="safe-top flex-shrink-0 relative"
         style={{ background: 'linear-gradient(135deg, #FF6B35, #FF8C42)' }}>
      <div className="flex items-center justify-between px-3" style={{ height: 56 }}>
        {/* Restaurant name */}
        <h1 className="text-white font-fredoka font-bold text-lg truncate max-w-[160px]"
            style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
          {restaurantName}
        </h1>

        {/* Stat badges */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 rounded-full px-3 py-1 border border-yellow-300/30 backdrop-blur-sm"
               style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.4), rgba(251,191,36,0.15))', boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.2)' }}>
            <span className="text-sm">🪙</span>
            <span className="text-white text-xs font-bold" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>{coins.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 rounded-full px-3 py-1 border border-purple-300/30 backdrop-blur-sm"
               style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.4), rgba(168,85,247,0.15))', boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.2)' }}>
            <span className="text-sm">💎</span>
            <span className="text-white text-xs font-bold" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>{gems}</span>
          </div>
          <div className="flex items-center gap-1 rounded-full px-3 py-1 border border-white/30 backdrop-blur-sm"
               style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.35), rgba(255,255,255,0.1))', boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.2)' }}>
            <span className="text-sm">⭐</span>
            <span className="text-white text-xs font-bold" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>{level}</span>
          </div>
        </div>
      </div>

      {/* XP progress bar */}
      <div className="w-full rounded-b" style={{ height: 6, background: 'rgba(0,0,0,0.15)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${xpPercent}%`, background: 'linear-gradient(90deg, #FFC66D, #FFFFFF)' }}
        />
      </div>
    </div>
  );
}
