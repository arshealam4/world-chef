import { AnimatePresence, motion } from 'framer-motion';
import { useUIStore } from '../../store/useUIStore';
import { ChefPanel } from './ChefPanel';
import { ServePanel } from './ServePanel';
import { StorePanel } from './StorePanel';
import { StoragePanel } from './StoragePanel';
import { ProfilePanel } from './ProfilePanel';

const PANEL_COMPONENTS = {
  chef:    ChefPanel,
  serve:   ServePanel,
  store:   StorePanel,
  storage: StoragePanel,
  profile: ProfilePanel,
};

export function PanelOverlay() {
  const activePanel = useUIStore(s => s.activePanel);
  const closePanel = useUIStore(s => s.closePanel);

  const PanelContent = activePanel ? PANEL_COMPONENTS[activePanel] : null;

  return (
    <AnimatePresence>
      {activePanel && PanelContent && (
        <>
          {/* Dim backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40"
            onClick={closePanel}
          />

          {/* Bottom sheet */}
          <motion.div
            key="panel"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50"
            style={{ maxHeight: '80vh', overflow: 'auto' }}
          >
            {/* Drag handle */}
            <div className="w-10 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 mb-2" />
            <PanelContent />
            {/* Bottom padding for safe area */}
            <div className="safe-bottom" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
