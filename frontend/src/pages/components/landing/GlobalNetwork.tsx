import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Globe } from 'lucide-react';

const locations = [
  { name: "N. Virginia", top: "32%", left: "22%", color: "bg-blue-500" },
  { name: "California", top: "35%", left: "12%", color: "bg-green-500" },
  { name: "São Paulo", top: "70%", left: "30%", color: "bg-purple-500" },
  { name: "Ireland", top: "25%", left: "45%", color: "bg-indigo-500" },
  { name: "Frankfurt", top: "28%", left: "52%", color: "bg-yellow-400" },
  { name: "Singapore", top: "62%", left: "80%", color: "bg-pink-500" },
  { name: "Tokyo", top: "35%", left: "88%", color: "bg-red-500" },
  { name: "Sydney", top: "78%", left: "90%", color: "bg-cyan-500" },
  { name: "Mumbai", top: "50%", left: "72%", color: "bg-orange-500" },
];

const GlobalNetwork = () => {
  return (
    <motion.section
      id="network"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="py-20 md:py-32 bg-gradient-to-b from-background via-muted/30 to-background"
    >
      <div className="container mx-auto px-4">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* LEFT CONTENT */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Badge variant="secondary" className="mb-4">Global Reach</Badge>

            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Monitor From Every Corner of the World
            </h2>

            <p className="text-xl text-muted-foreground mb-8">
              Your users are global, and your monitoring should be too. PulseMonitor checks your services from multiple worldwide locations in real-time.
            </p>

            <ul className="space-y-5">
              <li className="flex gap-3">
                <Globe className="text-primary" />
                Reduce false positives with multi-region checks.
              </li>
              <li className="flex gap-3">
                <Globe className="text-primary" />
                Measure response time geographically.
              </li>
            </ul>
          </motion.div>

          {/* RIGHT - ROTATING EARTH */}
          <div className="relative h-[18rem] md:h-[26rem] flex items-center justify-center overflow-hidden">

            {/* ROTATING MAP */}
            <motion.img
              src="/world-map.svg"
              alt="Earth Map"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 50, ease: "linear" }}
              className="w-full max-w-lg opacity-30"
            />

            {/* COLORFUL DOTS */}
            {locations.map((loc, index) => (
              <motion.div
                key={index}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ top: loc.top, left: loc.left }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.6, 1, 0.6]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2 + index * 0.3
                }}
              >
                <div className="relative group">
                  {/* Outer Glow */}
                  <div
                    className={`absolute inset-0 rounded-full blur-md ${loc.color} opacity-60`}
                  ></div>

                  {/* Core Dot */}
                  <div
                    className={`w-3 h-3 rounded-full ${loc.color}`}
                  ></div>

                  {/* Tooltip */}
                  <div className="absolute hidden group-hover:block
                                  bg-background border text-xs rounded shadow-md
                                  py-1 px-2 whitespace-nowrap
                                  -top-8 left-1/2 -translate-x-1/2">
                    {loc.name}
                  </div>
                </div>
              </motion.div>
            ))}

          </div>

        </div>

      </div>
    </motion.section>
  );
};

export default GlobalNetwork;
