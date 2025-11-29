import React from "react";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const services = [
  { name: "Main Website", status: "online", uptime: 99.98, response: 120 },
  { name: "API Server", status: "degraded", uptime: 97.34, response: 600 },
  { name: "Auth Service", status: "offline", uptime: 88.21, response: 0 },
];

const incidents = [
  { date: "2025-02-22", name: "API Server", status: "down" },
  { date: "2025-02-18", name: "Auth Service", status: "down" },
  { date: "2025-02-12", name: "Payment Gateway", status: "degraded" },
];

const getBadge = (status: string) => {
  if (status === "online") return <Badge className="bg-green-600">Online</Badge>;
  if (status === "degraded") return <Badge className="bg-yellow-500">Degraded</Badge>;
  return <Badge className="bg-red-600">Offline</Badge>;
};

const getIcon = (status: string) => {
  if (status === "online") return <CheckCircle className="text-green-400" />;
  if (status === "degraded") return <AlertTriangle className="text-yellow-400" />;
  return <XCircle className="text-red-400" />;
};

export default function BeautifulDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white p-8">

      <header className="mb-10">
        <h1 className="text-4xl font-bold">🚀 System Dashboard</h1>
        <p className="text-gray-400 mt-1">Dummy Data (UI Preview)</p>
      </header>

      {/* METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="bg-gradient-to-r from-green-600 to-green-900 text-white">
          <CardHeader><CardTitle>Total Uptime</CardTitle></CardHeader>
          <CardContent><p className="text-4xl font-bold">96.45%</p></CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-600 to-blue-900 text-white">
          <CardHeader><CardTitle>Avg Response</CardTitle></CardHeader>
          <CardContent><p className="text-4xl font-bold">320ms</p></CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-600 to-purple-900 text-white">
          <CardHeader><CardTitle>Active Services</CardTitle></CardHeader>
          <CardContent><p className="text-4xl font-bold">3</p></CardContent>
        </Card>
      </div>

      {/* SERVICES */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">🖥 Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service, index) => (
            <Card key={index} className="bg-gray-900 hover:scale-[1.02] transition">
              <CardHeader className="flex justify-between flex-row items-center">
                <span>{service.name}</span>
                {getBadge(service.status)}
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  {getIcon(service.status)}
                  <span className="capitalize">{service.status}</span>
                </div>

                <div>
                  <p className="text-gray-400 text-sm">Uptime</p>
                  <Progress value={service.uptime} />
                  <p className="text-sm">{service.uptime}%</p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm">Response Time</p>
                  <p className="font-bold">{service.response || "--"} ms</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* INCIDENT HISTORY */}
      <section>
        <h2 className="text-2xl font-bold mb-4">🚨 Incidents</h2>
        <div className="bg-gray-900 p-5 rounded-lg space-y-3">
          {incidents.map((item, index) => (
            <div key={index} className="flex justify-between border-b border-gray-700 pb-2">
              <span>{item.name}</span>
              <span>{item.date}</span>
              <Badge className={item.status === "down" ? "bg-red-600" : "bg-yellow-500"}>
                {item.status}
              </Badge>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
