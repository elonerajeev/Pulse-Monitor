import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  ArrowRight,
  Activity,
} from "lucide-react";
import { motion } from "framer-motion";
import StatusDonut from "@/components/ui/status-donut";
import RealTimeChart from "@/components/ui/real-time-chart";
import MetricsGrid from "@/components/ui/metrics-grid";
import World from "@/components/ui/World";

const Hero = ({ handleGetStarted }) => {
    const globeConfig = {
        width: 800,
        height: 600,
        markerColor: "#FF0000",
        graticuleColor: "#CCCCCC",
        backgroundColor: "#FFFFFF",
      };

      const data = [
        { lat: 34.0522, lon: -118.2437, size: 10 },
        { lat: 40.7128, lon: -74.006, size: 10 },
        { lat: 51.5074, lon: -0.1278, size: 10 },
      ];
  return (
    <section className="py-20 md:py-32">
      <div className="absolute inset-0 hero-gradient opacity-10"></div>
      <div className="container mx-auto px-4 text-center relative">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <Badge variant="secondary" className="mb-6 px-4 py-2">
            <Zap className="w-4 h-4 mr-2" />
            Monitoring made simple
          </Badge>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Keep your websites{" "}
            <span className="text-gradient">always online</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Monitor uptime, track performance, and get instant alerts when
            something goes wrong. Simple, reliable monitoring for developers and
            teams.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              onClick={handleGetStarted}
              variant="hero"
              size="xl"
              className="w-full sm:w-auto"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            No credit card required • 5 monitors free • 2-minute setup
          </div>
        </motion.div>

        {/* Animated Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16 relative max-w-7xl mx-auto"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="bg-card/80 backdrop-blur-lg rounded-2xl shadow-2xl border p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-destructive"></div>
                <div className="w-3 h-3 rounded-full bg-warning"></div>
                <div className="w-3 h-3 rounded-full bg-success"></div>
              </div>
              <Badge variant="outline" className="text-xs">
                Live Monitoring Demo
              </Badge>
            </div>

            {/* Metrics Grid */}
            <div className="mb-6">
              <MetricsGrid />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Response Time Chart */}
              <div className="bg-card/30 backdrop-blur-sm rounded-lg border shadow-sm p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">
                      Response Time Trend
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs animate-pulse">
                    Live Data
                  </Badge>
                </div>
                <div className="h-[300px]">
                  <RealTimeChart />
                </div>
              </div>

              {/* Status Donut */}
              <StatusDonut />
            </div>

            {/* Global Map */}
            <World globeConfig={globeConfig} data={data} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
export default Hero;