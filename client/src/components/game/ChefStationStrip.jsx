import { useGameStore } from '../../store/useGameStore';
import { useConfigStore } from '../../store/useConfigStore';
import { useTimerStore } from '../../store/useTimerStore';
import { useUIStore } from '../../store/useUIStore';

const CHEF_COLORS = {
  grill_helper:      '#E8A87C', dough_helper:      '#F5DEB3',
  stove_helper:      '#B0C4DE', milk_helper:       '#FFF8DC',
  american_chef:     '#FF8C69', antipasti_chef:    '#98D8A0',
  italian_chef:      '#FF6347', japanese_chef:     '#FF69B4',
  mexican_chef:      '#32CD32', indian_chef:       '#FFA500',
  spanish_chef:      '#FFD700', arabian_chef:      '#DEB887',
  french_chef:       '#87CEEB', cupcake_chef:      '#FFB6C1',
  german_chef:       '#D2B48C', vegetarian_chef:   '#90EE90',
  chinese_chef:      '#FF4500', vietnam_chef:      '#98FB98',
  scandinavian_chef: '#ADD8E6', thai_chef:         '#FFD700',
  greek_chef:        '#87CEEB', korean_chef:       '#FFA07A',
  russian_chef:      '#DDA0DD', brazilian_chef:    '#32CD32',
  english_chef:      '#F0E68C',
};

export function ChefStationStrip() {
  const gameState = useGameStore(s => s.gameState);
  const chefs = useConfigStore(s => s.chefs);
  const timers = useTimerStore(s => s.timers);
  const openPanel = useUIStore(s => s.openPanel);

  const ownedChefs = gameState?.chefs || [];
  if (ownedChefs.length === 0) return null;

  const getActiveCount = (chefId) =>
    timers.filter(t => t.chefId === chefId && !t.completed).length;

  return (
    <div
      className="flex-shrink-0 overflow-x-auto overflow-y-hidden"
      style={{
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        background: 'linear-gradient(180deg, #F5E6C8 0%, #EDD9B8 100%)',
        borderBottom: '3px solid #C8A04A',
      }}
    >
      {/* Hide scrollbar with CSS */}
      <style>{`.chef-strip::-webkit-scrollbar { display: none; }`}</style>
      <div className="chef-strip flex gap-1 p-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {ownedChefs.map(c => {
          const def = chefs.find(d => d.id === c.chefId);
          if (!def) return null;
          const color = CHEF_COLORS[c.chefId] || '#CCCCCC';
          const activeCount = getActiveCount(c.chefId);

          return (
            <button
              key={c.chefId}
              onClick={() => openPanel('chef', { chefId: c.chefId })}
              className="flex-shrink-0 flex flex-col items-center justify-center rounded-xl active:scale-95 transition-transform duration-100 relative"
              style={{
                width: 80,
                height: 80,
                background: `linear-gradient(145deg, ${color}dd, ${color}aa)`,
                border: `2px solid ${color}88`,
                boxShadow: `0 3px 0 0 ${color}66, 0 4px 8px rgba(0,0,0,0.1)`,
              }}
            >
              <span className="text-2xl leading-none drop-shadow-sm">{def.emoji}</span>
              {/* Slot dots */}
              <div className="flex gap-0.5 mt-1">
                {Array.from({ length: c.slots }, (_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-white/70 border border-white/30" />
                ))}
              </div>
              {/* Active cooking badge */}
              {activeCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center shadow-sm border border-white">
                  {activeCount}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
