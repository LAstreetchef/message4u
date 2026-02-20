import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart, Lock, DollarSign, Send, Ghost, Timer, Eye, Bomb } from "lucide-react";
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

  // Reset form when switching between signup and login
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
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground" fill="currentColor" />
              </div>
              <span className="text-xl font-heading font-bold text-foreground">Secret Message</span>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-block">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    <Heart className="w-4 h-4" fill="currentColor" />
                    Playful Pay-to-Open Messages
                  </span>
                </div>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-heading font-bold text-foreground leading-tight">
                  Welcome to <br />
                  <span className="bg-gradient-to-r from-primary via-chart-2 to-accent bg-clip-text text-transparent">
                    Secret Message
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-lg">
                  Send pictures, files, and messages that unlock with a payment. Set your price, share the link, get paid!
                </p>
                <Card className="p-6 space-y-4 max-w-md">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-semibold text-lg">
                      {isSignUp ? "Create Account" : "Sign In"}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsSignUp(!isSignUp);
                        form.reset();
                      }}
                      data-testid="button-toggle-auth"
                    >
                      {isSignUp ? "Already have an account?" : "Need an account?"}
                    </Button>
                  </div>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="your@email.com"
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
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder={isSignUp ? "At least 8 characters" : "Your password"}
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
                                  data-testid="checkbox-disclaimer"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <label className="text-sm font-normal">
                                  I agree to the{" "}
                                  <a href="/legal-disclaimer" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" data-testid="link-disclaimer">
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
                        size="lg"
                        className="w-full rounded-full bg-gradient-to-r from-primary to-chart-2 hover:opacity-90"
                        data-testid="button-submit"
                        disabled={isPending}
                      >
                        {isPending ? "Please wait..." : (isSignUp ? "Sign Up" : "Sign In")}
                      </Button>
                    </form>
                  </Form>
                </Card>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-chart-2/20 rounded-3xl blur-3xl" />
                <Card className="relative p-8 space-y-6 border-2">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Send className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-heading font-semibold text-lg">Create Your Message</h3>
                        <p className="text-sm text-muted-foreground">Write something special and set your price</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-chart-2/10 flex items-center justify-center flex-shrink-0">
                        <Lock className="w-6 h-6 text-chart-2" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-heading font-semibold text-lg">Share the Link</h3>
                        <p className="text-sm text-muted-foreground">Send your paywalled message to anyone</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <DollarSign className="w-6 h-6 text-accent-foreground" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-heading font-semibold text-lg">Get Paid to Unlock</h3>
                        <p className="text-sm text-muted-foreground">They pay, message reveals as an image</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-secondary/30">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold">
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <Card className="p-6 space-y-4 text-center hover-elevate">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <span className="text-3xl">📱</span>
                </div>
                <h3 className="font-heading font-semibold text-lg">1. Create</h3>
                <p className="text-sm text-muted-foreground">
                  Write your message and set how much it costs to unlock
                </p>
              </Card>
              
              <Card className="p-6 space-y-4 text-center hover-elevate">
                <div className="w-16 h-16 rounded-full bg-chart-2/10 flex items-center justify-center mx-auto">
                  <span className="text-3xl">🔒</span>
                </div>
                <h3 className="font-heading font-semibold text-lg">2. Share</h3>
                <p className="text-sm text-muted-foreground">
                  Get a unique link to send to your special someone
                </p>
              </Card>
              
              <Card className="p-6 space-y-4 text-center hover-elevate">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                  <span className="text-3xl">💖</span>
                </div>
                <h3 className="font-heading font-semibold text-lg">3. Unlock</h3>
                <p className="text-sm text-muted-foreground">
                  They pay to unlock and see your message as a beautiful image
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Disappearing Messages Feature - Highlighted */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/20 via-chart-2/10 to-accent/20">
          <div className="max-w-5xl mx-auto">
            <div className="text-center space-y-4 mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary">
                <Ghost className="w-5 h-5" />
                <span className="font-semibold">NEW FEATURE</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-heading font-bold">
                Disappearing Messages
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Make your secrets truly secret. Set messages to self-destruct after being viewed.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 space-y-4 border-2 border-primary/30 bg-background/50 backdrop-blur">
                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                  <Eye className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-heading font-bold text-xl">View Limits</h3>
                <p className="text-muted-foreground">
                  Set a maximum number of views. Message disappears after 1, 3, 5, or up to 100 views.
                </p>
              </Card>

              <Card className="p-6 space-y-4 border-2 border-chart-2/30 bg-background/50 backdrop-blur">
                <div className="w-14 h-14 rounded-full bg-chart-2/20 flex items-center justify-center">
                  <Timer className="w-7 h-7 text-chart-2" />
                </div>
                <h3 className="font-heading font-bold text-xl">Timed Delete</h3>
                <p className="text-muted-foreground">
                  Start a countdown after first view. Delete after 1 minute, 1 hour, or up to 7 days.
                </p>
              </Card>

              <Card className="p-6 space-y-4 border-2 border-accent/30 bg-background/50 backdrop-blur">
                <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center">
                  <Bomb className="w-7 h-7 text-accent-foreground" />
                </div>
                <h3 className="font-heading font-bold text-xl">💣 Bomb Mode</h3>
                <p className="text-muted-foreground">
                  Set an exact date & time. Message self-destructs at that moment — read or not.
                </p>
              </Card>
            </div>

            <p className="text-center mt-10 text-muted-foreground">
              Perfect for exclusive content, limited offers, or anything you want to keep truly private.
            </p>
          </div>
        </section>
      </main>

      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t mt-20">
        <div className="max-w-6xl mx-auto text-center space-y-2">
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
