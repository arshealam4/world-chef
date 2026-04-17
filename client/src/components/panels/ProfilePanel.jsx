import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useGameStore } from '../../store/useGameStore';
import { useUIStore } from '../../store/useUIStore';
import { gameApi } from '../../api/gameApi';
import { audioManager } from '../../utils/audioManager';

export function ProfilePanel() {
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const gameState = useGameStore(s => s.gameState);
  const renameRestaurant = useGameStore(s => s.renameRestaurant);
  const showNotification = useUIStore(s => s.showNotification);
  const closePanel = useUIStore(s => s.closePanel);

  const [speed, setSpeed] = useState(1);
  const [sound, setSound] = useState(() => audioManager.soundEnabled);
  const [music, setMusic] = useState(() => audioManager.musicEnabled);
  const [restName, setRestName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setRestName(gameState?.restaurantName || 'My Restaurant');
  }, [gameState?.restaurantName]);

  // Speed: 1x=1.0, 2x=0.5, 3x=0.33, 4x=0.25 multiplier
  const speedToMultiplier = (s) => 1 / s;

  const handleSpeedChange = async (newSpeed) => {
    setSpeed(newSpeed);
    try {
      await gameApi.updateSettings({ cookTimeMultiplier: speedToMultiplier(newSpeed) });
      showNotification(`Cook speed: ${newSpeed}x`, 'success');
    } catch {
      showNotification('Failed to update', 'error');
    }
  };

  const handleSoundToggle = () => {
    const val = !sound;
    setSound(val);
    audioManager.setSoundEnabled(val);
    gameApi.updateSettings({ soundEnabled: val }).catch(() => {});
  };

  const handleMusicToggle = () => {
    const val = !music;
    setMusic(val);
    audioManager.setMusicEnabled(val);
    gameApi.updateSettings({ musicEnabled: val }).catch(() => {});
  };

  const handleRename = async () => {
    if (!restName.trim()) return;
    setLoading(true);
    try {
      await renameRestaurant(restName.trim());
      showNotification('Restaurant renamed!', 'success');
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed', 'error');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    closePanel();
  };

  return (
    <div className="p-4 space-y-4">
      {/* Account */}
      <div className="card-game p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-md"
               style={{ background: 'linear-gradient(135deg, #FF8C42, #FF6B35)' }}>
            👤
          </div>
          <div>
            <p className="font-fredoka font-bold text-wood text-base">{user?.username}</p>
            <p className="text-xs text-wood-muted font-semibold">
              Level {gameState?.level} · {gameState?.popularity || 0} popularity
            </p>
          </div>
        </div>
      </div>

      {/* Cook Speed */}
      <div className="card-game p-4">
        <p className="text-xs text-wood-muted font-semibold uppercase tracking-wide mb-2">Cook Speed</p>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4].map(s => (
            <button
              key={s}
              onClick={() => handleSpeedChange(s)}
              className={`flex-1 py-2.5 text-sm font-fredoka font-bold rounded-xl transition-all ${
                speed === s
                  ? 'btn-3d-orange'
                  : 'bg-white text-wood-muted border-2 border-orange-200 hover:border-primary/50'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
        <p className="text-xs text-wood-muted mt-2">Affects future cooking timers</p>
      </div>

      {/* Sound & Music */}
      <div className="card-game p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-fredoka font-semibold text-wood">Sound Effects</span>
          <button onClick={handleSoundToggle} className="toggle-track" style={{ background: sound ? 'linear-gradient(135deg, #FF8C42, #FF6B35)' : '#D1D5DB' }}>
            <div className={`toggle-thumb ${sound ? 'left-[26px]' : 'left-1'}`} />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-fredoka font-semibold text-wood">Music</span>
          <button onClick={handleMusicToggle} className="toggle-track" style={{ background: music ? 'linear-gradient(135deg, #FF8C42, #FF6B35)' : '#D1D5DB' }}>
            <div className={`toggle-thumb ${music ? 'left-[26px]' : 'left-1'}`} />
          </button>
        </div>
      </div>

      {/* Restaurant Name */}
      <div className="card-game p-4">
        <p className="text-xs text-wood-muted font-semibold uppercase tracking-wide mb-2">Restaurant Name</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={restName}
            onChange={e => setRestName(e.target.value)}
            maxLength={30}
            className="flex-1 px-3 py-2.5 rounded-xl border-2 border-orange-200 text-sm font-fredoka focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <button
            onClick={handleRename}
            disabled={loading}
            className="px-4 py-2.5 btn-3d-orange text-sm"
          >
            Save
          </button>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full py-3 text-red-500 text-sm font-fredoka font-bold border-2 border-red-200 rounded-2xl hover:bg-red-50 transition-colors"
      >
        Logout
      </button>
    </div>
  );
}
