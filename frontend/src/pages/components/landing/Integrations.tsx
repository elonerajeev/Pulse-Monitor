import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

const integrations = [
  { name: "Slack", iconUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg" },
  { name: "Email", iconUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_(2020).svg" },
  { name: "Telegram", iconUrl: "https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg" },
  { name: "PagerDuty", iconUrl: "https://www.vectorlogo.zone/logos/pagerduty/pagerduty-icon.svg" },
  { name: "Opsgenie", iconUrl: "https://cdn.worldvectorlogo.com/logos/opsgenie-1.svg" },
  { name: "Webhooks", iconUrl: "https://www.vectorlogo.zone/logos/zapier/zapier-icon.svg" },
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
                <img src={integration.iconUrl} alt={`${integration.name} logo`} className="w-12 h-12 mb-4" />
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
