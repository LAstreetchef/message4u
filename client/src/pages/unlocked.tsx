import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Unlock, Sparkles, Download, FileIcon } from "lucide-react";
import { ConfettiEffect } from "@/components/ConfettiEffect";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Message } from "@shared/schema";
import { Button } from "@/components/ui/button";

export default function Unlocked() {
  const [, params] = useRoute("/m/:slug/unlocked");
  const [showConfetti, setShowConfetti] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  const { data: message, isLoading, error } = useQuery<Message>({
    queryKey: ["/api/messages", params?.slug],
    enabled: !!params?.slug,
  });

  // Check payment on mount if session_id is present
  useEffect(() => {
    const checkPayment = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session_id');
      
      if (sessionId && params?.slug) {
        try {
          await apiRequest("GET", `/api/messages/${params.slug}/check-payment?session_id=${sessionId}`);
          // Invalidate query to refetch message with unlocked status
          queryClient.invalidateQueries({ queryKey: ["/api/messages", params.slug] });
        } catch (error) {
          console.error("Error checking payment:", error);
        }
      }
    };

    checkPayment();
  }, [params?.slug]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  // Redirect to paywall if not unlocked
  useEffect(() => {
    if (message && !message.unlocked) {
      window.location.href = `/m/${params?.slug}`;
    }
  }, [message, params?.slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-96 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !message || !message.unlocked) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <Unlock className="w-10 h-10 text-destructive" />
          </div>
          <h2 className="text-2xl font-heading font-bold mb-2">Message Not Available</h2>
          <p className="text-muted-foreground mb-6">
            This message hasn't been unlocked yet or doesn't exist.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {showConfetti && <ConfettiEffect />}
      
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center">
                <Heart className="w-4 h-4 text-primary-foreground" fill="currentColor" />
              </div>
              <span className="text-lg font-heading font-bold text-foreground">Secret Message</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Unlock className="w-4 h-4" />
            <span className="text-sm font-medium">Message Unlocked!</span>
          </div>
          <h1 className="text-4xl font-heading font-bold mb-3" data-testid="text-message-title">
            {message.title}
          </h1>
          <p className="text-lg text-muted-foreground flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Here's your secret message
            <Sparkles className="w-5 h-5 text-primary" />
          </p>
        </div>

        <Card className="border-2 overflow-hidden">
          <CardContent className="p-0">
            {message.fileUrl ? (
              <div className="p-8">
                {message.fileType?.startsWith('image/') ? (
                  <div 
                    className={`relative transition-all duration-500 ${
                      imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                    }`}
                  >
                    <img
                      src={`/api/messages/${params?.slug}/file`}
                      alt="Unlocked file"
                      className="w-full h-auto rounded-lg"
                      onLoad={() => setImageLoaded(true)}
                      data-testid="image-file"
                    />
                  </div>
                ) : message.fileType?.startsWith('video/') ? (
                  <video 
                    controls 
                    className="w-full rounded-lg"
                    data-testid="video-file"
                  >
                    <source src={`/api/messages/${params?.slug}/file`} type={message.fileType} />
                    Your browser does not support the video tag.
                  </video>
                ) : message.fileType === 'application/pdf' ? (
                  <div className="space-y-4">
                    <embed 
                      src={`/api/messages/${params?.slug}/file`}
                      type="application/pdf" 
                      className="w-full h-[600px] rounded-lg"
                      data-testid="pdf-file"
                    />
                    <Button 
                      className="w-full" 
                      onClick={() => window.open(`/api/messages/${params?.slug}/file`, '_blank')}
                      data-testid="button-download-pdf"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <FileIcon className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-heading font-bold mb-2">File Ready to Download</h3>
                    <p className="text-muted-foreground mb-6">
                      {message.fileType || 'Unknown file type'}
                    </p>
                    <Button 
                      size="lg"
                      onClick={() => window.open(`/api/messages/${params?.slug}/file`, '_blank')}
                      data-testid="button-download-file"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download File
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div 
                className={`relative transition-all duration-500 ${
                  imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
              >
                {message.imageUrl ? (
                  <img
                    src={message.imageUrl}
                    alt="Unlocked message"
                    className="w-full h-auto rounded-lg"
                    onLoad={() => setImageLoaded(true)}
                    data-testid="image-message"
                  />
                ) : (
                  <div className="bg-gradient-to-br from-primary/5 to-chart-2/5 p-12 text-center rounded-lg">
                    <p className="text-muted-foreground">
                      Image is being generated...
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground mb-4">
            Want to send your own secret message?
          </p>
          <a href="/" className="text-primary hover:underline font-medium">
            Create your own Secret Message
          </a>
        </div>
      </main>

      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t mt-20">
        <div className="max-w-4xl mx-auto text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Secret Message – pay-to-open messages
          </p>
          <div className="flex justify-center gap-4 text-sm">
            <Link href="/privacy">
              <a className="text-muted-foreground hover:text-foreground" data-testid="link-footer-privacy">
                Privacy Policy
              </a>
            </Link>
            <Link href="/legal-disclaimer">
              <a className="text-muted-foreground hover:text-foreground" data-testid="link-footer-legal">
                Legal Disclaimer
              </a>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
