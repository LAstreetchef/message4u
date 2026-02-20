import { Card } from "@/components/ui/card";
import { Heart } from "lucide-react";
import { Link } from "wouter";

export default function LegalDisclaimer() {
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

      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-heading font-bold mb-2">Legal Disclaimer</h1>
            <p className="text-muted-foreground">Last Updated: February 20, 2026</p>
          </div>

          <div className="space-y-6">
            <Card className="p-8">
              <div className="prose prose-invert max-w-none space-y-6">
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="font-semibold text-sm">
                    PLEASE READ THIS DISCLAIMER CAREFULLY. BY ACCESSING OR USING THIS WEBSITE (THE "SITE"), YOU ACKNOWLEDGE THAT YOU ARE ABOVE THE AGE OF 21, HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THE FOLLOWING TERMS. IF YOU DO NOT AGREE OR ARE UNDER 21, YOU MUST IMMEDIATELY CEASE USE OF THE SITE.
                  </p>
                </div>

                <section className="space-y-4">
                  <h2 className="text-2xl font-heading font-semibold">1. No Warranties</h2>
                  <p className="text-muted-foreground">
                    The Site and all content, features, and services provided through it (including but not limited to the creation, delivery, and unlocking of secret messages via payment) are provided on an "as is" and "as available" basis without any warranties of any kind, either express or implied. This includes, but is not limited to, implied warranties of merchantability, fitness for a particular purpose, title, and non-infringement.
                  </p>
                  <p className="text-muted-foreground">
                    We do not warrant that the Site will be uninterrupted, error-free, secure, or free from viruses or other harmful components. We do not guarantee the accuracy, completeness, reliability, or timeliness of any information or content on the Site. Any reliance on the Site or its content is at your own risk.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-heading font-semibold">2. Limitation of Liability</h2>
                  <p className="text-muted-foreground">
                    To the fullest extent permitted by law, SecretMessage4U.com, its owners, operators, affiliates, employees, agents, and licensors (collectively, "we," "us," or "our") shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, goodwill, or other intangible losses, arising out of or in connection with your access to or use of (or inability to access or use) the Site, regardless of whether such damages were foreseeable or whether we were advised of the possibility of such damages.
                  </p>
                  <p className="text-muted-foreground">
                    In no event shall our total liability to you for all claims arising from or related to the Site exceed the amount you paid to us (if any) in the twelve (12) months preceding the claim. Some jurisdictions do not allow the exclusion or limitation of certain damages, so the above limitations may not apply to you.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-heading font-semibold">3. User Content and Messages</h2>
                  <p className="text-muted-foreground">
                    You are solely responsible for any content you submit, send, or otherwise make available through the Site, including secret messages ("User Content"). You represent and warrant that your User Content does not violate any applicable laws, third-party rights (e.g., intellectual property, privacy, or publicity rights), or our Terms of Service.
                  </p>
                  <p className="text-muted-foreground">
                    We do not endorse, verify, or take responsibility for any User Content. Messages unlocked via payment are delivered as submitted, and we are not liable for the truthfulness, appropriateness, or consequences of any message. Use of the Site to send harassing, defamatory, illegal, or harmful content is strictly prohibited and may result in account suspension or termination.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-heading font-semibold">4. Payments and Refunds</h2>
                  <p className="text-muted-foreground">
                    All payments for unlocking messages are final and non-refundable, except as required by law. We use third-party payment processors, and you agree to their terms. We are not responsible for any errors, delays, or disputes related to payments.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-heading font-semibold">5. Indemnification</h2>
                  <p className="text-muted-foreground">
                    You agree to indemnify, defend, and hold harmless us and our affiliates, officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses (including reasonable attorneys' fees) arising out of or related to (i) your access to or use of the Site; (ii) your violation of this Disclaimer or any applicable law; or (iii) your User Content.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-heading font-semibold">6. Governing Law and Dispute Resolution</h2>
                  <p className="text-muted-foreground">
                    This Disclaimer shall be governed by and construed in accordance with the laws of the State of Delaware, USA, without regard to its conflict of law principles. Any disputes arising from or relating to this Disclaimer or the Site shall be resolved exclusively in the state or federal courts located in New Castle County, Delaware.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-heading font-semibold">7. Changes to This Disclaimer</h2>
                  <p className="text-muted-foreground">
                    We reserve the right to modify this Disclaimer at any time. Changes will be effective upon posting to the Site. Your continued use of the Site after any changes constitutes acceptance of the revised terms.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-heading font-semibold">8. Miscellaneous</h2>
                  <p className="text-muted-foreground">
                    If any provision of this Disclaimer is found to be invalid or unenforceable, the remaining provisions shall remain in full force and effect. Our failure to enforce any right or provision shall not constitute a waiver of such right or provision. This Disclaimer constitutes the entire agreement between you and us regarding the subject matter herein.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-heading font-semibold">Contact Us</h2>
                  <p className="text-muted-foreground">
                    If you have questions about this Disclaimer, please contact us at:
                  </p>
                  <div className="p-4 bg-secondary/30 rounded-md">
                    <p className="text-sm">Email: message4u@secretmessage4u.com</p>
                  </div>
                </section>
              </div>
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
