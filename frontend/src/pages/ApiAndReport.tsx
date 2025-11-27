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
import { useState, useEffect, useCallback } from "react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '@/utils/api';
import { useToast } from "@/hooks/use-toast";

interface MonitoringLog {
  status: string;
  responseTime: number;
  createdAt: string;
}

interface MonitoringService {
  _id: string;
  name: string;
  target: string;
  latestLog?: MonitoringLog;
  logs: MonitoringLog[];
}

interface TrafficData {
  time: string;
  value: number;
}

const ApiAndReport = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('report');
  const [services, setServices] = useState<MonitoringService[]>([]);
  const [trafficData, setTrafficData] = useState<TrafficData[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [servicesRes, trafficRes] = await Promise.all([
        api.get('/monitoring'),
        api.get('/traffic?site_id=pulse-monitor-pro.vercel.app')
      ]);

      if (servicesRes.status === 200) {
        setServices(servicesRes.data.data);
      } else {
        toast({ title: 'Error', description: 'Failed to fetch monitoring services.', variant: 'destructive' });
      }

      if (trafficRes.status === 200) {
        const { results } = trafficRes.data.data;
        const formattedTraffic = results.map((item: { pageviews: number; date: string }) => ({
          value: item.pageviews,
          time: new Date(item.date).toLocaleDateString(),
        }));
        setTrafficData(formattedTraffic);
      } else {
        toast({ title: 'Error', description: 'Failed to fetch traffic data.', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch dashboard data.', variant: 'destructive' });
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    if (activeTab === 'report') {
      fetchDashboardData();
    }
  }, [activeTab, fetchDashboardData]);

  const generatePdf = () => {
    const doc = new jsPDF();
    let yPos = 20;

    doc.setFontSize(22);
    doc.text("Dashboard Report", 105, yPos, { align: "center" });
    yPos += 15;

    const onlineServices = services.filter(s => s.latestLog?.status === 'online');
    const uptimePercentage = services.length > 0 ? (onlineServices.length / services.length) * 100 : 100;
    const avgResponseTime =
      onlineServices.length > 0
        ? Math.round(onlineServices.reduce((acc, s) => acc + (s.latestLog?.responseTime || 0), 0) / onlineServices.length)
        : 0;

    autoTable(doc, {
      startY: yPos,
      head: [['Metric', 'Value']],
      body: [
        ['Overall Uptime', `${uptimePercentage.toFixed(2)}%`],
        ['Average Response Time', `${avgResponseTime}ms`],
        ['Total Monitored Services', services.length.toString()],
        ['Online Services', onlineServices.length.toString()],
      ],
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] },
    });
    yPos = (doc as any).lastAutoTable.finalY + 15;

    doc.setFontSize(16);
    doc.text("Monitored Services Details", 14, yPos);
    yPos += 8;

    autoTable(doc, {
      startY: yPos,
      head: [['Service Name', 'Target URL', 'Status', 'Response Time (ms)']],
      body: services.map(s => [
        s.name,
        s.target,
        s.latestLog?.status || 'N/A',
        s.latestLog?.responseTime?.toString() || 'N/A',
      ]),
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
    });

    doc.save("dashboard-report.pdf");
  };

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
              <Link to="/dashboard">
                <Button variant="hero" size="lg">
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Go to Dashboard
                </Button>
              </Link>
              <Button variant="hero" size="lg" onClick={generatePdf} disabled={loading}>
                {loading ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : <Download className="w-5 h-5 mr-2" />}
                {loading ? 'Fetching Data...' : 'Download Report'}
              </Button>
            </div>
          </div>
          <Card>
            <CardHeader><CardTitle>Report Preview</CardTitle></CardHeader>
            <CardContent>
              {loading ? <p className="text-center text-muted-foreground">Loading...</p> : (
                <ul>
                  <li><strong>Uptime:</strong> {((services.filter(s => s.latestLog?.status === 'online').length / services.length) * 100 || 100).toFixed(2)}%</li>
                </ul>
              )}
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
            <Book className="w-4 h-4 mr-2" />API & Report
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

export default ApiAndReport;
