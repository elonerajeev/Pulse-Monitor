import Navbar from "@/components/ui/navbar";
import { useAuth } from "@/hooks/useAuth";

const Contact = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      <Navbar isAuthenticated={isAuthenticated} />

      <div className="container mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold text-center mb-6">Contact Us</h1>

        <p className="text-lg text-muted-foreground text-center max-w-3xl mx-auto mb-10">
          Have a question, feature request, or need help? Our team is here for you.
          Reach out anytime and we’ll respond as soon as possible.
        </p>

        <div className="bg-card p-10 rounded-xl shadow-sm border max-w-xl mx-auto text-center">
          <p className="text-muted-foreground text-lg mb-4">
            Email us directly at:
          </p>

          <a
            href="mailto:support@pulsemonitor.com"
            className="text-primary text-xl font-semibold hover:underline"
          >
            pulsemonitor.log@gmail.com
          </a>

          <p className="text-muted-foreground mt-6">
            Our support team is available 24/7 to help monitor your services.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
