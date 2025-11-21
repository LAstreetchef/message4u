import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMessageSchema, type InsertMessage } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Heart, ArrowLeft, Calendar as CalendarIcon, FileText, Upload } from "lucide-react";
import { Link, useLocation } from "wouter";
import { z } from "zod";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ObjectUploader } from "@/components/ObjectUploader";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const formSchema = insertMessageSchema.extend({
  price: z.string().min(1, "Price is required").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    "Price must be greater than 0"
  ),
  expiresAt: z.date().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function CreateMessage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [messageType, setMessageType] = useState<"text" | "file">("text");
  const [uploadedFile, setUploadedFile] = useState<{ url: string; type: string; name: string } | null>(null);
  const [newMessageId, setNewMessageId] = useState<string>("");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      recipientIdentifier: "",
      messageBody: "",
      price: "",
      expiresAt: undefined,
      fileUrl: undefined,
      fileType: undefined,
    },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      let messageData: InsertMessage;

      if (messageType === "file") {
        if (!uploadedFile) {
          throw new Error("Please upload a file");
        }
        messageData = {
          ...data,
          messageBody: undefined,
          fileUrl: uploadedFile.url,
          fileType: uploadedFile.type,
          price: data.price,
          expiresAt: data.expiresAt ? data.expiresAt.toISOString() : undefined,
        } as InsertMessage;
      } else {
        if (!data.messageBody || data.messageBody.trim() === "") {
          throw new Error("Please enter a message");
        }
        messageData = {
          ...data,
          fileUrl: undefined,
          fileType: undefined,
          price: data.price,
          expiresAt: data.expiresAt ? data.expiresAt.toISOString() : undefined,
        } as InsertMessage;
      }

      const response = await apiRequest("POST", "/api/messages", messageData);
      const result = await response.json() as { id: string };
      
      if (messageType === "file" && uploadedFile && result.id) {
        await apiRequest("PUT", `/api/messages/${result.id}/file`, {
          fileURL: uploadedFile.url,
          fileType: uploadedFile.type,
        });
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      toast({
        title: "Message Created!",
        description: "Your paywalled message is ready to share",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create message",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

  if (authLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <a className="flex items-center gap-2 hover-elevate rounded-lg px-3 py-2 -ml-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-primary-foreground" fill="currentColor" />
                </div>
                <span className="text-lg font-heading font-bold text-foreground">Secret Message</span>
              </a>
            </Link>
            <Link href="/">
              <Button variant="ghost" className="rounded-full" data-testid="button-back">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-heading font-bold mb-2">
            Create a Message
          </h1>
          <p className="text-muted-foreground">
            Set your price and send something special ✨
          </p>
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">Message Details</CardTitle>
            <CardDescription>
              {messageType === "text" 
                ? "Your message will be converted to an image and locked until payment"
                : "Upload any file (max 10MB) - will be locked until payment"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-3">
                  <FormLabel>Message Type</FormLabel>
                  <RadioGroup 
                    value={messageType} 
                    onValueChange={(value) => setMessageType(value as "text" | "file")}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="text" id="text" data-testid="radio-text" />
                      <Label htmlFor="text" className="flex items-center gap-2 cursor-pointer">
                        <FileText className="w-4 h-4" />
                        Text Message
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="file" id="file" data-testid="radio-file" />
                      <Label htmlFor="file" className="flex items-center gap-2 cursor-pointer">
                        <Upload className="w-4 h-4" />
                        File Upload
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message Title</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Give your message a catchy title..." 
                          {...field}
                          data-testid="input-title"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="recipientIdentifier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recipient</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Name, email, or phone..." 
                          {...field}
                          data-testid="input-recipient"
                        />
                      </FormControl>
                      <FormDescription>
                        Just for your reference - can be anything
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {messageType === "text" ? (
                  <FormField
                    control={form.control}
                    name="messageBody"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Write your secret message here..."
                            className="min-h-32 resize-none"
                            {...field}
                            value={field.value || ""}
                            data-testid="input-message"
                          />
                        </FormControl>
                        <FormDescription>
                          This will be shown as an image after payment
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <div className="space-y-2">
                    <FormLabel>Upload File</FormLabel>
                    <ObjectUploader
                      maxNumberOfFiles={1}
                      maxFileSize={10485760}
                      onGetUploadParameters={async () => {
                        const res = await apiRequest("POST", "/api/objects/upload", {});
                        const data = await res.json() as { uploadURL: string };
                        return {
                          method: "PUT" as const,
                          url: data.uploadURL,
                        };
                      }}
                      onComplete={(result) => {
                        if (result.successful.length > 0) {
                          const file = result.successful[0];
                          setUploadedFile({
                            url: file.uploadURL,
                            type: file.type || "application/octet-stream",
                            name: file.name,
                          });
                          toast({
                            title: "File uploaded!",
                            description: `${file.name} is ready`,
                          });
                        }
                      }}
                      buttonVariant="outline"
                      buttonClassName="w-full"
                    >
                      {uploadedFile ? (
                        <span className="flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          {uploadedFile.name}
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          Choose File (Max 10MB)
                        </span>
                      )}
                    </ObjectUploader>
                    <FormDescription>
                      Any file type accepted - will be revealed after payment
                    </FormDescription>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price to Unlock</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            $
                          </span>
                          <Input 
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="5.00"
                            className="pl-8"
                            {...field}
                            data-testid="input-price"
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        How much should they pay to open this? 💸
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expiresAt"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Expiration Date (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal rounded-lg",
                                !field.value && "text-muted-foreground"
                              )}
                              data-testid="button-expiration-date"
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick an expiration date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Leave blank for no expiration
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full rounded-full text-lg bg-gradient-instagram hover:opacity-90 shadow-lg shadow-primary/30 border-0"
                  disabled={createMutation.isPending}
                  data-testid="button-submit"
                >
                  {createMutation.isPending ? "Creating..." : "Create Message"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>

      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t mt-20">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            Secret Message – secure pay-to-open messaging
          </p>
        </div>
      </footer>
    </div>
  );
}
