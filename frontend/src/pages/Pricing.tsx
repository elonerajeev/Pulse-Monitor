import React from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import api from "@/utils/api";

const tiers = [
  {
    name: "Free",
    id: "free",
    price: "$0",
    description: "Perfect for personal projects",
    features: ["5 Monitors", "5-minute check intervals", "Email alerts", "7-day log history"],
    buttonText: "Current Plan",
    priceId: null,
  },
  {
    name: "Pro",
    id: "pro",
    price: "$29",
    description: "Best for growing startups",
    features: ["50 Monitors", "1-minute check intervals", "Email & Slack alerts", "30-day log history", "2 Regions"],
    buttonText: "Upgrade to Pro",
    priceId: import.meta.env.VITE_STRIPE_PRO_PRICE_ID || "PRO_PRICE_ID",
  },
  {
    name: "Enterprise",
    id: "enterprise",
    price: "$99",
    description: "For mission-critical applications",
    features: ["Unlimited Monitors", "30-second check intervals", "All alert channels", "90-day log history", "All Regions", "Dedicated Support"],
    buttonText: "Upgrade to Enterprise",
    priceId: import.meta.env.VITE_STRIPE_ENTERPRISE_PRICE_ID || "ENTERPRISE_PRICE_ID",
  },
];

const PricingPage = () => {
  const { user } = useAuth();

  const handleSubscribe = async (priceId) => {
    if (!priceId) return;
    try {
      const response = await api.post("/stripe/create-checkout-session", { priceId });
      if (response.data?.data?.url) {
        window.location.href = response.data.data.url;
      }
    } catch (error) {
      console.error("Subscription error:", error);
    }
  };

  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">Pricing</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Choose the right plan for your team
          </p>
        </div>
        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8">
          {tiers.map((tier) => (
            <Card key={tier.id} className={tier.id === 'pro' ? 'border-indigo-600 border-2' : ''}>
              <CardHeader>
                <CardTitle>{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="text-4xl font-bold">{tier.price}<span className="text-sm font-normal text-gray-500">/mo</span></div>
                <ul className="space-y-2">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={tier.id === 'pro' ? 'default' : 'outline'}
                  disabled={user?.plan === tier.id || !tier.priceId}
                  onClick={() => handleSubscribe(tier.priceId)}
                >
                  {user?.plan === tier.id ? "Current Plan" : tier.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
