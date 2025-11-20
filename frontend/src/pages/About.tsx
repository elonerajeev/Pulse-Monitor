import Navbar from "@/components/ui/navbar";
import { useAuth } from "@/hooks/useAuth";

const About = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      <Navbar isAuthenticated={isAuthenticated} />

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
              <h3 className="text-xl font-semibold mb-3">Our Values</h3>
              <p className="text-muted-foreground">
                Reliability, transparency, and craftsmanship. We believe that great engineering
                comes from clarity and strong attention to detail.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
