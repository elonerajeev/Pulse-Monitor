import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Rocket, Target, BellRing } from 'lucide-react';

const steps = [
  {
    icon: Rocket,
    title: "Step 1: Sign Up",
    description: "Create your free PulseMonitor account in seconds. No credit card required to get started.",
  },
  {
    icon: Target,
    title: "Step 2: Add Your First Monitor",
    description: "Enter the URL, IP address, or API endpoint you want to monitor. It only takes a minute.",
  },
  {
    icon: BellRing,
    title: "Step 3: Configure Alerts",
    description: "Choose how you want to be notified—via Slack, email, or other integrations—when an issue is detected.",
  },
];

const QuickStartGuide = () => {
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <motion.section 
      id="quick-start"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="py-20 md:py-32 bg-background"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Get Started in Minutes
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Quick Start Guide
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Getting started with PulseMonitor is simple. Follow these three easy steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {steps.map((step, index) => (
            <div key={index} className="bg-card p-8 rounded-lg border shadow-sm">
              <div className="flex justify-center items-center mb-6">
                <div className="bg-primary/10 p-4 rounded-full">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default QuickStartGuide;
