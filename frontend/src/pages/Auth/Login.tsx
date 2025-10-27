
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/utils/api';
import { Github, Loader2, Chrome, Activity, Eye, EyeOff } from 'lucide-react';
import Navbar from '@/components/ui/navbar';
import BackgroundIcons from '@/components/ui/background-icons';
import useNotifications from '@/hooks/use-notifications';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { addNotification } = useNotifications();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        addNotification({
          message: 'Welcome back!',
          service: 'Authentication',
          severity: 'success',
        });
        toast.success('Login Successful', {
          description: 'Welcome back!',
        });
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify(data.data));
        navigate('/dashboard');
      } else {
        toast.error(data.message || 'An error occurred.');
      }
    } catch (error) {
      toast.error('Could not connect to the server. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubLogin = () => {
    setIsGitHubLoading(true);
    window.location.href = `${API_BASE_URL}/api/v1/users/auth/github`;
  };

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    window.location.href = `${API_BASE_URL}/api/v1/users/auth/google`;
  };

  return (
    <div className="min-h-screen bg-background relative">
      <BackgroundIcons />
      <Navbar isAuthenticated={false} />
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <div className="w-full max-w-md">
          <Card className="border-none shadow-lg rounded-2xl bg-background/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="flex items-center justify-between mb-4">
                <div className="flex space-x-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                  <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                </div>
                <div className="flex items-center justify-center flex-grow">
                  <Activity className="w-10 h-10 text-primary" />
                  <h1 className="text-2xl font-bold ml-2">PulseMonitor</h1>
                </div>
              </div>
              <CardTitle className="text-2xl">Welcome back!</CardTitle>
              <CardDescription>
                Enter your credentials to access your dashboard.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-3">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    'Login'
                  )}
                </Button>

                <div className="relative w-full">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full">
                  <Button variant="outline" onClick={handleGitHubLogin} disabled={isGitHubLoading}>
                    {isGitHubLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Github className="mr-2 h-4 w-4" />
                    )}
                    GitHub
                  </Button>
                  <Button variant="outline" onClick={handleGoogleLogin} disabled={isGoogleLoading}>
                    {isGoogleLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Chrome className="mr-2 h-4 w-4" />
                    )}
                    Google
                  </Button>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <Link
                    to="/signup"
                    className="text-primary hover:underline font-medium"
                  >
                    Sign up
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
