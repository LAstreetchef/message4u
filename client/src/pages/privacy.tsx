import { Heart } from "lucide-react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";

export default function Privacy() {
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
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl sm:text-5xl font-heading font-bold text-foreground">
                Privacy Policy
              </h1>
              <p className="text-lg text-muted-foreground">
                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <Card className="p-8 space-y-8">
              <section className="space-y-4">
                <h2 className="text-2xl font-heading font-semibold">Introduction</h2>
                <p className="text-muted-foreground">
                  Secret Message ("we", "our", or "us") is committed to protecting your privacy. This Privacy 
                  Policy explains how we collect, use, disclose, and safeguard your information when you use 
                  our paywalled messaging service.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-heading font-semibold">Information We Collect</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p><strong>Account Information:</strong> When you create an account, we collect your email 
                  address and password (stored securely using industry-standard hashing).</p>
                  
                  <p><strong>Message Data:</strong> We collect and store the paywalled messages you create, 
                  including message content, pricing, recipient identifiers, and file uploads.</p>
                  
                  <p><strong>Payment Information:</strong> Payment processing is handled securely by Stripe. 
                  We do not store your full credit card information. We retain transaction records for 
                  accounting and sender payout purposes.</p>
                  
                  <p><strong>Phone Numbers (Optional):</strong> If you choose to receive SMS notifications, 
                  we collect your phone number solely for the purpose of sending message unlock alerts.</p>
                  
                  <p><strong>Usage Data:</strong> We automatically collect information about how you interact 
                  with our service, including IP addresses, browser type, and pages visited.</p>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-heading font-semibold">How We Use Your Information</h2>
                <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                  <li>To provide and maintain our paywalled messaging service</li>
                  <li>To process payments and facilitate sender payouts</li>
                  <li>To send transactional SMS notifications (only if you opt-in)</li>
                  <li>To communicate with you about your account</li>
                  <li>To improve and optimize our service</li>
                  <li>To prevent fraud and ensure platform security</li>
                  <li>To comply with legal obligations</li>
                </ul>
              </section>

              <section className="space-y-4 p-6 bg-primary/5 border border-primary/20 rounded-md">
                <h2 className="text-2xl font-heading font-semibold">SMS Communications</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    <strong>Opt-In Required:</strong> We only send SMS messages to users who explicitly 
                    opt-in by checking the SMS consent checkbox and providing their phone number.
                  </p>
                  
                  <p>
                    <strong>Message Types:</strong> SMS messages are transactional notifications sent when 
                    a paywalled message you're expecting is unlocked. We do not send marketing messages.
                  </p>
                  
                  <p>
                    <strong>No Third-Party Sharing:</strong> We do not share your mobile phone number 
                    or any SMS-related information with third parties for marketing or promotional purposes. 
                    Your phone number is only shared with our SMS service provider (Twilio) as necessary to 
                    deliver notifications.
                  </p>
                  
                  <p>
                    <strong>Opt-Out:</strong> You may opt-out of SMS notifications at any time by replying 
                    STOP to any message. You can also contact us directly to unsubscribe.
                  </p>
                  
                  <p>
                    <strong>Message Frequency:</strong> You will only receive SMS notifications when messages 
                    you're expecting are unlocked. Frequency depends on your activity.
                  </p>
                  
                  <p className="text-sm">
                    Message and data rates may apply. Carriers are not liable for delayed or undelivered messages.
                  </p>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-heading font-semibold">Information Sharing and Disclosure</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p><strong>Service Providers:</strong> We may share your information with trusted third-party 
                  service providers who assist us in operating our platform, including:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Stripe (payment processing)</li>
                    <li>Twilio (SMS notifications)</li>
                    <li>Neon (database hosting)</li>
                    <li>Replit (application hosting and object storage)</li>
                  </ul>
                  <p className="mt-3">
                    These service providers are contractually obligated to use your information only to provide 
                    services to us and are prohibited from using it for their own purposes.
                  </p>
                  
                  <p><strong>Legal Requirements:</strong> We may disclose your information if required by law, 
                  court order, or to protect our rights and safety.</p>
                  
                  <p><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of 
                  assets, your information may be transferred to the acquiring entity.</p>
                  
                  <p><strong>With Your Consent:</strong> We may share information with third parties when you 
                  give us explicit permission to do so.</p>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-heading font-semibold">Data Security</h2>
                <p className="text-muted-foreground">
                  We implement industry-standard security measures to protect your information, including 
                  encryption of data in transit and at rest, secure password hashing (bcrypt), and regular 
                  security assessments. However, no method of transmission over the internet is 100% secure, 
                  and we cannot guarantee absolute security.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-heading font-semibold">Data Retention</h2>
                <p className="text-muted-foreground">
                  We retain your information for as long as your account is active or as needed to provide 
                  services. Message content and payment records are retained for accounting, dispute resolution, 
                  and compliance purposes. You may request deletion of your account and associated data by 
                  contacting us.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-heading font-semibold">Your Rights</h2>
                <p className="text-muted-foreground">You have the right to:</p>
                <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                  <li>Access the personal information we hold about you</li>
                  <li>Request correction of inaccurate information</li>
                  <li>Request deletion of your account and data</li>
                  <li>Opt-out of SMS communications at any time</li>
                  <li>Export your data in a machine-readable format</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-heading font-semibold">Cookies and Tracking</h2>
                <p className="text-muted-foreground">
                  We use HTTP-only session cookies for authentication purposes. These cookies are essential 
                  for the operation of our service. We do not use third-party advertising or tracking cookies.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-heading font-semibold">Children's Privacy</h2>
                <p className="text-muted-foreground">
                  Our service is not intended for users under the age of 18. We do not knowingly collect 
                  information from children. If you believe we have collected information from a minor, 
                  please contact us immediately.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-heading font-semibold">Changes to This Policy</h2>
                <p className="text-muted-foreground">
                  We may update this Privacy Policy from time to time. We will notify you of significant 
                  changes by posting the new policy on this page and updating the "Last updated" date. 
                  Continued use of our service after changes constitutes acceptance of the updated policy.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-heading font-semibold">Contact Us</h2>
                <p className="text-muted-foreground">
                  If you have questions about this Privacy Policy or how we handle your information, 
                  please contact us at:
                </p>
                <div className="p-4 bg-secondary/30 rounded-md">
                  <p className="text-sm">Email: privacy@secretmessage.com</p>
                  <p className="text-sm">For SMS-related inquiries, text HELP to our SMS number or email support@secretmessage.com</p>
                </div>
              </section>
            </Card>
          </div>
        </div>
      </main>

      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t mt-20">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            Secret Message – pay-to-open messages
          </p>
        </div>
      </footer>
    </div>
  );
}
