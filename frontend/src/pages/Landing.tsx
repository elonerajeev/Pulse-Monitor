import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Monitor,
  Zap,
  Shield,
  DollarSign,
  ArrowRight,
  CheckCircle,
  Activity,
  Bell,
  BarChart3,
  Globe,
  Smartphone,
  Clock
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import BackgroundDecorator from "@/components/ui/background-decorator";
import RealTimeChart from "@/components/ui/real-time-chart";
import MetricsGrid from "@/components/ui/metrics-grid";
import GlobalMap from "@/components/ui/global-map";
import StatusDonut from "@/components/ui/status-donut";

const Landing = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const features = [
    {
      icon: Monitor,
      title: "Real-time Monitoring",
      description: "Monitor your websites, APIs, and services with 60-second checks from multiple global locations.",
    },
    {
      icon: Bell,
      title: "Instant Alerts",
      description: "Get notified immediately via email, Slack, or Telegram when your services go down.",
    },
    {
      icon: BarChart3,
      title: "Detailed Analytics",
      description: "Track uptime percentage, response times, and performance trends with interactive charts.",
    },
    {
      icon: Globe,
      title: "Global Monitoring",
      description: "Check your services from multiple regions worldwide for comprehensive coverage.",
    },
    {
      icon: Shield,
      title: "SSL Certificate Tracking",
      description: "Monitor SSL certificate expiration dates and get alerts before they expire.",
    },
    {
      icon: Zap,
      title: "Lightweight & Fast",
      description: "Simple setup, minimal configuration. Start monitoring in under 2 minutes.",
    },
  ];

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for side projects and personal websites",
      features: [
        "5 monitors",
        "5-minute checks",
        "Email alerts",
        "7-day data retention",
        "Basic dashboard"
      ],
      cta: "Get Started Free",
      variant: "outline" as const,
      popular: false,
    },
    {
      name: "Starter",
      price: "$9",
      period: "per month",
      description: "Great for small teams and growing businesses",
      features: [
        "25 monitors",
        "1-minute checks",
        "Email + Slack + Telegram alerts",
        "30-day data retention",
        "Advanced dashboard",
        "SSL monitoring",
        "Multiple locations"
      ],
      cta: "Start 14-Day Trial",
      variant: "hero" as const,
      popular: true,
    },
    {
      name: "Pro",
      price: "$29",
      period: "per month",
      description: "For teams that need advanced monitoring",
      features: [
        "100 monitors",
        "30-second checks",
        "All alert channels",
        "1-year data retention",
        "Custom dashboards",
        "API access",
        "Priority support",
        "Team collaboration"
      ],
      cta: "Start 14-Day Trial",
      variant: "premium" as const,
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background relative">
      <BackgroundDecorator />
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Activity className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold text-gradient">PulseMonitor</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              <Link to="/testimonials" className="text-muted-foreground hover:text-foreground transition-colors">Testimonials</Link>
              <Link to="/documentation" className="text-muted-foreground hover:text-foreground transition-colors">Docs</Link>
              <div className="flex items-center space-x-2">
                <ThemeToggle />
                <Link to="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/signup">
                  <Button variant="hero" size="sm">Get Started Free</Button>
                </Link>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span className={`bg-foreground block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'}`}></span>
                <span className={`bg-foreground block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                <span className={`bg-foreground block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'}`}></span>
              </div>
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t py-4">
            <div className="flex flex-col space-y-4">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              <Link to="/testimonials" className="text-muted-foreground hover:text-foreground transition-colors">Testimonials</Link>
              <Link to="/documentation" className="text-muted-foreground hover:text-foreground transition-colors">Docs</Link>
              <div className="flex flex-col space-y-2 pt-4 border-t">
                <ThemeToggle />
                <Link to="/login">
                  <Button variant="ghost" className="w-full justify-start">Sign In</Button>
                </Link>
                <Link to="/signup">
                  <Button variant="hero" className="w-full">Get Started Free</Button>
                </Link>
              </div>
            </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-5"></div>
        <div className="container mx-auto px-4 text-center relative">
          <div className="max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6 px-4 py-2">
              <Zap className="w-4 h-4 mr-2" />
              Monitoring made simple
            </Badge>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Keep your websites{" "}
              <span className="text-gradient">always online</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Monitor uptime, track performance, and get instant alerts when something goes wrong.
              Simple, reliable monitoring for developers and teams.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link to="/signup">
                <Button variant="hero" size="xl" className="w-full sm:w-auto">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="outline" size="xl" className="w-full sm:w-auto">
                  View Demo Dashboard
                </Button>
              </Link>
            </div>

            <div className="text-sm text-muted-foreground">
              No credit card required • 5 monitors free • 2-minute setup
            </div>
          </div>

          {/* Animated Dashboard Mockup */}
          <div className="mt-16 relative max-w-7xl mx-auto">
            <div className="bg-card/80 backdrop-blur-lg rounded-2xl shadow-2xl border p-6 animate-float">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-destructive"></div>
                  <div className="w-3 h-3 rounded-full bg-warning"></div>
                  <div className="w-3 h-3 rounded-full bg-success"></div>
                </div>
                <Badge variant="outline" className="text-xs">
                  Live Monitoring Demo
                </Badge>
              </div>

              {/* Metrics Grid */}
              <div className="mb-6">
                <MetricsGrid />
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Response Time Chart */}
                <div className="bg-card/30 backdrop-blur-sm rounded-lg border shadow-sm p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Response Time Trend</span>
                    </div>
                    <Badge variant="outline" className="text-xs animate-pulse">
                      Live Data
                    </Badge>
                  </div>
                  <div className="h-[300px]">
                    <RealTimeChart />
                  </div>
                </div>

                {/* Status Donut */}
                <StatusDonut />
              </div>

              {/* Global Map */}
              <GlobalMap />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Everything you need to monitor your services
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive monitoring tools designed for modern developers and teams
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <feature.icon className="w-12 h-12 text-primary mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Start free, upgrade when you need more. No hidden fees or surprises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative group hover:shadow-xl transition-all duration-300 ${
                  plan.popular ? 'border-primary shadow-lg scale-105' : 'hover:-translate-y-1'
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-primary text-white">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                  <p className="text-muted-foreground">{plan.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-success mr-3 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/signup">
                    <Button variant={plan.variant} className="w-full" size="lg">
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Ready to monitor your services?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of developers who trust PulseMonitor to keep their services online.
          </p>
          <Link to="/signup">
            <Button variant="glass" size="xl" className="mr-4">
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Column 1 - Logo & Description */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-8 h-8 text-primary" />
                <span className="text-xl font-bold">PulseMonitor</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Simple, reliable monitoring for developers and teams. Keep your services online 24/7.
              </p>
            </div>

            {/* Column 2 - Product */}
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link to="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
                <li><Link to="/documentation" className="hover:text-foreground transition-colors">Documentation</Link></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><Link to="/testimonials" className="hover:text-foreground transition-colors">Testimonials</Link></li>
              </ul>
            </div>

            {/* Column 3 - Company */}
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Column 4 - Legal & Social */}
            <div>
              <h3 className="font-semibold mb-4">Legal & Social</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">GitHub</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Twitter</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2024 PulseMonitor. All rights reserved. Built with ❤️ for developers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
