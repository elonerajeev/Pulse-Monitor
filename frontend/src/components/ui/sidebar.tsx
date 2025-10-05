import React, { useState } from "react";
import { Button } from "./button";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "./theme-toggle";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50"
        onClick={toggleSidebar}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>
      <div
        className={`fixed top-0 left-0 h-full bg-background z-40 transition-all duration-300 ease-in-out ${
          isOpen ? "w-64" : "w-0"
        } overflow-hidden`}
      >
        <div className="flex flex-col items-center justify-center h-full">
          <nav className="flex flex-col space-y-4 text-lg">
            <Link to="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link to="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
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
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
