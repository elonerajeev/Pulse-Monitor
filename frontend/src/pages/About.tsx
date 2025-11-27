import { useAuth } from "@/hooks/useAuth";

const About = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      <section className="bg-gradient-to-b from-background to-muted/40 py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-6">About PulseMonitor</h1>

          <p className="text-lg text-muted-foreground text-center max-w-3xl mx-auto mb-12">
            PulseMonitor helps teams keep their applications alive, healthy, and running 24/7.
            We provide real-time uptime tracking, performance insights, and instant alerts so your
            services stay reliable and your customers stay happy.
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-10">
            <div className="p-6 rounded-xl bg-card shadow-sm border">
              <h3 className="text-xl font-semibold mb-3">Our Mission</h3>
              <p className="text-muted-foreground">
                Deliver simple monitoring tools that empower developers, startups, and enterprises
                to run stable, fast, and scalable systems.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card shadow-sm border">
              <h3 className="text-xl font-semibold mb-3">Our Vision</h3>
              <p className="text-muted-foreground">
                Build an ecosystem where any application developer can diagnose failures
                within seconds and prevent outages before they impact users.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card shadow-sm border">
              <h3 className="text-xl font-semibold mb-3">Our Solution</h3>
              <ul className="text-muted-foreground list-disc list-inside space-y-1">
                <li>Instant detection within 60 seconds</li>
                <li>Beautiful, intuitive dashboard</li>
                <li>Zero-config deployment in 2 minutes</li>
                <li>Enterprise features, startup-friendly pricing</li>
                <li>Open source with full customization</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
