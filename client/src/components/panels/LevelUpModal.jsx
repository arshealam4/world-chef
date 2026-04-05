import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store/useUIStore';
import { useConfigStore } from '../../store/useConfigStore';

export function LevelUpModal() {
  const levelUpData = useUIStore(s => s.levelUpData);
  const hideLevelUp = useUIStore(s => s.hideLevelUp);
  const chefs = useConfigStore(s => s.chefs);
  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    if (levelUpData) {
      const pieces = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.3,
        color: ['#FF6B35', '#FFB347', '#4CAF50', '#9B59B6', '#F39C12', '#FF69B4'][i % 6],
        rotation: Math.random() * 360,
      }));
      setConfetti(pieces);
    }
  }, [levelUpData]);

  if (!levelUpData) return null;

  const getUnlockName = (unlockId) => {
    const chef = chefs.find(c => c.id === unlockId);
    if (chef) return `${chef.emoji} ${chef.name}`;
    if (unlockId === 'extra_table') return '🪑 Extra Table';
    if (unlockId.startsWith('expansion')) return '🏗️ Restaurant Expansion';
    return unlockId;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center"
        onClick={hideLevelUp}
      >
        {/* Confetti */}
        {confetti.map(p => (
          <motion.div
            key={p.id}
            initial={{ x: '50vw', y: '50vh', scale: 0, rotate: 0 }}
            animate={{
              x: `${p.x}vw`,
              y: `${10 + Math.random() * 80}vh`,
              scale: 1,
              rotate: p.rotation,
            }}
            transition={{ duration: 1.2, delay: p.delay, ease: 'easeOut' }}
            className="fixed w-3 h-3 rounded-sm"
            style={{ backgroundColor: p.color, pointerEvents: 'none' }}
          />
        ))}

        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200 }}
          className="bg-white rounded-3xl shadow-2xl p-8 max-w-xs w-full mx-4 text-center"
          onClick={e => e.stopPropagation()}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.3, 1] }}
            transition={{ duration: 0.6, times: [0, 0.6, 1] }}
            className="text-6xl mb-4"
          >
            ⭐
          </motion.div>

          <h2 className="font-fredoka font-bold text-3xl text-orange-500 mb-1">
            Level Up!
          </h2>
          <p className="font-fredoka text-lg text-gray-500 mb-4">
            You reached Level {levelUpData.newLevel}!
          </p>

          {/* Rewards */}
          {(levelUpData.coinsReward > 0 || levelUpData.gemReward > 0) && (
            <div className="flex justify-center gap-4 mb-4">
              {levelUpData.coinsReward > 0 && (
                <div className="bg-yellow-50 px-3 py-1.5 rounded-xl">
                  <span className="text-sm font-semibold text-yellow-700">
                    +{levelUpData.coinsReward} 🪙
                  </span>
                </div>
              )}
              {levelUpData.gemReward > 0 && (
                <div className="bg-purple-50 px-3 py-1.5 rounded-xl">
                  <span className="text-sm font-semibold text-purple-700">
                    +{levelUpData.gemReward} 💎
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Unlocks */}
          {levelUpData.unlocks?.length > 0 && (
            <div className="mb-4 space-y-1">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Unlocked</p>
              {levelUpData.unlocks.map((u, i) => (
                <p key={i} className="text-sm font-medium text-green-600">
                  {getUnlockName(u)}
                </p>
              ))}
            </div>
          )}

          <button
            onClick={hideLevelUp}
            className="w-full py-3 bg-orange-500 text-white font-fredoka font-semibold rounded-xl hover:bg-orange-600 shadow-[0_4px_0_0_#c2410c] active:translate-y-1 active:shadow-[0_2px_0_0_#c2410c]"
          >
            Let's Cook!
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
