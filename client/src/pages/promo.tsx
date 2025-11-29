import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart, Lock, DollarSign, Send, Sparkles, ArrowRight, CheckCircle } from "lucide-react";
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
    message: "You must agree to the legal disclaimer",
  }),
});

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

type SignupFormData = z.infer<typeof signupSchema>;
type LoginFormData = z.infer<typeof loginSchema>;

export default function Promo() {
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
    <div className="min-h-screen bg-black">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-b from-purple-600/30 to-transparent rounded-full blur-3xl" />
      
      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="p-4 sm:p-6">
          <div className="flex items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" fill="currentColor" />
            </div>
            <span className="text-xl font-bold text-white">Secret Message</span>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-300">Pay-to-Unlock Messages</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
                Get Paid for Your{" "}
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                  Secret Messages
                </span>
              </h1>
              
              <p className="text-lg text-gray-400 max-w-sm mx-auto">
                Create messages that unlock with payment. Set your price, share the link, earn money.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 py-4">
              <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
                <Send className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <p className="text-xs text-gray-400">Create</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
                <Lock className="w-6 h-6 text-pink-400 mx-auto mb-2" />
                <p className="text-xs text-gray-400">Share</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
                <DollarSign className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <p className="text-xs text-gray-400">Earn</p>
              </div>
            </div>

            <Card className="p-6 bg-zinc-900/80 border-zinc-800 backdrop-blur-sm">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">
                    {isSignUp ? "Start Earning" : "Welcome Back"}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      form.reset();
                    }}
                    className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                    data-testid="button-toggle-auth-promo"
                  >
                    {isSignUp ? "Sign in" : "Sign up"}
                  </Button>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="your@email.com"
                              className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
                              data-testid="input-email-promo"
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
                          <FormLabel className="text-gray-300">Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder={isSignUp ? "At least 8 characters" : "Your password"}
                              className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
                              data-testid="input-password-promo"
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
                                className="border-zinc-600 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                                data-testid="checkbox-disclaimer-promo"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <label className="text-sm text-gray-400">
                                I agree to the{" "}
                                <Link href="/legal-disclaimer">
                                  <span 
                                    className="text-purple-400 hover:underline cursor-pointer"
                                    data-testid="link-disclaimer-promo"
                                  >
                                    Legal Disclaimer
                                  </span>
                                </Link>
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
                      className="w-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-6"
                      data-testid="button-submit-promo"
                      disabled={isPending}
                    >
                      {isPending ? (
                        "Please wait..."
                      ) : (
                        <span className="flex items-center gap-2">
                          {isSignUp ? "Create Free Account" : "Sign In"}
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      )}
                    </Button>
                  </form>
                </Form>
              </div>
            </Card>

            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-3 text-gray-400">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm">Accept credit cards & 200+ cryptocurrencies</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm">Automated payouts to your bank account</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm">Send text messages or files up to 10MB</span>
              </div>
            </div>
          </div>
        </main>

        <footer className="p-4 text-center">
          <p className="text-xs text-gray-600">
            Secret Message – pay-to-open messages
          </p>
          <div className="flex justify-center gap-4 mt-2 text-xs">
            <Link href="/privacy">
              <span className="text-gray-600 hover:text-gray-400 cursor-pointer" data-testid="link-promo-privacy">
                Privacy
              </span>
            </Link>
            <Link href="/legal-disclaimer">
              <span className="text-gray-600 hover:text-gray-400 cursor-pointer" data-testid="link-promo-legal">
                Legal
              </span>
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
