import { useState } from "react";
import { AnimatedLogo } from "./AnimatedLogo";

const ACCESS_KEY = "sm4u_access";
const VALID_EMAIL = "vendor@secretmessage4u.com";

export function useAccessGate() {
  const [hasAccess, setHasAccess] = useState(() => {
    return localStorage.getItem(ACCESS_KEY) === "granted";
  });

  const grantAccess = () => {
    localStorage.setItem(ACCESS_KEY, "granted");
    setHasAccess(true);
  };

  return { hasAccess, grantAccess };
}

interface AccessGateProps {
  onAccessGranted: () => void;
}

export function AccessGate({ onAccessGranted }: AccessGateProps) {
  const [email, setEmail] = useState("");
  const [isOver18, setIsOver18] = useState(false);
  const [error, setError] = useState("");
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isOver18) {
      setError("You must confirm you are 18 or older to access this site.");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }
    
    if (email.toLowerCase().trim() === VALID_EMAIL) {
      localStorage.setItem(ACCESS_KEY, "granted");
      onAccessGranted();
    } else {
      setError("Invalid access code. Please use the email provided to you.");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
      <div className={`w-full max-w-sm ${isShaking ? 'animate-shake' : ''}`}>
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <AnimatedLogo size={80} variant="dark" />
          <h1 className="mt-4 text-2xl font-bold text-white tracking-tight">
            SecretMessage4U
          </h1>
          <p className="mt-2 text-zinc-400 text-sm text-center">
            Vendor Access Portal
          </p>
        </div>

        {/* 18+ Warning */}
        <div className="mb-6 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
          <div className="flex items-center gap-3 text-amber-500 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
              <path d="M12 9v4"/>
              <path d="M12 17h.01"/>
            </svg>
            <span className="font-semibold text-lg">18+ Only</span>
          </div>
          <p className="text-zinc-400 text-sm">
            This site contains adult content. You must be 18 years or older to enter.
          </p>
        </div>

        {/* Access Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Age Verification Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                checked={isOver18}
                onChange={(e) => {
                  setIsOver18(e.target.checked);
                  setError("");
                }}
                className="sr-only peer"
              />
              <div className="w-5 h-5 border-2 border-zinc-600 rounded bg-zinc-900 peer-checked:bg-white peer-checked:border-white transition-all flex items-center justify-center">
                {isOver18 && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#18181b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </div>
            </div>
            <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">
              I confirm that I am <strong>18 years of age or older</strong> and agree to view adult content
            </span>
          </label>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
              Enter your access email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="email@example.com"
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition-all"
              autoComplete="email"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={!isOver18}
            className="w-full py-3 bg-white text-zinc-900 font-semibold rounded-lg hover:bg-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Access Site
          </button>
        </form>

        <p className="mt-6 text-xs text-zinc-600 text-center">
          Contact support if you need access credentials
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
