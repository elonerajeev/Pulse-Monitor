import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Users,
  Building2,
  Activity,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";

const Testimonials = () => {

  const testimonials = [
    {
      id: 1,
      name: "Sarah Chen",
      role: "CTO",
      company: "TechStart Inc",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      content: "PulseMonitor has been a game-changer for our infrastructure monitoring. The instant alerts saved us from a major outage last week.",
      rating: 5,
      companySize: "Series A Startup",
      useCase: "API Monitoring",
    },
    {
      id: 2,
      name: "Marcus Rodriguez",
      role: "DevOps Engineer",
      company: "CloudNine Solutions",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      content: "Simple setup, powerful monitoring. We migrated from a complex enterprise solution and couldn't be happier with the reliability and cost savings.",
      rating: 5,
      companySize: "Enterprise (500+)",
      useCase: "Multi-region Monitoring",
    },
    {
      id: 3,
      name: "Emily Johnson",
      role: "Full Stack Developer",
      company: "Indie Creator",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      content: "Perfect for side projects! The free tier gives me everything I need to monitor my apps without breaking the bank.",
      rating: 5,
      companySize: "Solo Developer",
      useCase: "Side Projects",
    },
    {
      id: 4,
      name: "David Kim",
      role: "SRE Lead",
      company: "DataFlow Corp",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      content: "The response time analytics helped us optimize our API endpoints and improve user experience by 40%. Highly recommended!",
      rating: 5,
      companySize: "Series B",
      useCase: "Performance Optimization",
    },
    {
      id: 5,
      name: "Lisa Wang",
      role: "Product Manager",
      company: "E-commerce Plus",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face",
      content: "Reliable monitoring with beautiful dashboards. Our team loves the clean interface and detailed reporting features.",
      rating: 5,
      companySize: "Growth Stage",
      useCase: "E-commerce Platform",
    },
    {
      id: 6,
      name: "Alex Thompson",
      role: "Infrastructure Manager",
      company: "FinTech Secure",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
      content: "Security and compliance were our top concerns. PulseMonitor met all our requirements while being incredibly easy to implement.",
      rating: 5,
      companySize: "Enterprise",
      useCase: "Financial Services",
    }
  ];

  const stats = [
    { label: "Happy Customers", value: "2,500+", icon: Users },
    { label: "Uptime Monitored", value: "99.99%", icon: Activity },
    { label: "Alerts Sent", value: "50K+", icon: Zap },
    { label: "Companies Trust Us", value: "500+", icon: Building2 },
  ];

  const sectionVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: "easeOut" } 
    },
  };

  return (
    <motion.section
      id="testimonials"
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
            What our customers say
          </h2>

          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            From solo developers to enterprise teams, see how PulseMonitor helps teams 
            keep their services online and their customers happy.
          </p>

          {/* STATS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="group"
              >
                <Card className="text-center bg-card/80 backdrop-blur shadow-md hover:shadow-xl transition">
                  <CardContent className="p-6">
                    <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                    <div className="text-2xl font-bold mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* TESTIMONIAL GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              viewport={{ once: true }}
            >
              <Card className="group bg-card/80 backdrop-blur transition-all duration-300 
                               hover:shadow-2xl hover:-translate-y-2 rounded-xl border">

                <CardContent className="p-6">

                  {/* RATING */}
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>

                  {/* CONTENT */}
                  <blockquote className="text-muted-foreground mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </blockquote>

                  {/* USER INFO */}
                  <div className="flex items-start gap-3">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      onError={(e: any) => {
                        e.target.src = "https://dummyimage.com/100/1f2937/ffffff&text=User";
                      }}
                      className="w-12 h-12 rounded-full object-cover"
                    />

                    <div>
                      <div className="font-semibold">
                        {testimonial.name}
                      </div>

                      <div className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </div>

                      <div className="text-sm text-muted-foreground">
                        {testimonial.company}
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {testimonial.companySize}
                        </Badge>

                        <Badge variant="secondary" className="text-xs">
                          {testimonial.useCase}
                        </Badge>
                      </div>
                    </div>
                  </div>

                </CardContent>
              </Card>
            </motion.div>
          ))}

        </div>
      </div>
    </motion.section>
  );
};

export default Testimonials;
