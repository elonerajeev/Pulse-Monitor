import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Monitor,
  Zap,
  Shield,
  ArrowRight,
  CheckCircle,
  Activity,
  Bell,
  BarChart3,
  Globe,
  Star,
  Users,
  Building2
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/ui/navbar";
import StatusDonut from "@/components/ui/status-donut";
import RealTimeChart from "@/components/ui/real-time-chart";
import MetricsGrid from "@/components/ui/metrics-grid";
import World from "@/components/ui/World"; // Corrected import
import BackgroundDecorator from "@/components/ui/background-decorator";
import { useAuth } from "@/hooks/useAuth";

const Landing = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/signup");
    }
  };
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

  const testimonials = [
    {
      id: 1,
      name: "Sarah Chen",
      role: "CTO",
      company: "TechStart Inc",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      content: "PulseMonitor has been a game-changer for our infrastructure monitoring. The instant alerts saved us from a major outage last week.",
      rating: 5,
      companySize: "Series A Startup",
      useCase: "API Monitoring",
    },
    {
      id: 2,
      name: "Marcus Rodriguez",
      role: "DevOps Engineer",
      company: "CloudNine Solutions",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      content: "Simple setup, powerful monitoring. We migrated from a complex enterprise solution and couldn't be happier with the reliability and cost savings.",
      rating: 5,
      companySize: "Enterprise (500+)",
      useCase: "Multi-region Monitoring",
    },
    {
      id: 3,
      name: "Emily Johnson",
      role: "Full Stack Developer",
      company: "Indie Creator",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      content: "Perfect for side projects! The free tier gives me everything I need to monitor my apps without breaking the bank.",
      rating: 5,
      companySize: "Solo Developer",
      useCase: "Side Projects",
    },
    {
      id: 4,
      name: "David Kim",
      role: "SRE Lead",
      company: "DataFlow Corp",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      content: "The response time analytics helped us optimize our API endpoints and improve user experience by 40%. Highly recommended!",
      rating: 5,
      companySize: "Series B",
      useCase: "Performance Optimization",
    },
    {
      id: 5,
      name: "Lisa Wang",
      role: "Product Manager",
      company: "E-commerce Plus",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face",
      content: "Reliable monitoring with beautiful dashboards. Our team loves the clean interface and detailed reporting features.",
      rating: 5,
      companySize: "Growth Stage",
      useCase: "E-commerce Platform",
    },
    {
      id: 6,
      name: "Alex Thompson",
      role: "Infrastructure Manager",
      company: "FinTech Secure",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
      content: "Security and compliance were our top concerns. PulseMonitor met all our requirements while being incredibly easy to implement.",
      rating: 5,
      companySize: "Enterprise",
      useCase: "Financial Services",
    }
  ];

  const stats = [
    { label: "Happy Customers", value: "2,500+", icon: Users },
    { label: "Uptime Monitored", value: "99.99%", icon: Activity },
    { label: "Alerts Sent", value: "50K+", icon: Zap },
    { label: "Companies Trust Us", value: "500+", icon: Building2 },
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

  const customerLogos = [
    { src: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg", alt: "Google" },
    { src: "https://upload.wikimedia.org/wikipedia/commons/a/ab/Meta-Logo.svg", alt: "Meta" },
    { src: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg", alt: "Microsoft" },
    { src: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg", alt: "Amazon" },
    { src: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg", alt: "Netflix" },
  ];

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const globeConfig = {
    width: 800,
    height: 600,
    markerColor: "#FF0000",
    graticuleColor: "#CCCCCC",
    backgroundColor: "#FFFFFF",
  };

  const data = [
    { lat: 34.0522, lon: -118.2437, size: 10 },
    { lat: 40.7128, lon: -74.006, size: 10 },
    { lat: 51.5074, lon: -0.1278, size: 10 },
  ];

  return (
    <div className="min-h-screen bg-background relative">
      <Navbar isAuthenticated={false} />
      <BackgroundDecorator />
      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="absolute inset-0 hero-gradient opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
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
              <Button onClick={handleGetStarted} variant="hero" size="xl" className="w-full sm:w-auto">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              {/* <Link to="/deshboard">
                <Button variant="outline" size="xl" className="w-full sm:w-auto">
                  Login
                </Button>
              </Link> */}
            </div>

            <div className="text-sm text-muted-foreground">
              No credit card required • 5 monitors free • 2-minute setup
            </div>
          </motion.div>

          {/* Animated Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16 relative max-w-7xl mx-auto"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="bg-card/80 backdrop-blur-lg rounded-2xl shadow-2xl border p-6"
            >
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
              <World globeConfig={globeConfig} data={data} />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Customers Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-center text-lg text-muted-foreground mb-8">
            Trusted by developers at leading companies
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8">
            {customerLogos.map((logo) => (
              <img
                key={logo.alt}
                src={logo.src}
                alt={logo.alt}
                className="h-10 object-contain"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <motion.section
        id="features"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="py-20 bg-muted/30"
      >
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
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-primary/20">
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
      </motion.section>

      {/* Testimonials Section */}
      <motion.section
        id="testimonials"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="py-20"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              What our customers say
            </h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
              From solo developers to enterprise teams, see how PulseMonitor helps teams 
              keep their services online and their customers happy.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <blockquote className="text-muted-foreground mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </blockquote>
                  <div className="flex items-start space-x-3">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.company}</div>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {testimonial.companySize}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {testimonial.useCase}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Pricing Section */}
      <motion.section
        id="pricing"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="py-20"
      >
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
            {plans.map((plan) => (
              <Card
                key={plan.name}
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
                  <Button onClick={handleGetStarted} variant={plan.variant} className="w-full" size="lg">
                      {plan.cta}
                    </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <section className="py-20 bg-background text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="bg-card border rounded-2xl p-10 md:p-16 relative overflow-hidden">
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-gradient-primary rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-16 -right-10 w-48 h-48 bg-gradient-primary rounded-full opacity-10 animate-pulse delay-500"></div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
              Ready to monitor your services?
            </h2>
            <p className="text-xl mb-8 text-muted-foreground max-w-2xl mx-auto">
              Join thousands of developers who trust PulseMonitor to keep their services online.
            </p>
            <Button onClick={handleGetStarted} variant="hero" size="xl">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
          </div>
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
                <li><a href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</a></li>
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
                <li><a href="#" className-="hover:text-foreground transition-colors">Twitter</a></li>
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
