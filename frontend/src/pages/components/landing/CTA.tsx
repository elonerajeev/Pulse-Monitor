import { Button } from "@/components/ui/button";
import {
  ArrowRight,
} from "lucide-react";

const CTA = ({ handleGetStarted }) => {
    return (
<section className="py-20 bg-background text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="bg-card border rounded-2xl p-10 md:p-16 relative overflow-hidden">
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-gradient-primary rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-16 -right-10 w-48 h-48 bg-gradient-primary rounded-full opacity-10 animate-pulse delay-500"></div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
              Ready to monitor your services?
            </h2>
            <p className="text-xl mb-8 text-muted-foreground max-w-2xl mx-auto">
              Join thousands of developers who trust PulseMonitor to keep their services online.
            </p>
            <Button onClick={handleGetStarted} variant="hero" size="xl">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
          </div>
        </div>
      </section>
    )
}
export default CTA