import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export function LoginPage() {
  const [tab, setTab] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);
  const [loading, setLoading] = useState(false);

  const login = useAuthStore(s => s.login);
  const register = useAuthStore(s => s.register);
  const navigate = useNavigate();

  const showError = (msg) => {
    setError(msg);
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (tab === 'login') {
        await login(username, password);
      } else {
        await register(username, password);
      }
      navigate('/game');
    } catch (err) {
      const msg = err.response?.data?.error || 'Something went wrong';
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 mx-4">
        <h1 className="text-4xl font-fredoka font-bold text-orange-500 text-center">
          World Chef
        </h1>
        <p className="text-gray-400 text-center mt-1 text-sm">Open your restaurant!</p>

        {/* Tabs */}
        <div className="flex mt-6 border-b border-gray-200">
          <button
            className={`flex-1 pb-2 text-sm font-semibold transition-colors ${
              tab === 'login'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-gray-400'
            }`}
            onClick={() => { setTab('login'); setError(''); }}
          >
            Login
          </button>
          <button
            className={`flex-1 pb-2 text-sm font-semibold transition-colors ${
              tab === 'register'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-gray-400'
            }`}
            onClick={() => { setTab('register'); setError(''); }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-orange-200 focus:border-orange-400 focus:outline-none transition-colors"
            autoComplete="username"
          />

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-orange-200 focus:border-orange-400 focus:outline-none transition-colors pr-12"
              autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-[0_4px_0_0_#c2410c] active:translate-y-1 active:shadow-[0_2px_0_0_#c2410c] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 mx-auto text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              tab === 'login' ? 'Login' : 'Create Account'
            )}
          </button>

          {error && (
            <p className={`text-red-500 text-sm text-center ${shaking ? 'animate-shake' : ''}`}>
              {error}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
