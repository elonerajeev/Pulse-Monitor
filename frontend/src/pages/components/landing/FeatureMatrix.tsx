
import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  Search,
  Activity,
  ShieldCheck,
  Clock,
  Map,
  Dna,
  Link,
  BellRing,
  GaugeCircle,
  Component
} from "lucide-react";
import FeatureDisplay from "./FeatureDisplay";

const monitoringTypes = [
  {
    id: "website",
    name: "Website Monitoring",
    description:
      "Keep a constant eye on your website's availability. We check your site from multiple global locations, ensuring it's accessible to your users everywhere, 24/7. Get alerted the instant it goes down.",
    icon: Globe,
    image: "https://images.unsplash.com/photo-1517430816045-df4b7de1cd0b?auto=format&fit=crop&w=800&q=80",
  },

  {
    id: "ping",
    name: "Ping Monitoring",
    description:
      "Check the fundamental connectivity of your servers and network devices. Our ping checks measure response times and packet loss, giving you a clear view of your network's health and stability.",
    icon: Activity,
    image: "https://images.unsplash.com/photo-1585079542156-2755d9c8a094?auto=format&fit=crop&w=800&q=80",
  },

  {
    id: "cron",
    name: "Cron Job Monitoring",
    description:
      "Never let a silent failure in your scheduled tasks go unnoticed. We monitor your cron jobs, scheduled scripts, and background tasks, alerting you if they don't run on time or fail unexpectedly.",
    icon: Clock,
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80",
  },
];

const advancedFeatures = [
  {
    id: "ssl",
    name: "SSL Monitoring",
    description:
      "Avoid security warnings and protect your users. We automatically track your SSL certificate's expiration date and validity, alerting you well in advance to renew it.",
    icon: ShieldCheck,
    image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "response-time",
    name: "Response Time Monitoring",
    description:
      "Understand your website's performance from the user's perspective. We track how quickly your pages load and alert you if they become sluggish, helping you maintain a fast user experience.",
    icon: GaugeCircle,
    image: "https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&w=800&q=80",
  },

  {
    id: "dns",
    name: "DNS Monitoring",
    description:
      "Ensure your domain correctly points to your servers. We monitor your DNS records (A, CNAME, MX, etc.) for any unauthorized or incorrect changes that could take your services offline.",
    icon: Link,
    image: "https://images.unsplash.com/photo-1591696331115-cda6c93b0a48?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "smart-alerting",
    name: "Smart Alerting",
    description:
      "Reduce alert fatigue with intelligent notifications. We'll only notify you about persistent issues, not temporary glitches, and you can set custom alert thresholds to match your needs.",
    icon: BellRing,
    image: "https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?auto=format&fit=crop&w=800&q=80",
  }
];

const FeatureMatrix = () => {
  return (
    <section id="features" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Powerful Features
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            A Monitoring Powerhouse
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From basic uptime checks to advanced monitoring, we have everything you need to ensure your online services are fast, reliable, and secure.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <FeatureDisplay features={monitoringTypes} title="Uptime Monitoring" />
          <FeatureDisplay features={advancedFeatures} title="Advanced Features" />
        </div>
      </div>
    </section>
  );
};

export default FeatureMatrix;
