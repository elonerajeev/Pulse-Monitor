import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, Star, ArrowLeft, Users, Building2, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const Testimonials = () => {
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

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Activity className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold text-gradient">PulseMonitor</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-2">
            <Star className="w-4 h-4 mr-2 fill-current" />
            Trusted by developers worldwide
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            What our <span className="text-gradient">customers say</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            From solo developers to enterprise teams, see how PulseMonitor helps teams 
            keep their services online and their customers happy.
          </p>

          {/* Stats */}
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
      </section>

      {/* Testimonials Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  {/* Rating */}
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  
                  {/* Content */}
                  <blockquote className="text-muted-foreground mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </blockquote>
                  
                  {/* Author */}
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
      </section>

      {/* Customer Logos */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-12">Trusted by companies of all sizes</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 opacity-60">
            {["TechStart", "CloudNine", "DataFlow", "E-commerce+", "FinTech", "DevCorp"].map((company, index) => (
              <div key={index} className="flex items-center justify-center">
                <div className="text-lg font-semibold text-muted-foreground">
                  {company}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Join thousands of satisfied customers
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Start monitoring your services today and see why developers love PulseMonitor.
          </p>
          <Link to="/signup">
            <Button variant="glass" size="xl">
              Get Started Free
              <Activity className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Testimonials;