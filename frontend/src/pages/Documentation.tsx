import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Book,
  Code,
  PlayCircle,
  Settings,
  Monitor,
  Bell,
  BarChart3,
  ExternalLink,
  Copy,
  CheckCircle
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const Documentation = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(authStatus);
  }, []);

  const handleStartTrialClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const quickStartSteps = [
    {
      title: "Sign up for free",
      description: "Create your account in under 30 seconds",
      icon: Activity,
      time: "30 seconds"
    },
    {
      title: "Add your first monitor",
      description: "Enter your website URL and configure check intervals",
      icon: Monitor,
      time: "1 minute"
    },
    {
      title: "Set up notifications",
      description: "Receive email alerts when your service status changes",
      icon: Bell,
      time: "2 minutes"
    },
    {
      title: "Start monitoring",
      description: "Watch your dashboards populate with real-time data",
      icon: BarChart3,
      time: "Immediate"
    }
  ];

  const apiExamples = [
    {
      title: "Register User",
      method: "POST",
      endpoint: "/api/v1/auth/register",
      code: `{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}`,
      description: "Create a new user account"
    },
    {
      title: "Login User",
      method: "POST",
      endpoint: "/api/v1/auth/login",
      code: `{
  "email": "john.doe@example.com",
  "password": "password123"
}`,
      description: "Authenticate and receive a JWT"
    },
    {
      title: "Create Monitor",
      method: "POST",
      endpoint: "/api/v1/monitoring",
      code: `{
  "name": "My API",
  "target": "https://api.example.com",
  "serviceType": "website",
  "interval": 5
}`,
      description: "Create a new monitor for your service"
    },
    {
      title: "Get All Monitors",
      method: "GET",
      endpoint: "/api/v1/monitoring",
      code: `// Returns an array of all monitoring services\n// for the authenticated user.`,
      description: "Retrieve all your configured monitors"
    },
    {
      title: "Update Monitor",
      method: "PATCH",
      endpoint: "/api/v1/monitoring/{id}",
      code: `{
  "name": "New Monitor Name",
  "interval": 10
}`,
      description: "Update a monitor's properties"
    },
    {
      title: "Delete Monitor",
      method: "DELETE",
      endpoint: "/api/v1/monitoring/{id}",
      code: `// No request body required.\n// Deletes the monitor with the specified ID.`,
      description: "Delete a monitoring service"
    }
  ];

  const integrations = [
    {
      name: "Email",
      description: "Traditional email alerts and reports",
      setup: "Enabled by default for your account email",
      icon: "📧",
      status: "Working"
    },
    {
      name: "Slack",
      description: "Instant notifications in your team channels",
      setup: "Add webhook URL from Slack app settings",
      icon: "💬",
      status: "Coming Soon"
    },
    {
      name: "Telegram",
      description: "Personal or group chat notifications",
      setup: "Create bot and add bot token",
      icon: "📱",
      status: "Coming Soon"
    },
    {
      name: "Discord",
      description: "Community and team Discord servers",
      setup: "Create webhook in channel settings",
      icon: "🎮",
      status: "Coming Soon"
    },
    {
      name: "PagerDuty",
      description: "Escalation and incident management",
      setup: "Connect via integration key",
      icon: "🚨",
      status: "Coming Soon"
    },
    {
      name: "Microsoft Teams",
      description: "Enterprise team collaboration",
      setup: "Configure incoming webhook connector",
      icon: "👔",
      status: "Coming Soon"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-20 bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-2">
            <Book className="w-4 h-4 mr-2" />
            Developer Documentation
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Get started in <span className="text-gradient">minutes</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Everything you need to set up monitoring, configure alerts, and integrate 
            with your existing tools. Simple guides, code examples, and best practices.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" onClick={handleStartTrialClick}>
                <PlayCircle className="w-5 h-5 mr-2" />
                Start Free Trial
            </Button>
            <Link to="/api-reference">
              <Button variant="outline" size="lg">
                <ExternalLink className="w-5 h-5 mr-2" />
                API Reference
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Quick Start Guide */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Quick Start Guide</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickStartSteps.map((step, index) => (
              <Card key={index} className="relative group hover:shadow-lg transition-all duration-300">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                  <Badge variant="outline" className="w-fit mx-auto">{step.time}</Badge>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
                {index < quickStartSteps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-6 h-0.5 bg-border"></div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </section>

        {/* API Examples */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">API Examples</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Integrate PulseMonitor into your workflow with our simple REST API
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {apiExamples.map((example, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Code className="w-5 h-5 mr-2" />
                      {example.title}
                    </CardTitle>
                    <Badge 
                      variant={example.method === 'POST' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {example.method}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{example.description}</p>
                  <code className="text-xs bg-muted px-2 py-1 rounded">{example.endpoint}</code>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="relative h-full">
                    <pre className="bg-muted/50 p-4 rounded-lg text-sm overflow-x-auto h-full">
                      <code>{example.code}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(example.code, `api-${index}`)}
                    >
                      {copiedCode === `api-${index}` ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Integrations */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Integrations</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Connect PulseMonitor with your favorite tools and services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((integration, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{integration.icon}</span>
                      {integration.name}
                    </div>
                    <Badge variant={integration.status === 'Working' ? 'success' : 'outline'}>
                      {integration.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">{integration.description}</p>
                  <p className="text-sm font-medium">Setup: {integration.setup}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Best Practices */}
        <section className="mb-16">
          <Card className="bg-gradient-to-r from-primary/5 to-success/5">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Settings className="w-6 h-6 mr-3" />
                Best Practices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-success" />
                    Monitor Configuration
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Set appropriate check intervals (5 minutes for critical services)</li>
                    <li>• Configure realistic timeout values</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-success" />
                    Alert Management
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Avoid alert fatigue with smart thresholds</li>
                    <li>• Test notification channels regularly</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Support */}
        <section>
          <Card className="text-center bg-gradient-hero text-white">
            <CardContent className="p-12">
              <h3 className="text-2xl font-bold mb-4">Need Help?</h3>
              <p className="text-xl opacity-90 mb-8">
                Our support team is here to help you get the most out of PulseMonitor
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="glass" size="lg">
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Contact Support
                </Button>
                <Link to="/api-reference">
                  <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-primary">
                    <Book className="w-5 h-5 mr-2" />
                    View Full Docs
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Documentation;