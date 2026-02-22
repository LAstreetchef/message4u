import { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, Upload, DollarSign, Link as LinkIcon, Copy, Check, Image, FileText, Video, X, Loader2, Eye, Clock, Bomb, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

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
    fileUrl: "",
    // Disappearing options
    maxViews: null as number | null,
    deleteAfterMinutes: null as number | null,
  });
  const [showDisappearingOptions, setShowDisappearingOptions] = useState(false);
  const [disappearingMode, setDisappearingMode] = useState<"none" | "views" | "timer">("none");
  const [uploadedFile, setUploadedFile] = useState<{ name: string; url: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Get upload URL
      const uploadRes = await fetch('/api/instalink/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      
      if (!uploadRes.ok) throw new Error('Failed to get upload URL');
      
      const { uploadURL } = await uploadRes.json();
      
      // Upload file
      const uploadResult = await fetch(uploadURL, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        body: file
      });
      
      if (!uploadResult.ok) throw new Error('Upload failed');
      
      const { fileUrl } = await uploadResult.json();
      
      setUploadedFile({ name: file.name, url: fileUrl });
      setFormData(prev => ({ ...prev, fileUrl }));
      
      toast({
        title: "File uploaded!",
        description: file.name
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Please try again or paste a URL instead",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setFormData(prev => ({ ...prev, fileUrl: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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
                    Create Your{' '}
                  </span>
                  <span style={{color: '#833AB4'}}>I</span>
                  <span style={{color: '#C13584'}}>n</span>
                  <span style={{color: '#E1306C'}}>s</span>
                  <span style={{color: '#F77737'}}>t</span>
                  <span style={{color: '#FCAF45'}}>a</span>
                  <span className="text-white">Link</span>
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

                {/* File Upload */}
                <div className="space-y-4">
                  <label className="text-sm font-medium">Your Content *</label>
                  
                  {!uploadedFile ? (
                    <div className="space-y-3">
                      {/* Upload Button */}
                      <div 
                        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
                          ${isUploading ? 'border-pink-500 bg-pink-500/10' : 'border-zinc-700 hover:border-pink-500/50'}`}
                        onClick={() => !isUploading && fileInputRef.current?.click()}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          onChange={handleFileChange}
                          accept="image/*,video/*,.pdf,.doc,.docx,.zip"
                          className="hidden"
                        />
                        {isUploading ? (
                          <>
                            <Loader2 className="w-10 h-10 mx-auto text-pink-400 animate-spin mb-3" />
                            <p className="text-sm text-zinc-400">Uploading...</p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-10 h-10 mx-auto text-zinc-500 mb-3" />
                            <p className="text-sm font-medium mb-1">Click to upload</p>
                            <p className="text-xs text-zinc-500">Photos, videos, PDFs, or any file (max 10MB)</p>
                          </>
                        )}
                      </div>
                      
                      {/* Or paste URL */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-zinc-800" />
                        <span className="text-xs text-zinc-500">or paste a link</span>
                        <div className="flex-1 h-px bg-zinc-800" />
                      </div>
                      
                      <Input
                        type="url"
                        value={formData.fileUrl}
                        onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                        placeholder="https://drive.google.com/..."
                        className="bg-zinc-900 border-zinc-700 text-white h-12"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4 bg-zinc-900 border border-zinc-700 rounded-xl">
                      <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-pink-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{uploadedFile.name}</p>
                        <p className="text-xs text-green-400">Uploaded ✓</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={removeFile}
                        className="text-zinc-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Content Type Icons */}
                <div className="flex justify-center gap-6 py-2">
                  <div className="text-center">
                    <Image className="w-6 h-6 mx-auto text-zinc-600 mb-1" />
                    <span className="text-xs text-zinc-600">Photos</span>
                  </div>
                  <div className="text-center">
                    <Video className="w-6 h-6 mx-auto text-zinc-600 mb-1" />
                    <span className="text-xs text-zinc-600">Videos</span>
                  </div>
                  <div className="text-center">
                    <FileText className="w-6 h-6 mx-auto text-zinc-600 mb-1" />
                    <span className="text-xs text-zinc-600">Files</span>
                  </div>
                </div>

                {/* Disappearing Content Options */}
                <div className="border border-zinc-800 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowDisappearingOptions(!showDisappearingOptions)}
                    className="w-full flex items-center justify-between p-4 hover:bg-zinc-900/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                        <Bomb className="w-5 h-5 text-pink-400" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Disappearing Content</p>
                        <p className="text-xs text-zinc-500">Auto-delete after views or time</p>
                      </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-zinc-500 transition-transform ${showDisappearingOptions ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showDisappearingOptions && (
                    <div className="border-t border-zinc-800 p-4 space-y-4">
                      {/* View Limit */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Eye className="w-5 h-5 text-zinc-500" />
                          <div>
                            <p className="text-sm font-medium">View Limit</p>
                            <p className="text-xs text-zinc-500">Delete after X views</p>
                          </div>
                        </div>
                        <Switch
                          checked={disappearingMode === "views"}
                          onCheckedChange={(checked) => {
                            setDisappearingMode(checked ? "views" : "none");
                            if (!checked) setFormData(prev => ({ ...prev, maxViews: null }));
                          }}
                        />
                      </div>
                      
                      {disappearingMode === "views" && (
                        <div className="pl-8">
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="1"
                              max="100"
                              value={formData.maxViews || ""}
                              onChange={(e) => setFormData({ ...formData, maxViews: parseInt(e.target.value) || null })}
                              placeholder="1"
                              className="bg-zinc-900 border-zinc-700 text-white h-10 w-24"
                            />
                            <span className="text-sm text-zinc-400">views max</span>
                          </div>
                          <p className="text-xs text-zinc-500 mt-2">Content disappears after this many views</p>
                        </div>
                      )}

                      {/* Timer */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-zinc-500" />
                          <div>
                            <p className="text-sm font-medium">Self-Destruct Timer</p>
                            <p className="text-xs text-zinc-500">Delete after first view</p>
                          </div>
                        </div>
                        <Switch
                          checked={disappearingMode === "timer"}
                          onCheckedChange={(checked) => {
                            setDisappearingMode(checked ? "timer" : "none");
                            if (!checked) setFormData(prev => ({ ...prev, deleteAfterMinutes: null }));
                          }}
                        />
                      </div>
                      
                      {disappearingMode === "timer" && (
                        <div className="pl-8">
                          <div className="flex items-center gap-2">
                            <select
                              value={formData.deleteAfterMinutes || ""}
                              onChange={(e) => setFormData({ ...formData, deleteAfterMinutes: parseInt(e.target.value) || null })}
                              className="bg-zinc-900 border border-zinc-700 text-white h-10 px-3 rounded-md"
                            >
                              <option value="">Select time</option>
                              <option value="1">1 minute</option>
                              <option value="5">5 minutes</option>
                              <option value="15">15 minutes</option>
                              <option value="30">30 minutes</option>
                              <option value="60">1 hour</option>
                              <option value="1440">24 hours</option>
                              <option value="10080">7 days</option>
                            </select>
                            <span className="text-sm text-zinc-400">after first view</span>
                          </div>
                          <p className="text-xs text-zinc-500 mt-2">Timer starts when content is first opened</p>
                        </div>
                      )}
                    </div>
                  )}
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
