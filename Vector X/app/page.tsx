"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import {
  ArrowRight,
  CheckCircle,
  Globe,
  Headphones,
  Rocket,
  Shield,
  ChevronDown,
  ExternalLink,
  Mail,
  MapPin,
} from "lucide-react";

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  const navItems = [
    {
      name: "About",
      link: "#about",
    },
    {
      name: "Products",
      link: "#products",
    },
    {
      name: "Why Choose Us",
      link: "#features",
    },
  ];

  return (
    <>
      {/* Navigation */}
      <Navbar className="fixed top-0 left-0 right-0 z-50">
        {/* Desktop Navigation */}
        <NavBody>
          <NavbarLogo />
          <NavItems
            items={navItems}
            onItemClick={() => {
              // Handle click if needed
            }}
          />
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <NavbarButton
              href="#contact"
              variant="primary"
              as="button"
              onClick={() => scrollToSection("contact")}
            >
              Get In Touch
            </NavbarButton>
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <MobileNavToggle
                isOpen={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              />
            </div>
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item, idx) => (
              <a
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => {
                  scrollToSection(item.link.replace('#', ''));
                  setIsMobileMenuOpen(false);
                }}
                className="relative text-neutral-600 dark:text-neutral-300"
              >
                <span className="block">{item.name}</span>
              </a>
            ))}
            <div className="flex w-full flex-col gap-4">
              <NavbarButton
                onClick={() => {
                  scrollToSection("contact");
                  setIsMobileMenuOpen(false);
                }}
                variant="primary"
                className="w-full"
                as="button"
              >
                Get In Touch
              </NavbarButton>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="container relative z-10 mx-auto px-4 py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fadeIn">
            <div className="flex justify-center mb-8">
              <Logo className="w-64 h-64 animate-pulse" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Next-Generation SaaS Development
            </h1>
            <p className="text-xl md:text-2xl opacity-70 max-w-2xl mx-auto">
              Modern SaaS solutions for growing businesses.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => scrollToSection("products")}
                className="group"
              >
                Explore Our Products
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollToSection("contact")}
              >
                Get In Touch
              </Button>
            </div>
          </div>
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDown className="h-6 w-6 opacity-50 text-accent" />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8 animate-fadeInUp">
            <h2 className="text-4xl md:text-5xl font-bold">About Vector X</h2>
            <div className="space-y-6 text-lg opacity-80">
              <p>
                We are a UK-based software development company creating practical SaaS solutions for businesses.
              </p>
              <p>
                Our team focuses on building reliable, scalable software that solves real problems.
              </p>
              <p>
                From planning to deployment, we handle the complete development process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Products</h2>
            <p className="text-xl opacity-60">
              Innovative SaaS solutions designed for modern businesses
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 glass-card border-border/20">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-accent/10 rounded-lg backdrop-blur-sm">
                    <img src="/vectorwitch-logo.svg" alt="VectorWitch" className="h-6 w-6 dark:invert" />
                  </div>
                  <ExternalLink className="h-4 w-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
                <CardTitle>VectorWitch</CardTitle>
                <CardDescription className="opacity-60">AI SVG Generator</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm opacity-70 mb-4">
                  AI-powered SVG generation platform that transforms text prompts and images into scalable vector graphics.
                </p>
                <Link href="https://vectorwitch.com" target="_blank">
                  <Button variant="outline" size="sm" className="w-full border-border/40 hover:bg-accent/10 hover:border-accent/40 backdrop-blur-sm">
                    Visit Platform
                    <ArrowRight className="ml-2 h-3 w-3" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 glass-card border-border/20">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-accent/10 rounded-lg backdrop-blur-sm">
                    <Rocket className="h-6 w-6" />
                  </div>
                  <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full backdrop-blur-sm">
                    Coming Soon
                  </span>
                </div>
                <CardTitle>FlowHub</CardTitle>
                <CardDescription className="opacity-60">Workflow Automation</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm opacity-70 mb-4">
                  Process automation tool to streamline business workflows and improve productivity.
                </p>
                <Button variant="outline" size="sm" className="w-full border-border/40 opacity-50" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 glass-card border-border/20">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-accent/10 rounded-lg backdrop-blur-sm">
                    <Shield className="h-6 w-6" />
                  </div>
                  <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full backdrop-blur-sm">
                    Beta
                  </span>
                </div>
                <CardTitle>SecureVault</CardTitle>
                <CardDescription className="opacity-60">Security Management</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm opacity-70 mb-4">
                  Security management platform with encryption and threat detection capabilities.
                </p>
                <Button variant="outline" size="sm" className="w-full border-border/40 opacity-50" disabled>
                  Beta Access
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose Us
            </h2>
            <p className="text-xl opacity-60">
              Quality software development
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center space-y-4 group">
              <div className="inline-flex p-4 bg-accent/10 rounded-2xl group-hover:bg-accent/20 transition-all backdrop-blur-sm">
                <Rocket className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold">Innovation</h3>
              <p className="opacity-70">
                Using modern technologies to build better software solutions.
              </p>
            </div>
            <div className="text-center space-y-4 group">
              <div className="inline-flex p-4 bg-accent/10 rounded-2xl group-hover:bg-accent/20 transition-all backdrop-blur-sm">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold">Security</h3>
              <p className="opacity-70">
                Secure development practices with data protection and encryption.
              </p>
            </div>
            <div className="text-center space-y-4 group">
              <div className="inline-flex p-4 bg-accent/10 rounded-2xl group-hover:bg-accent/20 transition-all backdrop-blur-sm">
                <Globe className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold">UK Based</h3>
              <p className="opacity-70">
                Located in London, serving clients worldwide.
              </p>
            </div>
            <div className="text-center space-y-4 group">
              <div className="inline-flex p-4 bg-accent/10 rounded-2xl group-hover:bg-accent/20 transition-all backdrop-blur-sm">
                <Headphones className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold">Support</h3>
              <p className="opacity-70">
                Dedicated support team for all our products.
              </p>
            </div>
          </div>
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                <span className="opacity-70">ISO 27001</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                <span className="opacity-70">GDPR Compliant</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                <span className="opacity-70">Secure</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                <span className="opacity-70">99.9% Uptime</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                <span className="opacity-70">Regular Updates</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                <span className="opacity-70">API Ready</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Get In Touch</h2>
              <p className="text-xl opacity-60">
                Ready to start your next project? Let&apos;s discuss your needs.
              </p>
            </div>

            <Card className="glass-card border-border/20">
              <CardContent className="p-8">
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        className="border-border/40 focus:border-accent backdrop-blur-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        className="border-border/40 focus:border-accent backdrop-blur-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      className="border-foreground/20 focus:border-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Company (Optional)</Label>
                    <Input
                      id="company"
                      placeholder="Your Company"
                      className="border-foreground/20 focus:border-foreground"
                    />
                  </div>


                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                  >
                    Send Message
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="text-center mt-8 space-y-4">
              <p className="text-sm opacity-60">
                Or reach us directly at:
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
                <Link
                  href="mailto:hello@vectorx.co.uk"
                  className="flex items-center gap-2 hover:opacity-100 opacity-70 transition-opacity"
                >
                  <Mail className="h-4 w-4" />
                  hello@vectorx.co.uk
                </Link>
                <div className="flex items-center gap-2 opacity-70">
                  <MapPin className="h-4 w-4" />
                  London, UK
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative backdrop-blur-md border-t border-border/20">
        <div className="max-w-7xl mx-auto px-6 pt-8 pb-3">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Logo className="w-10 h-10" />
                <span className="text-xl font-bold">Vector X</span>
              </div>
              <p className="text-sm opacity-60">
                Building quality SaaS solutions.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Products</h4>
              <ul className="space-y-2 text-sm opacity-70">
                <li>
                  <Link href="https://vectorwitch.com" target="_blank" className="hover:opacity-100 transition-opacity">
                    VectorWitch
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:opacity-100 transition-opacity">
                    FlowHub
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:opacity-100 transition-opacity">
                    SecureVault
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Company</h4>
              <ul className="space-y-2 text-sm opacity-70">
                <li>
                  <button onClick={() => scrollToSection("about")} className="hover:opacity-100 transition-opacity">
                    About Us
                  </button>
                </li>
                <li>
                  <Link href="#" className="hover:opacity-100 transition-opacity">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:opacity-100 transition-opacity">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:opacity-100 transition-opacity">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Contact</h4>
              <ul className="space-y-3 text-sm opacity-70">
                <li className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>128 City Road, London EC1V 2NX, United Kingdom</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <Link href="mailto:hello@vectorx.co.uk" className="hover:opacity-100 transition-opacity">
                    hello@vectorx.co.uk
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/20 dark:border-white/20">
            <div className="flex flex-col md:flex-row justify-between items-center gap-2">
              <p className="text-xs opacity-60 text-center md:text-left">
                © {new Date().getFullYear()} Vector X Ltd. All rights reserved.
              </p>
              <p className="text-xs opacity-60 text-center md:text-right">
                Registered in England and Wales. Company No. 16739534
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
