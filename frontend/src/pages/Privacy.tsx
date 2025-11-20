import Navbar from "@/components/ui/navbar";
import { useAuth } from "@/hooks/useAuth";

const Privacy = () => {
  const { isAuthenticated } = useAuth();
  return (
    <div>
      <Navbar isAuthenticated={isAuthenticated} />
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-8">Privacy Policy</h1>
        <p className="text-lg text-muted-foreground text-center max-w-3xl mx-auto">
          Your privacy is important to us. At PulseMonitor, we are committed to protecting your personal information and being transparent about how we use it. This policy outlines our practices for collecting, using, and protecting your data.
        </p>
      </div>
    </div>
  );
};

export default Privacy;
