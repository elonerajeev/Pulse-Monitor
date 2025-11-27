import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Globe } from 'lucide-react';

// Simplified representation of monitoring locations
const locations = [
  { name: "N. Virginia", top: "32%", left: "22%" },
  { name: "California", top: "35%", left: "12%" },
  { name: "São Paulo", top: "70%", left: "30%" },
  { name: "Ireland", top: "25%", left: "45%" },
  { name: "Frankfurt", top: "28%", left: "52%" },
  { name: "Singapore", top: "62%", left: "80%" },
  { name: "Tokyo", top: "35%", left: "88%" },
  { name: "Sydney", top: "78%", left: "90%" },
  { name: "Mumbai", top: "50%", left: "72%" },
];

const GlobalNetwork = () => {
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <motion.section 
      id="network"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="py-20 md:py-32 bg-background"
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <Badge variant="secondary" className="mb-4">
              Global Reach
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Monitor From Every Corner of the World
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Your users are global, and your monitoring should be too. PulseMonitor checks your services from a distributed network of monitoring locations to give you a comprehensive view of your application's health and performance worldwide.
            </p>
            <ul className="space-y-4">
                <li className="flex items-start">
                    <Globe className="w-6 h-6 text-primary mr-4 mt-1 flex-shrink-0" />
                    <div>
                        <h4 className="font-semibold">Reduce False Positives</h4>
                        <p className="text-muted-foreground">Confirm downtime with checks from multiple locations to avoid false alarms caused by local network issues.</p>
                    </div>
                </li>
                <li className="flex items-start">
                    <Globe className="w-6 h-6 text-primary mr-4 mt-1 flex-shrink-0" />
                    <div>
                        <h4 className="font-semibold">Measure Global Performance</h4>
                        <p className="text-muted-foreground">Identify and resolve region-specific performance bottlenecks by comparing response times across the globe.</p>
                    </div>
                </li>
            </ul>
          </div>
          
          <div className="relative h-64 md:h-96">
            <img src="/world-map.svg" alt="World Map" className="w-full h-full object-contain opacity-10" />
            {locations.map((loc, index) => (
              <div 
                key={index}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ top: loc.top, left: loc.left }}
              >
                <div className="relative group">
                    <div className="w-3 h-3 bg-primary rounded-full animate-ping"></div>
                    <div className="absolute -top-1 -left-1 w-5 h-5 bg-primary/50 rounded-full animate-ping delay-500"></div>
                    <div className="absolute hidden group-hover:block bg-card text-foreground text-xs rounded py-1 px-2 -top-8 left-1/2 -translate-x-1/2 shadow-lg whitespace-nowrap">
                        {loc.name}
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export default GlobalNetwork;
