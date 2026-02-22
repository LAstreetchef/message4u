import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, Upload, DollarSign, Link as LinkIcon, Copy, Check, Image, FileText, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function InstaLinkCreate() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [step, setStep] = useState<"create" | "success">("create");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "4.99",
    fileUrl: "", // For now, just a URL - later we can add file upload
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.price) {
      toast({
        title: "Missing fields",
        description: "Please fill in title and price",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/instalink/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create link');
      }
      
      setGeneratedLink(`https://secretmessage4u.com/l/${data.slug}`);
      setStep("success");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create link",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            <Link href="/instalink">
              <a className="text-sm text-zinc-400 hover:text-white">← Back</a>
            </Link>
          </div>
        </div>
      </nav>

      <main className="py-12 px-4">
        <div className="max-w-lg mx-auto">
          
          {step === "create" && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">
                  <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                    Create Your InstaLink
                  </span>
                </h1>
                <p className="text-zinc-400">
                  Set up your paid content link in 60 seconds
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Content Title *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Exclusive Photos, Behind the Scenes"
                    className="bg-zinc-900 border-zinc-700 text-white h-12"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description (shown before unlock)</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Tease what they'll get..."
                    className="bg-zinc-900 border-zinc-700 text-white min-h-[80px]"
                  />
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price (USD) *</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <Input
                      type="number"
                      step="0.01"
                      min="0.99"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="bg-zinc-900 border-zinc-700 text-white h-12 pl-10"
                    />
                  </div>
                </div>

                {/* File URL (simple for now) */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Content URL (image, video, or file link)</label>
                  <Input
                    type="url"
                    value={formData.fileUrl}
                    onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                    placeholder="https://..."
                    className="bg-zinc-900 border-zinc-700 text-white h-12"
                  />
                  <p className="text-xs text-zinc-500">Paste a link to your content (Google Drive, Dropbox, etc.)</p>
                </div>

                {/* Content Type Icons */}
                <div className="flex justify-center gap-4 py-4">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto rounded-full bg-zinc-800 flex items-center justify-center mb-1">
                      <Image className="w-5 h-5 text-pink-400" />
                    </div>
                    <span className="text-xs text-zinc-500">Photos</span>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto rounded-full bg-zinc-800 flex items-center justify-center mb-1">
                      <Video className="w-5 h-5 text-pink-400" />
                    </div>
                    <span className="text-xs text-zinc-500">Videos</span>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto rounded-full bg-zinc-800 flex items-center justify-center mb-1">
                      <FileText className="w-5 h-5 text-pink-400" />
                    </div>
                    <span className="text-xs text-zinc-500">Files</span>
                  </div>
                </div>

                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:opacity-90 text-white font-semibold"
                >
                  {isSubmitting ? "Creating..." : "Create Link"}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </form>
            </>
          )}

          {step === "success" && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center">
                <LinkIcon className="w-8 h-8 text-white" />
              </div>
              
              <div>
                <h1 className="text-3xl font-bold mb-2">Your Link is Ready! 🎉</h1>
                <p className="text-zinc-400">
                  Copy this link and paste it in your Instagram bio
                </p>
              </div>

              <div className="p-4 bg-zinc-900 border border-zinc-700 rounded-lg">
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-pink-400 text-sm break-all">
                    {generatedLink}
                  </code>
                  <Button
                    onClick={handleCopy}
                    className="bg-zinc-800 hover:bg-zinc-700"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={() => window.open(generatedLink, '_blank')}
                  variant="outline"
                  className="w-full bg-transparent border-zinc-700 text-white hover:bg-zinc-900"
                >
                  Preview Link
                </Button>
                
                <Button 
                  onClick={() => {
                    setStep("create");
                    setFormData({ title: "", description: "", price: "4.99", fileUrl: "" });
                    setGeneratedLink("");
                  }}
                  variant="ghost"
                  className="w-full text-zinc-400 hover:text-white"
                >
                  Create Another
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
