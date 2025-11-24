import { Activity } from "lucide-react";
import { Link } from "react-router-dom";
import ComingSoon from '@/pages/ComingSoon';


const Footer = () => {
  return (
    <footer className="border-t py-16 bg-muted/30 relative z-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Column 1 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold">PulseMonitor</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Simple, reliable monitoring for developers and teams. Keep your services online 24/7.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/dashboard" className="cursor-pointer hover:text-foreground">Dashboard</Link></li>
              <li><Link to="/documentation" className="cursor-pointer hover:text-foreground">Documentation</Link></li>
              <li><a href="#pricing" className="cursor-pointer hover:text-foreground">Pricing</a></li>
              <li><a href="#testimonials" className="cursor-pointer hover:text-foreground">Testimonials</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/about" className="cursor-pointer hover:text-foreground">About Us</Link></li>
              <li><Link to="/coming-soon" className="cursor-pointer hover:text-foreground">Blog</Link></li>
              <li><Link to="/coming-soon" className="cursor-pointer hover:text-foreground">Careers</Link></li>
              <li><Link to="/contact" className="cursor-pointer hover:text-foreground">Contact</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal & Social</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/privacy" className="cursor-pointer hover:text-foreground">Privacy Policy</Link></li>
              <li><Link to="/terms" className="cursor-pointer hover:text-foreground">Terms of Service</Link></li>
              <li><a href="#" className="cursor-pointer hover:text-foreground">GitHub</a></li>
              <li><a href="#" className="cursor-pointer hover:text-foreground">Twitter</a></li>
            </ul>
          </div>

        </div>

        <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
          <p>© 2024 PulseMonitor. All rights reserved. Built with ❤️ for developers.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
