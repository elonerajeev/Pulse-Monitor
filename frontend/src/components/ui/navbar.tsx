import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, Edit, LayoutDashboard, LogOut, Plus, Settings, UserCog, Users } from "lucide-react";
import { Button } from "./button";
import { ThemeToggle } from "./theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import NotificationBell from "./NotificationBell";
import { toast } from "sonner";
import useNotifications from "@/hooks/use-notifications";

interface NavbarProps {
  isAuthenticated: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ isAuthenticated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { notifications, addNotification, clearNotification, clearAllNotifications } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Features", href: "/#features" },
    { label: "Testimonials", href: "/#testimonials" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Documentation", href: "/documentation" },
  ];

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (href.startsWith("/#")) {
      e.preventDefault();
      const targetId = href.substring(2);
      if (location.pathname === "/") {
        document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
      } else {
        navigate("/");
        setTimeout(() => {
          document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
      setIsOpen(false);
    } else {
      setIsOpen(false);
    }
  };

  const handleLogout = () => {
    addNotification({
      message: "You have been successfully logged out.",
      service: "Authentication",
      severity: "info",
    });
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
    toast.success("Logout Successful", {
      description: "You have been successfully logged out.",
    });
    navigate("/login");
  };


  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link to="/" className="mr-6 flex items-center space-x-2">
          <img src="/logo.svg" alt="PulseMonitor Logo" className="h-8 w-8" />
          <span className="font-bold">PulseMonitor</span>
        </Link>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="hidden md:flex md:items-center md:space-x-6 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-2">
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                <NotificationBell 
                  notifications={notifications} 
                  onClear={clearNotification} 
                  onClearAll={clearAllNotifications} 
                />
                <Popover>
                  <PopoverTrigger>
                    <Avatar>
                      <AvatarImage src={user?.avatarUrl} />
                      <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
                    </Avatar>
                  </PopoverTrigger>
                  <PopoverContent className="w-64">
                    <div className="p-2">
                      <div className="flex items-center space-x-3 mb-3">
                        <Avatar>
                          <AvatarImage src={user?.avatarUrl} />
                          <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{user?.name}</p>
                          <p className="text-sm text-muted-foreground">{user?.email}</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/dashboard")}>
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Dashboard
                        </Button>
                        <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/profile/edit")}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Profile
                        </Button>
                        <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/settings")}>
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </Button>
                        <Button variant="destructive" className="w-full justify-start mt-2" onClick={handleLogout}>
                          <LogOut className="mr-2 h-4 w-4" />
                          Logout
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="block px-3 py-2 rounded-md text-base font-medium text-foreground/60 hover:text-foreground/80 hover:bg-accent"
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-border">
              {isAuthenticated ? (
                 <Popover>
                 <PopoverTrigger className="w-full">
                   <Avatar>
                     <AvatarImage src={user?.avatarUrl} />
                     <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
                   </Avatar>
                 </PopoverTrigger>
                 <PopoverContent>
                   <Button onClick={() => navigate("/dashboard")} className="w-full mb-2">Dashboard</Button>
                   <Button onClick={handleLogout} variant="destructive" className="w-full">Logout</Button>
                 </PopoverContent>
               </Popover>
              ) : (
                <>
                  <Link to="/login">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setIsOpen(false)}
                    >
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button
                      variant="default"
                      className="w-full mt-2"
                      onClick={() => setIsOpen(false)}
                    >
                      Get Started Free
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
