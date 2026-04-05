import { AnimatePresence, motion } from 'framer-motion';
import { useUIStore } from '../../store/useUIStore';

const STYLES = {
  success: { bg: 'linear-gradient(135deg, #66BB6A, #4CAF50)', border: 'rgba(76,175,80,0.3)', icon: '✓' },
  error:   { bg: 'linear-gradient(135deg, #EF5350, #E53935)', border: 'rgba(229,57,53,0.3)', icon: '!' },
  info:    { bg: 'linear-gradient(135deg, #FF8C42, #FF6B35)', border: 'rgba(255,107,53,0.3)', icon: '★' },
};

export function Notification() {
  const notification = useUIStore(s => s.notification);

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ y: -60, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -60, opacity: 0, scale: 0.9 }}
          className="fixed top-16 left-1/2 -translate-x-1/2 z-[90] px-5 py-2.5 rounded-2xl shadow-2xl text-white text-sm font-fredoka font-bold flex items-center gap-2"
          style={{
            background: (STYLES[notification.type] || STYLES.info).bg,
            border: `1.5px solid ${(STYLES[notification.type] || STYLES.info).border}`,
            backdropFilter: 'blur(4px)',
          }}
        >
          <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
            {(STYLES[notification.type] || STYLES.info).icon}
          </span>
          {notification.message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
