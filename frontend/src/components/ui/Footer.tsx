import { Activity, Github, Twitter, Linkedin } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const Footer = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate(isAuthenticated ? '/dashboard' : '/signup');
  };

  return (
    <footer className="border-t bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        
        {/* CTA Section */}
        <div className="py-16 text-center border-b">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Improve Your Uptime?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                Start monitoring your websites and services in minutes. Powerful features, simple setup. No credit card required.
            </p>
            <Button size="lg" variant="hero" onClick={handleGetStarted}>
                Get Started for Free
            </Button>
        </div>

        <div className="py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            
            {/* Column 1: Logo & Description */}
            <div className="md:col-span-2 lg:col-span-1 space-y-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-8 h-8 text-primary" />
                <span className="text-xl font-bold">PulseMonitor</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Simple, reliable monitoring for developers and teams.
              </p>
            </div>

            {/* Product */}
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link to="/dashboard" className="cursor-pointer hover:text-foreground transition-colors">Dashboard</Link></li>
                <li><Link to="/documentation" className="cursor-pointer hover:text-foreground transition-colors">Documentation</Link></li>
                <li><a href="#pricing" className="cursor-pointer hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#testimonials" className="cursor-pointer hover:text-foreground transition-colors">Testimonials</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link to="/about" className="cursor-pointer hover:text-foreground transition-colors">About Us</Link></li>
                <li><Link to="/coming-soon" className="cursor-pointer hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link to="/contact" className="cursor-pointer hover:text-foreground transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            {/* Newsletter */}
            <div>
              <h3 className="font-semibold mb-4">Stay Updated</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Subscribe for updates and news.
              </p>
              <form className="flex flex-col space-y-2">
                <Input type="email" placeholder="Enter your email" className="bg-background/50" />
                <Button type="submit" variant="secondary" className="w-full">Subscribe</Button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t py-8 flex flex-col sm:flex-row justify-between items-center gap-y-4">
          <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} PulseMonitor. All rights reserved.
          </p>
          <div className="flex items-center space-x-6">
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
              <div className="flex space-x-4">
                  <a href="#" aria-label="GitHub" className="text-muted-foreground hover:text-foreground transition-colors"><Github className="w-5 h-5" /></a>
                  <a href="#" aria-label="Twitter" className="text-muted-foreground hover:text-foreground transition-colors"><Twitter className="w-5 h-5" /></a>
                  <a href="#" aria-label="LinkedIn" className="text-muted-foreground hover:text-foreground transition-colors"><Linkedin className="w-5 h-5" /></a>
              </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
