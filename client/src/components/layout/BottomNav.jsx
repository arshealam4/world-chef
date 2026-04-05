import { useUIStore } from '../../store/useUIStore';

const TABS = [
  { id: 'chef',    icon: '🍳', label: 'Cook' },
  { id: 'storage', icon: '📦', label: 'Storage' },
  { id: 'store',   icon: '🏪', label: 'Shop' },
  { id: 'profile', icon: '👤', label: 'Profile' },
];

export function BottomNav() {
  const activePanel = useUIStore(s => s.activePanel);
  const openPanel = useUIStore(s => s.openPanel);
  const closePanel = useUIStore(s => s.closePanel);

  const handleTap = (id) => {
    if (activePanel === id) {
      closePanel();
    } else {
      openPanel(id);
    }
  };

  return (
    <div
      className="safe-bottom flex-shrink-0 border-t-2 flex"
      style={{
        height: 64,
        borderColor: '#F0D9C8',
        background: 'linear-gradient(to top, #FFF8F0, #FFFFFF)',
        boxShadow: '0 -4px 16px rgba(61,43,31,0.08)',
      }}
    >
      {TABS.map(tab => {
        const isActive = activePanel === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => handleTap(tab.id)}
            className="flex-1 flex flex-col items-center justify-center active:scale-95 transition-transform duration-100"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-0.5 transition-all duration-150 ${
              isActive
                ? 'shadow-[0_3px_0_0_#C2410C] active:shadow-[0_1px_0_0_#C2410C] active:translate-y-[1px]'
                : 'bg-gray-100/60'
            }`}
              style={isActive ? { background: 'linear-gradient(to bottom, #FF8C42, #FF6B35)' } : {}}
            >
              <span className={`text-xl leading-none ${isActive ? 'drop-shadow-sm' : ''}`}>
                {tab.icon}
              </span>
            </div>
            <span
              className={`font-fredoka ${isActive ? 'font-bold' : 'font-medium'}`}
              style={{ color: isActive ? '#FF6B35' : '#9E8070', fontSize: 10 }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
