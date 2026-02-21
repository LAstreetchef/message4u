import { useState } from "react";
import { useParams } from "wouter";
import { Lock, Send, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

// Simple creator configs (in production, fetch from API)
const CREATOR_CONFIGS: Record<string, {
  displayName: string;
  handle: string;
  avatar?: string;
  price: string;
  prompt: string;
}> = {
  demo: {
    displayName: "Demo Creator",
    handle: "@demo",
    price: "4.99",
    prompt: "Send me an anonymous message 👀"
  }
};

const DEFAULT_CONFIG = {
  displayName: "Creator",
  handle: "@creator",
  price: "4.99",
  prompt: "Send me a secret message"
};

export default function InstaLink() {
  const { username } = useParams<{ username: string }>();
  const config = CREATOR_CONFIGS[username || ""] || { 
    ...DEFAULT_CONFIG, 
    displayName: username || "Creator",
    handle: `@${username || "creator"}`
  };
  
  const [step, setStep] = useState<"compose" | "email" | "success">("compose");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = () => {
    if (message.trim()) {
      setStep("email");
    }
  };

  const handleSend = async () => {
    if (!email.trim()) return;
    setIsSubmitting(true);
    
    // Simulate - in production, create the message via API
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setStep("success");
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header - Instagram style */}
      <header className="p-4 border-b border-zinc-800">
        <div className="max-w-md mx-auto flex items-center justify-center gap-2">
          <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
            <div className="w-3 h-3 bg-black rounded-sm" />
          </div>
          <span className="text-sm font-medium text-zinc-400">secretmessage4u</span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6">
          
          {/* Creator Info */}
          <div className="text-center space-y-3">
            {/* Avatar placeholder */}
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-[3px]">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-2xl">
                {config.displayName.charAt(0).toUpperCase()}
              </div>
            </div>
            <div>
              <h1 className="text-xl font-semibold">{config.displayName}</h1>
              <p className="text-zinc-500 text-sm">{config.handle}</p>
            </div>
            <p className="text-zinc-300">{config.prompt}</p>
          </div>

          {/* Step: Compose */}
          {step === "compose" && (
            <div className="space-y-4">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your secret message..."
                className="min-h-[140px] bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 resize-none rounded-xl"
              />
              
              <div className="flex items-center justify-between text-sm text-zinc-500">
                <span>🔒 Anonymous & encrypted</span>
                <span>${config.price} to unlock</span>
              </div>

              <Button 
                onClick={handleNext}
                disabled={!message.trim()}
                className="w-full h-12 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:opacity-90 text-white font-semibold rounded-xl"
              >
                Continue
              </Button>
            </div>
          )}

          {/* Step: Email */}
          {step === "email" && (
            <div className="space-y-4">
              <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800">
                <p className="text-sm text-zinc-400 mb-1">Your message:</p>
                <p className="text-white">{message.length > 100 ? message.slice(0, 100) + "..." : message}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Their email (to receive unlock link)</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="creator@email.com"
                  className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 rounded-xl h-12"
                />
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline"
                  onClick={() => setStep("compose")}
                  className="flex-1 h-12 bg-transparent border-zinc-700 text-white hover:bg-zinc-900 rounded-xl"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleSend}
                  disabled={!email.trim() || isSubmitting}
                  className="flex-1 h-12 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:opacity-90 text-white font-semibold rounded-xl"
                >
                  {isSubmitting ? "Sending..." : `Send · $${config.price}`}
                </Button>
              </div>
            </div>
          )}

          {/* Step: Success */}
          {step === "success" && (
            <div className="text-center space-y-4 py-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center">
                <Send className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-xl font-semibold">Secret Sent! 🎉</h2>
              <p className="text-zinc-400">
                {config.displayName} will receive an email with a link to pay ${config.price} and unlock your message.
              </p>
              <Button 
                onClick={() => {
                  setStep("compose");
                  setMessage("");
                  setEmail("");
                }}
                variant="outline"
                className="bg-transparent border-zinc-700 text-white hover:bg-zinc-900 rounded-xl"
              >
                Send Another
              </Button>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center">
        <a 
          href="/partners" 
          className="text-xs text-zinc-600 hover:text-zinc-400"
        >
          Create your own link → secretmessage4u.com
        </a>
      </footer>
    </div>
  );
}
