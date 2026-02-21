import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight, Lock, Shield, DollarSign, Code, Zap, Eye, Send, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";

// Sample Widget Component
function WidgetPreview({ 
  theme = "light",
  accent = "#18181b",
  title = "Send a Secret",
  buttonText = "Create Message",
  price = "4.99"
}: {
  theme?: "light" | "dark";
  accent?: string;
  title?: string;
  buttonText?: string;
  price?: string;
}) {
  const bgColor = theme === "dark" ? "#18181b" : "#ffffff";
  const textColor = theme === "dark" ? "#fafafa" : "#18181b";
  const mutedColor = theme === "dark" ? "#a1a1aa" : "#71717a";
  const borderColor = theme === "dark" ? "#27272a" : "#e4e4e7";
  
  return (
    <div 
      className="p-6 rounded-lg border-2 transition-all hover:scale-[1.02]"
      style={{ 
        backgroundColor: bgColor, 
        borderColor: borderColor,
        color: textColor 
      }}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div 
            className="w-8 h-8 rounded flex items-center justify-center"
            style={{ backgroundColor: accent }}
          >
            <Lock className="w-4 h-4" style={{ color: theme === "dark" ? "#18181b" : "#ffffff" }} />
          </div>
          <span className="font-semibold">{title}</span>
        </div>
        
        <div 
          className="p-3 rounded border"
          style={{ borderColor: borderColor }}
        >
          <p className="text-sm" style={{ color: mutedColor }}>
            Your message (encrypted)
          </p>
          <div className="mt-2 h-20 rounded" style={{ backgroundColor: theme === "dark" ? "#27272a" : "#f4f4f5" }}></div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: mutedColor }}>
            Unlock price: <strong style={{ color: textColor }}>${price}</strong>
          </span>
        </div>
        
        <button 
          className="w-full py-3 rounded font-medium flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
          style={{ backgroundColor: accent, color: theme === "dark" ? "#18181b" : "#ffffff" }}
        >
          <Send className="w-4 h-4" />
          {buttonText}
        </button>
        
        <p className="text-xs text-center" style={{ color: mutedColor }}>
          Powered by SecretMessage4U
        </p>
      </div>
    </div>
  );
}

