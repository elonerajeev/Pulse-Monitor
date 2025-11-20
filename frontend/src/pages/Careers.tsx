import Navbar from "@/components/ui/navbar";
import { useAuth } from "@/hooks/useAuth";

const Careers = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      <Navbar isAuthenticated={isAuthenticated} />

      <div className="container mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold text-center mb-6">Careers at PulseMonitor</h1>

        <p className="text-lg text-muted-foreground text-center max-w-3xl mx-auto mb-10">
          We are building tools that keep the internet stable.  
          Our current openings will be available soon.  
          New roles and opportunities are planned for the next phase of our growth.
        </p>

        <div className="bg-card border rounded-xl shadow-sm max-w-xl mx-auto p-10 text-center">
          <h2 className="text-2xl font-semibold mb-3">No Open Positions Right Now</h2>
          <p className="text-muted-foreground">
            Our hiring page is being prepared.  
            Please check back later for upcoming engineering and product roles.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Careers;
