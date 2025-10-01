import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  ArrowLeft, 
  Book, 
  Code, 
  PlayCircle, 
  Settings, 
  Webhook,
  Monitor,
  Bell,
  BarChart3,
  ExternalLink,
  Copy,
  CheckCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useState } from "react";

const Documentation = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

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
      description: "Configure email, Slack, or Telegram alerts",
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
      title: "Create Monitor",
      method: "POST",
      endpoint: "/api/v1/monitors",
      code: `{
  "url": "https://api.example.com/health",
  "name": "API Health Check",
  "interval": 300,
  "regions": ["us-east", "eu-west"],
  "expected_status": 200,
  "timeout": 30
}`,
      description: "Create a new monitor for your service"
    },
    {
      title: "Get Monitor Status",
      method: "GET",
      endpoint: "/api/v1/monitors/{id}",
      code: `{
  "id": "mon_1234567890",
  "url": "https://api.example.com/health",
  "status": "up",
  "last_check": "2024-01-15T10:30:00Z",
  "response_time": 245,
  "uptime_percentage": 99.95
}`,
      description: "Retrieve current status and metrics"
    },
    {
      title: "Set up Webhook",
      method: "POST",
      endpoint: "/api/v1/notifications/webhooks",
      code: `{
  "url": "https://hooks.slack.com/services/...",
  "events": ["down", "up", "slow_response"],
  "name": "Slack Alerts",
  "active": true
}`,
      description: "Configure webhook notifications"
    }
  ];

  const integrations = [
    {
      name: "Slack",
      description: "Instant notifications in your team channels",
      setup: "Add webhook URL from Slack app settings",
      icon: "💬"
    },
    {
      name: "Telegram",
      description: "Personal or group chat notifications",
      setup: "Create bot and add bot token",
      icon: "📱"
    },
    {
      name: "Email",
      description: "Traditional email alerts and reports",
      setup: "Verify email address in settings",
      icon: "📧"
    },
    {
      name: "PagerDuty",
      description: "Escalation and incident management",
      setup: "Connect via integration key",
      icon: "🚨"
    },
    {
      name: "Discord",
      description: "Community and team Discord servers",
      setup: "Create webhook in channel settings",
      icon: "🎮"
    },
    {
      name: "Microsoft Teams",
      description: "Enterprise team collaboration",
      setup: "Configure incoming webhook connector",
      icon: "👔"
    }
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
              <Link to="/signup">
                <Button variant="hero" size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

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
            <Link to="/signup">
              <Button variant="hero" size="lg">
                <PlayCircle className="w-5 h-5 mr-2" />
                Start Free Trial
              </Button>
            </Link>
            <Button variant="outline" size="lg">
              <ExternalLink className="w-5 h-5 mr-2" />
              API Reference
            </Button>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {apiExamples.map((example, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300">
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
                <CardContent>
                  <div className="relative">
                    <pre className="bg-muted/50 p-4 rounded-lg text-sm overflow-x-auto">
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
                  <CardTitle className="flex items-center">
                    <span className="text-2xl mr-3">{integration.icon}</span>
                    {integration.name}
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
                    <li>• Set appropriate check intervals (1-5 minutes for critical services)</li>
                    <li>• Use multiple regions for global services</li>
                    <li>• Configure realistic timeout values</li>
                    <li>• Monitor both endpoints and databases</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-success" />
                    Alert Management
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Avoid alert fatigue with smart thresholds</li>
                    <li>• Use escalation policies for critical issues</li>
                    <li>• Test notification channels regularly</li>
                    <li>• Set up maintenance windows</li>
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
                <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-primary">
                  <Book className="w-5 h-5 mr-2" />
                  View Full Docs
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Documentation;