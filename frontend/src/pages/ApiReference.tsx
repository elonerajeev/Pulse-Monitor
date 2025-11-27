import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code, Copy, CheckCircle, Server, User, Settings, GitBranch } from "lucide-react";
import { useState, useEffect } from "react";

const ApiReference = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const CodeBlock = ({ id, code }: { id: string, code: string }) => (
    <div className="relative">
      <pre className="bg-muted/50 p-4 rounded-lg text-sm overflow-x-auto">
        <code>{code}</code>
      </pre>
      <button
        className="absolute top-2 right-2 p-2 text-muted-foreground hover:text-foreground"
        onClick={() => copyToClipboard(code, id)}
      >
        {copiedCode === id ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-4">API Reference & Developer Guide</h1>
        <p className="text-lg text-muted-foreground mb-12">
          A comprehensive guide to integrating with the PulseMonitor API.
        </p>

        {/* Authentication */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 flex items-center"><User className="mr-2" /> Authentication</h2>
          <p className="mb-4">
            The API uses JWT for authentication. All protected routes require an `Authorization` header with a Bearer token.
          </p>
          <Card>
            <CardHeader>
              <CardTitle>POST /api/v1/auth/register</CardTitle>
              <p className="text-sm text-muted-foreground">Registers a new user.</p>
            </CardHeader>
            <CardContent>
              <h4 className="font-semibold mb-2">Request Body:</h4>
              <CodeBlock id="reg-req" code={`{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}`} />
              <h4 className="font-semibold mt-4 mb-2">Response (201 Success):</h4>
              <CodeBlock id="reg-res" code={`{
  "statusCode": 201,
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john.doe@example.com"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully"
}`} />
            </CardContent>
          </Card>
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>POST /api/v1/auth/login</CardTitle>
              <p className="text-sm text-muted-foreground">Logs in an existing user.</p>
            </CardHeader>
            <CardContent>
              <h4 className="font-semibold mb-2">Request Body:</h4>
              <CodeBlock id="login-req" code={`{
  "email": "john.doe@example.com",
  "password": "password123"
}`} />
              <h4 className="font-semibold mt-4 mb-2">Response (200 Success):</h4>
              <CodeBlock id="login-res" code={`{
  "statusCode": 200,
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User logged in successfully"
}`} />
            </CardContent>
          </Card>
        </section>

        {/* Monitoring API */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 flex items-center"><Server className="mr-2" /> Monitoring API</h2>
          <Card>
            <CardHeader>
              <CardTitle>POST /api/v1/monitoring</CardTitle>
              <p className="text-sm text-muted-foreground">Creates a new monitoring service.</p>
            </CardHeader>
            <CardContent>
              <h4 className="font-semibold mb-2">Request Body:</h4>
              <CodeBlock id="create-mon-req" code={`{
  "name": "My Production API",
  "target": "https://api.example.com/health",
  "serviceType": "website", // or "server"
  "interval": 5 // in minutes, min: 5
}`} />
              <h4 className="font-semibold mt-4 mb-2">Response (201 Success):</h4>
              <CodeBlock id="create-mon-res" code={`{
  "statusCode": 201,
  "data": { /* monitoring object */ },
  "message": "Monitoring service created successfully"
}`} />
            </CardContent>
          </Card>
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>GET /api/v1/monitoring</CardTitle>
              <p className="text-sm text-muted-foreground">Retrieves all monitoring services for the user.</p>
            </CardHeader>
            <CardContent>
              <h4 className="font-semibold mb-2">Response (200 Success):</h4>
              <CodeBlock id="get-mon-res" code={`{
  "statusCode": 200,
  "data": [ /* array of monitoring objects */ ],
  "message": "Monitoring services retrieved successfully"
}`} />
            </CardContent>
          </Card>
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>PATCH /api/v1/monitoring/:id</CardTitle>
              <p className="text-sm text-muted-foreground">Updates a specific monitoring service.</p>
            </CardHeader>
            <CardContent>
              <h4 className="font-semibold mb-2">Request Body:</h4>
              <CodeBlock id="update-mon-req" code={`{
  "name": "My Updated API Name",
  "interval": 10
}`} />
              <h4 className="font-semibold mt-4 mb-2">Response (200 Success):</h4>
              <CodeBlock id="update-mon-res" code={`{
  "statusCode": 200,
  "data": { /* updated monitoring object */ },
  "message": "Monitoring service updated successfully"
}`} />
            </CardContent>
          </Card>
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>DELETE /api/v1/monitoring/:id</CardTitle>
              <p className="text-sm text-muted-foreground">Deletes a monitoring service.</p>
            </CardHeader>
            <CardContent>
              <h4 className="font-semibold mb-2">Response (200 Success):</h4>
              <CodeBlock id="delete-mon-res" code={`{
  "statusCode": 200,
  "data": {},
  "message": "Monitoring service deleted successfully"
}`} />
            </CardContent>
          </Card>
        </section>
        
        {/* Developer Guide */}
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center"><GitBranch className="mr-2" /> Developer Guide</h2>
          <p className="mb-4">
            This guide provides an overview of the project structure and how to make changes.
          </p>
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Frontend (`/frontend`)</CardTitle></CardHeader>
              <CardContent>
                <p>The frontend is a React SPA built with Vite. UI components are in `/src/components` and pages are in `/src/pages`. API calls are made directly from the page components using `fetch`.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Backend (`/backend`)</CardTitle></CardHeader>
              <CardContent>
                <p>The backend is a Node.js/Express API. To add a new feature, you would typically add a route in `/src/routes`, create a controller function in `/src/controllers`, and define a model in `/src/models`.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Service (`/service`)</CardTitle></CardHeader>
              <CardContent>
                <p>This is a background service that runs cron jobs. The main monitoring logic is in `/src/jobs/monitorJob.js`, which runs every 5 minutes. To change the check frequency, modify the cron string in this file.</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ApiReference;
