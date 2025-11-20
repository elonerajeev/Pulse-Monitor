import { Activity, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "./button";

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#testimonials", label: "Testimonials" },
  { href: "/documentation", label: "Docs" },
];

const Header = () => {
  return (
    <header className="flex items-center justify-between px-4 md:px-6 h-16 border-b bg-background/95 backdrop-blur-sm">
      <Link to="/" className="flex items-center space-x-2">
        <Activity className="w-8 h-8 text-primary" />
        <span className="text-xl font-bold">PulseMonitor</span>
      </Link>
      <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
        {navLinks.map((link) => (
          <a key={link.href} href={link.href} className="hover:text-primary transition-colors">
            {link.label}
          </a>
        ))}
      </nav>
      <div className="hidden md:flex items-center space-x-4">
        <Button variant="ghost" asChild>
          <Link to="/login">Login</Link>
        </Button>
        <Button asChild>
          <Link to="/signup">Get Started</Link>
        </Button>
      </div>
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <div className="grid gap-4 p-4">
              <Link to="/" className="flex items-center space-x-2 mb-4">
                <Activity className="w-8 h-8 text-primary" />
                <span className="text-xl font-bold">PulseMonitor</span>
              </Link>
              <nav className="grid gap-2">
                {navLinks.map((link) => (
                  <a key={link.href} href={link.href} className="py-2 text-lg font-medium hover:text-primary transition-colors">
                    {link.label}
                  </a>
                ))}
              </nav>
              <div className="border-t pt-4 mt-4 grid gap-2">
                <Button variant="ghost" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/signup">Get Started</Link>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
