import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart } from "lucide-react";
import { Link } from "wouter";

export default function SmsConsent() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [hasConsented, setHasConsented] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <a className="flex items-center gap-2" data-testid="link-home">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-primary-foreground" fill="currentColor" />
                </div>
                <span className="text-xl font-heading font-bold text-foreground">Secret Message</span>
              </a>
            </Link>
          </div>
        </div>
      </nav>

      <main className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl sm:text-5xl font-heading font-bold text-foreground">
                SMS Notification Consent
              </h1>
              <p className="text-lg text-muted-foreground">
                Example of how users opt-in to receive SMS notifications from Secret Message
              </p>
            </div>

            <Card className="p-8 space-y-6">
              <div className="space-y-4">
                <h2 className="text-2xl font-heading font-semibold">
                  How SMS Opt-In Works
                </h2>
                <p className="text-muted-foreground">
                  When someone sends you a paywalled message on Secret Message, you can optionally provide 
                  your phone number to receive an SMS notification when the message is unlocked. Here's how 
                  the consent process works:
                </p>
              </div>

              <div className="space-y-6 border-t pt-6">
                <h3 className="text-lg font-heading font-semibold">
                  Example Opt-In Form
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number (optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      data-testid="input-phone"
                    />
                    <p className="text-sm text-muted-foreground">
                      Receive an SMS when your message is unlocked
                    </p>
                  </div>

                  <div className="flex items-start space-x-3 p-4 rounded-md bg-secondary/30">
                    <Checkbox
                      id="sms-consent"
                      checked={hasConsented}
                      onCheckedChange={(checked) => setHasConsented(checked === true)}
                      data-testid="checkbox-sms-consent"
                    />
                    <div className="space-y-1 leading-none">
                      <Label
                        htmlFor="sms-consent"
                        className="text-sm font-normal cursor-pointer"
                      >
                        I agree to receive SMS notifications from <strong>Secret Message</strong> when my 
                        paywalled message is unlocked. Message and data rates may apply. Reply STOP to 
                        opt-out at any time. Reply HELP for support.
                      </Label>
                      <p className="text-xs text-muted-foreground pt-2">
                        By checking this box, you consent to receive transactional SMS notifications. 
                        Read our{" "}
                        <Link href="/privacy">
                          <a className="text-primary hover:underline" data-testid="link-privacy">
                            Privacy Policy
                          </a>
                        </Link>
                        {" "}for more information.
                      </p>
                    </div>
                  </div>

                  <Button
                    disabled={!phoneNumber || !hasConsented}
                    className="w-full"
                    data-testid="button-subscribe"
                  >
                    Subscribe to SMS Notifications
                  </Button>
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <h3 className="text-lg font-heading font-semibold">
                  Key Consent Requirements
                </h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>
                      <strong>Unchecked by default:</strong> The consent checkbox is not pre-checked, 
                      requiring explicit opt-in
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>
                      <strong>Brand name:</strong> "Secret Message" is clearly identified as the sender
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>
                      <strong>Message type:</strong> Users know they'll receive unlock notifications
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>
                      <strong>Opt-out instructions:</strong> Clear "Reply STOP to opt-out" language
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>
                      <strong>Rate disclosure:</strong> "Message and data rates may apply" is included
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>
                      <strong>Help information:</strong> "Reply HELP for support" provides assistance
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>
                      <strong>Privacy policy:</strong> Link to privacy policy is accessible
                    </span>
                  </li>
                </ul>
              </div>

              <div className="border-t pt-6 space-y-4">
                <h3 className="text-lg font-heading font-semibold">
                  SMS Message Examples
                </h3>
                
                <div className="space-y-3">
                  <div className="p-4 rounded-md bg-secondary/30 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">Unlock Notification</p>
                    <p className="text-sm">
                      Secret Message: Your paywalled message has been unlocked! View it here: 
                      [link]. Reply STOP to unsubscribe.
                    </p>
                  </div>

                  <div className="p-4 rounded-md bg-secondary/30 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">Auto-Reply to HELP</p>
                    <p className="text-sm">
                      Secret Message: Need help? Email us at support@secretmessage.com or visit 
                      our website. Msg&data rates may apply. Reply STOP to opt-out.
                    </p>
                  </div>

                  <div className="p-4 rounded-md bg-secondary/30 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">Auto-Reply to STOP</p>
                    <p className="text-sm">
                      Secret Message: You've been unsubscribed from SMS notifications. 
                      No more messages will be sent. Thanks for using Secret Message!
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-primary/5 border-primary/20">
              <h3 className="text-lg font-heading font-semibold mb-3">
                For Twilio A2P 10DLC Registration
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                This page demonstrates Secret Message's compliant SMS opt-in process for Twilio 
                A2P 10DLC campaign registration. It shows:
              </p>
              <ul className="text-sm text-muted-foreground space-y-2 mb-4">
                <li>• How users provide explicit consent to receive SMS messages</li>
                <li>• All required disclosures and compliance language</li>
                <li>• Opt-out and help instructions</li>
                <li>• Privacy policy accessibility</li>
              </ul>
              <p className="text-sm font-medium">
                Public URL for campaign registration: {window.location.origin}/sms-consent
              </p>
            </Card>
          </div>
        </div>
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
