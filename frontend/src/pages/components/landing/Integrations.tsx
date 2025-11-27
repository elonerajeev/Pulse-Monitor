import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Mail, Send, Bell } from 'lucide-react'; // Placeholder icons

const integrations = [
  { name: "Slack", icon: MessageSquare },
  { name: "Email", icon: Mail },
  { name: "Telegram", icon: Send },
  { name: "PagerDuty", icon: Bell },
  { name: "Opsgenie", icon: Bell },
  { name: "Webhooks", icon: Send },
];

const Integrations = () => {
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i) => ({
      opacity: 1,
      scale: 1,
      transition: { delay: i * 0.1, ease: "easeOut" },
    }),
  };

  return (
    <motion.section 
      id="integrations"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="py-20 md:py-32 bg-muted/30"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
                Connect Your Workflow
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Powerful Integrations
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Receive instant alerts on the platforms your team already uses. No need to change your workflow.
            </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {integrations.map((integration, index) => (
              <motion.div
                key={integration.name}
                custom={index}
                variants={itemVariants}
                className="bg-card p-6 rounded-lg border flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <integration.icon className="w-12 h-12 mb-4 text-primary" />
                <p className="font-semibold text-lg">{integration.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export default Integrations;
