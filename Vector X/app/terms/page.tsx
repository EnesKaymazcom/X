"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/logo";

export default function TermsOfService() {
  return (
    <div className="min-h-screen">
      {/* Simple Header */}
      <header className="border-b border-border/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Logo className="w-10 h-10" />
              <span className="text-xl font-bold">Vector X</span>
            </Link>
            <Link href="/">
              <Button variant="outline" size="sm" className="border-border/40">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>

        <div className="space-y-6 text-foreground/80">
          <section className="space-y-3">
            <p className="text-sm opacity-60">Effective Date: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-foreground">1. Agreement to Terms</h2>
            <p>
              By accessing and using the services provided by Vector X Ltd (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you disagree with any part of these terms, you may not access our services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-foreground">2. Description of Services</h2>
            <p>
              Vector X provides SaaS (Software as a Service) solutions, including but not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>VectorWitch - AI-powered SVG generation platform</li>
              <li>Custom software development services</li>
              <li>Technical consultation and support</li>
              <li>Other digital products and services as may be offered</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-foreground">3. User Accounts</h2>
            <p>To access certain features of our services, you may be required to create an account. You are responsible for:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Providing accurate and complete information</li>
              <li>Notifying us immediately of any unauthorized use</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-foreground">4. Acceptable Use</h2>
            <p>You agree not to use our services to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon intellectual property rights</li>
              <li>Transmit malicious code or interfere with service operation</li>
              <li>Engage in unauthorized access or data mining</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Engage in any activity that disrupts or damages our services</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-foreground">5. Intellectual Property Rights</h2>
            <p>
              All content, features, and functionality of our services, including but not limited to text, graphics, logos, and software, are the exclusive property of Vector X Ltd and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
            <p>
              Content you create using our services remains your property, but you grant us a license to use, store, and process such content as necessary to provide our services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-foreground">6. Payment Terms</h2>
            <p>For paid services:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>All fees are exclusive of taxes unless otherwise stated</li>
              <li>Payments are processed securely through our payment providers</li>
              <li>Subscription fees are billed in advance</li>
              <li>Refunds are subject to our refund policy</li>
              <li>We reserve the right to modify pricing with reasonable notice</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-foreground">7. Service Availability</h2>
            <p>
              While we strive to provide uninterrupted service, we do not guarantee that our services will be available at all times. We may experience hardware, software, or other problems requiring maintenance, resulting in interruptions, delays, or errors.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-foreground">8. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, Vector X Ltd shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-foreground">9. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless Vector X Ltd, its affiliates, and their respective officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses arising from your use of our services or violation of these Terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-foreground">10. Termination</h2>
            <p>
              We reserve the right to terminate or suspend your account and access to our services at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-foreground">11. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of England and Wales. Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of England and Wales.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-foreground">12. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will provide notice of significant changes by posting the new Terms on our website. Your continued use of our services after such modifications constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-foreground">13. Contact Information</h2>
            <p>For questions about these Terms, please contact us at:</p>
            <div className="pl-6 space-y-1">
              <p>Vector X Ltd</p>
              <p>128 City Road, London EC1V 2NX</p>
              <p>United Kingdom</p>
              <p>Email: hello@vectorx.co.uk</p>
            </div>
          </section>

          <section className="mt-8 p-6 bg-accent/5 rounded-lg">
            <p className="text-sm">
              <strong>Company Registration:</strong> Registered in England and Wales, Company No. 16739534
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}