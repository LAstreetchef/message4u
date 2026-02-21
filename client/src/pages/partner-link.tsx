import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { Lock, Send, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

// Partner configurations (in production, fetch from API)
const PARTNER_CONFIGS: Record<string, {
  name: string;
  title: string;
  description: string;
  price: string;
  accent: string;
  theme: "light" | "dark";
  buttonText: string;
}> = {
  demo: {
    name: "Demo Partner",
    title: "Send Me a Secret",
    description: "Send an anonymous message. I'll pay to unlock it.",
    price: "4.99",
    accent: "#18181b",
    theme: "light",
    buttonText: "Send Secret"
  },
  creator: {
    name: "Creator",
    title: "✨ Send Me Something Spicy",
    description: "Anonymous messages welcome. Make it worth my while 😏",
    price: "9.99",
    accent: "#e11d48",
    theme: "light", 
    buttonText: "Send It"
  },
  vip: {
    name: "VIP",
    title: "🔒 Confidential Tips",
    description: "Share insider info anonymously. Encryption guaranteed.",
    price: "14.99",
    accent: "#8b5cf6",
    theme: "dark",
    buttonText: "Submit Tip"
  }
};

const DEFAULT_CONFIG = {
  name: "Partner",
  title: "Send a Secret Message",
  description: "Send an anonymous, encrypted message.",
  price: "4.99",
  accent: "#18181b",
  theme: "light" as const,
  buttonText: "Create Message"
};

export default function PartnerLink() {
  const { partnerId } = useParams<{ partnerId: string }>();
  const config = PARTNER_CONFIGS[partnerId || ""] || DEFAULT_CONFIG;
  const { toast } = useToast();
  
  const [step, setStep] = useState<"form" | "success">("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const bgColor = config.theme === "dark" ? "#18181b" : "#fafafa";
  const textColor = config.theme === "dark" ? "#fafafa" : "#18181b";
  const mutedColor = config.theme === "dark" ? "#a1a1aa" : "#71717a";
  const cardBg = config.theme === "dark" ? "#27272a" : "#ffffff";
  const borderColor = config.theme === "dark" ? "#3f3f46" : "#e4e4e7";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate submission - in production, this would create the message
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setStep("success");
    setIsSubmitting(false);
  };

  if (step === "success") {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: bgColor }}
      >
        <div 
          className="w-full max-w-md p-8 text-center space-y-6 border"
          style={{ backgroundColor: cardBg, borderColor, color: textColor }}
        >
          <div 
            className="w-16 h-16 mx-auto rounded-lg flex items-center justify-center"
            style={{ backgroundColor: config.accent }}
          >
            <Send className="w-8 h-8" style={{ color: config.theme === "dark" ? "#18181b" : "#fafafa" }} />
          </div>
          <h1 className="text-2xl font-semibold">Secret Sent!</h1>
          <p style={{ color: mutedColor }}>
            Your message has been encrypted and sent. The recipient will need to pay ${config.price} to unlock it.
          </p>
          <Button 
            onClick={() => setStep("form")}
            className="w-full"
            style={{ backgroundColor: config.accent, color: config.theme === "dark" ? "#18181b" : "#fafafa" }}
          >
            Send Another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {/* Header */}
      <header className="p-4 border-b" style={{ borderColor }}>
        <div className="max-w-md mx-auto flex items-center gap-2">
          <div 
            className="w-8 h-8 rounded flex items-center justify-center"
            style={{ backgroundColor: config.accent }}
          >
            <div 
              className="w-4 h-4 rounded-sm"
              style={{ backgroundColor: config.theme === "dark" ? "#18181b" : "#fafafa" }}
            />
          </div>
          <span className="font-semibold">Secret Message</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Partner Info */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-semibold">{config.title}</h1>
            <p style={{ color: mutedColor }}>{config.description}</p>
          </div>

          {/* Message Form */}
          <form 
            onSubmit={handleSubmit}
            className="p-6 border space-y-4"
            style={{ backgroundColor: cardBg, borderColor }}
          >
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Secret Message</label>
              <Textarea
                required
                placeholder="Type your message here..."
                className="min-h-[120px] resize-none"
                style={{ 
                  backgroundColor: config.theme === "dark" ? "#18181b" : "#f4f4f5",
                  borderColor,
                  color: textColor
                }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Recipient Email</label>
              <Input
                required
                type="email"
                placeholder="who@example.com"
                style={{ 
                  backgroundColor: config.theme === "dark" ? "#18181b" : "#f4f4f5",
                  borderColor,
                  color: textColor
                }}
              />
              <p className="text-xs" style={{ color: mutedColor }}>
                They'll receive a link to pay and unlock your message
              </p>
            </div>

            <div 
              className="flex items-center justify-between p-3 border"
              style={{ borderColor, backgroundColor: config.theme === "dark" ? "#18181b" : "#f4f4f5" }}
            >
              <span className="text-sm" style={{ color: mutedColor }}>Unlock Price</span>
              <span className="text-lg font-semibold">${config.price}</span>
            </div>

            <Button 
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 text-base font-medium"
              style={{ 
                backgroundColor: config.accent, 
                color: config.theme === "dark" ? "#18181b" : "#fafafa" 
              }}
            >
              {isSubmitting ? (
                "Sending..."
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  {config.buttonText}
                </>
              )}
            </Button>

            <p className="text-xs text-center" style={{ color: mutedColor }}>
              🔒 End-to-end encrypted • Anonymous • Secure
            </p>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 border-t text-center" style={{ borderColor }}>
        <p className="text-sm" style={{ color: mutedColor }}>
          Powered by{" "}
          <Link href="/">
            <a className="underline" style={{ color: textColor }}>SecretMessage4U</a>
          </Link>
        </p>
      </footer>
    </div>
  );
}
