
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import {
  Globe,
  Activity,
  ShieldCheck,
  Clock,
  BellRing,
  GaugeCircle,
} from 'lucide-react';

const allFeatures = [
  {
    id: 'website',
    name: 'Website Monitoring',
    description:
      "Keep a constant eye on your website\'s availability. We check your site from multiple global locations, ensuring it\'s accessible to your users everywhere, 24/7. Get alerted the instant it goes down.",
    icon: Globe,
    image: 'https://picsum.photos/id/1015/800/600',
    category: 'Uptime Monitoring',
  },
  {
    id: 'ping',
    name: 'Ping Monitoring',
    description:
      "Check the fundamental connectivity of your servers and network devices. Our ping checks measure response times and packet loss, giving you a clear view of your network\'s health and stability.",
    icon: Activity,
    image: 'https://picsum.photos/id/1069/800/600',
    category: 'Uptime Monitoring',
  },
  {
    id: 'cron',
    name: 'Cron Job Monitoring',
    description:
      "Never let a silent failure in your scheduled tasks go unnoticed. We monitor your cron jobs, scheduled scripts, and background tasks, alerting you if they don\'t run on time or fail unexpectedly.",
    icon: Clock,
    image: 'https://picsum.photos/id/1024/800/600',
    category: 'Uptime Monitoring',
  },
  {
    id: 'response-time',
    name: 'Response Time Monitoring',
    description:
      "Understand your website\'s performance from the user\'s perspective. We track how quickly your pages load and alert you if they become sluggish, helping you maintain a fast user experience.",
    icon: GaugeCircle,
    image: 'https://picsum.photos/id/1027/800/600',
    category: 'Advanced Features',
  },
  {
    id: 'smart-alerting',
    name: 'Smart Alerting',
    description:
      "Reduce alert fatigue with intelligent notifications. We\'ll only notify you about persistent issues, not temporary glitches, and you can set custom alert thresholds to match your needs.",
    icon: BellRing,
    image: 'https://picsum.photos/id/1050/800/600',
    category: 'Advanced Features',
  },
  {
    id: 'domain-expiration',
    name: 'Domain Expiration',
    description:
      "Don\'t let your domain expire. We monitor your domain\'s expiration date and notify you before it\'s too late.",
    icon: Clock,
    image: 'https://picsum.photos/id/1052/800/600',
    category: 'Advanced Features',
  },
];

const FeatureButton = ({ feature, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full text-left p-4 rounded-lg transition-all duration-300 ${
      isActive ? 'bg-primary/10 text-primary shadow-lg' : 'hover:bg-muted/50'
    }`}
  >
    <div className="flex items-center space-x-4">
      <div
        className={`p-3 rounded-xl transition-colors duration-300 ${
          isActive ? 'bg-primary/20' : 'bg-muted'
        }`}
      >
        <feature.icon
          className={`w-6 h-6 transition-colors duration-300 ${
            isActive ? 'text-primary' : 'text-muted-foreground'
          }`}
        />
      </div>
      <div>
        <p className="font-semibold text-base">{feature.name}</p>
        <p className="text-sm text-muted-foreground">{feature.category}</p>
      </div>
    </div>
  </button>
);

const FeatureCard = ({ feature }) => (
  <motion.div
    key={feature.id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.5, ease: 'easeInOut' }}
    className="bg-muted/30 rounded-2xl overflow-hidden border-2 shadow-xl"
  >
    <img
      src={feature.image}
      alt={feature.name}
      className="w-full h-80 object-cover"
    />
    <div className="p-8">
      <div className="flex items-center space-x-4 mb-4">
        <feature.icon className="w-8 h-8 text-primary" />
        <h3 className="text-2xl font-bold">{feature.name}</h3>
      </div>
      <p className="text-muted-foreground leading-relaxed">
        {feature.description}
      </p>
    </div>
  </motion.div>
);

const InteractiveFeatureDisplay = () => {
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          <div className="lg:col-span-1 space-y-3 lg:sticky lg:top-24">
            {allFeatures.map((feature) => (
              <FeatureButton
                key={feature.id}
                feature={feature}
                isActive={activeFeature.id === feature.id}
                onClick={() => setActiveFeature(feature)}
              />
            ))}
          </div>
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <FeatureCard feature={activeFeature} />
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveFeatureDisplay;
