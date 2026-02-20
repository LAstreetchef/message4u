import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, Lock, DollarSign, Send } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation, Link } from "wouter";

const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  disclaimerAgreed: z.boolean().refine((val) => val === true, {
    message: "You must agree to the legal disclaimer to create an account",
  }),
});

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

type SignupFormData = z.infer<typeof signupSchema>;
type LoginFormData = z.infer<typeof loginSchema>;

// Lifestyle images from Unsplash
const heroImages = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=500&fit=crop",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop",
];

export default function Landing() {
  const [isSignUp, setIsSignUp] = useState(true);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<SignupFormData>({
    resolver: zodResolver(isSignUp ? signupSchema : loginSchema),
    defaultValues: {
      email: "",
      password: "",
      disclaimerAgreed: false,
    },
  });

  useEffect(() => {
    form.reset({
      email: "",
      password: "",
      disclaimerAgreed: false,
    });
  }, [isSignUp]);

  const signupMutation = useMutation({
    mutationFn: async (data: SignupFormData) => {
      return await apiRequest("POST", "/api/auth/signup", data);
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Account Created!",
        description: "Welcome to Secret Message. Redirecting to dashboard...",
      });
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Sign Up Failed",
        description: error.message || "Unable to create account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      return await apiRequest("POST", "/api/auth/login", data);
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Welcome Back!",
        description: "Redirecting to dashboard...",
      });
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: SignupFormData | LoginFormData) => {
    if (isSignUp) {
      signupMutation.mutate(data as SignupFormData);
    } else {
      loginMutation.mutate(data as LoginFormData);
    }
  };

  const isPending = signupMutation.isPending || loginMutation.isPending;

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Nav */}
      <nav className="border-b border-black/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <span className="text-xl font-semibold tracking-tight">Secret Message</span>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-black/10">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left - Text & Form */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <p className="text-sm uppercase tracking-widest text-black/50">Pay-to-unlock messages</p>
                  <h1 className="text-5xl sm:text-6xl font-light tracking-tight leading-tight">
                    Send secrets.<br />
                    <span className="font-semibold">Get paid.</span>
                  </h1>
                  <p className="text-lg text-black/60 max-w-md">
                    Create paywalled messages, photos, and files. Share the link. Earn when they unlock.
                  </p>
                </div>

                {/* Auth Card */}
                <div className="border border-black/10 p-6 space-y-4 max-w-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">
                      {isSignUp ? "Create Account" : "Sign In"}
                    </h3>
                    <button
                      onClick={() => {
                        setIsSignUp(!isSignUp);
                        form.reset();
                      }}
                      className="text-sm text-black/50 hover:text-black"
                      data-testid="button-toggle-auth"
                    >
                      {isSignUp ? "Have an account?" : "Need an account?"}
                    </button>
                  </div>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="Email"
                                className="border-black/20 focus:border-black rounded-none"
                                data-testid="input-email"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Password"
                                className="border-black/20 focus:border-black rounded-none"
                                data-testid="input-password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {isSignUp && (
                        <FormField
                          control={form.control}
                          name="disclaimerAgreed"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="rounded-none border-black/30"
                                  data-testid="checkbox-disclaimer"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <label className="text-sm text-black/60">
                                  I agree to the{" "}
                                  <a href="/legal-disclaimer" className="underline hover:text-black" target="_blank" rel="noopener noreferrer" data-testid="link-disclaimer">
                                    Legal Disclaimer
                                  </a>
                                </label>
                                <FormMessage />
                              </div>
                            </FormItem>
                          )}
                        />
                      )}
                      <Button
                        type="submit"
                        className="w-full bg-black text-white hover:bg-black/90 rounded-none h-12"
                        data-testid="button-submit"
                        disabled={isPending}
                      >
                        {isPending ? "Please wait..." : (isSignUp ? "Get Started" : "Sign In")}
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </form>
                  </Form>
                </div>
              </div>

              {/* Right - Image Grid */}
              <div className="hidden lg:grid grid-cols-2 gap-4">
                {heroImages.map((src, i) => (
                  <div 
                    key={i} 
                    className={`aspect-[4/5] overflow-hidden border border-black/10 ${i % 2 === 1 ? 'mt-8' : ''}`}
                  >
                    <img 
                      src={src} 
                      alt="" 
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <p className="text-sm uppercase tracking-widest text-black/50 mb-8">How it works</p>
            
            <div className="grid md:grid-cols-3 gap-12">
              <div className="space-y-4">
                <div className="w-12 h-12 border border-black/20 flex items-center justify-center">
                  <Send className="w-5 h-5" />
                </div>
                <h3 className="font-medium text-lg">1. Create</h3>
                <p className="text-black/60 text-sm leading-relaxed">
                  Write a message, upload a photo or file. Set your price.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="w-12 h-12 border border-black/20 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="font-medium text-lg">2. Share</h3>
                <p className="text-black/60 text-sm leading-relaxed">
                  Get a unique link. Send it to anyone you want.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="w-12 h-12 border border-black/20 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
                <h3 className="font-medium text-lg">3. Earn</h3>
                <p className="text-black/60 text-sm leading-relaxed">
                  They pay to unlock. You get paid instantly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Strip */}
        <section className="border-y border-black/10 py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-8 text-sm text-black/50">
              <span>✓ Stripe & Crypto payments</span>
              <span>✓ Disappearing messages</span>
              <span>✓ Files up to 10MB</span>
              <span>✓ Instant payouts</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-black/10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-black/40">
            © 2026 Secret Message
          </p>
          <div className="flex gap-6 text-sm text-black/40">
            <Link href="/privacy">
              <a className="hover:text-black" data-testid="link-footer-privacy">Privacy</a>
            </Link>
            <Link href="/legal-disclaimer">
              <a className="hover:text-black" data-testid="link-footer-legal">Legal</a>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
