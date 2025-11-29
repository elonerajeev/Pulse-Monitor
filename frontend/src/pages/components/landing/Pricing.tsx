import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
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
      className="py-20 bg-gradient-to-b from-background via-muted/20 to-background"
    >
      <div className="container mx-auto px-4">

        {/* HEADER */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Start free, upgrade when you need more. No hidden fees or surprises.
          </p>
        </div>

        {/* PLANS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">

          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative group border backdrop-blur-lg rounded-2xl bg-card/80
                transition-all duration-300 overflow-hidden
                ${plan.popular 
                  ? 'border-primary shadow-xl scale-105 ring-2 ring-primary/30' 
                  : 'hover:-translate-y-1 hover:shadow-2xl'
                }`
              }
            >

              {/* POPULAR BADGE */}
              {plan.popular && (
                <Badge
                  className="absolute top-4 left-1/2 -translate-x-1/2 
                             bg-gradient-to-r from-primary to-purple-500 
                             text-white shadow-md"
                >
                  Most Popular
                </Badge>
              )}

              {/* GLOW EFFECT */}
              {plan.popular && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10 pointer-events-none" />
              )}

              <CardHeader className="text-center pt-10 relative z-10">
                <CardTitle className="text-2xl mb-2">
                  {plan.name}
                </CardTitle>

                <div className="mt-2">
                  <span className="text-4xl font-extrabold">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    /{plan.period}
                  </span>
                </div>

                <p className="text-muted-foreground mt-2">
                  {plan.description}
                </p>
              </CardHeader>

              <CardContent className="relative z-10">

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center text-sm"
                    >
                      <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={handlePricingClick}
                  variant={plan.variant}
                  className="w-full transition-transform group-hover:scale-[1.03]"
                  size="lg"
                >
                  {plan.cta}
                </Button>

              </CardContent>
            </Card>
          ))}

        </div>
      </div>
    </motion.section>
  );
};

export default Pricing;
