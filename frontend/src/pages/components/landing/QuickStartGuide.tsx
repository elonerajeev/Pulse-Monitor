import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Rocket, Target, BellRing } from 'lucide-react';

const steps = [
  {
    icon: Rocket,
    title: "Step 1: Sign Up",
    description: "Create your free PulseMonitor account in seconds. No credit card required to get started.",
    gradient: "from-pink-500 to-purple-500"
  },
  {
    icon: Target,
    title: "Step 2: Add Your First Monitor",
    description: "Enter the URL, IP address, or API endpoint you want to monitor. It only takes a minute.",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    icon: BellRing,
    title: "Step 3: Configure Alerts",
    description: "Choose how you want to be notified—via Slack, email, or other integrations—when an issue is detected.",
    gradient: "from-amber-500 to-orange-500"
  },
];

const QuickStartGuide = () => {

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.2 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: "easeOut" } 
    },
  };

  return (
    <motion.section 
      id="quick-start"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="py-20 md:py-32 bg-gradient-to-b from-background to-muted/30"
    >
      <div className="container mx-auto px-4">

        {/* HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge variant="secondary" className="mb-4">
            Get Started in Minutes
          </Badge>

          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Quick Start Guide
          </h2>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Getting started with PulseMonitor is simple. Follow these three easy steps.
          </p>
        </motion.div>

        {/* STEPS */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center"
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ scale: 1.05 }}
              className="relative bg-card/80 backdrop-blur border rounded-2xl shadow-lg
                         p-8 hover:shadow-2xl transition-all duration-300"
            >
              {/* GLOW ANIMATION */}
              <motion.div
                animate={{ opacity: [0.2, 0.35, 0.2] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${step.gradient} blur-2xl`}
              />

              {/* ICON */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                className={`relative z-10 w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${step.gradient}
                           flex items-center justify-center mb-6 shadow-lg`}
              >
                <step.icon className="w-9 h-9 text-white" />
              </motion.div>

              {/* CONTENT */}
              <h3 className="relative z-10 text-xl font-bold mb-2">
                {step.title}
              </h3>

              <p className="relative z-10 text-muted-foreground">
                {step.description}
              </p>

            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
};

export default QuickStartGuide;
