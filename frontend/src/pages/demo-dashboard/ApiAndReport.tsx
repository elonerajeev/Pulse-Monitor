import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Book,
  Code,
  ExternalLink,
  Copy,
  CheckCircle,
  KeyRound,
  AlertTriangle,
  Gauge,
  Rocket,
  Download,
  RefreshCw
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';


const DemoApiAndReport = () => {
  const [activeTab, setActiveTab] = useState('report');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  

  const apiExamples = [
    {
      title: "Register User",
      method: "POST",
      endpoint: "/api/v1/auth/register",
      description: "Create a new user account.",
      code: JSON.stringify({ name: "John Doe", email: "john.doe@example.com", password: "password123", confirmPassword: "password123" }, null, 2),
      response: JSON.stringify({ user: { _id: "1", name: "John Doe", email: "john.doe@example.com" }, accessToken: "..." }, null, 2)
    },
    {
      title: "Login User",
      method: "POST",
      endpoint: "/api/v1/auth/login",
      description: "Authenticate a user and receive token.",
      code: JSON.stringify({ email: "john.doe@example.com", password: "password123" }, null, 2),
      response: JSON.stringify({ user: { _id: "1", name: "John Doe" }, accessToken: "..." }, null, 2)
    },
    {
      title: "Create a new monitor",
      method: "POST",
      endpoint: "/api/v1/monitoring",
      description: "Create a new monitoring service.",
      code: JSON.stringify({ name: "My API", target: "https://api.example.com", serviceType: "website", interval: 5 }, null, 2),
      response: JSON.stringify({ _id: "1", status: "pending" }, null, 2)
    },
    {
      title: "Get Monitoring Services",
      method: "GET",
      endpoint: "/api/v1/monitoring",
      description: "Fetch all monitors.",
      code: "// No body required",
      response: JSON.stringify([{ name: "Website Monitor", status: "online" }], null, 2)
    },
    {
      title: "Update Monitor",
      method: "PATCH",
      endpoint: "/api/v1/monitoring/:id",
      description: "Modify monitor settings.",
      code: JSON.stringify({ interval: 15 }, null, 2),
      response: JSON.stringify({ success: true }, null, 2)
    },
    {
      title: "Delete Monitor",
      method: "DELETE",
      endpoint: "/api/v1/monitoring/:id",
      description: "Remove service permanently.",
      code: "// No body required",
      response: JSON.stringify({ deleted: true }, null, 2)
    },
    {
      title: "Service Logs",
      method: "GET",
      endpoint: "/api/v1/monitoring/:id/logs",
      description: "Fetch service logs.",
      code: "// No body required",
      response: JSON.stringify([{ status: "online", responseTime: 101 }], null, 2)
    }
  ];

  const developerRequests = [
    {
      title: "cURL Request",
      code: `curl -X POST https://yourdomain.com/api/v1/monitoring \\
-H "Authorization: Bearer YOUR_TOKEN" \\
-H "Content-Type: application/json" \\
-d '{
  "name": "My API",
  "target": "https://api.example.com",
  "serviceType": "website",
  "interval": 5
}'`
    },
    {
      title: "Fetch API",
      code: `fetch("/api/v1/monitoring", {
  method: "POST",
  headers: {
    Authorization: "Bearer YOUR_TOKEN",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    name: "My API",
    target: "https://api.example.com",
    serviceType: "website",
    interval: 5
  })
}).then(res => res.json()).then(console.log);`
    },
    {
      title: "Axios",
      code: `axios.post("/api/v1/monitoring", {
  name: "My API",
  target: "https://api.example.com",
  serviceType: "website",
  interval: 5
}, {
  headers: {
    Authorization: "Bearer YOUR_TOKEN"
  }
});`
    },
    {
      title: "Node.js HTTPS",
      code: `const https = require("https");

const data = JSON.stringify({
  name: "My API",
  target: "https://api.example.com",
  serviceType: "website",
  interval: 5
});

const req = https.request({
  method: "POST",
  headers: {
    Authorization: "Bearer YOUR_TOKEN",
    "Content-Type": "application/json"
  }
}, res => {
  res.on("data", d => console.log(d.toString()));
});

req.write(data);
req.end();`
    }
  ];

  const CodeBlock = ({ code, language, id }: { code: string; language: string; id: string }) => (
    <div className="relative">
      <SyntaxHighlighter language={language} style={atomDark}>
        {code}
      </SyntaxHighlighter>
      <Button size="sm" variant="ghost" className="absolute top-2 right-2" onClick={() => copyToClipboard(code, id)}>
        {copiedCode === id ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
      </Button>
    </div>
  );

  const renderContent = () => {
    if (activeTab === 'report') {
      return (
        <div>
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">Generate Your Report</h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Get a comprehensive overview of your monitored services in PDF format.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/demo-dashboard">
                <Button variant="hero" size="lg">
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Go to Dashboard
                </Button>
              </Link>
              <Button variant="hero" size="lg" disabled>
                <Download className="w-5 h-5 mr-2" />
                Download Report
              </Button>
            </div>
          </div>
          <Card>
            <CardHeader><CardTitle>Report Preview</CardTitle></CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">This is a demo. Report generation is disabled.</p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div>
        <Card className="mb-10">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Rocket className="w-5 h-5 mr-2" />
              Developer Request Examples
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {developerRequests.map((req, i) => (
              <div key={i}>
                <h4 className="font-semibold mb-2">{req.title}</h4>
                <CodeBlock code={req.code} language="javascript" id={`dev-${i}`} />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-8">
          {apiExamples.map((example, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Code className="w-5 h-5 mr-2" />
                    {example.title}
                  </CardTitle>
                  <Badge>{example.method}</Badge>
                </div>
                <p className="text-sm text-muted-foreground pt-2">{example.description}</p>
                <code className="text-xs bg-muted px-2 py-1 rounded mt-1">{example.endpoint}</code>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Request</h4>
                    <CodeBlock code={example.code} language="json" id={`api-req-${index}`} />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Response</h4>
                    <CodeBlock code={example.response} language="json" id={`api-res-${index}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="py-20 bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-2">
            <Book className="w-4 h-4 mr-2" />API & Report (Demo)
          </Badge>

          <div className="flex justify-center mb-8">
            <Button variant={activeTab === 'report' ? 'hero' : 'outline'} onClick={() => setActiveTab('report')} className="mr-4">
              Dashboard Report
            </Button>
            <Button variant={activeTab === 'api' ? 'hero' : 'outline'} onClick={() => setActiveTab('api')}>
              API Documentation
            </Button>
          </div>

          {renderContent()}
        </div>
      </section>
    </div>
  );
};

export default DemoApiAndReport;
