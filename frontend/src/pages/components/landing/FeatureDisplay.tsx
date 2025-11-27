
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import {
  Globe,
  Activity,
  Network,
  Clock,
  Shield,
  Timer,
  Bell,
} from 'lucide-react';

const allFeatures = [
  {
    id: 'website-monitoring',
    name: 'Website Monitoring',
    category: 'Uptime Monitoring',
    description: "Keep a constant eye on your website's availability. We check your site from multiple global locations, ensuring it's accessible to your users everywhere, 24/7. Get alerted the instant it goes down.",
    icon: Globe,
    image: '/placeholder.svg',
  },
  {
    id: 'ping-monitoring',
    name: 'Ping Monitoring',
    category: 'Uptime Monitoring',
    description: "Check the availability of your network devices. We send pings to your servers and alert you if they don't respond.",
    icon: Activity,
    image: '/placeholder.svg',
  },
  {
    id: 'port-monitoring',
    name: 'Port Monitoring',
    category: 'Uptime Monitoring',
    description: 'Verify that your server ports are open and accessible. We check your specified TCP ports and alert you if they are closed.',
    icon: Network,
    image: '/placeholder.svg',
  },
  {
    id: 'cron-job-monitoring',
    name: 'Cron Job Monitoring',
    category: 'Uptime Monitoring',
    description: "Ensure your scheduled tasks are running correctly. We monitor your cron jobs and alert you if they fail or don't run on time.",
    icon: Clock,
    image: '/placeholder.svg',
  },
  {
    id: 'ssl-monitoring',
    name: 'SSL Monitoring',
    category: 'Advanced Features',
    description: "Avoid security warnings and protect your users. We automatically track your SSL certificate's expiration date and validity, alerting you well in advance to renew it.",
    icon: Shield,
    image: '/placeholder.svg',
  },
  {
    id: 'response-time-monitoring',
    name: 'Response Time Monitoring',
    category: 'Advanced Features',
    description: "Track your website's performance. We measure the response time of your site from different locations and provide detailed reports.",
    icon: Timer,
    image: '/placeholder.svg',
  },
  {
    id: 'smart-alerting',
    name: 'Smart Alerting',
    category: 'Advanced Features',
    description: "Avoid alert fatigue. We use smart alerting to notify you only when there's a real issue, reducing false positives.",
    icon: Bell,
    image: '/placeholder.svg',
  },
];


const FeatureButton = ({ feature, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full text-left p-3 rounded-lg transition-all duration-300 ${
      isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50'
    }`}
  >
    <div className="flex items-center space-x-4">
      <feature.icon className={`w-5 h-5`} />
      <div>
        <p className="font-semibold text-sm">{feature.name}</p>
        <p className="text-xs">{feature.category}</p>
      </div>
    </div>
  </button>
);


const FeatureDisplay = () => {
  const [activeFeature, setActiveFeature] = useState(allFeatures[0]);

  return (
    <section id="features" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 text-sm">
                Powerful Features
            </Badge>
            <h2 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tighter">
                A Monitoring Powerhouse
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto">
                From basic uptime checks to advanced performance analytics, we provide a comprehensive suite of tools to ensure your online services are fast, reliable, and secure.
            </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-4">
            <div className="bg-muted/30 rounded-lg p-2 space-y-1">
                {allFeatures.map((feature) => (
                    <FeatureButton
                      key={feature.id}
                      feature={feature}
                      isActive={activeFeature.id === feature.id}
                      onClick={() => setActiveFeature(feature)}
                    />
                ))}
            </div>
          </div>

          <div className="lg:col-span-8 lg:sticky lg:top-24">
            <motion.div
                key={activeFeature.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
            >
              <div className="bg-muted/30 rounded-2xl overflow-hidden border">
                <img
                  src={activeFeature.image}
                  alt={activeFeature.name}
                  className="w-full h-72 object-cover"
                />
                <div className="p-8">
                  <div className="flex items-center space-x-3 mb-4">
                    <activeFeature.icon className="w-8 h-8 text-primary" />
                    <h3 className="text-2xl font-bold">{activeFeature.name}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {activeFeature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureDisplay;
