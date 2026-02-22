import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight, Instagram, Lock, DollarSign, Zap, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function InstaLinkLanding() {
  const [username, setUsername] = useState("");
  const [copied, setCopied] = useState(false);
  
  const generatedLink = username ? `secretmessage4u.com/i/${username.toLowerCase().replace(/[^a-z0-9]/g, '')}` : '';

  const handleCopy = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(`https://${generatedLink}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Nav */}
      <nav className="border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <a className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                  <div className="w-4 h-4 bg-black rounded-sm" />
                </div>
                <span className="text-xl font-semibold">Secret Message</span>
              </a>
            </Link>
            <Link href="/">
              <a className="text-sm text-zinc-400 hover:text-white">← Back</a>
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-zinc-800">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 border border-pink-500/30">
              <Instagram className="w-4 h-4 text-pink-400" />
              <span className="text-sm font-medium text-pink-400">FOR INSTAGRAM CREATORS</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                InstaLink
              </span>
            </h1>
            
            <p className="text-xl text-zinc-400 max-w-xl mx-auto">
              Get paid for anonymous messages. Drop the link in your bio — fans send secrets, you unlock them for cash.
            </p>
          </div>
        </section>

        {/* Link Generator */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-zinc-800">
          <div className="max-w-md mx-auto space-y-6">
            <h2 className="text-2xl font-semibold text-center">Create Your Link</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Your username</label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="yourname"
                  className="bg-zinc-900 border-zinc-700 text-white h-12 text-lg"
                />
              </div>
              
              {username && (
                <div className="p-4 bg-zinc-900 border border-zinc-700 rounded-lg space-y-3">
                  <p className="text-sm text-zinc-400">Your InstaLink:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-pink-400 text-sm break-all">
                      https://{generatedLink}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopy}
                      className="bg-transparent border-zinc-700 hover:bg-zinc-800"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              )}
              
              {username && (
                <Link href={`/i/${username.toLowerCase().replace(/[^a-z0-9]/g, '')}`}>
                  <Button className="w-full h-12 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:opacity-90 text-white font-semibold">
                    Preview Your Page
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-zinc-800">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-center mb-12">How It Works</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center">
                  <Instagram className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg">1. Add to Bio</h3>
                <p className="text-zinc-400 text-sm">
                  Drop your InstaLink in your Instagram bio
                </p>
              </div>
              
              <div className="text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg">2. Fans Send Secrets</h3>
                <p className="text-zinc-400 text-sm">
                  They type anonymous messages — encrypted and private
                </p>
              </div>
              
              <div className="text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg">3. You Get Paid</h3>
                <p className="text-zinc-400 text-sm">
                  Pay to unlock each message — keep 100% of earnings
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-lg">
                <Zap className="w-8 h-8 text-pink-400 mb-4" />
                <h3 className="font-semibold mb-2">No Signup Required</h3>
                <p className="text-zinc-400 text-sm">
                  Just pick a username and start sharing. Your fans don't need accounts either.
                </p>
              </div>
              
              <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-lg">
                <Lock className="w-8 h-8 text-pink-400 mb-4" />
                <h3 className="font-semibold mb-2">100% Anonymous</h3>
                <p className="text-zinc-400 text-sm">
                  Messages are encrypted. You never know who sent them — that's the fun.
                </p>
              </div>
              
              <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-lg">
                <DollarSign className="w-8 h-8 text-pink-400 mb-4" />
                <h3 className="font-semibold mb-2">Set Your Price</h3>
                <p className="text-zinc-400 text-sm">
                  Charge $1, $5, $20 — whatever you want. You control your earnings.
                </p>
              </div>
              
              <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-lg">
                <Instagram className="w-8 h-8 text-pink-400 mb-4" />
                <h3 className="font-semibold mb-2">Made for Instagram</h3>
                <p className="text-zinc-400 text-sm">
                  Mobile-first design. Looks perfect when fans tap your bio link.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-zinc-500">
            © 2026 Secret Message
          </p>
          <div className="flex gap-6 text-sm text-zinc-500">
            <Link href="/partners">
              <a className="hover:text-white">Partners</a>
            </Link>
            <Link href="/privacy">
              <a className="hover:text-white">Privacy</a>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
