import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";

const Pricing = ({ handlePricingClick }) => {
    const plans = [
        {
          name: "Free",
          price: "$0",
          period: "forever",
          description: "Perfect for side projects and personal websites",
          features: [
            "5 monitors",
            "5-minute checks",
            "Email alerts",
            "7-day data retention",
            "Basic dashboard"
          ],
          cta: "Get Started Free",
          variant: "outline" as const,
          popular: false,
        },
        {
          name: "Starter",
          price: "$9",
          period: "per month",
          description: "Great for small teams and growing businesses",
          features: [
            "25 monitors",
            "1-minute checks",
            "Email + Slack + Telegram alerts",
            "30-day data retention",
            "Advanced dashboard",
            "SSL monitoring",
            "Multiple locations"
          ],
          cta: "Start 14-Day Trial",
          variant: "hero" as const,
          popular: true,
        },
        {
          name: "Pro",
          price: "$29",
          period: "per month",
          description: "For teams that need advanced monitoring",
          features: [
            "100 monitors",
            "30-second checks",
            "All alert channels",
            "1-year data retention",
            "Custom dashboards",
            "API access",
            "Priority support",
            "Team collaboration"
          ],
          cta: "Start 14-Day Trial",
          variant: "premium" as const,
          popular: false,
        },
      ];
      const sectionVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
      };

    return (
<motion.section
        id="pricing"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="py-20"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Start free, upgrade when you need more. No hidden fees or surprises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative group hover:shadow-xl transition-all duration-300 ${
                  plan.popular ? 'border-primary shadow-lg scale-105' : 'hover:-translate-y-1'
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-primary text-white">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                  <p className="text-muted-foreground">{plan.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-success mr-3 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button onClick={handlePricingClick} variant={plan.variant} className="w-full" size="lg">
                      {plan.cta}
                    </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </motion.section>
    )
}

export default Pricing