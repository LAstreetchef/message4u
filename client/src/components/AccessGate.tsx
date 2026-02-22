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
  const [error, setError] = useState("");
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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

        {/* Access Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
              autoFocus
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-white text-zinc-900 font-semibold rounded-lg hover:bg-zinc-100 transition-colors"
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
