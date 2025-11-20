import Navbar from "@/components/ui/navbar";
import { useAuth } from "@/hooks/useAuth";

const Blog = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      <Navbar isAuthenticated={isAuthenticated} />

      <div className="container mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold text-center mb-6">PulseMonitor Blog</h1>

        <p className="text-lg text-muted-foreground text-center max-w-3xl mx-auto mb-12">
          Insights on monitoring, performance optimization, DevOps culture,
          and engineering best practices. Stay updated with the latest
          trends that help teams build stable systems.
        </p>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="p-5 bg-card border rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold mb-2">Why Uptime Monitoring Matters</h3>
            <p className="text-muted-foreground">
              Learn the hidden costs of downtime and how monitoring prevents business damage.
            </p>
          </div>

          <div className="p-5 bg-card border rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold mb-2">How to Track API Performance</h3>
            <p className="text-muted-foreground">
              Understand essential metrics like latency, error rates, and response time.
            </p>
          </div>

          <div className="p-5 bg-card border rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold mb-2">Building Reliable CI/CD Pipelines</h3>
            <p className="text-muted-foreground">
              Improve your deployment workflow and reduce production failures.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;