export default function Partners() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <a className="text-xl font-semibold tracking-tight">Secret Message</a>
            </Link>
            <Link href="/">
              <a className="text-sm text-muted-foreground hover:text-foreground">← Back to Home</a>
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-border">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <p className="text-sm uppercase tracking-widest text-muted-foreground">Partner Program</p>
            <h1 className="text-5xl sm:text-6xl font-light tracking-tight">
              Secret Partners
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Embed our widget. Set your price. Keep the markup. It's that simple.
            </p>
          </div>
        </section>

        {/* Revenue Model */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-border bg-secondary/30">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 border border-border text-sm mb-4">
                <DollarSign className="w-4 h-4" />
                <span className="font-medium">EARN MONEY</span>
              </div>
              <h2 className="text-3xl font-light">Earn From Every Message</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center p-6 border border-border bg-background">
                <div className="text-4xl font-light mb-2">1</div>
                <h3 className="font-medium mb-2">Embed Widget</h3>
                <p className="text-sm text-muted-foreground">Add our widget to your site with one line of code</p>
              </div>
              <div className="text-center p-6 border border-border bg-background">
                <div className="text-4xl font-light mb-2">2</div>
                <h3 className="font-medium mb-2">Set Your Price</h3>
                <p className="text-sm text-muted-foreground">Choose any unlock price (minimum $0.99)</p>
              </div>
              <div className="text-center p-6 border border-border bg-background">
                <div className="text-4xl font-light mb-2">3</div>
                <h3 className="font-medium mb-2">Keep the Markup</h3>
                <p className="text-sm text-muted-foreground">We take $0.49 flat — you keep the rest</p>
              </div>
            </div>

            <div className="p-8 border border-border bg-background">
              <h3 className="font-medium text-lg mb-4 text-center">Example Earnings</h3>
              <div className="grid sm:grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-muted-foreground text-sm">Your Price</p>
                  <p className="text-3xl font-light">$4.99</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Our Fee</p>
                  <p className="text-3xl font-light">$0.49</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">You Keep</p>
                  <p className="text-3xl font-semibold text-green-500">$4.50</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Widget Showcase */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-border">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 border border-border text-sm mb-4">
                <Palette className="w-4 h-4" />
                <span className="font-medium">WIDGET PREVIEW</span>
              </div>
              <h2 className="text-3xl font-light mb-4">See It In Action</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Customize colors, text, and pricing to match your brand. Here's how it looks:
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {/* Light Theme */}
              <div>
                <p className="text-sm text-muted-foreground mb-3 text-center">Light Theme</p>
                <WidgetPreview 
                  theme="light"
                  accent="#18181b"
                  title="Send a Secret"
                  buttonText="Create Message"
                  price="4.99"
                />
              </div>
              
              {/* Dark Theme */}
              <div>
                <p className="text-sm text-muted-foreground mb-3 text-center">Dark Theme</p>
                <WidgetPreview 
                  theme="dark"
                  accent="#fafafa"
                  title="Send a Secret"
                  buttonText="Create Message"
                  price="4.99"
                />
              </div>
              
              {/* Custom Brand */}
              <div>
                <p className="text-sm text-muted-foreground mb-3 text-center">Custom Brand</p>
                <WidgetPreview 
                  theme="light"
                  accent="#e11d48"
                  title="💋 Spicy Secret"
                  buttonText="Send It"
                  price="9.99"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Creator Example */}
              <div>
                <p className="text-sm text-muted-foreground mb-3 text-center">For Creators</p>
                <WidgetPreview 
                  theme="dark"
                  accent="#8b5cf6"
                  title="✨ Exclusive Content"
                  buttonText="Unlock Now"
                  price="14.99"
                />
              </div>
              
              {/* Business Example */}
              <div>
                <p className="text-sm text-muted-foreground mb-3 text-center">For Business</p>
                <WidgetPreview 
                  theme="light"
                  accent="#0ea5e9"
                  title="🔒 Confidential Tip"
                  buttonText="Submit Securely"
                  price="1.99"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Quick Start */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-border bg-secondary/30">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-8">
              <Code className="w-5 h-5" />
              <h2 className="text-2xl font-light">Embed in 30 Seconds</h2>
            </div>

            <div className="bg-zinc-900 text-zinc-100 p-6 rounded-none font-mono text-sm overflow-x-auto">
              <pre>{`<script
  src="https://secretmessage4u.com/widget/v1/sm-widget.js"
  data-partner-id="YOUR_PARTNER_ID"
  data-price="4.99"
></script>`}</pre>
            </div>

            <div className="mt-8 grid sm:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 mt-0.5 text-muted-foreground" />
                <div>
                  <h3 className="font-medium">Your Price</h3>
                  <p className="text-sm text-muted-foreground">$1.99, $9.99, whatever fits your audience</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Eye className="w-5 h-5 mt-0.5 text-muted-foreground" />
                <div>
                  <h3 className="font-medium">Your Branding</h3>
                  <p className="text-sm text-muted-foreground">Custom colors, title, button text</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Code className="w-5 h-5 mt-0.5 text-muted-foreground" />
                <div>
                  <h3 className="font-medium">Your Analytics</h3>
                  <p className="text-sm text-muted-foreground">Callbacks for every message created</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-border">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-8">
              <Shield className="w-5 h-5" />
              <h2 className="text-2xl font-light">Security & Privacy</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Encryption */}
              <div className="p-6 border border-border bg-background">
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="w-5 h-5" />
                  <h3 className="font-medium text-lg">End-to-End Encryption</h3>
                </div>
                <p className="text-muted-foreground text-sm mb-4">
                  Messages are encrypted the moment they're created. Only the recipient with the unlock key can read them — not us, not the partner site, not anyone else.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-foreground rounded-full"></span>
                    <span><strong>In transit:</strong> TLS 1.3</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-foreground rounded-full"></span>
                    <span><strong>At rest:</strong> AES-256 encryption</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-foreground rounded-full"></span>
                    <span><strong>Keys:</strong> Unique per message, tied to payment</span>
                  </li>
                </ul>
              </div>

              {/* PAL */}
              <div className="p-6 border border-border bg-background">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5" />
                  <h3 className="font-medium text-lg">Payment Abstraction Layer</h3>
                </div>
                <p className="text-muted-foreground text-sm mb-4">
                  Our scaled PAL architecture ensures complete anonymity by separating payment identity from message identity.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-foreground rounded-full"></span>
                    <span><strong>Sender anonymity:</strong> No account required</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-foreground rounded-full"></span>
                    <span><strong>Payment anonymity:</strong> PAL abstracts identity</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-foreground rounded-full"></span>
                    <span><strong>Partner anonymity:</strong> Earn without seeing content</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Architecture Diagram */}
            <div className="mt-8 p-6 border border-border bg-background">
              <h3 className="font-medium mb-4 text-center">Zero-Knowledge Architecture</h3>
              <div className="flex items-center justify-center gap-4 text-sm">
                <div className="text-center">
                  <div className="w-16 h-16 border border-border flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl">👤</span>
                  </div>
                  <p className="text-muted-foreground">Sender</p>
                  <p className="text-xs text-muted-foreground">Encrypted</p>
                </div>
                <div className="text-2xl text-muted-foreground">→</div>
                <div className="text-center">
                  <div className="w-16 h-16 border border-border flex items-center justify-center mx-auto mb-2 bg-secondary">
                    <span className="font-medium">PAL</span>
                  </div>
                  <p className="text-muted-foreground">Payment Layer</p>
                  <p className="text-xs text-muted-foreground">Verified</p>
                </div>
                <div className="text-2xl text-muted-foreground">→</div>
                <div className="text-center">
                  <div className="w-16 h-16 border border-border flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl">👤</span>
                  </div>
                  <p className="text-muted-foreground">Recipient</p>
                  <p className="text-xs text-muted-foreground">Decrypted</p>
                </div>
              </div>
              <p className="text-center text-sm text-muted-foreground mt-6">
                We can't read your secrets. By design, not by policy.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-light">Ready to Earn?</h2>
            <p className="text-muted-foreground">
              Get your Partner ID and start monetizing your audience today.
            </p>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none h-12 px-8">
              Get Your Partner ID
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </section>
      </main>

      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2026 Secret Message
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/privacy">
              <a className="hover:text-foreground">Privacy</a>
            </Link>
            <Link href="/legal-disclaimer">
              <a className="hover:text-foreground">Legal</a>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
