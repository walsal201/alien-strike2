import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, AlertTriangle } from 'lucide-react';

const ACCESS_CODE = 'Alpha@188305';

const Auth = () => {
  const [accessCode, setAccessCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode) return;

    setIsLoading(true);
    setError('');

    // Short delay for effect
    setTimeout(() => {
      if (accessCode === ACCESS_CODE) {
        sessionStorage.setItem('tactical_session', 'authenticated');
        sessionStorage.setItem('tactical_auth_time', Date.now().toString());
        navigate('/');
      } else {
        setError('ACCESS DENIED — INVALID CODE');
        setIsLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="h-full w-full" style={{
          backgroundImage: 'linear-gradient(rgba(34, 197, 94, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 197, 94, 0.3) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-800 border-4 border-green-500 rounded-full mb-4 animate-pulse">
            <Shield className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-mono font-bold text-green-500 tracking-wider">
            TACTICAL COMMAND
          </h1>
          <p className="text-gray-500 font-mono text-sm mt-2">
            SECURE ACCESS REQUIRED
          </p>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="bg-gray-800 border-2 border-green-600 p-6 space-y-6">
          <div className="border-b-2 border-gray-700 pb-4">
            <h2 className="text-green-400 font-mono font-bold flex items-center gap-2">
              <Lock className="w-4 h-4" />
              ENTER ACCESS CODE
            </h2>
          </div>

          {error && (
            <div className="bg-red-900/50 border-2 border-red-500 p-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className="text-red-400 font-mono text-sm">{error}</span>
            </div>
          )}

          <div>
            <input
              type="password"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="ENTER CODE..."
              className="w-full bg-gray-900 border-2 border-green-600 text-green-400 font-mono text-lg p-4 text-center tracking-widest placeholder:text-gray-600 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20"
              autoFocus
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !accessCode}
            className={`w-full py-4 font-mono font-bold text-lg tracking-wider border-2 transition-all ${
              isLoading || !accessCode
                ? 'bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 border-green-400 text-white hover:bg-green-500 hover:shadow-lg hover:shadow-green-500/30'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                AUTHENTICATING...
              </span>
            ) : (
              '🔐 AUTHENTICATE'
            )}
          </button>

          <div className="text-center">
            <p className="text-gray-600 font-mono text-xs">
              ENCRYPTED CONNECTION • AES-256
            </p>
          </div>
        </form>

        {/* Footer Warning */}
        <div className="mt-6 text-center">
          <p className="text-red-500 font-mono text-xs animate-pulse">
            ⚠️ UNAUTHORIZED ACCESS IS PROHIBITED ⚠️
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
