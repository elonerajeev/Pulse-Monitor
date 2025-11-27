import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Activity, Home } from "lucide-react";


const NotFound = () => {
  const location = useLocation();
  const [user, setUser] = useState({ name: '', email: '' });
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    const authStatus = localStorage.getItem("isAuthenticated");
    setIsAuthenticated(authStatus === 'true');
    if (authStatus === 'true') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">

      <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 4rem)' }}>
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-8">
            <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-6xl font-bold text-muted-foreground mb-2">404</h1>
            <h2 className="text-2xl font-semibold mb-4">Page not found</h2>
            <p className="text-muted-foreground mb-8">
              Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or doesn't exist.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button variant="hero" size="lg" className="w-full sm:w-auto">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <Button variant="outline" size="lg" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
