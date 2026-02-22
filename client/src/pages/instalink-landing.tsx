import { Link } from "wouter";
import { ArrowRight, Instagram, Lock, DollarSign, Zap, Image, Video, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InstaLinkLanding() {
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
              Sell photos, videos, and files directly from your Instagram bio. One link. Instant payments.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-zinc-800">
          <div className="max-w-md mx-auto text-center space-y-6">
            <h2 className="text-2xl font-semibold">Ready to Start Earning?</h2>
            <p className="text-zinc-400">Create your first paid link in under 60 seconds</p>
            
            <Link href="/instalink/create">
              <Button className="h-14 px-8 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:opacity-90 text-white font-semibold text-lg">
                Create Your Link
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-zinc-800">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-center mb-12">How It Works</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg">1. Upload Content</h3>
                <p className="text-zinc-400 text-sm">
                  Add your photo, video, or file and set your price
                </p>
              </div>
              
              <div className="text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center">
                  <Instagram className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg">2. Share the Link</h3>
                <p className="text-zinc-400 text-sm">
                  Drop the link in your bio — fans tap to view
                </p>
              </div>
              
              <div className="text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg">3. Get Paid Instantly</h3>
                <p className="text-zinc-400 text-sm">
                  Fans pay to unlock — money goes straight to you
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What You Can Sell */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-zinc-800">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-center mb-12">What You Can Sell</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-lg text-center">
                <Image className="w-10 h-10 text-pink-400 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Photos</h3>
                <p className="text-zinc-400 text-sm">
                  Exclusive pics, behind-the-scenes, premium content
                </p>
              </div>
              
              <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-lg text-center">
                <Video className="w-10 h-10 text-pink-400 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Videos</h3>
                <p className="text-zinc-400 text-sm">
                  Tutorials, vlogs, exclusive clips
                </p>
              </div>
              
              <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-lg text-center">
                <FileText className="w-10 h-10 text-pink-400 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Files</h3>
                <p className="text-zinc-400 text-sm">
                  PDFs, guides, presets, templates
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
                <h3 className="font-semibold mb-2">No Account Needed</h3>
                <p className="text-zinc-400 text-sm">
                  Create links instantly. Fans pay without signing up.
                </p>
              </div>
              
              <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-lg">
                <DollarSign className="w-8 h-8 text-pink-400 mb-4" />
                <h3 className="font-semibold mb-2">Keep More Money</h3>
                <p className="text-zinc-400 text-sm">
                  Low fees. No monthly charges. You keep most of what you earn.
                </p>
              </div>
              
              <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-lg">
                <Lock className="w-8 h-8 text-pink-400 mb-4" />
                <h3 className="font-semibold mb-2">Secure Payments</h3>
                <p className="text-zinc-400 text-sm">
                  Powered by Stripe. Credit cards, Apple Pay, Google Pay.
                </p>
              </div>
              
              <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-lg">
                <Instagram className="w-8 h-8 text-pink-400 mb-4" />
                <h3 className="font-semibold mb-2">Made for Instagram</h3>
                <p className="text-zinc-400 text-sm">
                  Mobile-first. Looks perfect when fans tap your bio link.
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
