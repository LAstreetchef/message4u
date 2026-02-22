import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { Lock, Unlock, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InstaLinkData {
  id: string;
  slug: string;
  title: string;
  description?: string;
  price: string;
  unlocked: boolean;
  fileUrl?: string;
  creatorName?: string;
}

export default function InstaLinkView() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<InstaLinkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLink();
  }, [slug]);

  const fetchLink = async () => {
    try {
      const response = await fetch(`/api/instalink/${slug}`);
      if (!response.ok) {
        throw new Error('Link not found');
      }
      const linkData = await response.json();
      setData(linkData);
    } catch (err: any) {
      setError(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    setPaying(true);
    try {
      const response = await fetch(`/api/instalink/${slug}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      
      if (result.checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = result.checkoutUrl;
      } else if (result.unlocked) {
        // Already unlocked or free
        setData(prev => prev ? { ...prev, unlocked: true, fileUrl: result.fileUrl } : null);
      }
    } catch (err) {
      setError('Payment failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-400" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Link Not Found</h1>
          <p className="text-zinc-400">This link doesn't exist or has expired.</p>
          <Link href="/">
            <Button variant="outline" className="border-zinc-700">
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="p-4 border-b border-zinc-800">
        <div className="max-w-md mx-auto flex items-center justify-center gap-2">
          <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
            <div className="w-3 h-3 bg-black rounded-sm" />
          </div>
          <span className="text-sm font-medium text-zinc-400">secretmessage4u</span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6">
          
          {!data.unlocked ? (
            // Locked state
            <>
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 p-[3px]">
                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                    <Lock className="w-8 h-8 text-pink-400" />
                  </div>
                </div>
                
                <div>
                  <h1 className="text-2xl font-bold">{data.title}</h1>
                  {data.description && (
                    <p className="text-zinc-400 mt-2">{data.description}</p>
                  )}
                </div>
              </div>

              <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl text-center space-y-4">
                <div>
                  <p className="text-zinc-400 text-sm">Unlock this content for</p>
                  <p className="text-4xl font-bold mt-1">${data.price}</p>
                </div>
                
                <Button 
                  onClick={handlePay}
                  disabled={paying}
                  className="w-full h-12 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:opacity-90 text-white font-semibold"
                >
                  {paying ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Unlock className="w-4 h-4 mr-2" />
                      Pay & Unlock
                    </>
                  )}
                </Button>
                
                <p className="text-xs text-zinc-500">
                  Secure payment via Stripe
                </p>
              </div>
            </>
          ) : (
            // Unlocked state
            <>
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-green-500 to-emerald-500 p-[3px]">
                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                    <Unlock className="w-8 h-8 text-green-400" />
                  </div>
                </div>
                
                <div>
                  <h1 className="text-2xl font-bold">Content Unlocked! 🎉</h1>
                  <p className="text-zinc-400 mt-2">{data.title}</p>
                </div>
              </div>

              <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl text-center space-y-4">
                {data.fileUrl && (
                  <Button 
                    onClick={() => window.open(data.fileUrl, '_blank')}
                    className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90 text-white font-semibold"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Content
                  </Button>
                )}
                
                <p className="text-xs text-zinc-500">
                  Thank you for your purchase!
                </p>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center">
        <a 
          href="/instalink" 
          className="text-xs text-zinc-600 hover:text-zinc-400"
        >
          Create your own InstaLink → secretmessage4u.com
        </a>
      </footer>
    </div>
  );
}
